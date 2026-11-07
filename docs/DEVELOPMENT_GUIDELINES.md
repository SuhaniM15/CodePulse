# Development and Integration Guidelines

## 1. Git workflow
- Keep `main` stable.
- Create one branch per task, e.g. `feature/preprocessing-pipeline`, `feature/model-training`, `feature/review-budget`, `feature/react-frontend`, `feature/fastapi-backend`.
- Raise a Pull Request for every change; do not commit directly to `main`.
- Pull the latest `main` before starting and before opening a PR.
- Keep PRs focused and small; request at least one teammate review.

## 2. GitHub Issues
Create one issue per deliverable. Each issue should state objective, scope, expected files, dependencies, acceptance criteria, owner, and target date.

Suggested issues:
1. Finalise dataset/feature decisions and document unresolved questions.
2. Implement dataset validation and loading.
3. Implement preprocessing and split utilities.
4. Implement baseline and candidate model training.
5. Implement model evaluation and export predictions.
6. Implement review-budget evaluation and ranking baselines.
7. Implement cross-project evaluation, explainability and error analysis.
8. Build React frontend shell and pages.
9. Build FastAPI schemas and endpoints.
10. Integrate frontend, API and saved model.
11. Add tests and final documentation.

## 3. Suggested module interfaces
Agree on function names and data contracts before integration. These are suggested interfaces, not completed implementations.

```python
# src/data_loader.py
def load_dataset(path):
    pass

# src/preprocessing.py
def get_feature_columns():
    pass

def build_preprocessor(model_name):
    pass

# src/splitting.py
def make_splits(df, strategy="temporal"):
    pass

# src/train.py
def train_models(X_train, y_train, X_valid, y_valid):
    pass

# src/evaluate.py
def evaluate_model(y_true, y_score, threshold):
    pass

# src/review_budget.py
def evaluate_review_budget(y_true, scores, budgets=(0.10, 0.20, 0.30)):
    pass
```

## 4. Shared data contract
- Target: `buggy`; positive class is `True`.
- Identifier: `commit_id`.
- Group field: `project`.
- Temporal fields: `year`, `author_date`.
- `fix` is excluded from predictors pending verification of its exact meaning.
- Approved predictor columns must be defined once and reused by training and inference.
- Feature order and preprocessing must match between training and prediction.
- Save feature configuration with the model artefact.

## 5. Suggested model/evaluation outputs
- `models/codepulse_pipeline.joblib`: fitted preprocessing-plus-model pipeline, if the chosen pipeline supports this packaging.
- `reports/model_metrics.json`: metrics, split details, threshold, configuration.
- `reports/commit_predictions.csv`: IDs, project, retrospective actual label, predicted probability and class.
- `reports/review_budget_results.csv`: calculated budget and baseline results.
- `reports/feature_importance.csv`: explainability output.
- `reports/model_card.md`: intended use, evaluation and limitations.

Do not commit large raw datasets. Never commit credentials or API tokens.

## 6. Frontend/backend contract
- React frontend owns presentation and user interaction; it must not reimplement ML preprocessing.
- FastAPI owns request validation and calls the approved Python prediction/evaluation functions.
- Agree request/response schemas before wiring pages to endpoints.
- Prediction requests must contain exactly the approved model features (plus optional metadata only if schema allows).
- API responses should include the predicted probability, predicted class, model/version metadata where available, and explanation fields only when genuinely computed.
- Historical ranking and review-budget pages should consume computed experiment outputs, not hand-authored numbers.
- Keep CORS and local development configuration documented; never disable security checks indiscriminately for deployment.

## 7. Code quality
- Use clear names and docstrings for reusable functions.
- Put reusable logic in `src/`, not only notebooks.
- Avoid duplicated preprocessing and giant scripts.
- Set and record random seeds.
- Handle invalid inputs and missing files explicitly.
- Do not silently swallow exceptions.
- Update dependency files when dependencies change.

## 8. Minimum testing
- Required columns exist.
- Target values are valid.
- `buggy`, `fix`, `commit_id`, `project`, `year`, and `author_date` are not accidentally included in predictors.
- Split identifiers do not overlap where disjointness is required.
- Preprocessing is fitted only on training data.
- Inference expects approved features in the correct order.
- Predicted probabilities are between 0 and 1.
- Review-budget calculation uses a documented denominator and tie method.
- API rejects malformed requests and handles missing model files with a useful error.
- Frontend handles loading, empty, validation-error, and API-error states.
- No final screen displays mock or fabricated metrics.

## 9. Application rules
- Use genuine saved model artefacts and experiment outputs.
- Clearly label temporary mock data during development and remove/replace it before final demo.
- Do not imply historical replay is live GitHub analysis.
- Accept only approved model features for manual prediction.
- Present risk as an estimate, not certainty.
- Keep navigation simple, responsive and reliable.

## 10. Integration-ready definition
A module is ready when it has a clear entry point, documented inputs/outputs, runs independently, has relevant tests, does not depend on uncommitted local files, and has a PR with a short test summary.
