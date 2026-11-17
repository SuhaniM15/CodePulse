import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { AboutPage } from '@/pages/AboutPage';
import { CheckACommitPage } from '@/pages/CheckACommitPage';
import { CommitRankingPage } from '@/pages/CommitRankingPage';
import { ModelsPage } from '@/pages/ModelsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { ReviewBudgetPage } from '@/pages/ReviewBudgetPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="review-budget" element={<ReviewBudgetPage />} />
          <Route path="commit-ranking" element={<CommitRankingPage />} />
          <Route path="check-a-commit" element={<CheckACommitPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
