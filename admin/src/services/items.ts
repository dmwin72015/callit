import api from './api';
import type { PaginatedResponse, ItemResponse } from '../types';

export const getItems = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
}): Promise<PaginatedResponse<ItemResponse>> => {
  const response = await api.get<PaginatedResponse<ItemResponse>>('/admin/items', { params });
  return response.data;
};

export const getItem = async (id: number): Promise<ItemResponse> => {
  const response = await api.get<ItemResponse>(`/admin/items/${id}`);
  return response.data;
};

export const createItem = async (data: {
  name: string;
  description?: string;
  category_id: number;
}): Promise<ItemResponse> => {
  const response = await api.post<ItemResponse>('/admin/items', data);
  return response.data;
};

export const updateItem = async (id: number, data: Partial<ItemResponse>): Promise<ItemResponse> => {
  const response = await api.put<ItemResponse>(`/admin/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/admin/items/${id}`);
};
