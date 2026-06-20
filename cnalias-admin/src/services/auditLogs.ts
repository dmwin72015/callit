import api from './api';
import type { PaginatedResponse, AuditLogResponse } from '../types';

export const getAuditLogs = async (params: {
  page?: number;
  page_size?: number;
  action?: string;
  user_id?: number;
}): Promise<PaginatedResponse<AuditLogResponse>> => {
  const response = await api.get<PaginatedResponse<AuditLogResponse>>('/admin/audit-logs', { params });
  return response.data;
};
