# Feature and Application Requirements

## Architecture
React frontend → FastAPI backend → preprocessing + saved ML model → structured response → frontend visualisation.

Final UI results must come from actual outputs. Mock data is allowed during early UI development only and must be replaced before review.

## Pages
1. **Overview:** purpose, limitations, model status, sourced summary metrics.
2. **Commit Analysis:** approved metric inputs, validation, risk score and supported explanation. Show probability only if calibrated.
3. **Review Budget (highest priority):** top 10/20/30%; buggy commits captured and capture rate; model vs random vs change-size; pooled and per-project views; denominator, sample size, rounding and tie policy.
4. **Model Performance:** PR-AUC, ROC-AUC, precision, recall, F1, MCC where applicable; Brier/calibration plot if probabilities; prevalence and split type.
5. **Explainability:** global importance and example explanation where supported; association is not causation.
6. **Historical Evaluation:** ranked commits from labelled offline data; do not imply live GitHub analysis.

## Priority
**P0:** health check, validated prediction endpoint, actual model loading/inference, Review Budget page with real results, Model Performance page, correct score/probability wording, error handling and end-to-end test.

**P1:** commit explanation, pooled/per-project filter, historical ranking, calibration visualisation.

**P2 (cut first):** CSV download, extra filters, confusion matrix, separate model-card page, decorative polish. Do not cut Review Budget.

## API contract by Nov 8
Agree prediction request/response, model metrics, pooled review-budget, per-project evaluation and explainability schemas. Specify field names, types, required fields and examples.

### Illustrative request only
```json
{
  "la": 12, "ld": 4, "nf": 2, "nd": 1, "ns": 1,
  "ent": 0.7, "ndev": 3, "age": 14, "nuc": 8,
  "aexp": 20, "arexp": 12, "asexp": 9
}
```

### Illustrative response only — values are placeholders
```json
{
  "model_status": "provisional",
  "score_type": "relative_risk_score",
  "risk_score": 0.73,
  "probability": null,
  "explanation": [{"feature": "la", "direction": "increases_score"}],
  "notice": "Decision support only; inspect and test the code change."
}
```
Never present placeholder values as project results. A probability field may be populated only when calibration is supported by suitable validation evidence.

## Suggested report files
- `model_metrics.json`
- `review_budget_pooled.csv`
- `review_budget_by_project.csv`
- `cross_project_metrics.csv`
- `calibration_metrics.json`
- `predictions.csv`

Include model version, dataset subset, split type and evaluation metadata.
