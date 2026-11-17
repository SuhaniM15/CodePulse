"""CodePulse ML pipeline: data -> chronological split -> models -> calibration
-> review budget -> report files + model artefact.

Run from the repo root:
    python src/pipeline.py --data data/raw/apachejit_total.csv
"""
import argparse
import json
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, brier_score_loss, f1_score,
                             matthews_corrcoef, precision_recall_curve,
                             precision_score, recall_score, roc_auc_score)
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler

FEATURES = ["la", "ld", "nf", "nd", "ns", "ent", "ndev", "age", "nuc", "aexp", "arexp", "asexp"]
# Never predictors: buggy (target), fix, commit_id, project, year, author_date.
FORBIDDEN = {"buggy", "fix", "commit_id", "project", "year", "author_date", "date"}
HADOOP = "apache/hadoop"
# In ApacheJIT the clean commits of Hadoop HDFS and Hadoop MapReduce are stored under the parent repo
# name "apache/hadoop" (11,964 rows, all clean), while their bug-inducing commits carry the sub-project
# names. Together the three labels equal the paper's HDFS + MapReduce totals (16,192 commits, 3,060
# buggy), so we treat them as ONE project. Keeping them apart would give "hadoop-hdfs" a 76% buggy rate
# (paper: 21%) and make the "apache/hadoop" rows look like a labelling failure, which they are not.
HADOOP_FAMILY = {"apache/hadoop-hdfs": HADOOP, "apache/hadoop-mapreduce": HADOOP}
SEED = 42
ROUNDING_POLICY = "commits reviewed = ceil(budget fraction x number of commits in the set)"
TIE_POLICY = ("Ties in the ranking score are broken randomly with a fixed seed; "
              "the same tie-break rule is used for the model and change-size ranking.")
RANDOM_METHOD = "Analytic expectation: total buggy x (commits reviewed / set size)."
SCORE_TYPE = "relative_risk_score"  # switch to "probability" only after calibration is validated


# ----------------------------------------------------------------------------- data
def load(path):
    df = pd.read_csv(path)
    df["buggy"] = df["buggy"].astype(int)
    df["project"] = df["project"].replace(HADOOP_FAMILY)
    df["date"] = pd.to_datetime(df["author_date"], unit="s")
    assert df[FEATURES].notna().all().all(), "missing values in features"
    assert (df[FEATURES] >= 0).all().all(), "negative feature values (log1p would fail)"
    assert not df["commit_id"].duplicated().any(), "duplicate commit ids"
    assert not (set(FEATURES) & FORBIDDEN), "forbidden column used as predictor"
    return df.sort_values("date").reset_index(drop=True)


def chrono_split(df, train_end, val_start, val_end, test_start, test_end=None):
    """Global date cutoffs; the gaps between periods guard against label latency."""
    t = lambda s: pd.Timestamp(s)
    day = pd.Timedelta(days=1)  # end dates are inclusive calendar days, so include the whole last day
    train = df[df.date < t(train_end) + day]
    val = df[(df.date >= t(val_start)) & (df.date < t(val_end) + day)]
    test = df[df.date >= t(test_start)]
    if test_end:
        test = test[test.date < t(test_end) + pd.Timedelta(days=1)]
    assert train.date.max() < val.date.min() <= val.date.max() < test.date.min()
    assert not (set(train.commit_id) & set(val.commit_id)) and not (set(val.commit_id) & set(test.commit_id))
    return train, val, test


# ----------------------------------------------------------------------------- models
def make_models(seed=SEED):
    logt = lambda: FunctionTransformer(np.log1p)
    return {
        "la_only_lr": (["la"], make_pipeline(logt(), StandardScaler(), LogisticRegression(max_iter=1000))),
        "logistic_regression": (FEATURES, make_pipeline(logt(), StandardScaler(), LogisticRegression(max_iter=1000))),
        "random_forest": (FEATURES, RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1, random_state=seed)),
        "gradient_boosting": (FEATURES, HistGradientBoostingClassifier(max_iter=200, learning_rate=0.05, random_state=seed)),
    }


def _logit(p):
    p = np.clip(p, 1e-6, 1 - 1e-6)
    return np.log(p / (1 - p)).reshape(-1, 1)


def fit_platt(raw_val, y_val):
    return LogisticRegression().fit(_logit(raw_val), y_val)


def apply_platt(cal, raw):
    return cal.predict_proba(_logit(raw))[:, 1]


def best_f1_threshold(y, s):
    pr, rc, th = precision_recall_curve(y, s)
    f1 = 2 * pr[:-1] * rc[:-1] / (pr[:-1] + rc[:-1] + 1e-12)
    return float(th[int(np.argmax(f1))])


def metrics_at(y, s, thr):
    pred = (s >= thr).astype(int)
    return {
        "pr_auc": float(average_precision_score(y, s)),
        "roc_auc": float(roc_auc_score(y, s)),
        "precision": float(precision_score(y, pred, zero_division=0)),
        "recall": float(recall_score(y, pred)),
        "f1": float(f1_score(y, pred)),
        "mcc": float(matthews_corrcoef(y, pred)),
        "brier": float(brier_score_loss(y, s)),
        "threshold": float(thr),
    }


# ----------------------------------------------------------------------------- review budget
def _rank(score, seed=0):
    """Order indices by descending score, random (seeded) tie-break."""
    tie = np.random.default_rng(seed).random(len(score))
    return np.lexsort((tie, -np.asarray(score, dtype=float)))


def n_reviewed(n, frac):
    return int(np.ceil(round(frac * n, 9)))


def budget_row(y, score, frac, seed=0):
    k = n_reviewed(len(y), frac)
    return k, int(np.asarray(y)[_rank(score, seed)][:k].sum())


def budget_table(y, model_score, size_score, budgets=(10, 20, 30)):
    """Rows for model / change_size / random at each budget, same commits for all."""
    y = np.asarray(y)
    n, total = len(y), int(y.sum())
    rows = []
    for b in budgets:
        frac = b / 100
        k_m, c_m = budget_row(y, model_score, frac)
        k_s, c_s = budget_row(y, size_score, frac)
        k_r = n_reviewed(n, frac)
        for method, k, c in (("model", k_m, c_m), ("change_size", k_s, c_s), ("random", k_r, total * k_r / n)):
            rows.append({"budget_pct": b, "method": method, "commits_reviewed": k,
                         "buggy_caught": round(float(c), 2), "total_buggy": total,
                         "eval_set_size": n, "capture_rate": round(float(c) / total, 4)})
    return rows


def capture_curve(y, model_score, size_score, step=1):
    y = np.asarray(y)
    n, total = len(y), int(y.sum())
    om, os_ = _rank(model_score), _rank(size_score)
    cm, cs = np.cumsum(y[om]), np.cumsum(y[os_])
    pts = [{"pct_reviewed": 0, "model": 0.0, "change_size": 0.0, "random": 0.0}]
    for p in range(step, 101, step):
        k = n_reviewed(n, p / 100)
        pts.append({"pct_reviewed": p,
                    "model": round(100 * cm[k - 1] / total, 2),
                    "change_size": round(100 * cs[k - 1] / total, 2),
                    "random": round(100 * k / n, 2)})
    return pts


# ----------------------------------------------------------------------------- model selection
# Validation PR-AUC varies by about +/-0.003 between random seeds, so models closer than this are tied.
SELECTION_TOLERANCE = 0.003
SIMPLICITY_ORDER = ["la_only_lr", "logistic_regression", "gradient_boosting", "random_forest"]  # simplest first


def select_model(rows, tol=SELECTION_TOLERANCE):
    """Highest validation PR-AUC; among models within `tol` of it, prefer the simplest (smaller artefact,
    easier to explain). Uses validation results only; the test set plays no part in selection."""
    top = max(r["val_pr_auc"] for r in rows)
    tied = [r for r in rows if r["val_pr_auc"] >= top - tol]
    return min(tied, key=lambda r: SIMPLICITY_ORDER.index(r["model_id"]))["model_id"]


# ----------------------------------------------------------------------------- main
def run(args):
    os.makedirs("reports", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    df = load(args.data)
    full_summary = {
        "total_commits": int(len(df)), "buggy_commits": int(df.buggy.sum()),
        "buggy_rate": float(df.buggy.mean()), "projects": sorted(df.project.unique().tolist()),
        "per_project": {p: {"commits": int(len(g)), "buggy": int(g.buggy.sum())} for p, g in df.groupby("project")},
        "date_range": {"start": str(df.date.min().date()), "end": str(df.date.max().date())},
        "project_note": ("apache/hadoop-hdfs, apache/hadoop-mapreduce and apache/hadoop are merged into "
                         "one project; together they match the ApacheJIT paper's HDFS + MapReduce totals."),
        # Typical ranges in the training data, so users enter values on the dataset's scale
        "feature_ranges": {f: {"min": round(float(df[f].min()), 3), "median": round(float(df[f].median()), 3),
                               "p95": round(float(df[f].quantile(0.95)), 3), "max": round(float(df[f].max()), 3)}
                           for f in FEATURES},
    }
    json.dump(full_summary, open("reports/dataset_summary.json", "w"), indent=2)

    def split_for(frame, test_end=args.test_end):
        return chrono_split(frame, args.train_end, args.val_start, args.val_end, args.test_start, test_end)

    main_df = df  # all commits; the three Hadoop labels are already merged in load()
    train, val, test = split_for(main_df)
    print(f"train {len(train)} ({train.buggy.mean():.3f}) | val {len(val)} ({val.buggy.mean():.3f}) | "
          f"test {len(test)} ({test.buggy.mean():.3f})")

    version = "v1.0-" + datetime.now(timezone.utc).strftime("%Y%m%d")
    fitted, rows = {}, []
    for name, (cols, model) in make_models().items():
        model.fit(train[cols], train.buggy)
        raw_val = model.predict_proba(val[cols])[:, 1]
        cal = fit_platt(raw_val, val.buggy)
        s_val = apply_platt(cal, raw_val)
        thr = best_f1_threshold(val.buggy, s_val)
        s_test = apply_platt(cal, model.predict_proba(test[cols])[:, 1])
        fitted[name] = (cols, model, cal, thr, s_test)
        val_ap = float(average_precision_score(val.buggy, s_val))
        rows.append({"model_id": name, "model_name": name.replace("_", " "),
                     "val_pr_auc": val_ap, **metrics_at(test.buggy, s_test, thr)})
        print(f"{name:20s} val PR-AUC {val_ap:.3f} | test PR-AUC {rows[-1]['pr_auc']:.3f} "
              f"ROC {rows[-1]['roc_auc']:.3f} Brier {rows[-1]['brier']:.3f}")

    # Select on VALIDATION only; the test set is never used for selection.
    best = select_model(rows)
    cols, model, cal, thr, s_test = fitted[best]
    for r in rows:
        r["is_active"] = r["model_id"] == best
        r["model_status"] = args.status
        r["threshold_method"] = "maximises F1 on the validation period"
    ev_ctx = {"split_name": "chronological-test", "split_type": "chronological",
              "date_range": {"start": str(test.date.min().date()), "end": str(test.date.max().date())},
              "total_commits": int(len(test)), "buggy_commits": int(test.buggy.sum()),
              "model_version": version}
    json.dump({"models": rows, "evaluation_context": ev_ctx, "calibration_available": False,
               "score_type": SCORE_TYPE, "selected_model": best,
               "selection_rule": (f"Highest validation PR-AUC; models within {SELECTION_TOLERANCE} of the best "
                                  "are treated as tied and the simpler model is chosen.")},
              open("reports/model_metrics.json", "w"), indent=2)

    split_cfg = {**ev_ctx, "train_end": args.train_end, "val_start": args.val_start, "val_end": args.val_end,
                 "test_start": args.test_start, "note": "Gaps between periods reduce label latency leakage.",
                 "counts": {k: {"commits": int(len(x)), "buggy": int(x.buggy.sum())}
                            for k, x in (("train", train), ("val", val), ("test", test))},
                 "excluded_from_main_run": [],
                 "project_note": "apache/hadoop-hdfs, apache/hadoop-mapreduce and apache/hadoop are merged into one project (see pipeline.py)."}
    json.dump(split_cfg, open("reports/split_config.json", "w"), indent=2)

    # Calibration table (for the report; the app stays on 'relative risk score' until validated)
    bins = pd.cut(s_test, [0, .05, .1, .2, .3, .4, .5, .6, .8, 1.0], include_lowest=True)
    cal_df = (pd.DataFrame({"bin": bins.astype(str), "pred": s_test, "obs": test.buggy.values})
              .groupby("bin", observed=True).agg(n=("obs", "size"), mean_predicted=("pred", "mean"),
                                                 observed_rate=("obs", "mean")).reset_index())
    cal_df.to_csv("reports/calibration_bins.csv", index=False)

    # Review budget + capture curve on the held-out test set (same commits for all methods)
    y, size = test.buggy.values, (test.la + test.ld).values
    bt = [{"view": "pooled", "project": "ALL", **r} for r in budget_table(y, s_test, size)]
    for proj, idx in test.reset_index(drop=True).groupby("project").groups.items():
        yp = y[idx]
        if yp.sum() == 0:
            for b in (10, 20, 30):
                for m in ("model", "change_size", "random"):
                    bt.append({"view": "per_project", "project": proj, "budget_pct": b, "method": m,
                               "commits_reviewed": n_reviewed(len(yp), b / 100), "buggy_caught": None,
                               "total_buggy": None, "eval_set_size": int(len(yp)), "capture_rate": None})
        else:
            bt += [{"view": "per_project", "project": proj, **r}
                   for r in budget_table(yp, s_test[idx], size[idx])]
    bdf = pd.DataFrame(bt)
    bdf["rounding_policy"], bdf["tie_policy"], bdf["random_method"] = ROUNDING_POLICY, TIE_POLICY, RANDOM_METHOD
    bdf.to_csv("reports/review_budget_results.csv", index=False)
    pd.DataFrame(capture_curve(y, s_test, size)).to_csv("reports/capture_curve.csv", index=False)

    # Retrospective commit ranking
    cp = pd.DataFrame({"commit_id": test.commit_id.values, "project": test.project.values,
                       "risk_score": np.round(s_test, 6),
                       "outcome": np.where(y == 1, "buggy", "clean"),
                       "score_type": SCORE_TYPE, "model_version": version})
    cp.sort_values("risk_score", ascending=False).to_csv("reports/commit_predictions.csv", index=False)

    # Global permutation importance (magnitude only; not causal), on a validation sample
    vs = val.sample(min(15000, len(val)), random_state=SEED)
    pi = permutation_importance(model, vs[cols], vs.buggy, scoring="average_precision",
                                n_repeats=5, random_state=SEED, n_jobs=-1)
    pd.DataFrame({"feature": cols, "importance": pi.importances_mean.round(6),
                  "method": "permutation_importance (drop in validation PR-AUC)",
                  "model_version": version}).sort_values("importance", ascending=False
                  ).to_csv("reports/feature_importance.csv", index=False)

    joblib.dump({"model": model, "calibrator": cal, "features": cols, "threshold": thr,
                 "model_name": best, "model_status": args.status, "model_version": version,
                 "score_type": SCORE_TYPE}, "models/model.joblib")

    run_experiments(df, args, best, version)
    print("Selected:", best, "| files written to reports/ and models/")


# ----------------------------------------------------------------------------- experiments
def _fit_eval(best, tr, te_val, te):
    cols, model = make_models()[best]
    model.fit(tr[cols], tr.buggy)
    raw_v = model.predict_proba(te_val[cols])[:, 1]
    cal = fit_platt(raw_v, te_val.buggy)
    s = apply_platt(cal, model.predict_proba(te[cols])[:, 1])
    base = float(te.buggy.mean())
    k = n_reviewed(len(te), 0.2)
    cap = float(te.buggy.values[_rank(s)][:k].sum() / max(te.buggy.sum(), 1))
    ap = float(average_precision_score(te.buggy, s))
    return {"roc_auc": float(roc_auc_score(te.buggy, s)), "pr_auc": ap,
            "pr_auc_lift_over_base_rate": round(ap / base, 3),
            "capture_at_20pct": round(cap, 4), "capture_lift_over_random": round(cap / 0.2, 3),
            "test_buggy_rate": round(base, 4), "test_size": int(len(te))}


def run_experiments(df, args, best, version):
    out = {"model": best,
           "note": ("PR-AUC and capture depend on the base rate, so compare ROC-AUC and the lift columns "
                    "across experiments, not raw PR-AUC. None of these experiments affect model selection.")}
    c = lambda frame, te_end=args.test_end: chrono_split(frame, args.train_end, args.val_start,
                                                         args.val_end, args.test_start, te_end)
    main_df = df
    tr, va, te = c(main_df)
    out["chronological_main"] = _fit_eval(best, tr, va, te)

    # 1. Random vs chronological split: same pool, same sizes
    pool = pd.concat([tr, va, te]).sample(frac=1, random_state=SEED)
    a, b = len(tr), len(va)
    out["random_split_same_sizes"] = _fit_eval(best, pool.iloc[:a], pool.iloc[a:a + b], pool.iloc[a + b:])

    # 2. Label latency: extend the test period through 2019 (labels there are right-censored)
    tr2, va2, te2 = c(main_df, "2019-12-31")
    out["chronological_test_through_2019"] = _fit_eval(best, tr2, va2, te2)
    te19 = te2[te2.date >= pd.Timestamp("2019-01-01")]
    out["buggy_rate_by_year_in_test_window"] = {
        str(y): round(float(g.buggy.mean()), 4) for y, g in te2.groupby(te2.date.dt.year)}

    # 3. Sensitivity: drop the whole Hadoop family (largest project group after Camel) from every split
    tr_h, va_h, te_h = c(df[df.project != HADOOP])
    out["hadoop_family_excluded"] = _fit_eval(best, tr_h, va_h, te_h)

    # 4. Leave-one-project-out (time ignored): cross-project transfer
    lopo = {}
    for proj in sorted(main_df.project.unique()):
        te_p = main_df[main_df.project == proj]
        if te_p.buggy.sum() < 30:
            lopo[proj] = {"skipped": "fewer than 30 buggy commits"}
            continue
        rest = main_df[main_df.project != proj]
        cols, model = make_models()[best]
        model.fit(rest[cols], rest.buggy)
        s = model.predict_proba(te_p[cols])[:, 1]
        base = float(te_p.buggy.mean())
        k = n_reviewed(len(te_p), 0.2)
        cap = float(te_p.buggy.values[_rank(s)][:k].sum() / te_p.buggy.sum())
        ap = float(average_precision_score(te_p.buggy, s))
        lopo[proj] = {"roc_auc": round(float(roc_auc_score(te_p.buggy, s)), 4),
                      "pr_auc_lift_over_base_rate": round(ap / base, 3), "base_rate": round(base, 4),
                      "capture_at_20pct": round(cap, 4), "capture_lift_over_random": round(cap / 0.2, 3),
                      "max_possible_capture_at_20pct": round(min(1.0, 0.2 / base), 4)}
    out["leave_one_project_out"] = lopo
    json.dump(out, open("reports/experiments.json", "w"), indent=2)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data/raw/apachejit_total.csv")
    ap.add_argument("--train-end", default="2016-09-30")
    ap.add_argument("--val-start", default="2017-01-01")
    ap.add_argument("--val-end", default="2017-09-30")
    ap.add_argument("--test-start", default="2018-01-01")
    ap.add_argument("--test-end", default="2018-12-31",
                    help="Main test ends here: later labels are right-censored (bug fixes not yet recorded).")
    ap.add_argument("--status", default="provisional", choices=["provisional", "final"])
    run(ap.parse_args())
