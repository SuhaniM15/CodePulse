# Technical Methodology

This is the planned experimental design. Items requiring verification must be recorded before results are reported.

## 1. Dataset and target
Primary source: ApacheJIT. Target: `buggy`; positive class: `True`.

| File | Rows |
|---|---:|
| apachejit_total.csv | 106,674 |
| apachejit_train.csv | 44,834 |
| apachejit_test_large.csv | 30,111 |
| apachejit_test_small.csv | 7,526 |

`test_small` is a subset of `test_large`; do not treat them as independent evaluations.

## 2. Column roles

| Column(s) | Planned role |
|---|---|
| `buggy` | Target; never a predictor |
| `commit_id` | Identifier; exclude from predictors |
| `project` | Grouping and project-wise analysis |
| `year`, `author_date` | Temporal analysis and splitting |
| `fix` | Exclude from predictors; possible target proxy. Exact semantics need verification |
| `la`, `ld`, `nf`, `nd`, `ns`, `ent`, `ndev`, `age`, `nuc`, `aexp`, `arexp`, `asexp` | Candidate predictors; verify definitions and ranges |

## 3. Known data observations
- Initial inspection found no missing values in the four CSV files.
- Supplied training data is approximately balanced; supplied test files have a buggy rate around 19%.
- `test_small` is contained in `test_large`.
- Although the supplied split is described as a later-period test set, per-project date checks show overlap for some projects. Do not call it strictly future-only for every project.
- `apache/hadoop` has 11,964 inspected rows and zero `buggy=True` labels. This is unresolved. Preserve raw data and, if feasible, compare results with and without this project.

## 4. Preprocessing principles
1. Keep raw data unchanged.
2. Implement reusable preprocessing in `src/`, not only in notebooks.
3. Validate required columns, types, target values, duplicate identifiers, and numeric ranges.
4. Fit imputers, scalers, encoders, and learned transformations on training data only.
5. Apply fitted transformations unchanged to validation and test sets.
6. Check candidate features for negative values before applying `log1p`.
7. Tree models do not normally require scaling.
8. For Logistic Regression, consider `log1p` for verified non-negative skewed features and `StandardScaler`; decide using validation data.
9. Keep one approved ordered feature list shared by training and inference.

## 5. Splitting and leakage prevention
Preferred evaluation: chronological train, validation, and untouched test periods. Select cutoffs after inspecting actual dates.

Also consider leave-one-project-out evaluation: train on 14 projects and test on the held-out project, repeating where class composition allows meaningful metrics.

The supplied split can be reported as a benchmark, but describe its limitations accurately.

Never use `buggy`, `fix`, identifiers, or other prohibited fields as predictors. Never fit preprocessing on the full dataset before splitting. Never tune thresholds or hyperparameters on the final test set.

## 6. Candidate models
1. Logistic Regression, potentially with class weighting.
2. Random Forest; candidate configuration: 300 trees and balanced class weights.
3. Gradient Boosting using a suitable scikit-learn implementation.

Use the same split and feature definitions for all models. Record seeds and hyperparameters.

## 7. Baselines
- Majority-class prediction.
- Random ranking.
- Change-size ranking, using a documented metric such as `la` or a defined combined change-size measure.

Evaluate baselines on exactly the same held-out commits as the model.

## 8. Metrics
Report PR-AUC/average precision (state which implementation), ROC-AUC, precision, recall, F1 at a validation-selected threshold, MCC, and confusion matrix. Consider Brier score/calibration if probability quality is shown in the app.

PR-AUC is important because buggy commits are a minority in the realistic test distribution. Accuracy alone is insufficient.

## 9. Review-budget experiment
For each held-out set:
1. Score every commit.
2. Sort by predicted risk, highest first.
3. Select the top 10%, 20%, and 30%.
4. Calculate the fraction of all actual buggy commits captured.
5. Compare CodePulse with random and change-size ranking.
6. State denominator and tie-handling method.

Use real predictions and labels. If using LOC-weighted effort, label LOC as an approximate proxy for review effort.

## 10. Explainability and error analysis
Use permutation importance or a compatible feature-attribution method. Explain that importance is not causation. Inspect representative false positives and false negatives where time permits.

## 11. Reliability and optional work
If feasible, report bootstrap confidence intervals and repeat stochastic models across seeds. Note that row-level bootstrap does not account for dependence among commits from the same project.

Optional only after core completion: Hadoop sensitivity analysis, training-label noise experiment (never alter test labels), external Qt/OpenStack evaluation after compatibility verification, and advanced explainability.

## 12. Reproducibility
Record Python/library versions, data files, split strategy and cutoffs, features, preprocessing, hyperparameters, random seeds, metrics, and model artefact version. Every reported number must be reproducible.
