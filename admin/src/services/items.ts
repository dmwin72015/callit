import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, ItemResponse } from '../types';

export const getItems = async (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
}): Promise<PaginatedResponse<ItemResponse>> => {
  return fetchService.get<PaginatedResponse<ItemResponse>>('/admin/items', { params });
};

export const getItem = async (id: number): Promise<ItemResponse> => {
  return fetchService.get<ItemResponse>(`/admin/items/${id}`);
};

export const createItem = async (data: {
  name: string;
  description?: string;
  categoryId: number;
}): Promise<ItemResponse> => {
  return fetchService.post<ItemResponse>('/admin/items', data);
};

export const updateItem = async (id: number, data: Partial<ItemResponse>): Promise<ItemResponse> => {
  return fetchService.put<ItemResponse>(`/admin/items/${id}`, data);
};

export const deleteItem = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/items/${id}`);
};
