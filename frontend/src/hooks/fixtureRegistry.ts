// Tracks which mounted components are currently showing fixture data, so the
// layout can render a non-dismissible "Sample data" notice for the page.
// Only useApi writes to this registry.

import { useSyncExternalStore } from 'react';

const active = new Map<symbol, string>();
const listeners = new Set<() => void>();
let snapshot: readonly string[] = [];

function emit() {
  snapshot = Array.from(new Set(active.values()));
  listeners.forEach((listener) => listener());
}

export function registerFixtureUse(id: symbol, label: string): () => void {
  active.set(id, label);
  emit();
  return () => {
    active.delete(id);
    emit();
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Labels (usually endpoint paths) of the fixtures currently displayed. */
export function useFixturesInUse(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}
