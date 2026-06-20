import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, RegionResponse } from '../types';

export const getRegions = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<RegionResponse>> => {
  const data = await fetchService.get<PaginatedResponse<RegionResponse>>('/admin/regions', { params });
  return data;
};

export const createRegion = async (regionData: { name: string; code: string; description?: string }): Promise<RegionResponse> => {
  const data = await fetchService.post<RegionResponse>('/admin/regions', regionData);
  return data;
};

export const updateRegion = async (id: number, regionData: Partial<RegionResponse>): Promise<RegionResponse> => {
  const data = await fetchService.put<RegionResponse>(`/admin/regions/${id}`, regionData);
  return data;
};

export const deleteRegion = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/regions/${id}`);
};
