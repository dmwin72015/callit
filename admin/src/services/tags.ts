import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, TagResponse } from '../types';

export const getTags = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<TagResponse>> => {
  const data = await fetchService.get<PaginatedResponse<TagResponse>>('/admin/tags', { params });
  return data;
};

export const createTag = async (tagData: { name: string; description?: string; category_ids?: number[] }): Promise<TagResponse> => {
  const data = await fetchService.post<TagResponse>('/admin/tags', tagData);
  return data;
};

export const updateTag = async (id: number, tagData: Partial<TagResponse>): Promise<TagResponse> => {
  const data = await fetchService.put<TagResponse>(`/admin/tags/${id}`, tagData);
  return data;
};

export const deleteTag = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/tags/${id}`);
};
