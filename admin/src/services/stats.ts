import { fetchService } from '../lib/http/fetch';
import type { StatsResponse } from '../types';

export const getStats = async (): Promise<StatsResponse> => {
  const data = await fetchService.get<StatsResponse>('/admin/stats');
  return data;
};

export const getRecentActivity = async (limit: number = 10) => {
  const data = await fetchService.get('/admin/audit-logs', {
    params: { limit, page: 1, page_size: limit },
  });
  return data;
};
