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
  items: T[];
  page: number;
  pageSize: number;
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
  isVerified: boolean;
  createdAt: string;
}

/** 登录响应 - 包含令牌和用户信息 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user?: UserResponse;
}

// ============================================================================
// 业务实体类型
// ============================================================================

/** 别名实体 */
export interface AliasResponse {
  id: number;
  aliasName: string;
  itemName: string;
  regionName: string;
  regionCode: string;
  submittedBy: string;
  votesCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

/** 条目实体 */
export interface ItemResponse {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  aliasesCount: number;
  createdAt: string;
}

/** 分类实体（支持树形结构） */
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  children?: CategoryResponse[];
  itemsCount: number;
  sortOrder: number;
}

/** 地区实体（支持树形结构） */
export interface RegionResponse {
  id: number;
  name: string;
  parentId: number | null;
  regionType: 'MACRO_REGION' | 'PROVINCE' | 'CITY' | 'DISTRICT' | 'STREET';
  code: string;
  sortOrder: number;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  areaCode?: string;
  children?: RegionResponse[];
}

/** 标签实体 */
export interface TagResponse {
  id: number;
  name: string;
  color: string;
  aliasesCount: number;
}

// ============================================================================
// 统计数据与审计类型
// ============================================================================

/** 仪表板统计数据 */
export interface StatsResponse {
  totalUsers: number;
  totalItems: number;
  totalAliases: number;
  pendingReviews: number;
}

/** 审计日志 */
export interface AuditLogResponse {
  id: number;
  adminUser: string;
  action: string;
  targetType: string;
  targetId: number;
  note: string;
  createdAt: string;
}
