# CodePulse Task Tracker
**Review/submission:** Nov 19, 2026 · **Code freeze:** Nov 18, 2026

Status values: Not started / In progress / Blocked / Done.

| Due | Task | Owner | Acceptance condition |
|---|---|---|---|
| Nov 7 | Review EDA and approve provisional data/features | Member 1 + Harsh | Decisions supported by saved evidence |
| Nov 7 | Validate data and investigate split relationships | Harsh | Counts, IDs, class rates, dates/projects |
| Nov 7 | Training/baseline framework | Tanushri | Reproducible scripts |
| Nov 7 | Literature and review-budget definition | Gitte | Sources and calculation definition |
| Nov 7 | FastAPI skeleton/health endpoint | Chaudhari | Runs locally |
| Nov 8 | API schema agreed | Member 1 + Chaudhari | Fields/types documented |
| Nov 8 | Sample request/response and report formats | Chaudhari + owners | JSON/CSV examples shared |
| Nov 8 | Investigate unassigned ApacheJIT records | Harsh | Verify IDs, dates, projects and labels |
| Nov 9–10 | Provisional model pipeline artefact | Tanushri | Loads/predicts; labelled provisional |
| Nov 9–10 | Early frontend/backend integration | Member 1 + Chaudhari | Frontend calls API |
| Nov 11–12 | Model comparison/calibration | Tanushri | Validation-only choices; Brier/plot if probability |
| Nov 11–12 | Random vs chronological evaluation | Harsh + Tanushri | Split manifests and metrics |
| Nov 12 | Deployment/local-demo decision | Member 1 + Chaudhari | Feasibility checked; fallback agreed |
| Nov 13–14 | Pooled/per-project review-budget results | Gitte | Top 10/20/30 and baselines; ties/denominator defined |
| Nov 13–14 | Cross-project and Hadoop sensitivity | Harsh | Fold eligibility and with/without Hadoop |
| Nov 13–14 | Explainability/error analysis | Gitte + Chaudhari | Method and output coordinated |
| Nov 13–14 | Report skeleton | Gitte | Sections drafted |
| Nov 15–16 | Full integration and end-to-end tests | All relevant owners | Real model and results connected |
| Nov 17 | Final report, README and presentation | Gitte + all | Numbers match reproducible outputs |
| Nov 18 | Code freeze and rehearsal | All | Backup demo ready |
| Nov 19 | Review/submission | All | Deliverables ready |

## Immediate checklist

### Member 1
- [ ] Verify feature definitions against ApacheJIT paper.
- [ ] Approve predictor/exclusion decisions.
- [ ] Start React shell and Review Budget layout.
- [ ] Agree API contract with Chaudhari.

### Harsh
- [ ] Save evidence for counts, class rates, date overlap and `test_small` subset.
- [ ] Verify candidate unassigned records by commit ID.
- [ ] Investigate Hadoop without changing raw labels.
- [ ] Build validation/preprocessing/split utilities.
- [ ] Run cross-project and Hadoop sensitivity evaluation.

### Tanushri
- [ ] Build baseline framework.
- [ ] Implement `la`-only Logistic Regression.
- [ ] Train candidate models.
- [ ] Investigate natural-rate calibration set.
- [ ] Export provisional artefact by Nov 9–10.
- [ ] Report Brier/calibration plot if probabilities are used.

### Gitte
- [ ] Literature review.
- [ ] Define denominator, rounding and tie policy.
- [ ] Pooled and per-project top-10/20/30 results.
- [ ] Compare model, random and change-size ranking.
- [ ] Start report skeleton Nov 13–14.

### Chaudhari
- [ ] FastAPI skeleton and health endpoint.
- [ ] API schema by Nov 8.
- [ ] Sample response/report shapes by Nov 8.
- [ ] Provisional model integration Nov 9–10.
- [ ] Explainability support with Gitte.
- [ ] Deployment and local fallback with Member 1.

## Definition of done
A task is done when its code/document exists, has been run or checked, outputs are reproducible or evidence recorded, limitations documented, owner can explain it, and relevant PR is reviewed/merged.


## Milestone freeze dates and integration rules

| Freeze | Date | Meaning |
|---|---|---|
| Split freeze | Nov 9 | Dataset partitions, IDs, date boundaries and split metadata are fixed and versioned. |
| Model freeze | Nov 11 | Select the model and export the versioned final artefact. |
| Feature freeze | Nov 14 | No new user-facing features after this date; only fixes and stability work. |
| Code freeze | Nov 18 | No feature work; final rehearsal and critical fixes only. |

Use a provisional model/artefact for early integration if needed. Label it clearly as provisional; never use provisional results as final report results. The final API and frontend must use the final saved artefact and real evaluation outputs.

## Definition of Done

A task is complete only when:
- its output exists in the agreed repository location;
- it runs from the documented environment/commands;
- relevant tests or manual verification have passed;
- results are real and reproducible, not invented or left as unlabeled mock data;
- the PR has been reviewed and merged;
- the author can explain the implementation and its limitations.

## Daily team update

Each member posts: (1) completed since last update, (2) next task, (3) blocker/dependency, and (4) relevant issue, files or PR link.

## Dependency order

Member 2's validated data and frozen split → Member 3's final model → Member 4's final review-budget evaluation and Member 5's final prediction/explainability API → Member 1's end-to-end integration. Start interface work earlier with agreed schemas and clearly marked provisional fixtures.

## Scope cuts if the schedule slips

Cut in this order: external dataset work; label-noise experiments; CSV export/extra filters/confusion-matrix extras; separate model-card page (retain a concise model card in the docs). Preserve the core baselines, chronological evaluation, calibration decision/relative-risk wording, review-budget experiment, leakage checks and random-versus-chronological comparison.
