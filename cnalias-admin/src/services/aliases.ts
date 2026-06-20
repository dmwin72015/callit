import api from './api';
import type { PaginatedResponse, AliasResponse } from '../types';

export const getReviewQueue = async (params: {
  page?: number;
  page_size?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}): Promise<PaginatedResponse<AliasResponse>> => {
  const response = await api.get<PaginatedResponse<AliasResponse>>('/admin/aliases/review-queue', { params });
  return response.data;
};

export const approveAlias = async (id: number, data?: { note?: string }) => {
  const response = await api.post(`/admin/aliases/${id}/approve`, data || {});
  return response.data;
};

export const rejectAlias = async (id: number, data: { reason: string }) => {
  const response = await api.post(`/admin/aliases/${id}/reject`, data);
  return response.data;
};
