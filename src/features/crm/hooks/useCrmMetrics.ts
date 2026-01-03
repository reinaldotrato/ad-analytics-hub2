import { getCrmMetrics, getFunnelData } from '../lib/mock-data';

export function useCrmMetrics() {
  return {
    metrics: getCrmMetrics(),
    funnelData: getFunnelData(),
    isLoading: false,
    error: null,
  };
}
