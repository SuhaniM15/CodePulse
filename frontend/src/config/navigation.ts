import {
  BarChart3,
  FileSearch,
  Gauge,
  Info,
  ListOrdered,
  SearchCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

/** The six routes, in display order. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: Gauge },
  { to: '/review-budget', label: 'Review budget', icon: BarChart3 },
  { to: '/commit-ranking', label: 'Commit ranking', icon: ListOrdered },
  { to: '/check-a-commit', label: 'Check a commit', icon: SearchCheck },
  { to: '/models', label: 'Models', icon: FileSearch },
  { to: '/about', label: 'About', icon: Info },
];
