# Technical Methodology

## 1. Target and candidate features
`buggy` is the target label. Candidate numeric predictors are `la`, `ld`, `nf`, `nd`, `ns`, `ent`, `ndev`, `age`, `nuc`, `aexp`, `arexp`, `asexp`. Verify their exact definitions against the ApacheJIT paper before approving the final feature dictionary; do not infer definitions from names alone.

| Column | Role |
|---|---|
| `buggy` | Target only |
| `commit_id` | Traceability identifier, not predictor |
| `project` | Grouping for per-project/cross-project evaluation |
| `author_date`, `year` | Temporal analysis and splitting |
| `fix` | Excluded pending verification of meaning and prediction-time availability |
| Twelve numeric metrics | Candidate predictors, subject to verification |

## 2. Required data validation
Check shapes, columns, types, missing values, duplicate IDs, ranges, class rates by project/year, date coverage, project coverage and ID overlap among all files. Verify whether `test_small` is contained in `test_large`. Identify records in `total` not present in supplied train or large test using IDs, not arithmetic alone. Save notebook/script output as evidence.

## 3. Hadoop anomaly
Current inspection found `apache/hadoop` has no `buggy=True` labels. This is an observed anomaly, not proof that labels are wrong. Preserve raw rows; investigate documentation; compare results with all projects versus excluding `apache/hadoop`. In a held-out project with no positive labels, positive-class recall and PR-AUC are not meaningfully evaluable; mark them N/A and explain why. Do not silently discard Hadoop.

## 4. Evaluation splits
- **Supplied split:** reproduce as a benchmark. Do not call it strictly chronological for every project because per-project date checks showed overlap.
- **Random split:** create reproducible partitions with no commit appearing in multiple partitions.
- **Chronological split:** train on earlier commits and evaluate on later commits. Choose cutoffs only after inspecting project/date distributions. Keep the final test period untouched.
- **Candidate natural-rate validation pool:** inspect records in `total` outside supplied train/test. Verify IDs, dates, project coverage and labels before using. Do not use future records to validate a model intended to predict those same future records.
- **Label-availability gap (embargo):** because a commit's `buggy` label is established through later bug-fixing evidence, investigate when that label would realistically become knowable. If a gap is needed between training/validation/test periods, justify its length from the dataset's label-construction process and observed timing. Do not choose an arbitrary gap or assume the label is available immediately at commit time.

Report split dates, row counts, projects and buggy rates.

## 5. Preprocessing and leakage
Split before fitting learned preprocessing. Fit scalers, imputers, transformations and feature selection on training data only. Apply fitted transforms to validation/test without refitting. Ensure `buggy`, `commit_id`, `fix`, and default grouping/temporal columns are excluded from predictors. Check non-negative values before `log1p`. Scaling is relevant for Logistic Regression; tree models generally do not need standardisation.

For the random-versus-chronological comparison, use the same model family, feature set, evaluation metrics and comparable training-set sizes. Describe differences in split design and prevalence so the comparison is not overstated.

## 6. Models and baselines
Required:
1. Majority/always-clean baseline.
2. Random ranking baseline for review-budget comparison.
3. Change-size ranking baseline (document exact formula).
4. Logistic Regression using `la` alone.
5. Full-feature Logistic Regression.
6. Random Forest.
7. Gradient Boosting model.

Handle class imbalance within training only. Do not rebalance validation/test data.

## 7. Calibration and probabilities
The supplied training file is roughly balanced while the supplied large test file has a lower buggy rate. A model trained on a balanced sample may rank commits usefully but output probabilities that do not reflect natural prevalence.

Investigate a representative natural-rate validation set. Fit the calibrator using a dedicated calibration portion of validation data (or a properly cross-validated calibration procedure). Use validation data for model/threshold choices without leaking final-test information. Keep the final test untouched and use it only for final Brier score and calibration assessment. State class prevalence. Do not fit and claim to independently evaluate calibration on the same observations. If a suitable calibration set cannot be established, call the output a **relative risk score**, not a calibrated probability. Ranking quality and probability accuracy are different.

## 8. Metrics
Report PR-AUC, ROC-AUC, precision, recall, F1 at a validation-selected threshold, and MCC where applicable. Report prevalence. Report Brier score and calibration plot if probability output is enabled. Accuracy alone is insufficient for imbalanced data.

## 9. Review-budget experiment
For each evaluation set:
- Rank commits highest risk first.
- Evaluate top 10%, 20%, 30%.
- Capture rate = buggy commits selected in top-k / all buggy commits in evaluation set.
- Compare model, random and change-size ranking.
- Specify rounding for fractional budget counts and deterministic tie handling (e.g. stable commit-ID ordering after equal scores).
- Report pooled and per-project results.
- For projects with no positives, mark positive-class capture as N/A.
Optional effort-aware evaluation may use lines changed as a proxy for effort; call it a proxy, not actual developer time.

## 10. Cross-project evaluation
Use leave-one-project-out where feasible: train on other projects and test on the held-out project. Report project sample size and positive prevalence. A project with no positives cannot provide meaningful positive-class PR-AUC/recall.

## 11. Explainability and uncertainty
Use a supported method such as permutation importance or a suitable SHAP method if feasible. Importance indicates model association, not causation. Inspect false positives/negatives. Fix random seeds and report seed variation. Row-level bootstrap ignores dependence among commits from the same project; state this limitation if used.

## 12. External dataset gate
Qt/OpenStack is optional. Verify commit-level unit, compatible label meaning, feature definitions and availability, transformations, and split design. If not quickly verified, do not implement external evaluation or merge it. ReDef function-level data is not directly interchangeable with ApacheJIT commits.
