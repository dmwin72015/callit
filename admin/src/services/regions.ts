import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, RegionResponse } from '../types';

export const getRegions = async (params: {
  page?: number;
  pageSize?: number;
  regionType?: string;
  parentId?: number;
}): Promise<PaginatedResponse<RegionResponse>> => {
  const data = await fetchService.get<PaginatedResponse<RegionResponse>>('/admin/regions', { params });
  return data;
};

export const createRegion = async (regionData: {
  name: string;
  code: string;
  regionType: string;
  parentId?: number;
  sortOrder?: number;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  areaCode?: string;
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

export const getRegionTree = async (rootID?: number, rootType?: string, maxDepth = 2): Promise<RegionResponse[]> => {
  const params: Record<string, any> = {};
  if (rootID) params.rootId = rootID;
  if (rootType) params.rootType = rootType;
  if (maxDepth !== 2) params.maxDepth = maxDepth;
  const data = await fetchService.get<RegionResponse[]>('/regions/tree', { params });
  return data;
};

export const searchRegions = async (keyword: string, limit = 20): Promise<RegionResponse[]> => {
  const data = await fetchService.get<RegionResponse[]>('/regions/search/name', {
    params: { q: keyword, limit },
  });
  return data;
};
