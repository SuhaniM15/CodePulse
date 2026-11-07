# Project Overview

## Problem and aim
Software teams receive many commits, but review time is limited. Some commits are more likely than others to introduce defects. CodePulse investigates whether commit-level metrics and machine learning can help rank commits for review.

The application will accept approved commit metrics, return a model score, provide supported explanations, show evaluation results and demonstrate how many known buggy commits are captured within limited review capacity.

## Research question
Can machine-learning-based commit risk prediction improve code-review prioritisation compared with random ranking and simple change-size strategies, particularly when review capacity is limited?

## Central contribution: Review Budget
Rank commits by risk, select the top 10%, 20% and 30%, and calculate the fraction of all actually buggy commits captured. Compare model ranking with random ranking and change-size ranking. Report pooled and per-project results.

## Scope
Included: ApacheJIT, validation/leakage checks, supplied-split benchmark, random-versus-chronological evaluation, Logistic Regression (including `la`-only baseline), Random Forest, Gradient Boosting, calibration if probabilities are displayed, pooled/per-project review-budget evaluation, cross-project evaluation, Hadoop sensitivity, explainability, React + FastAPI and deployment investigation.

Not included: replacing human review/testing, guaranteed bug detection, live GitHub scanning, blind dataset merging, or ReDef implementation. Label-noise experiments are optional only after core requirements are complete.

## Dataset policy
ApacheJIT remains primary. The apparent unassigned records in `apachejit_total.csv` are only a candidate validation pool until ID overlap, chronology, project representation and label distribution are checked. Qt/OpenStack is optional external evaluation only after compatibility checks.

## Success criteria
Reproducible pipeline; no target leakage; honest random/time-based evaluation; calibration evidence if probabilities are shown; pooled and per-project review-budget results against baselines; working frontend connected to actual outputs; clear limitations.


## Evidence and interpretation guardrails
Initial inspection found that `apachejit_train.csv` is approximately balanced (about 50% buggy), while `apachejit_test_large.csv` has about 19% buggy commits. The supplied files therefore should not be treated as having the same class prevalence. The supplied split is a useful benchmark, but per-project date checks show overlap; do not describe it as strictly future-only for every project.

The `apache/hadoop` project currently has no positive (`buggy=True`) labels in the inspected data. This is an observed dataset characteristic, not proof that its labels are incorrect. Preserve it in the raw data and report an all-project versus without-`apache/hadoop` sensitivity analysis. A held-out fold with no positive examples cannot provide meaningful positive-class capture, recall or PR-AUC; report those measures as N/A with an explanation.

The `fix` column is excluded from predictors for now. Its exact semantics and whether it is available at prediction time have not been established sufficiently for safe use. Do not describe it as confirmed leakage; describe it as a potential target proxy / availability risk pending verification.
