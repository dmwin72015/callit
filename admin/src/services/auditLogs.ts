import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, AuditLogResponse } from '../types';

export const getAuditLogs = async (params: {
  page?: number;
  page_size?: number;
  action?: string;
  user_id?: number;
}): Promise<PaginatedResponse<AuditLogResponse>> => {
  const data = await fetchService.get<PaginatedResponse<AuditLogResponse>>('/admin/audit-logs', { params });
  return data;
};
