import api from './api';
import type { StatsResponse } from '../types';

export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>('/admin/stats');
  return response.data;
};

export const getRecentActivity = async (limit: number = 10) => {
  const response = await api.get('/admin/audit-logs', {
    params: { limit, page: 1, page_size: limit },
  });
  return response.data;
};
