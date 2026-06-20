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

export const getAdminAliases = async (params: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<PaginatedResponse<AliasResponse>> => {
  const data = await fetchService.get<PaginatedResponse<AliasResponse>>('/admin/aliases', { params });
  return data;
};

export const getAdminAlias = async (id: number): Promise<AliasResponse> => {
  const data = await fetchService.get<AliasResponse>(`/admin/aliases/${id}`);
  return data;
};

export const createAdminAlias = async (data: {
  item_id: number;
  region_id: number;
  alias_name: string;
  name_type: string;
  status: string;
  votes_count?: number;
  submitted_by?: number | null;
}): Promise<AliasResponse> => {
  const res = await fetchService.post<AliasResponse>('/admin/aliases', data);
  return res;
};

export const updateAdminAlias = async (id: number, data: {
  item_id: number;
  region_id: number;
  alias_name: string;
  name_type: string;
  status: string;
  votes_count: number;
}): Promise<AliasResponse> => {
  const res = await fetchService.put<AliasResponse>(`/admin/aliases/${id}`, data);
  return res;
};

export const deleteAdminAlias = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/aliases/${id}`);
};
