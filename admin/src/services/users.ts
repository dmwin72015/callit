import { fetchService } from '../lib/http/fetch';
import type { PaginatedResponse, UserResponse } from '../types';

export const getUsers = async (params: {
  page?: number;
  page_size?: number;
  role?: string;
  is_verified?: boolean;
  search?: string;
}): Promise<PaginatedResponse<UserResponse>> => {
  const data = await fetchService.get<PaginatedResponse<UserResponse>>('/admin/users', { params });
  return data;
};

export const getUser = async (id: number): Promise<UserResponse> => {
  const data = await fetchService.get<UserResponse>(`/admin/users/${id}`);
  return data;
};

export const updateUser = async (id: number, userData: Partial<UserResponse>): Promise<UserResponse> => {
  const data = await fetchService.put<UserResponse>(`/admin/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await fetchService.delete(`/admin/users/${id}`);
};
