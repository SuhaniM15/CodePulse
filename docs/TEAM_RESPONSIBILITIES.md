# Team Responsibilities

The project lead coordinates decisions and integration but does not implement everyone else's modules.

## Member 1 – Project Lead, EDA Decisions, Frontend and Integration
- Maintain plan and task tracker.
- Review EDA evidence and approve dataset/feature decisions.
- Build React frontend, prioritising Review Budget and Model Performance.
- Coordinate API/report contracts, integration and end-to-end tests.
- Do not take over other members' model, preprocessing or backend implementation.
**Deliverables:** approved decisions, frontend, integrated app, demo checklist.

## Member 2 – Harsh: Data Validation, Preprocessing and Cross-Project Evaluation
- Validate files, types, missing values, duplicates, ranges and class rates.
- Verify commit-ID overlaps, `test_small` subset relationship and candidate unassigned records.
- Build reusable preprocessing/split utilities.
- Preserve raw data; never silently alter labels or delete suspicious rows.
- Run cross-project/leave-one-project-out evaluation.
- Investigate Hadoop anomaly and save evidence.
- Compare all projects vs excluding `apache/hadoop`.
**Deliverables:** validation report, reusable utilities, split manifest, cross-project/Hadoop results.

## Member 3 – Tanushri: Machine Learning and Model Development
- Build reproducible baselines and training pipelines.
- Implement `la`-only Logistic Regression.
- Train full-feature Logistic Regression, Random Forest and Gradient Boosting.
- Handle imbalance within training only.
- Select thresholds using validation.
- Investigate natural-rate calibration; report Brier score and calibration plot if probabilities are shown.
- Export clearly labelled provisional pipeline by Nov 9–10; later export final pipeline and predictions.
**Deliverables:** training scripts, model comparison, calibration report or relative-score decision, provisional/final artefacts.

## Member 4 – Gitte: Research, Review-Budget Evaluation and Report
- Literature review and cautious research-gap framing.
- Define review-budget denominator, rounding and tie handling.
- Calculate pooled and per-project top-10/20/30% results.
- Compare model, random and change-size rankings.
- Interpret results and limitations.
- Start report skeleton by Nov 13–14.
**Deliverables:** literature review, evaluation scripts/tables/plots, report.

## Member 5 – Chaudhari: Backend/API, Explainability Support and Deployment
- Build FastAPI skeleton and health endpoint.
- Agree schemas and sample response/report files by Nov 8.
- Implement validated prediction/report endpoints.
- Integrate provisional model by Nov 9–10 and final artefact later.
- Implement explainability API support with Member 4.
- Coordinate deployment with Member 1; document local fallback.
**Deliverables:** API, schemas, endpoints, explainability support, deployment/local instructions.

## Shared rules
- Use branches and PRs; keep commits focused.
- Do not commit raw datasets, secrets or environment files.
- Never fabricate metrics or predictions; label provisional outputs.
- Coordinate interfaces early.
- Every PR author must understand and explain their own code, logic, dependencies, tests and limitations.


## Ownership boundaries and hand-offs

- Member 1 coordinates and approves project-level decisions, owns the React frontend and integration, and reviews evidence. Member 1 does not take over teammates' ML, preprocessing or backend implementation.
- Member 2 owns data validation, preprocessing, split implementation/configuration, leakage tests and cross-project/Hadoop evaluation.
- Member 3 owns baselines, model comparison, calibration, threshold selection, model artefacts and model predictions.
- Member 4 owns literature review, ranking baselines, review-budget analysis, error analysis and report writing.
- Member 5 owns FastAPI, request/response schemas, prediction and explainability endpoints, deployment investigation and local fallback instructions.

**Handoffs:** agree schemas and fixtures early; use a provisional model for integration; replace it with the frozen final artefact after Nov 11; use only final reproducible outputs in the final UI, report and presentation.
