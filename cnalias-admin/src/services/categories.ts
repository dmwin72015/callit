import api from './api';
import type { PaginatedResponse, CategoryResponse } from '../types';

export const getCategories = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<CategoryResponse>> => {
  const response = await api.get<PaginatedResponse<CategoryResponse>>('/admin/categories', { params });
  return response.data;
};

export const createCategory = async (data: { name: string; description?: string }): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>('/admin/categories', data);
  return response.data;
};

export const updateCategory = async (id: number, data: Partial<CategoryResponse>): Promise<CategoryResponse> => {
  const response = await api.put<CategoryResponse>(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};
