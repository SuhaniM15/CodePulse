import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { Notice } from '@/components/Notice';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useFixturesInUse } from '@/hooks/fixtureRegistry';

import { Brand } from './Brand';
import { DataSourceNote } from './DataSourceNote';
import { EvaluationContextStrip } from './EvaluationContextStrip';
import { SidebarNav } from './SidebarNav';

/**
 * Shared shell: left sidebar from the lg breakpoint, a top menu below it, the
 * persistent evaluation-context strip, and a non-dismissible "Sample data"
 * notice whenever any component on screen is rendering fixtures.
 */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const fixtures = useFixturesInUse();

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[var(--cp-sidebar-w)] flex-col gap-6 border-r border-border bg-surface px-4 py-5 lg:flex"
      >
        <Brand />
        <SidebarNav />
        <div className="mt-auto">
          <DataSourceNote />
        </div>
      </aside>

      <div className="lg:pl-[var(--cp-sidebar-w)]">
        {/* Top menu on smaller screens */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-2.5 lg:hidden">
          <Brand />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Open menu">
                <Menu aria-hidden="true" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="gap-5 p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Choose a page of the CodePulse interface.
              </SheetDescription>
              <Brand />
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
              <DataSourceNote />
            </SheetContent>
          </Sheet>
        </header>

        {fixtures.length > 0 ? (
          <div className="border-b border-border bg-surface px-4 py-3 md:px-8">
            <Notice variant="sample">
              The figures on this page come from built-in placeholder fixtures
              (for example project-a and project-b), not from the CodePulse model
              or dataset. Mock mode is enabled by VITE_USE_MOCK.
            </Notice>
          </div>
        ) : null}

        <EvaluationContextStrip />

        <main id="main" tabIndex={-1} className="px-4 py-8 md:px-8">
          <div className="max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
