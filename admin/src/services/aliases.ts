import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, AliasResponse } from '../types';

export const getReviewQueue = async (params: {
  page?: number;
  page_size?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}): Promise<PaginatedResponse<AliasResponse>> => {
  const data = await fetchService.get<PaginatedResponse<AliasResponse>>('/admin/aliases/review-queue', { params });
  return data;
};

export const approveAlias = async (id: number, noteData?: { note?: string }) => {
  const data = await fetchService.post(`/admin/aliases/${id}/approve`, noteData || {});
  return data;
};

export const rejectAlias = async (id: number, reasonData: { reason: string }) => {
  const data = await fetchService.post(`/admin/aliases/${id}/reject`, reasonData);
  return data;
};
