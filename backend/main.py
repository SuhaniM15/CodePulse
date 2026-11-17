"""CodePulse API. Serves the files produced by src/pipeline.py.

Run from the repo root:
    uvicorn backend.main:app --reload --port 8000
Interactive docs: http://localhost:8000/docs
"""
import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

ROOT = Path(os.environ.get("CODEPULSE_ROOT", Path(__file__).resolve().parents[1]))
REPORTS, MODELS = ROOT / "reports", ROOT / "models"
FEATURES = ["la", "ld", "nf", "nd", "ns", "ent", "ndev", "age", "nuc", "aexp", "arexp", "asexp"]

app = FastAPI(title="CodePulse API", version="1.0")
origins = os.environ.get("CODEPULSE_CORS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


# ------------------------------------------------------------------ errors
def _err(status, code, message, detail=None):
    return JSONResponse(status_code=status, content={"error_code": code, "message": message, "detail": detail})


@app.exception_handler(HTTPException)
async def http_exc(_: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error_code" in exc.detail:
        return _err(exc.status_code, exc.detail["error_code"], exc.detail["message"], exc.detail.get("detail"))
    return _err(exc.status_code, "HTTP_ERROR", str(exc.detail))



@app.exception_handler(RequestValidationError)
async def validation_exc(_: Request, exc: RequestValidationError):
    errors = []

    for error in exc.errors():
        field = ".".join(
            str(part)
            for part in error["loc"]
            if part != "body"
        )

        errors.append({
            "field": field,
            "message": error["msg"]
        })

    message = "; ".join(
        f"{error['field']}: {error['message']}"
        for error in errors
    )

    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "message": f"Invalid input. {message}",
            "field_errors": errors
        }
    )


def _missing(name):
    raise HTTPException(503, {"error_code": "REPORT_NOT_FOUND",
                              "message": f"{name} has not been generated. Run: python src/pipeline.py"})


# ------------------------------------------------------------------ loading
_cache = {}


def _artefact():
    if "a" not in _cache:
        p = MODELS / "model.joblib"
        _cache["a"] = joblib.load(p) if p.exists() else None
    return _cache["a"]


def _json_file(name):
    p = REPORTS / name
    if not p.exists():
        _missing(name)
    return json.loads(p.read_text())


def _csv(name):
    if name not in _cache:
        p = REPORTS / name
        if not p.exists():
            _missing(name)
        _cache[name] = pd.read_csv(p)
    return _cache[name]


def _records(df):
    """DataFrame -> list of dicts with NaN converted to None (JSON null)."""
    return json.loads(df.to_json(orient="records"))


def _eval_ctx():
    c = _json_file("split_config.json")
    return {k: c[k] for k in ("split_name", "split_type", "date_range", "total_commits", "buggy_commits",
                              "model_version")}


# ------------------------------------------------------------------ endpoints
@app.get("/health")
def health():
    a = _artefact()
    return {"status": "ok" if a else "degraded", "model_loaded": a is not None,
            "model_version": a["model_version"] if a else None,
            "model_status": a["model_status"] if a else None}


@app.get("/evaluation-context")
def evaluation_context():
    return _eval_ctx()


@app.get("/dataset-summary")
def dataset_summary():
    summary = _json_file("dataset_summary.json")
    per_project = summary.get("per_project", {})
    # Expose project statistics as an array, matching the frontend API contract.
    summary["per_project"] = [
        {
            "project": project,
            "total_commits": counts.get("total_commits", counts.get("commits")),
            "buggy_commits": counts.get("buggy_commits", counts.get("buggy")),
        }
        for project, counts in sorted(per_project.items())
    ]
    return summary


@app.get("/metrics")
def metrics():
    return _json_file("model_metrics.json")


@app.get("/review-budget")
def review_budget(view: str = Query("pooled", pattern="^(pooled|per_project)$")):
    df = _csv("review_budget_results.csv")
    df = df[df["view"] == view].copy()
    policies = {k: str(df[k].iloc[0]) for k in ("rounding_policy", "tie_policy", "random_method")}
    cols = ["budget_pct", "method", "commits_reviewed", "buggy_caught", "total_buggy", "eval_set_size",
            "capture_rate"]
    for c in ("budget_pct", "commits_reviewed", "total_buggy", "eval_set_size"):  # keep counts as integers
        df[c] = df[c].astype("Int64")
    if view == "pooled":
        return {"view": view, "results": _records(df[cols]), **policies, "evaluation_context": _eval_ctx()}
    return {"view": view, "results": _records(df[["project"] + cols]), **policies,
            "evaluation_context": _eval_ctx()}


@app.get("/capture-curve")
def capture_curve():
    df = _csv("capture_curve.csv")
    b = _csv("review_budget_results.csv").iloc[0]
    # Convert the wide CSV (one column per ranking method) into the series
    # structure consumed by the React capture-curve chart.
    series = [
        {
            "method": method,
            "points": [
                {"pct_reviewed": int(row.pct_reviewed), "pct_caught": float(getattr(row, method))}
                for row in df.itertuples(index=False)
            ],
        }
        for method in ("model", "change_size", "random")
    ]
    return {"step_pct": 1, "series": series, "random_method": b["random_method"],
            "tie_policy": b["tie_policy"], "evaluation_context": _eval_ctx()}


@app.get("/commits")
def commits(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=200),
            sort_by: str = "risk_score", sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
            project: str | None = None):
    df = _csv("commit_predictions.csv")
    if sort_by not in df.columns:
        raise HTTPException(422, {"error_code": "VALIDATION_ERROR",
                                  "message": f"sort_by must be one of: {', '.join(df.columns)}"})
    if project:
        df = df[df["project"] == project]
    df = df.sort_values(sort_by, ascending=(sort_dir == "asc"), kind="mergesort")
    chunk = df.iloc[(page - 1) * page_size: page * page_size]
    return {"commits": _records(chunk), "total": int(len(df)), "page": page, "page_size": page_size}


@app.get("/feature-importance")
def feature_importance():
    df = _csv("feature_importance.csv")
    return {"features": _records(df[["feature", "importance"]]), "method": str(df["method"].iloc[0]),
            "model_version": str(df["model_version"].iloc[0])}


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    la: float = Field(ge=0)
    ld: float = Field(ge=0)
    nf: float = Field(ge=0)
    nd: float = Field(ge=0)
    ns: float = Field(ge=0)
    ent: float = Field(ge=0)
    ndev: float = Field(ge=0)
    age: float = Field(ge=0)
    nuc: float = Field(ge=0)
    aexp: float = Field(ge=0)
    arexp: float = Field(ge=0)
    asexp: float = Field(ge=0)


@app.post("/predict")
def predict(req: PredictRequest):
    a = _artefact()
    if a is None:
        raise HTTPException(503, {"error_code": "MODEL_NOT_LOADED",
                                  "message": "No trained model is available. Run: python src/pipeline.py"})
    x = pd.DataFrame([req.model_dump()])[a["features"]]
    raw = float(a["model"].predict_proba(x)[:, 1][0])
    p = np.clip(raw, 1e-6, 1 - 1e-6)
    score = float(a["calibrator"].predict_proba(np.array([[np.log(p / (1 - p))]]))[0, 1])
    return {"model_status": a["model_status"], "score_type": a["score_type"], "risk_score": round(score, 6),
            "notice": ("Relative risk score for prioritising review. It is not a probability and "
                       "does not replace code review."),
            "model_version": a["model_version"]}
