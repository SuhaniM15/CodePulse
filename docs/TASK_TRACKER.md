# CodePulse Task Tracker

Use this as the shared task register. Replace Member 1–5 with names and update status in the GitHub Issues/Project board. Suggested statuses: `Not started`, `In progress`, `Blocked`, `In review`, `Done`.

## Ownership and tasks

| ID | Owner | Task | Dependency | Expected output | Initial status |
|---|---|---|---|---|---|
| CP-01 | Member 1 | Complete EDA decisions and confirm candidate feature list | Existing EDA; verify paper definitions | EDA/data-decision note | In progress |
| CP-02 | Member 1 | Coordinate methodology, interfaces and team check-ins | None | Approved shared contracts | Not started |
| CP-03 | Member 1 | Set up React + Vite frontend shell and design system | None | Running frontend shell | Not started |
| CP-04 | Member 1 | Build dashboard, commit analysis, risk ranking and results pages | CP-03; API/data contracts | Frontend pages | Not started |
| CP-05 | Member 1 + Member 5 | Integrate frontend with FastAPI | CP-04, CP-10 | End-to-end UI/API flow | Not started |
| CP-06 | Member 2 | Build dataset loading and validation | None for scaffolding | Validation script/report | Not started |
| CP-07 | Member 2 | Implement approved feature selection and preprocessing | CP-01 | Reusable preprocessing module | Not started |
| CP-08 | Member 2 | Implement temporal/project split utilities and leakage tests | CP-01, CP-07 | Reproducible split outputs/tests | Not started |
| CP-09 | Member 3 | Implement baseline and candidate model training | CP-07, CP-08 for final runs | Training pipeline | Not started |
| CP-10 | Member 3 | Compare models, select validation threshold and save artefacts | CP-09 | Model artefact and metrics/predictions | Not started |
| CP-11 | Member 4 | Prepare literature review and evaluation protocol | None | Cited related-work notes | Not started |
| CP-12 | Member 4 | Implement review-budget and ranking baselines | Evaluation contract; can prototype now | Review-budget results from real predictions | Not started |
| CP-13 | Member 4 | Implement cross-project evaluation | Split/data contract | Cross-project results | Not started |
| CP-14 | Member 4 | Implement explainability and error analysis | CP-10 | Explanation outputs and error notes | Not started |
| CP-15 | Member 5 | Set up FastAPI, health check and schemas | None | Running API skeleton | Not started |
| CP-16 | Member 5 | Implement real prediction endpoint and tests | CP-07, CP-10 | Working prediction API | Not started |
| CP-17 | All, coordinated by Member 1 | End-to-end testing and final fixes | Core tasks integrated | Test evidence and fixed demo | Not started |
| CP-18 | All, coordinated by Member 1 | Report, README, model card and presentation | Actual results available | Final documentation/presentation | Not started |

## Parallel work that can start immediately
- Member 1: EDA decisions and React shell.
- Member 2: generic data validation/loading scaffolding.
- Member 3: model-training skeleton, baseline definitions and experiment configuration; do not report provisional metrics as final.
- Member 4: literature review and review-budget calculation using clearly labelled sample predictions.
- Member 5: FastAPI health endpoint, schemas and API skeleton.

## Key dependency chain
1. Member 1 approves feature/data decisions.
2. Member 2 finalises preprocessing and split outputs.
3. Member 3 trains and evaluates candidate models, then saves compatible artefacts.
4. Member 4 completes model-dependent comparisons, explainability and error analysis; some evaluation scaffolding can happen earlier.
5. Member 5 connects the real prediction pipeline to the API once artefacts are ready.
6. Member 1 integrates the API into the React frontend and leads end-to-end validation.

This is not fully sequential: frontend pages, API scaffolding, validation scaffolding, literature review, and evaluation utilities can be developed in parallel using agreed contracts.

## Daily stand-up
Each member posts:
1. Completed yesterday/today:
2. Next task:
3. Blocker/dependency:
4. Issue/branch/PR link:

## Completion rule
A task is not `Done` merely because code was written. It must run, have appropriate tests or verification, produce genuine outputs, be committed on a branch, and be reviewed/merged.
