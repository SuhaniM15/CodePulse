# Decisions Needed and Decision Register

This file is the team's decision log. Record the final choice, evidence, owner and date when each item is resolved. Recommendations below are the current working position, not a substitute for checking the data and documenting the decision.

| ID | Decision | Current recommendation / evidence required | Owner |
|---|---|---|---|
| D1 | Dataset split strategy | Use a custom chronological train/validation/test split from `apachejit_total.csv` as the primary evaluation only after checking ID overlap, dates, project coverage, class prevalence and label availability. Reproduce the supplied train/test split as a secondary benchmark. Freeze the split and save its exact IDs/configuration by Nov 9. | Member 1 approves; Member 2 implements |
| D2 | Probability or relative-risk output | Default to a relative risk score. Display a calibrated probability only if a representative natural-prevalence calibration set and untouched final-test calibration evidence support it. | Member 3; Member 1 approves wording |
| D3 | Hadoop handling | Preserve all raw records. Run all-project and without-`apache/hadoop` sensitivity results. Do not use `apache/hadoop` as a positive-class held-out test fold because it has no positive labels in the inspected data; mark positive-class metrics N/A. This does not prove the labels are wrong. | Member 2 |
| D4 | Predictor list | Candidate numeric metrics: `la`, `ld`, `nf`, `nd`, `ns`, `ent`, `ndev`, `age`, `nuc`, `aexp`, `arexp`, `asexp`. Verify definitions against the ApacheJIT paper before final approval. Exclude `buggy`, `fix`, `commit_id`, `project`, `author_date` and `year` from predictors by default. | Member 1 approves; Member 2 implements |
| D5 | Review-budget calculation | Report top 10%, 20%, 30%; capture rate = buggy commits selected / all buggy commits in the evaluation set. Compare model, random ranking and change-size ranking. Specify rounding, deterministic tie handling, denominators and per-project treatment. | Member 4 |
| D6 | Deployment target | Decide by Nov 12 after checking actual hosting constraints. Keep a verified local demo as fallback; do not promise a hosted URL until deployed and tested. | Member 5 with Member 1 |

## Important evidence already observed

- `apachejit_train.csv`: 44,834 rows; approximately 50.01% buggy.
- `apachejit_test_large.csv`: 30,111 rows; approximately 19.32% buggy.
- `apachejit_test_small.csv`: 7,526 rows and is a subset of `apachejit_test_large.csv`; it is not an independent test set.
- Supplied train and large-test commit IDs were disjoint in the inspection performed. However, project-level date ranges overlap for several projects, so the supplied split should not be described as strictly chronological for every project.
- `apache/hadoop`: 11,964 inspected commits and zero `buggy=True` labels. Related repositories `apache/hadoop-hdfs` and `apache/hadoop-mapreduce` do contain positive labels.
- `fix=True` is strongly associated with `buggy=True` in the inspected cross-tab, but the exact meaning and prediction-time availability of `fix` have not been verified. Exclude it for now; do not assert confirmed leakage.
- `apachejit_total.csv` contains rows not accounted for by the supplied train and large-test files based on the initial row counts. The exact candidate validation pool must be identified by commit-ID set operations and then checked; do not assume it is automatically valid.

## Split and calibration safeguards

1. Never hand-author a split configuration before the actual split code has produced and validated it. Save the resulting IDs, date boundaries, project coverage, prevalence and random seed in `reports/split_config.json`.
2. Consider a label-availability gap only after investigating how long bug-inducing commits take to be identified through later fixing commits. The gap must be evidence-based, not arbitrary.
3. Use validation data for model selection, threshold selection and calibration fitting. Keep final test data untouched until final evaluation.
4. For random-versus-chronological comparisons, keep the model family, feature set and metrics consistent, and use comparable training sizes.
5. Never tune repeatedly against final-test results.

## Decision status

As decisions are confirmed, replace the recommendation with the selected option and add:
- decision date;
- evidence/notebook or report path;
- person approving it;
- impact on code, evaluation and report.
