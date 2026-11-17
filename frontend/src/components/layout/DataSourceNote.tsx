import { getApiBase, isMockMode } from '@/api/client';

/** Sidebar footer: says where data comes from, so nobody mistakes fixtures for results. */
export function DataSourceNote() {
  const mock = isMockMode();
  const base = getApiBase();

  return (
    <div className="text-xs leading-relaxed text-muted-foreground">
      <p className="m-0 font-semibold text-ink">Data source</p>
      {mock ? (
        <p className="m-0">Sample fixtures (VITE_USE_MOCK is true)</p>
      ) : base ? (
        <p className="m-0 break-all">API at {base}</p>
      ) : (
        <p className="m-0">API address not configured</p>
      )}
    </div>
  );
}
