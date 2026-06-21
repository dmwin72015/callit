import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, CategoryResponse } from '../types';

export const getCategories = async (params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<CategoryResponse>> => {
  const data = await fetchService.get<PaginatedResponse<CategoryResponse>>('/admin/categories', { params });
  return data;
};

export const createCategory = async (categoryData: { name: string; description?: string }): Promise<CategoryResponse> => {
  const data = await fetchService.post<CategoryResponse>('/admin/categories', categoryData);
  return data;
};

export const updateCategory = async (id: number, categoryData: Partial<CategoryResponse>): Promise<CategoryResponse> => {
  const data = await fetchService.put<CategoryResponse>(`/admin/categories/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/categories/${id}`);
};
