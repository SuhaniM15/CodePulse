# Development Guidelines

## Git
Keep `main` stable. Use task branches and focused commits. Submit PRs for review. Never commit raw data, `.venv`, credentials, tokens or `.env`. Keep `.env.example` updated when needed.

## Code understanding
AI-assisted development is permitted, but the PR author must read, test and understand submitted code, and be able to explain its purpose, flow, inputs, outputs, dependencies and limitations. Do not merge code nobody understands.

## Data integrity
Keep `data/raw/` unchanged. Put transformations in `data/processed/`. Document exclusions and filtering. Never silently relabel or delete anomalous records. Record source file, row count and split details.

## ML discipline
Keep target out of predictors. Exclude identifiers and fields unavailable at prediction time. Fit preprocessing on training data only. Use validation for model selection, threshold selection and calibration. Keep final test separate. Record seeds/splits. Do not repeatedly tune against test results. Do not show uncalibrated scores as probabilities.

## Integration
- Nov 8: schemas and sample responses agreed.
- Nov 9–10: provisional model artefact and early integration.
- Nov 15–16: final model and real outputs integrated; end-to-end tests.
- Nov 17: finish report/presentation and fixes.
- Nov 18: code freeze and rehearsal.

## Tests
Check loader, forbidden predictors, train-only preprocessing, saved-model loading, API health, invalid input handling, response schema, frontend/API connection, review-budget denominator/rounding/ties, and handling of projects with no positive labels. Final demo must not use mock results.

## Deployment and fallback
By Nov 12, decide whether to deploy React and FastAPI separately or use a reliable local demo if acceptable. Verify hosting limits rather than assuming free tiers. Prepare local instructions, screenshots and a short screen recording.

Raise blockers early. Use clearly labelled provisional interfaces/artifacts where needed; never hide unfinished work or invent results.
