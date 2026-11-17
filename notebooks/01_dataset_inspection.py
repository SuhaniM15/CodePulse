import pandas as pd
from pathlib import Path

dataset_dir = Path(
    "data/raw/apachejit-master/apachejit-master/dataset"
)

files = [
    "apachejit_total.csv",
    "apachejit_train.csv",
    "apachejit_test_large.csv",
    "apachejit_test_small.csv"
]

for filename in files:
    path = dataset_dir / filename
    df = pd.read_csv(path)

    print("\n" + "=" * 70)
    print(f"FILE: {filename}")
    print("=" * 70)

    print("Shape:", df.shape)
    print("\nColumns:")
    print(df.columns.tolist())

    print("\nFirst 3 rows:")
    print(df.head(3).to_string())

    print("\nData types:")
    print(df.dtypes.to_string())

    print("\nMissing values:")
    print(df.isnull().sum().to_string())
    import pandas as pd
from pathlib import Path

dataset_dir = Path(
    "data/raw/apachejit-master/apachejit-master/dataset"
)

files = {
    "total": "apachejit_total.csv",
    "train": "apachejit_train.csv",
    "test_large": "apachejit_test_large.csv",
    "test_small": "apachejit_test_small.csv"
}

datasets = {}

for name, filename in files.items():
    datasets[name] = pd.read_csv(dataset_dir / filename)

print("\n========== DATASET SUMMARY ==========")

for name, df in datasets.items():
    print(f"\n{name.upper()}")
    print("Rows:", len(df))

    print("\nBuggy distribution:")
    print(df["buggy"].value_counts())

    print("\nBug rate:")
    print(round(df["buggy"].mean() * 100, 2), "%")

    dates = pd.to_datetime(df["author_date"], unit="s")
    print("\nDate range:")
    print(dates.min(), "to", dates.max())

    print("\nNumber of projects:")
    print(df["project"].nunique())

print("\n========== PROJECT DISTRIBUTION ==========")
print(datasets["total"]["project"].value_counts().to_string())

print("\n========== COMMIT OVERLAP ==========")

for name, df in datasets.items():
    print(name, "unique commits:", df["commit_id"].nunique())

print(
    "Train and large test overlap:",
    len(set(datasets["train"]["commit_id"]) &
        set(datasets["test_large"]["commit_id"]))
)

print(
    "Train and small test overlap:",
    len(set(datasets["train"]["commit_id"]) &
        set(datasets["test_small"]["commit_id"]))
)

print(
    "Large and small test overlap:",
    len(set(datasets["test_large"]["commit_id"]) &
        set(datasets["test_small"]["commit_id"]))
)
train = datasets["train"]
test = datasets["test_large"]

print("\n========== DATE OVERLAP BY PROJECT ==========")

for project in sorted(set(train["project"]) & set(test["project"])):
    train_project = train[train["project"] == project]
    test_project = test[test["project"] == project]

    train_end = pd.to_datetime(
        train_project["author_date"], unit="s"
    ).max()

    test_start = pd.to_datetime(
        test_project["author_date"], unit="s"
    ).min()

    print(f"\n{project}")
    print("Train ends:", train_end)
    print("Test starts:", test_start)
    print("Strictly chronological:", train_end < test_start)

print("\n========== FIX AND BUGGY RELATIONSHIP ==========")

print(pd.crosstab(
    datasets["total"]["fix"],
    datasets["total"]["buggy"],
    margins=True
))

print("\n========== FIX DISTRIBUTION ==========")
print(datasets["total"]["fix"].value_counts(normalize=True) * 100)

print("\n========== TOTAL DATASET MEMBERSHIP ==========")

total_ids = set(datasets["total"]["commit_id"])

for name in ["train", "test_large", "test_small"]:
    ids = set(datasets[name]["commit_id"])
    print(f"{name} contained in total:", ids.issubset(total_ids))

total = datasets["total"]

print("\n========== DUPLICATE CHECKS ==========")

print("Duplicate commit IDs:",
      total["commit_id"].duplicated().sum())

print("Duplicate complete rows:",
      total.duplicated().sum())


print("\n========== FEATURE STATISTICS ==========")

features = [
    "la", "ld", "nf", "nd", "ns", "ent",
    "ndev", "age", "nuc", "aexp", "arexp", "asexp"
]

print(total[features].describe().round(2).to_string())


print("\n========== FEATURE SKEWNESS ==========")

print(total[features].skew().round(2).to_string())


print("\n========== BUG RATE BY PROJECT ==========")

print(
    total.groupby("project")["buggy"]
    .agg(["count", "mean"])
    .assign(bug_rate=lambda x: (x["mean"] * 100).round(2))
    .drop(columns="mean")
    .sort_values("bug_rate", ascending=False)
    .to_string()
)

import pandas as pd

# Load the complete dataset
df = pd.read_csv(
    "data/raw/apachejit-master/apachejit-master/dataset/apachejit_total.csv"
)

# 1. Filter Hadoop commits
hadoop = df[df["project"] == "apache/hadoop"].copy()

print("HADOOP LABEL DISTRIBUTION")
print(hadoop["buggy"].value_counts())

print("\nHADOOP BUGGY RATE")
print(hadoop["buggy"].mean() * 100)

# 2. Check buggy commits year-wise
print("\nBUGGY COMMITS BY YEAR")
yearly = hadoop.groupby("year")["buggy"].agg(
    total_commits="count",
    buggy_commits="sum"
)

yearly["bug_rate"] = (
    yearly["buggy_commits"] / yearly["total_commits"] * 100
)

print(yearly)

# 3. Check fix vs buggy relationship in Hadoop
print("\nFIX VS BUGGY IN HADOOP")
print(pd.crosstab(hadoop["fix"], hadoop["buggy"]))

# 4. Compare with other projects
print("\nPROJECT-WISE BUG RATES")
project_stats = df.groupby("project").agg(
    total_commits=("buggy", "count"),
    buggy_commits=("buggy", "sum")
)

project_stats["bug_rate"] = (
    project_stats["buggy_commits"] /
    project_stats["total_commits"] * 100
)

print(project_stats.sort_values("bug_rate"))
# Compare Hadoop-related projects
hadoop_projects = df[
    df["project"].isin([
        "apache/hadoop",
        "apache/hadoop-hdfs",
        "apache/hadoop-mapreduce"
    ])
]

print("\nHADOOP-RELATED PROJECT COMPARISON")

print(
    hadoop_projects.groupby("project").agg(
        total_commits=("buggy", "count"),
        buggy_commits=("buggy", "sum"),
        fix_commits=("fix", "sum")
    )
)