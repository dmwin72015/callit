import api from './api';
import type { PaginatedResponse, TagResponse } from '../types';

export const getTags = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<TagResponse>> => {
  const response = await api.get<PaginatedResponse<TagResponse>>('/admin/tags', { params });
  return response.data;
};

export const createTag = async (data: { name: string; description?: string; category_ids?: number[] }): Promise<TagResponse> => {
  const response = await api.post<TagResponse>('/admin/tags', data);
  return response.data;
};

export const updateTag = async (id: number, data: Partial<TagResponse>): Promise<TagResponse> => {
  const response = await api.put<TagResponse>(`/admin/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id: number): Promise<void> => {
  await api.delete(`/admin/tags/${id}`);
};
