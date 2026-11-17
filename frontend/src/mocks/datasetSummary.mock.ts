// SAMPLE FIXTURE. See flags.ts. Full-dataset numbers; separate from the evaluation split.
import type { DatasetSummary } from '../api/types';

export const mockDatasetSummary = {
  total_commits: 2000,
  buggy_commits: 400,
  buggy_rate: 0.2,
  projects: ['project-a', 'project-b'],
  per_project: [
    { project: 'project-a', total_commits: 1200, buggy_commits: 400 },
    { project: 'project-b', total_commits: 800, buggy_commits: 0 },
  ],
} satisfies DatasetSummary;
