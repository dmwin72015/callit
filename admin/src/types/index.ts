/**
 * 统一类型定义
 *
 * 所有 TypeScript 接口和类型集中在此处定义
 * 按功能分类，便于维护和查找
 */

// ============================================================================
// 核心 API 类型
// ============================================================================

/** 标准 API 响应包装器 - 所有接口返回的统一格式 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** 分页列表响应 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}

// ============================================================================
// 认证与用户类型
// ============================================================================

/** 用户信息 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_verified: boolean;
  created_at: string;
}

/** 登录响应 - 包含令牌和用户信息 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: UserResponse;
}

// ============================================================================
// 业务实体类型
// ============================================================================

/** 别名实体 */
export interface AliasResponse {
  id: number;
  alias_name: string;
  item_name: string;
  region_name: string;
  region_code: string;
  submitted_by: string;
  votes_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

/** 条目实体 */
export interface ItemResponse {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  aliases_count: number;
  created_at: string;
}

/** 分类实体（支持树形结构） */
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  children?: CategoryResponse[];
  items_count: number;
  sort_order: number;
}

/** 地区实体（支持树形结构） */
export interface RegionResponse {
  id: number;
  name: string;
  parent_id: number | null;
  region_type: 'PROVINCE' | 'CITY' | 'DISTRICT' | 'STREET';
  code: string;
  sort_order: number;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  area_code?: string;
  children?: RegionResponse[];
}

/** 标签实体 */
export interface TagResponse {
  id: number;
  name: string;
  color: string;
  aliases_count: number;
}

// ============================================================================
// 统计数据与审计类型
// ============================================================================

/** 仪表板统计数据 */
export interface StatsResponse {
  total_users: number;
  total_items: number;
  total_aliases: number;
  pending_reviews: number;
}

/** 审计日志 */
export interface AuditLogResponse {
  id: number;
  admin_user: string;
  action: string;
  target_type: string;
  target_id: number;
  note: string;
  created_at: string;
}
