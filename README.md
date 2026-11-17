# CodePulse

**Intelligent Software Change Risk Prediction and Code Review Prioritisation Using Machine Learning**

CodePulse is a machine-learning-based decision-support application that estimates the relative risk associated with software commits and helps developers prioritise code review.

Instead of reviewing commits in an arbitrary order, CodePulse ranks commits by their predicted risk and evaluates how many historically bug-inducing commits can be identified under a limited review budget.

The project combines machine learning, software engineering metrics, chronological evaluation, and a full-stack web application built with React and FastAPI.

CodePulse is a research and educational prototype. It does not replace human code review, software testing, static analysis, or developer judgement.

---

## 1. Problem Statement

Modern software projects involve frequent code changes, and development teams may not have enough time to review every commit with equal attention.

Some commits are more likely than others to introduce defects. However, simple prioritisation strategies, such as reviewing the largest changes first, do not consider additional factors such as developer experience, code-change history, and modification complexity.

CodePulse investigates whether machine learning can improve review prioritisation by identifying potentially risky commits before less risky ones.

**Research Question:**

Can machine-learning-based commit risk prediction improve code review prioritisation when the number of commits a reviewer can inspect is limited?

---

## 2. Project Objectives

The primary objectives of CodePulse are to:

1. Analyse historical software commits using software engineering metrics.
2. Develop machine learning models for commit-level defect prediction.
3. Compare representative classification algorithms.
4. Rank commits according to predicted relative risk.
5. Evaluate prioritisation under review budgets of 10%, 20%, and 30%.
6. Compare ML-based ranking against change-size ranking and random selection.
7. Develop an interactive web application for visualising predictions and evaluation results.
8. Investigate model performance, limitations, and practical deployment considerations.

---

## 3. Dataset

CodePulse uses the **ApacheJIT dataset**, a benchmark for Just-In-Time (JIT) software defect prediction.

JIT defect prediction attempts to identify potentially defect-inducing software changes at the commit level rather than predicting defects only at the file or module level.

### 3.1 Dataset Overview

| Property | Value |
|---|---:|
| Dataset | ApacheJIT |
| Total commits | 106,674 |
| Bug-inducing commits | 28,239 |
| Clean commits | 78,435 |
| Project groups after preprocessing | 13 |
| Dataset period | 2003–2019 |
| Prediction target | `buggy` |

The target variable is binary:

- `buggy = 1`: The commit was labelled as bug-inducing.
- `buggy = 0`: The commit was labelled as clean.

These labels represent historical defect identification rather than guaranteed ground truth.

### 3.2 Hadoop Project Grouping

During dataset inspection, Hadoop-related commits were found under three project identifiers:

- `apache/hadoop`
- `apache/hadoop-hdfs`
- `apache/hadoop-mapreduce`

The `apache/hadoop` identifier contained 11,964 commits labelled clean, while the related HDFS and MapReduce identifiers contained additional commits, including bug-inducing changes.

To avoid excluding these clean commits from the main evaluation, the three identifiers were consolidated into a single `apache/hadoop` project group.

After merging:

| Property | Value |
|---|---:|
| Merged Hadoop commits | 16,192 |
| Bug-inducing Hadoop commits | 3,060 |
| Clean Hadoop commits | 13,132 |

The original commit records and defect labels are preserved. Only their project identifiers are consolidated for analysis.

The resulting dataset contains **13 project groups**.

The pipeline also includes a sensitivity experiment that excludes the merged Hadoop group to examine the effect of project composition on evaluation performance.

### 3.3 Input Features

CodePulse uses 12 numerical commit-level features.

| Feature | Description |
|---|---|
| `la` | Lines added |
| `ld` | Lines deleted |
| `nf` | Number of files changed |
| `nd` | Number of directories changed |
| `ns` | Number of subsystems changed |
| `ent` | Distribution of modifications across affected files |
| `ndev` | Number of developers who previously modified the affected files |
| `age` | Average age of affected files since previous modifications |
| `nuc` | Number of unique previous changes to affected files |
| `aexp` | Author experience |
| `arexp` | Recent author experience |
| `asexp` | Author experience in the affected subsystems |

The following fields are not used as prediction features:

- Commit identifiers
- Project identifiers
- Commit dates and years
- The `buggy` target
- The `fix` indicator

The application provides descriptions of these features to help users understand the inputs required for a prediction.

---

## 4. Machine Learning Methodology

### 4.1 Problem Formulation

CodePulse formulates defect prediction as a **supervised binary classification problem**.

Each commit is represented by 12 numerical software metrics, and the model learns relationships between those metrics and historical defect labels.

Although classification metrics are reported, the primary practical objective is **ranking commits by relative risk**.

This allows developers to prioritise commits for additional review under limited review capacity.

### 4.2 Chronological Data Splitting

Rather than randomly dividing the primary dataset, CodePulse uses chronological training, validation, and testing periods.

| Partition | Period | Commits |
|---|---|---:|
| Training | Up to 30 September 2016 | 74,249 |
| Validation | 1 January – 30 September 2017 | 8,311 |
| Testing | 1 January – 31 December 2018 | 8,920 |

The test set contains **1,941 historically bug-inducing commits**.

Chronological splitting better reflects the intended scenario in which a model learns from earlier software changes and is evaluated on later changes.

Temporal gaps are maintained between the periods to reduce potential overlap and some label-timing risks. However, these gaps do not guarantee that every defect label was available at the time a prediction would have been made.

The date-boundary implementation includes the entire final calendar day of the training and validation periods.

The primary test period ends in 2018 because later defect labels may be affected by incomplete observation of subsequent fixes.

### 4.3 Data Preprocessing

The pipeline performs the following preprocessing steps:

1. Loads the ApacheJIT dataset.
2. Validates required numerical features.
3. Checks for missing or negative feature values.
4. Checks for duplicate commit identifiers.
5. Consolidates related Hadoop project labels.
6. Converts commit timestamps into dates.
7. Sorts commits chronologically.
8. Creates training, validation, and test partitions.
9. Applies model-specific transformations.

For Logistic Regression, numerical features undergo:

- Logarithmic transformation using `log1p`.
- Standardisation using `StandardScaler`.

These transformations are fitted on training data as part of the model pipeline.

Tree-based models use the original numerical features.

### 4.4 Models Evaluated

Four configurations were evaluated.

| Model | Purpose |
|---|---|
| LA-only Logistic Regression | Simple baseline using lines added |
| Logistic Regression | Linear classifier using all 12 features |
| Random Forest | Bagging-based tree ensemble for nonlinear relationships |
| Histogram-based Gradient Boosting | Boosting-based tree ensemble for nonlinear relationships |

The models represent different approaches to classification, from simple linear models to ensemble learning.

Additional algorithms such as SVM, K-Nearest Neighbors, Naïve Bayes, Decision Trees, and neural networks are possible extensions. The present study focuses on representative models suited to numerical tabular data and review-risk ranking.

### 4.5 Model Selection

**Validation Average Precision (AP)** is the primary model-selection metric.

Average Precision is particularly relevant because the objective is to rank historically buggy commits ahead of clean commits, and the dataset contains more clean commits than buggy commits.

The initial selection procedure chose the model with the highest validation AP.

During development, the selection policy was revised to account for operational simplicity when validation performance was extremely close.

The final selection rule is:

1. Identify the highest validation AP.
2. Treat candidate models within an absolute AP difference of 0.003 from the best as near-tied.
3. Among near-tied models, prefer the model with the predefined simplicity priority.

The value `0.003` is an engineering tolerance, not a statistically proven equivalence interval.

The relevant validation results were:

| Model | Validation AP |
|---|---:|
| LA-only Logistic Regression | 0.547396 |
| Logistic Regression | 0.587354 |
| Random Forest | **0.615395** |
| Gradient Boosting | 0.614738 |

Random Forest achieved the highest numerical validation AP, but the difference from Gradient Boosting was only approximately **0.000657**.

Under the revised near-tie rule, **Histogram-based Gradient Boosting** was selected.

Operational efficiency was an important consideration:

| Model artefact | Approximate size |
|---|---:|
| Random Forest | 240.36 MB |
| Gradient Boosting | **0.71 MB** |

Gradient Boosting is substantially easier to store and package in the application.

**Methodological qualification:** The selection rule was revised during development after test results had been inspected. The final test results should therefore not be described as fully independent of every model-development decision. Test-set performance was not an input to the implemented near-tie selection function.

### 4.6 Calibration and Risk Scores

CodePulse applies **Platt scaling** to transform model outputs using validation data.

However, the resulting scores have not been established to represent accurate defect probabilities.

For this reason, the application presents outputs as **relative risk scores**.

For example, a score of `0.80` indicates a relatively high model-generated risk score. It should not automatically be interpreted as an 80% probability that the commit is buggy.

The principal purpose of these scores is to rank commits for review prioritisation.

---

## 5. Model Evaluation

### 5.1 Evaluation Metrics

CodePulse evaluates classification models using:

- **Average Precision (AP):** Summarises precision across recall levels.
- **ROC-AUC:** Measures how well a model distinguishes buggy and clean commits across thresholds.
- **Precision:** Proportion of predicted buggy commits that are actually buggy.
- **Recall:** Proportion of buggy commits identified by the classifier.
- **F1-score:** Harmonic mean of precision and recall.
- **Matthews Correlation Coefficient (MCC):** A classification metric that accounts for all confusion-matrix outcomes.
- **Brier score:** Measures squared error in probability-like predictions.

The pipeline also evaluates how effectively risk scores prioritise commits under limited review budgets.

### 5.2 Test-Set Model Comparison

The final test evaluation covers **8,920 commits from 2018**, including **1,941 historically buggy commits**.

| Model | Test Average Precision | Test ROC-AUC | Test Brier Score |
|---|---:|---:|---:|
| LA-only Logistic Regression | 0.491 | 0.777 | 0.144 |
| Logistic Regression | 0.513 | 0.786 | 0.141 |
| Random Forest | 0.509 | 0.784 | 0.144 |
| **Gradient Boosting** | **0.524** | **0.794** | **0.141** |

Gradient Boosting achieved the highest reported test Average Precision and ROC-AUC among these configurations.

However, the final model was selected using the revised validation-based near-tie rule, not by directly maximising test performance.

The differences between the strongest models are modest and should not be interpreted as statistically significant without further analysis.

---

## 6. Review Budget Evaluation

The central contribution of CodePulse is evaluating whether predicted risk scores can help prioritise code reviews.

Instead of reviewing every commit, the system considers what happens when developers can inspect only the top-ranked 10%, 20%, or 30% of commits.

### 6.1 Ranking Methods

Three ranking strategies are compared:

**1. CodePulse (Gradient Boosting)**

Commits are ordered by their predicted relative risk scores.

**2. Change-size ranking**

Commits are ordered using the total number of lines added and deleted:

`Change size = la + ld`

**3. Random selection**

An analytical expected capture rate is calculated for random selection.

The random baseline represents an expectation, not a particular randomly sampled review list.

### 6.2 Capture Rate

Capture rate measures how many historically buggy commits are found among the selected commits.

**Capture rate = Buggy commits selected / Total buggy commits in the evaluation set**

The review budget is based on the **number of commits reviewed**, not actual developer time.

### 6.3 Final Review-Budget Results

| Review budget | CodePulse (Gradient Boosting) | Change-size ranking | Random expectation |
|---|---:|---:|---:|
| Top 10% | **27.87%** | 25.61% | 10.00% |
| Top 20% | **47.14%** | 44.72% | 20.00% |
| Top 30% | **62.91%** | 60.23% | 30.00% |

### 6.4 Main Finding

At a **20% review budget**:

| Measure | Value |
|---|---:|
| Total test commits | 8,920 |
| Commits reviewed | 1,784 |
| Total historically buggy commits | 1,941 |
| Buggy commits captured by CodePulse | **915** |
| Buggy commits captured by change-size ranking | 868 |
| Buggy commits expected from random selection | Approximately 388 |

CodePulse identifies **47 additional historically buggy commits** compared with change-size ranking at the same review budget.

This corresponds to a **2.42-percentage-point improvement** in capture rate over the change-size baseline.

Compared with random selection, CodePulse achieves approximately **2.36 times the expected capture rate** at a 20% review budget.

These results demonstrate an observed improvement in retrospective prioritisation. They do not establish that CodePulse prevents defects, saves a particular number of review hours, or consistently outperforms change-size ranking on every individual project.

---

## 7. Additional Experiments

The pipeline includes supplementary experiments to investigate the robustness and limitations of the main results.

### 7.1 Random vs. Chronological Splitting

Compares evaluation using a random data split with a chronological split.

The purpose is to investigate whether randomly mixing earlier and later commits produces more optimistic performance estimates.

### 7.2 Extended Test Period

Extends evaluation through 2019 to examine sensitivity to the evaluation period and possible right-censoring of defect labels.

### 7.3 Hadoop Sensitivity Analysis

Compares the main evaluation with an additional experiment excluding the merged Hadoop project group.

This helps examine how project composition influences model performance.

### 7.4 Leave-One-Project-Out Evaluation

Evaluates the selected algorithm's transfer across project groups by training on other projects and testing on a held-out project.

This experiment ignores chronological ordering and should not be interpreted as the same evaluation protocol as the main chronological test.

Experimental outputs are stored in `reports/experiments.json`.

---

## 8. Application Features

CodePulse provides an interactive web interface with six main pages.

### 8.1 Overview

Displays key dataset information, the selected model, and summary evaluation results.

### 8.2 Review Budget

Provides:

- Review-budget controls for 10%, 20%, and 30%.
- Pooled and per-project comparisons.
- Visual charts comparing ranking methods.
- Tables showing reviewed commits and buggy commits captured.
- The counting and ranking policies used in evaluation.

### 8.3 Commit Ranking

Displays historical test commits ranked according to model-generated relative risk scores.

This helps demonstrate how commits could be prioritised for additional review.

### 8.4 Check a Commit

Allows users to manually enter the 12 software metrics for a commit.

The frontend sends the values to the FastAPI backend, which loads the saved model and returns a relative risk score.

The application validates numerical inputs and displays relevant error messages.

This feature does not automatically retrieve live commits from GitHub.

### 8.5 Models

Displays classification model comparisons, evaluation metrics, and related model information.

### 8.6 About

Explains the purpose of CodePulse, the dataset, intended use, calibration limitations, and methodological considerations.

---

## 9. System Architecture

CodePulse follows a frontend–backend architecture.

```text
                     ApacheJIT Dataset
                            |
                            v
                    Data Preprocessing
                            |
                            v
                   Chronological Split
                            |
                            v
                  ML Model Comparison
                            |
                            v
                 Final Model Selection
                            |
                            v
              Saved Model + Evaluation Reports
                     /               \
                    v                 v
             FastAPI Backend      Report Data
                    \                 /
                     \               /
                      v             v
                       React Frontend
                             |
                             v
                  CodePulse Web Interface
```

The offline ML pipeline generates the trained model and evaluation reports.

The FastAPI backend exposes these results through API endpoints and performs predictions using the saved model.

The React frontend communicates with the backend to display visualisations and obtain predictions.

---

## 10. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Backend | Python, FastAPI, Pydantic |
| Machine learning | scikit-learn |
| Data processing | pandas, NumPy |
| Model persistence | joblib |
| Testing | pytest, FastAPI TestClient |
| Frontend package manager | pnpm |
| Version control | Git, GitHub |

---

## 11. Running CodePulse Locally

### 11.1 Prerequisites

Install:

- Python with the required project dependencies
- Node.js compatible with the frontend project
- pnpm
- Git

The ApacheJIT dataset is required to regenerate the ML artefacts.

### 11.2 Install Python Dependencies

From the CodePulse root directory, activate your Python virtual environment and run:

```powershell
python -m pip install -r requirements.txt
```

### 11.3 Generate the Model and Reports

Place the ApacheJIT dataset in the local data directory.

For the development dataset layout used in this project, run:

```powershell
python src/pipeline.py --data "data/raw/apachejit-master/apachejit-master/dataset/apachejit_total.csv" --status final
```

This trains the candidate models, applies the model-selection rule, generates evaluation reports, and saves the selected model.

Output directories:

```text
models/
reports/
```

The main saved model is:

```text
models/model.joblib
```

The final academic-review model is Histogram-based Gradient Boosting, with a saved artefact size of approximately 0.71 MB.

**Important:** Running the pipeline overwrites existing local model and report artefacts. Back up earlier results before regenerating them.

The trained model and the generated reports must correspond to the same pipeline run.

### 11.4 Start the FastAPI Backend

From the repository root:

```powershell
uvicorn backend.main:app --reload --port 8000
```

API documentation:

http://localhost:8000/docs

The backend requires the generated reports and saved model to be available locally.

### 11.5 Start the React Frontend

Open another terminal:

```powershell
cd frontend
pnpm install
```

Create a `frontend/.env` file from the provided environment template and configure the API connection:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

Start the frontend:

```powershell
pnpm dev
```

Open:

http://localhost:5173

Setting `VITE_USE_MOCK=false` ensures that the frontend requests actual backend results rather than sample data.

### 11.6 Production Frontend Build

```powershell
cd frontend
pnpm build
```

The build generates production frontend assets in the `dist/` directory.

---

## 12. Testing and Verification

### 12.1 Python Tests

From the repository root:

```powershell
python -m pytest -q
```

Latest verified result:

```text
19 passed, 1 warning
```

The warning is a non-blocking Starlette dependency deprecation warning.

### 12.2 Frontend Linting

```powershell
cd frontend
pnpm lint
```

The frontend lint check completed with zero reported errors and warnings.

### 12.3 Frontend Build

```powershell
pnpm build
```

The TypeScript and Vite production build completed successfully.

A non-blocking bundle-size warning was reported during the build.

### 12.4 Integration Verification

The application was tested locally with the FastAPI backend and React frontend running together.

The frontend successfully retrieved model information and displayed evaluation results.

The model artefact and report metadata were verified to identify:

- Selected model: `gradient_boosting`
- Model version: `v1.0-20261117`
- Model status: `final`

Here, `final` identifies the model version frozen for the academic review. It does not imply production validation.

---

## 13. Project Limitations

CodePulse has the following limitations:

1. **Historical evaluation:** Results are based on historical Apache software commits and retrospective defect labels.

2. **Generalisation:** Performance on unrelated projects, organisations, or programming languages has not been established.

3. **Label quality:** Defect labels may contain inaccuracies, and some labels may be affected by the time required for bugs to be discovered and fixed.

4. **Probability calibration:** Model outputs are intended as relative risk scores, not validated probabilities of defects.

5. **Review effort:** Review budgets measure the number of commits inspected rather than the actual time or effort required.

6. **Baseline improvement:** CodePulse's observed improvement over change-size ranking is modest, and statistical significance has not been established.

7. **Model-selection development:** The near-tie selection rule was revised during development after test results had been inspected, limiting claims about complete independence of the final evaluation.

8. **Live repository integration:** The current application supports manual feature entry and historical commit ranking; it does not automatically fetch and analyse new GitHub commits.

9. **Interpretability:** Feature importance provides evidence about predictive relevance but does not establish causal relationships between metrics and defects.

CodePulse is designed to support developer decisions, not automatically approve or reject commits.

---

## 14. Future Scope

Potential future improvements include:

- Evaluating additional classification algorithms such as SVM, Naïve Bayes, AdaBoost, and neural networks.
- Performing time-aware hyperparameter tuning and repeated validation experiments.
- Testing the model on newer and independent software repositories.
- Improving probability calibration and evaluating calibration reliability.
- Integrating GitHub APIs to automatically retrieve commit information.
- Estimating review effort using more realistic cost measures.
- Exploring explainable ML techniques for individual predictions.
- Deploying the frontend and backend as an accessible web application.
- Studying whether risk-based review prioritisation improves outcomes in real development workflows.

---

## 15. References

1. Keshavarz, H., & Nagappan, M. (2022). *ApacheJIT: A Large Dataset for Just-In-Time Defect Prediction.* https://arxiv.org/abs/2203.00101

2. Kamei, Y., Shihab, E., Adams, B., Hassan, A. E., Mockus, A., Sinha, A., & Ubayashi, N. (2013). *A Large-Scale Empirical Study of Just-in-Time Quality Assurance.* IEEE Transactions on Software Engineering, 39(6), 757–773. https://doi.org/10.1109/TSE.2012.70

3. ApacheJIT dataset and replication package: https://zenodo.org/records/5907847

---

## Project Status

**CodePulse v1.0 — Final Academic Review Prototype**

- Selected model: **Histogram-based Gradient Boosting**
- Evaluation: **Chronological, 2018 held-out test period**
- Test Average Precision: **0.5238**
- Test ROC-AUC: **0.794**
- Top-20% review-budget capture: **47.14%**
- Additional buggy commits captured over change-size ranking: **47**
- Python tests: **19 passed**
- Frontend lint and production build: **Passed**

CodePulse demonstrates how machine-learning-based risk ranking can support more informed software change-review prioritisation.
