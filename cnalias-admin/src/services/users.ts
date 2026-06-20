import api from './api';
import type { PaginatedResponse, UserResponse } from '../types';

export const getUsers = async (params: {
  page?: number;
  page_size?: number;
  role?: string;
  is_verified?: boolean;
  search?: string;
}): Promise<PaginatedResponse<UserResponse>> => {
  const response = await api.get<PaginatedResponse<UserResponse>>('/admin/users', { params });
  return response.data;
};

export const getUser = async (id: number): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<UserResponse>): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};
