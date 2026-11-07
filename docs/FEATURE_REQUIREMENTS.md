# Feature Requirements

## Priority
- **P0:** Must work for the final demonstration.
- **P1:** Important polish if time permits.
- **P2:** Optional; only after P0 is stable.

## P0 – Must-have

### Overview dashboard
- Project introduction and intended-use note.
- Dataset size and target distribution.
- Selected model and metrics loaded from actual experiment outputs.
- Clearly state which evaluation split produced the metrics.

### Commit risk prediction
- Form accepts the final approved model features only.
- Validate required fields and numeric ranges.
- Backend loads the saved fitted preprocessing-plus-model pipeline.
- Display predicted class and estimated probability/risk.
- State that the score is an estimate, not certainty.
- Handle missing model files and invalid input gracefully.

### Risk explanation
- Show influential features using a method compatible with the selected model.
- Do not imply feature importance proves causation.
- If only global explanation is implemented, label it as global.

### Historical commit prioritisation
- Load a prepared evaluation/demo dataset with actual model predictions.
- Allow project filtering where feasible.
- Rank commits by predicted risk.
- Show commit ID, project, and risk score.
- In retrospective evaluation views, actual labels may be shown clearly as historical ground truth.
- Do not imply historical replay is live GitHub analysis.

### Review-budget analysis
- Show top 10%, 20%, and 30% review-budget results.
- Show commits reviewed and actual buggy commits captured.
- Compare with random and change-size baselines.
- Show evaluation-set size and total buggy commits.
- Load computed experiment outputs; do not hardcode results.

### Model comparison
- Compare candidate models on the same held-out split.
- Display PR-AUC, ROC-AUC, precision, recall, F1, and MCC where defined.
- State how the classification threshold was selected.
- Explain final model selection briefly.

## P1 – Should-have
- Project and risk filters.
- Confusion matrix.
- Dataset and project charts.
- Download ranked commits as CSV.
- Helpful empty states and errors.
- Model limitations/model card page.

## P2 – Optional
- Multiple split comparison.
- Confidence intervals.
- LOC-weighted review-effort approximation.
- Advanced local explanations.
- External dataset evaluation.
- Label-noise robustness experiment.

## UI and API requirements
- Build a dedicated React web frontend; do not use Streamlit as the application UI.
- Use a Python FastAPI backend to expose prediction and experiment-result endpoints.
- Frontend and backend must communicate through documented request/response schemas.
- Frontend can be developed with temporary, clearly labelled mock data, but all demo results must be replaced by genuine outputs.
- UI must handle loading, empty, validation-error, and API-error states.
- Keep design polished and consistent, but prioritise usability and truthful data over decorative complexity.
- The project may use any suitable AI-assisted coding tool; no specific tool is required.

## Non-functional requirements
- Document actual launch commands once implementation exists.
- No raw data or secrets committed.
- Validated inputs.
- Compatible model and preprocessing artefacts.
- No fake fallback scores if model files are missing.
- Charts have titles, labels, and evaluation context.
- Usable on a typical laptop screen.

## Acceptance checklist
- [ ] App launches from a clean environment.
- [ ] Prediction uses the saved fitted pipeline through the API.
- [ ] Invalid input is handled.
- [ ] Risk score is labelled as an estimate.
- [ ] Explanation is derived from actual model information.
- [ ] Historical commits can be ranked using real model scores.
- [ ] Review-budget results are computed from experiments.
- [ ] Baselines use the same evaluation set.
- [ ] Model comparison uses consistent splits.
- [ ] No target, identifier, or prohibited leakage column enters predictors.
- [ ] No fabricated results are displayed.
