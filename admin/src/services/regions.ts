import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, RegionResponse } from '../types';

export const getRegions = async (params: {
  page?: number;
  page_size?: number;
  region_type?: string;
  parent_id?: number;
}): Promise<PaginatedResponse<RegionResponse>> => {
  const data = await fetchService.get<PaginatedResponse<RegionResponse>>('/admin/regions', { params });
  return data;
};

export const createRegion = async (regionData: {
  name: string;
  code: string;
  region_type: string;
  parent_id?: number;
  sort_order?: number;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  area_code?: string;
}): Promise<RegionResponse> => {
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

export const getRegionTree = async (rootID?: number): Promise<RegionResponse[]> => {
  const params = rootID ? { root_id: rootID } : undefined;
  const data = await fetchService.get<RegionResponse[]>('/regions/tree', { params });
  return data;
};

export const searchRegions = async (keyword: string, limit = 20): Promise<RegionResponse[]> => {
  const data = await fetchService.get<RegionResponse[]>('/regions/search/name', {
    params: { q: keyword, limit },
  });
  return data;
};
