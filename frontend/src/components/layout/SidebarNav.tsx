import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  /** Called after a link is chosen (used to close the mobile menu). */
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Main">
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm no-underline transition-colors',
                  isActive
                    ? 'border-model bg-canvas font-semibold text-ink'
                    : 'border-transparent text-muted-foreground hover:bg-canvas hover:text-ink',
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
