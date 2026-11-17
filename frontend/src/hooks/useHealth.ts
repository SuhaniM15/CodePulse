import type { HealthResponse } from '@/api/types';
import { useApi } from '@/hooks/useApi';
import { mockHealth } from '@/mocks/health.mock';

/** GET /health. The model status here drives the "Provisional model" notice. */
export function useHealth() {
  return useApi<HealthResponse>('/health', { mock: mockHealth });
}
