# Team Responsibilities and Schedule

Five-person team. Replace Member 1–5 with actual names. Each workstream has one primary owner; everyone should understand the complete pipeline.

## Ownership and deliverables

| Owner | Workstream | Main deliverables |
|---|---|---|
| Member 1 – Project lead (you) | EDA, methodology decisions, coordination, React frontend, integration and final validation | EDA decisions, approved feature list, React application, integrated demo |
| Member 2 | Data validation and preprocessing | Data loader, validation, preprocessing, split utilities, leakage tests |
| Member 3 | ML modelling | Baselines, model training, validation-based selection, saved model artefacts, model comparison |
| Member 4 | Evaluation, research and explainability | Literature review, review-budget experiment, cross-project evaluation, explainability, error analysis |
| Member 5 | Backend/API | FastAPI service, schemas, prediction endpoint, model loading, API tests |

## Member 1 – Project lead + frontend
- Finish EDA and investigate the Hadoop zero-positive-label anomaly.
- Verify feature definitions against the ApacheJIT paper.
- Approve predictor list and excluded columns.
- Coordinate interfaces, deadlines, GitHub issues and integration.
- Build React frontend pages and connect them to FastAPI.
- Review end-to-end behaviour and final documentation.
- Coordinate; do not take over other members' assigned implementation work.

## Member 2 – Data validation and preprocessing
- Implement loading and validation of raw ApacheJIT files.
- Check required columns, types, missing values, duplicates and numeric ranges.
- Implement feature selection, splitting, and transformations after Member 1 approves data decisions.
- Keep raw data unchanged.
- Fit learned transformations on training data only.
- Test leakage and consistent feature ordering.
- Coordinate final feature list with Members 1 and 3.

## Member 3 – Modelling
- Implement majority/simple baselines and candidate models: Logistic Regression, Random Forest, and Gradient Boosting.
- Use the approved preprocessing and split interfaces.
- Record seeds and hyperparameters.
- Select thresholds on validation data only.
- Save the fitted preprocessing-plus-model pipeline or clearly document the compatible artefacts.
- Export metrics and prediction scores in a documented format.

## Member 4 – Evaluation, research and explainability
- Research JIT defect prediction and prepare a concise related-work summary with credible references.
- Implement random and change-size ranking baselines.
- Implement top 10%, 20%, and 30% review-budget capture.
- Use identical held-out rows for model and baseline comparisons.
- Investigate leave-one-project-out evaluation if feasible.
- Implement explainability and representative error analysis.
- Document methodology, limitations, and result interpretation.
- Never write results before experiment outputs exist.

## Member 5 – Backend/API
- Set up FastAPI and define request/response schemas.
- Create a health-check endpoint and documented prediction endpoint.
- Implement input validation and useful error responses.
- Load the approved saved preprocessing/model artefacts.
- Return actual prediction probabilities/classes and available explanation data.
- Add API tests and instructions for running the service.
- Build the API skeleton before model artefacts are ready; use a clearly labelled development stub only if necessary, never as a final prediction.

## What each person should start with on Day 1
| Owner | First task | Expected initial output |
|---|---|---|
| Member 1 | Finalise EDA decisions; start frontend setup | Approved/provisional feature decision note and running frontend shell |
| Member 2 | Dataset validation | Script checking columns, dtypes, missing values, duplicates and ranges |
| Member 3 | Training/evaluation skeleton | Baseline script and agreed experiment configuration |
| Member 4 | Research and review-budget method | Initial references/notes and working calculation on clearly labelled sample predictions |
| Member 5 | API skeleton | Running FastAPI health endpoint and documented prediction schema |

## Dependencies
- Member 2 can build generic validation/loading scaffolding immediately; final feature transforms and split implementation depend on Member 1's approved data decisions.
- Member 3 can build model and evaluation scaffolding immediately; final training depends on the approved preprocessing and split outputs from Member 2.
- Member 4 can begin literature review, methodology and review-budget implementation with sample data immediately; final model comparisons, error analysis and model-specific explanations depend on genuine predictions from Member 3.
- Member 5 can build FastAPI structure, schemas, health check and tests immediately; the real prediction endpoint depends on compatible saved model/preprocessing artefacts from Member 3 (and Member 2's agreed feature contract).
- Member 1 can build React layout and pages immediately using clearly labelled development data; final API integration depends on Member 5's endpoints and genuine experiment outputs.

## Schedule – deadline November 19, 2026
| Date | Target |
|---|---|
| Nov 7 | Parallel work starts; EDA decisions and module interfaces |
| Nov 8 | Preprocessing/split pipeline and model/API skeleton |
| Nov 9–10 | Train candidate models and establish baselines |
| Nov 11 | Model comparison and threshold selection |
| Nov 12 | Review-budget and feasible cross-project evaluation |
| Nov 13 | Explainability and error analysis |
| Nov 14 | Optional robustness experiment only if core is stable |
| Nov 15–16 | React + FastAPI integration with real outputs |
| Nov 17 | End-to-end testing, report, README, slides |
| Nov 18 | Rehearsal, fixes, code freeze |
| Nov 19 | Final review/demo |

## Daily update format
1. Completed today:
2. Next task:
3. Blocker/dependency:
4. Files/PR/issue updated:

## Definition of done
A task is complete when code/docs are committed on a branch, it runs using documented instructions, tests or verification are done, outputs are genuine, a PR is raised and reviewed, and integration requirements are documented.
