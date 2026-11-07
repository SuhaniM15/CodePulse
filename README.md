# CodePulse
**Intelligent Software Change Risk Prediction and Code Review Prioritisation Using Machine Learning**

CodePulse estimates the risk associated with software commits and helps developers prioritise code review and testing. It is decision support only; it does not replace human review, tests, static analysis or developer judgement.

## Research question
Can machine-learning-based commit risk prediction improve review prioritisation compared with random ranking and simple change-size strategies when review time is limited?

## Core demonstration
Rank labelled commits by predicted risk. Imagine a reviewer can inspect only the top 10%, 20% or 30%. Measure what fraction of all buggy commits is captured, and compare the model with random ranking and change-size ranking. Report pooled and per-project results.

## Dataset decision
- ApacheJIT remains the **primary dataset**.
- Investigate records in `apachejit_total.csv` that are not in the supplied train/test files. Verify commit-ID overlap, dates, project coverage and labels before considering them for validation.
- Qt/OpenStack is an optional external-evaluation candidate only if commit-level labels and sufficiently equivalent features are verified. Do not merge datasets blindly.
- ReDef is not planned for implementation because its function-level data is not directly interchangeable with ApacheJIT commit-level records. It may be discussed in related work after source verification.

## Technology
- Frontend: React + Vite + JavaScript; Tailwind CSS; Recharts
- Backend: FastAPI
- ML: Python, pandas, NumPy, scikit-learn, joblib

## Repository structure
```text
CodePulse/
  data/raw/       # unchanged source data; do not commit
  data/processed/
  notebooks/
  src/
  models/
  app/
  tests/
  docs/
  requirements.txt
```

## Important rules
- `buggy` is the target, never a predictor.
- `commit_id` is an identifier, not a predictor.
- Keep `project` for grouping and cross-project evaluation.
- Keep `author_date` and `year` for temporal analysis/splitting; not default predictors.
- Exclude `fix` from predictors unless its meaning and availability at prediction time are verified; current plan is to exclude it.
- Fit preprocessing on training data only.
- Keep validation separate from final test data.
- Do not call an uncalibrated score a probability.
- Preserve raw data and labels. Document exclusions rather than altering source data.
- All final metrics and predictions must come from actual reproducible outputs.
- Every PR author must understand and explain their own code.

## Schedule
Nov 7: dataset decisions and app skeletons. Nov 8: API/report schemas. Nov 9–10: provisional model and early integration. Nov 11–12: model comparison, calibration and deployment decision. Nov 13–14: evaluation and report skeleton. Nov 15–16: full integration/testing. Nov 17: report/slides/fixes. Nov 18: code freeze/rehearsal. Nov 19: review/submission.


## Documentation map
- `docs/PROJECT_OVERVIEW.md` — aim, scope and success criteria
- `docs/TECHNICAL_METHODOLOGY.md` — data, models and evaluation protocol
- `docs/FEATURE_REQUIREMENTS.md` — application pages and API requirements
- `docs/TEAM_RESPONSIBILITIES.md` — role ownership and hand-offs
- `docs/TASK_TRACKER.md` — task IDs, milestones and Definition of Done
- `docs/DECISIONS_NEEDED.md` — open decisions and evidence-based recommendations
- `docs/DEVELOPMENT_GUIDELINES.md` — Git, testing and development rules
- `docs/TERMINOLOGY_GLOSSARY.md` — beginner-friendly definitions
- `reports/README.md` — expected reproducible output files

## Freeze dates
- Split freeze: **Nov 9, 2026**
- Model freeze: **Nov 11, 2026**
- Feature freeze: **Nov 14, 2026**
- Code freeze: **Nov 18, 2026**
- Review/submission: **Nov 19, 2026**

The schedule is intentionally tight. Use provisional artefacts for early integration, but label them clearly and replace them before final evaluation.
