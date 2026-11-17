"""API contract tests (need reports/ and models/ from src/pipeline.py). Run: pytest -q"""
import os

import pytest
from fastapi.testclient import TestClient

from backend.main import FEATURES, app

pytestmark = pytest.mark.skipif(not os.path.exists("models/model.joblib"), reason="run src/pipeline.py first")
client = TestClient(app)
GOOD = dict(la=100, ld=20, nf=5, nd=2, ns=1, ent=1.2, ndev=3, age=40, nuc=60, aexp=500, arexp=200, asexp=100)


def test_health():
    r = client.get("/health").json()
    assert r["model_loaded"] is True and r["model_status"] in ("provisional", "final")


def test_evaluation_context_fields():
    r = client.get("/evaluation-context").json()
    assert {"split_name", "date_range", "total_commits", "buggy_commits", "model_version"} <= set(r)


def test_metrics_has_active_model_and_threshold_method():
    m = client.get("/metrics").json()
    assert sum(x["is_active"] for x in m["models"]) == 1
    assert all(k in m["models"][0] for k in ("pr_auc", "roc_auc", "brier", "threshold_method", "model_status"))



def test_review_budget_pooled_and_per_project_nulls():
    p = client.get("/review-budget?view=pooled").json()
    assert {r["method"] for r in p["results"]} == {"model", "random", "change_size"}
    assert p["rounding_policy"] and p["tie_policy"]

    pp = client.get("/review-budget?view=per_project").json()
    assert "results" in pp and "projects" not in pp

    hadoop = [r for r in pp["results"] if r["project"] == "apache/hadoop"]
    assert hadoop
    assert all(
        r["buggy_caught"] is not None and r["capture_rate"] is not None
        for r in hadoop
    )

    random_rows = [r for r in p["results"] if r["method"] == "random"]
    assert random_rows and all(
        isinstance(r["buggy_caught"], (int, float))
        for r in random_rows
    )



def test_dataset_summary_per_project_is_array():
    r = client.get("/dataset-summary").json()
    assert isinstance(r["per_project"], list)
    assert {"project", "total_commits", "buggy_commits"} <= set(r["per_project"][0])



def test_capture_curve():
    r = client.get("/capture-curve").json()
    assert r["step_pct"] == 1 and r["random_method"]
    assert {s["method"] for s in r["series"]} == {"model", "change_size", "random"}
    model = next(s for s in r["series"] if s["method"] == "model")
    assert model["points"][0]["pct_reviewed"] == 0
    assert model["points"][-1]["pct_caught"] == 100.0
    assert set(model["points"][0]) == {"pct_reviewed", "pct_caught"}


def test_commits_pagination_sort_filter():
    r = client.get("/commits?page=2&page_size=10&sort_by=risk_score&sort_dir=desc").json()
    assert len(r["commits"]) == 10 and r["page"] == 2 and r["total"] > 100
    scores = [c["risk_score"] for c in r["commits"]]
    assert scores == sorted(scores, reverse=True)
    f = client.get("/commits?project=apache/kafka").json()
    assert f["total"] > 0 and {c["project"] for c in f["commits"]} == {"apache/kafka"}
    assert set(r["commits"][0]) >= {"commit_id", "project", "risk_score", "outcome", "score_type"}


def test_feature_importance_magnitude_only():
    r = client.get("/feature-importance").json()
    assert set(r["features"][0]) == {"feature", "importance"} and r["method"]


def test_predict_ok_and_wording():
    r = client.post("/predict", json=GOOD).json()
    assert 0 <= r["risk_score"] <= 1 and r["score_type"] == "relative_risk_score" and r["model_version"]


def test_predict_validation_errors_use_error_shape():
    bad = {**GOOD, "la": -5}
    r = client.post("/predict", json=bad)
    assert r.status_code == 422 and r.json()["error_code"] == "VALIDATION_ERROR" and "la" in r.json()["message"]
    missing = {k: v for k, v in GOOD.items() if k != "nf"}
    assert client.post("/predict", json=missing).status_code == 422
    assert client.post("/predict", json={**GOOD, "extra": 1}).status_code == 422


def test_unknown_sort_column_is_422():
    assert client.get("/commits?sort_by=nope").status_code == 422
