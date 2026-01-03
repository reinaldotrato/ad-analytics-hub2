import { getDealById, getTasksByDeal, getTimelineByDeal } from '../lib/mock-data';

export function useDealById(dealId: string | undefined) {
  if (!dealId) {
    return {
      deal: undefined,
      tasks: [],
      timeline: [],
      isLoading: false,
      error: null,
    };
  }

  const deal = getDealById(dealId);
  const tasks = getTasksByDeal(dealId);
  const timeline = getTimelineByDeal(dealId);

  return {
    deal,
    tasks,
    timeline,
    isLoading: false,
    error: deal ? null : new Error('Deal not found'),
  };
}
