# Beginner-Friendly CodePulse Glossary

Use this as a reference. You do not need to memorise all terms now; learn each one when the team reaches that task.

| Term | Plain-English meaning |
|---|---|
| Commit | A saved set of changes to a software project. |
| Bug/defect | A problem in software. |
| `buggy` label | Dataset's indication of whether a commit introduced a bug. |
| Feature/predictor | An input measurement the model uses. |
| Target | The answer the model is trained to predict; here, `buggy`. |
| Data leakage | Accidentally giving the model the answer, or information unavailable at prediction time. |
| Training set | Data used to teach the model. |
| Validation set | Separate data used to choose settings/models and possibly calibrate scores. |
| Test set | Held-back data used for final performance estimation. |
| Random split | Divide records randomly into groups. |
| Chronological split | Train on older records and test on newer records. |
| Class imbalance | One label appears much more often than the other. |
| Baseline | A simple reference method to compare with a more advanced model. |
| Logistic Regression | A classification algorithm that estimates a score/probability for a class. |
| `la`-only baseline | Logistic Regression using only lines added, to test whether more complex inputs add value. |
| Calibration | Checking whether predicted probabilities match observed frequencies. |
| Brier score | A measure of probability prediction error; lower is better. |
| PR-AUC | A summary of the precision-recall trade-off, useful when buggy commits are less common. |
| ROC-AUC | Measures how well a model ranks positive examples above negative examples across thresholds. |
| Threshold | A cutoff that converts a score into a yes/no prediction. |
| Review budget | The share of commits a reviewer has time to inspect, such as the top 20%. |
| Capture rate | Fraction of all buggy commits found inside the selected review budget. |
| Pooled evaluation | Evaluate commits from multiple projects together. |
| Per-project evaluation | Evaluate/rank commits separately inside each project. |
| Cross-project evaluation | Train on some projects and test on a project not used for training. |
| Leave-one-project-out | Repeat cross-project evaluation, holding out one project at a time. |
| Sensitivity analysis | Repeat an experiment with a changed assumption, such as including/excluding Hadoop. |
| Explainability | Methods that help describe which inputs influenced a model output. |
| API | A defined way for frontend and backend to exchange information. |
| Endpoint | A particular API action/address, such as requesting a prediction. |
| Model artefact | A saved trained model file used later for predictions. |
| Provisional | An early version used for integration, not final evaluation. |
| Deployment | Making an application available to run beyond a developer's own computer. |

## Important distinction
A risk score is not automatically a probability. A model may rank commits well even when its numerical scores do not represent accurate real-world chances. CodePulse will use probability wording only if validation evidence supports calibration.
