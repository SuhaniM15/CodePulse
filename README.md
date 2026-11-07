# CodePulse
## Intelligent Software Change Risk Prediction and Code Review Prioritisation Using Machine Learning

CodePulse is a software-engineering decision-support application that uses historical commit-level metrics to estimate whether a commit is likely to be defect-inducing and to prioritise commits for review.

Its central research question is:

> Can machine-learning-based commit risk prediction improve code-review prioritisation compared with simple strategies, particularly when review resources are limited?

The project focuses on **risk prediction, explainable prioritisation, and rigorous evaluation**. It does not replace human code review, testing, static analysis, or developer judgement.

## Core contribution
The main practical experiment asks: if a developer can review only the top 10%, 20%, or 30% of commits ranked by CodePulse, what fraction of all buggy commits are captured? Compare this with random ranking and change-size ranking.

## Planned technology
- **Frontend:** React + Vite, JavaScript, Tailwind CSS, shadcn/ui, and a charting library such as Recharts.
- **Backend/API:** FastAPI (Python).
- **ML:** pandas, NumPy, scikit-learn, and joblib.
- **Development tools:** The team may use AI-assisted development tools of its choice. The application architecture must remain independent of any particular editor or AI tool.

Technology choices may be adjusted by the team if a practical reason arises. Keep the frontend, API, and ML responsibilities separated.

## Dataset
Primary dataset: ApacheJIT, *A Large Dataset for Just-In-Time Defect Prediction*.
- Target: `buggy` (`True` means the commit introduced a bug, according to the supplied dataset README).
- Candidate metrics: `la`, `ld`, `nf`, `nd`, `ns`, `ent`, `ndev`, `age`, `nuc`, `aexp`, `arexp`, `asexp`.
- Verify feature definitions and ranges against the paper before finalising the feature list.
- `fix` is excluded from predictors pending verification of its exact meaning.
- `apachejit_test_small.csv` is a subset of `apachejit_test_large.csv`; they are not independent test sets.
- `apache/hadoop` has an unresolved zero-positive-label anomaly. Preserve raw data and document sensitivity analysis; do not silently alter labels.

## Main application capabilities
1. Overview dashboard with actual dataset and experiment results.
2. Commit risk prediction using the saved preprocessing/model pipeline.
3. Historical commit risk ranking.
4. Review-budget comparison against baselines.
5. Model performance comparison.
6. Explainability and limitations.

## Repository layout
```text
CodePulse/
├── app/                    # React frontend
├── backend/                # FastAPI service
├── src/                    # Shared data, ML and evaluation modules
├── data/raw/               # Original datasets (not committed)
├── data/processed/         # Generated processed data (not committed unless small/approved)
├── models/                 # Saved model artefacts (manage size carefully)
├── reports/                # Experiment outputs and model card
├── notebooks/              # Exploration; reusable logic belongs in src/
├── tests/
├── docs/
├── README.md
└── requirements.txt
```

## Setup and execution
Exact commands will be finalised once the team has created the frontend and backend package files. Keep separate documented commands for:
- Python environment and dependencies.
- FastAPI development server.
- React development server.
- Tests and model training.

Do not invent or publish launch commands until they match the actual repository.

## Scope boundaries
Prioritise a reliable end-to-end application and defensible evaluation. External datasets, live GitHub scoring, label-noise experiments, authentication, and advanced features are optional and must not delay the core. Do not fabricate predictions, metrics, or charts. Clearly distinguish historical retrospective results from live predictions.
