import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, AuditLogResponse } from '../types';

export const getAuditLogs = async (params: {
  page?: number;
  pageSize?: number;
  action?: string;
  userId?: number;
}): Promise<PaginatedResponse<AuditLogResponse>> => {
  const data = await fetchService.get<PaginatedResponse<AuditLogResponse>>('/admin/audit-logs', { params });
  return data;
};
