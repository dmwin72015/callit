/**
 * 应用常量定义
 */

// 路由常量
export const ROUTES = {
  // 认证
  LOGIN: '/admin/login',

  // 主布局
  DASHBOARD: '/admin/dashboard',

  // 管理页面
  ITEMS: '/admin/items',
  ITEM_CREATE: '/admin/items/new',
  ITEM_EDIT: (id: number) => `/admin/items/${id}/edit`,

  CATEGORIES: '/admin/categories',

  REGIONS: '/admin/regions',

  TAGS: '/admin/tags',

  USERS: '/admin/users',
  USER_EDIT: (id: number) => `/admin/users/${id}/edit`,

  ALIASES_REVIEW: '/admin/aliases/review',

  AUDIT_LOGS: '/admin/audit-logs',
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'callit_access_token',
  REFRESH_TOKEN: 'callit_refresh_token',
  USER: 'callit_user',
  AUTH_PERSIST: 'callit-auth',
} as const;

// Token 过期时间（秒）
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 900,    // 15分钟
  REFRESH_TOKEN: 604800, // 7天
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// API 端点
export const API_ENDPOINTS = {
  // 认证
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },

  // 公开接口
  PUBLIC: {
    ITEMS: '/items',
    ITEM_DETAIL: (id: number) => `/items/${id}`,
    REGIONS: '/regions',
    REGION_DETAIL: (id: number) => `/regions/${id}`,
    REGIONS_TREE: '/regions/tree',
    CATEGORIES: '/categories',
    CATEGORY_DETAIL: (id: number) => `/categories/${id}`,
    CATEGORIES_TREE: '/categories/tree',
    TAGS: '/tags',
    TAG_DETAIL: (id: number) => `/tags/${id}`,
    TAGS_SEARCH: '/tags/search',
    ALIASES_SUBMIT: '/aliases',
  },

  // 管理接口
  ADMIN: {
    STATS: '/admin/stats',
    REVIEW_QUEUE: '/admin/aliases/review-queue',
    APPROVE_ALIAS: (id: number) => `/admin/aliases/${id}/approve`,
    REJECT_ALIAS: (id: number) => `/admin/aliases/${id}/reject`,

    ITEMS: '/admin/items',
    ITEM_DETAIL: (id: number) => `/admin/items/${id}`,

    CATEGORIES: '/admin/categories',
    CATEGORY_DETAIL: (id: number) => `/admin/categories/${id}`,

    REGIONS: '/admin/regions',
    REGION_DETAIL: (id: number) => `/admin/regions/${id}`,

    TAGS: '/admin/tags',
    TAG_DETAIL: (id: number) => `/admin/tags/${id}`,

    USERS: '/admin/users',
    USER_DETAIL: (id: number) => `/admin/users/${id}`,

    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const;

// 用户角色
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

// 别名状态
export const ALIAS_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// 地区类型
export const REGION_TYPES = {
  PROVINCE: 'PROVINCE',
  CITY: 'CITY',
  DISTRICT: 'DISTRICT',
  CUSTOM: 'CUSTOM',
} as const;

// 消息提示时长（毫秒）
export const MESSAGE_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;
