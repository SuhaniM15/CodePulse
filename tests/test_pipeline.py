"""Leakage and metric-logic tests. Run: pytest -q"""
import numpy as np
import pandas as pd
import pytest

from src.pipeline import (FEATURES, FORBIDDEN, HADOOP, budget_table, capture_curve, chrono_split, load,
                          n_reviewed, _rank)

DATA = "data/raw/apachejit-master/apachejit-master/dataset/apachejit_total.csv"
CUT = dict(train_end="2016-09-30", val_start="2017-01-01", val_end="2017-09-30",
           test_start="2018-01-01", test_end="2018-12-31")


@pytest.fixture(scope="module")
def df():
    return load(DATA)


def test_features_exclude_forbidden_columns():
    assert not (set(FEATURES) & FORBIDDEN)
    assert len(FEATURES) == 12


def test_split_is_strictly_chronological_and_disjoint(df):
    tr, va, te = chrono_split(df, **CUT)
    assert tr.date.max() < va.date.min() and va.date.max() < te.date.min()
    ids = [set(x.commit_id) for x in (tr, va, te)]
    assert not (ids[0] & ids[1]) and not (ids[1] & ids[2]) and not (ids[0] & ids[2])
    assert len(tr) > 0 and len(va) > 0 and len(te) > 0


def test_hadoop_projects_are_merged(df):
    hadoop = df[df["project"] == "apache/hadoop"]

    assert len(hadoop) == 16192
    assert int(hadoop["buggy"].sum()) == 3060

    assert "apache/hadoop-hdfs" not in df["project"].values
    assert "apache/hadoop-mapreduce" not in df["project"].values

def test_n_reviewed_uses_ceil():
    assert n_reviewed(100, 0.1) == 10 and n_reviewed(101, 0.1) == 11 and n_reviewed(7046, 0.2) == 1410


def test_perfect_ranker_catches_everything_possible():
    y = np.array([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
    rows = budget_table(y, y.astype(float), np.zeros(10), budgets=(20,))
    model = [r for r in rows if r["method"] == "model"][0]
    assert model["buggy_caught"] == 2 and model["capture_rate"] == 1.0


def test_random_baseline_matches_budget_fraction_and_same_rows():
    rng = np.random.default_rng(0)
    y = (rng.random(1000) < 0.3).astype(int)
    rows = budget_table(y, rng.random(1000), rng.random(1000))
    for r in rows:
        assert r["eval_set_size"] == 1000 and r["total_buggy"] == int(y.sum())
        if r["method"] == "random":
            assert abs(r["capture_rate"] - r["budget_pct"] / 100) < 0.01


def test_capture_curve_is_monotone_and_ends_at_100():
    rng = np.random.default_rng(1)
    y = (rng.random(500) < 0.2).astype(int)
    pts = pd.DataFrame(capture_curve(y, rng.random(500), rng.random(500)))
    assert pts.model.is_monotonic_increasing and pts.model.iloc[-1] == 100.0
    assert pts.pct_reviewed.iloc[0] == 0 and pts.pct_reviewed.iloc[-1] == 100


def test_ranking_tie_break_is_deterministic():
    s = np.zeros(50)
    assert (_rank(s, 0) == _rank(s, 0)).all()
