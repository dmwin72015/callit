import api from './api';
import type { PaginatedResponse, RegionResponse } from '../types';

export const getRegions = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<RegionResponse>> => {
  const response = await api.get<PaginatedResponse<RegionResponse>>('/admin/regions', { params });
  return response.data;
};

export const createRegion = async (data: { name: string; code: string; description?: string }): Promise<RegionResponse> => {
  const response = await api.post<RegionResponse>('/admin/regions', data);
  return response.data;
};

export const updateRegion = async (id: number, data: Partial<RegionResponse>): Promise<RegionResponse> => {
  const response = await api.put<RegionResponse>(`/admin/regions/${id}`, data);
  return response.data;
};

export const deleteRegion = async (id: number): Promise<void> => {
  await api.delete(`/admin/regions/${id}`);
};
