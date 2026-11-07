# CodePulse – Project Overview

## Project description
CodePulse is an ML-based software engineering decision-support application. It analyses historical commit-level metrics, estimates the likelihood that a commit is defect-inducing, and ranks commits to help developers allocate limited review and testing effort.

## Problem statement
Reviewing every commit with equal priority can be inefficient. CodePulse investigates whether historical commit metrics can help identify higher-risk changes and improve review prioritisation.

## Research question
Can machine-learning-based commit risk prediction improve code-review prioritisation compared with simple strategies, particularly when review resources are limited?

## Objectives
1. Explore and validate ApacheJIT.
2. Build a leakage-aware preprocessing and evaluation pipeline.
3. Train and compare multiple binary classifiers.
4. Evaluate using metrics suitable for class imbalance.
5. Explain influential commit metrics.
6. Rank commits by predicted risk.
7. Compare risk-based ranking with random and change-size baselines under fixed review budgets.
8. Deliver a reproducible web application with a React frontend and Python API/ML backend.

## Central contribution
CodePulse is more than a binary classifier. Its practical focus is explainable risk-based review prioritisation. The key experiment measures what fraction of all defective commits are captured when reviewing only the top 10%, 20%, or 30% of commits ranked by predicted risk.

Compare against random ranking and change-size ranking (for example, lines added or a documented total-change measure).

## Dataset
Primary source: ApacheJIT – *A Large Dataset for Just-In-Time Defect Prediction*. The supplied dataset README describes `buggy` as indicating whether a commit introduced a bug.

Candidate metrics: `la`, `ld`, `nf`, `nd`, `ns`, `ent`, `ndev`, `age`, `nuc`, `aexp`, `arexp`, `asexp`. Verify definitions in the paper before finalising features.

## Application architecture
- **Frontend:** React application. It owns presentation, navigation, forms, tables, charts, and user interaction.
- **Backend:** FastAPI service. It validates requests, loads the approved model artefacts, and returns predictions/results.
- **ML and evaluation modules:** Python modules under `src/`. They own data preparation, training, scoring, evaluation, and explainability.
- **Data flow:** React frontend → FastAPI endpoints → preprocessing/model or precomputed experiment outputs → API response → frontend visualisation.

The architecture must not depend on a particular AI coding assistant or editor.

## Deliverables
- Reproducible preprocessing and training code.
- Trained model and compatible preprocessing artefact.
- Baseline and model-comparison results.
- Review-budget evaluation.
- Explainability output.
- Functional React + FastAPI application.
- Tests, model card, report, README, and presentation.

## Scope boundaries
Prioritise the working core. External datasets, label-noise experiments, live GitHub scoring, authentication, and advanced explainability are optional unless the core is complete. Do not claim generalisation beyond the projects and periods actually evaluated.
