export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface AliasResponse {
  id: number;
  alias_name: string;
  item_name: string;
  region_name: string;
  submitted_by: string;
  votes_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface ItemResponse {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  aliases_count: number;
  created_at: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  children?: CategoryResponse[];
  items_count: number;
  sort_order: number;
}

export interface RegionResponse {
  id: number;
  name: string;
  parent_id: number | null;
  region_type: 'PROVINCE' | 'CITY' | 'DISTRICT';
  code: string;
  sort_order: number;
  children?: RegionResponse[];
}

export interface TagResponse {
  id: number;
  name: string;
  color: string;
  aliases_count: number;
}

export interface StatsResponse {
  total_users: number;
  total_items: number;
  total_aliases: number;
  pending_reviews: number;
}

export interface AuditLogResponse {
  id: number;
  admin_user: string;
  action: string;
  target_type: string;
  target_id: number;
  note: string;
  created_at: string;
}
