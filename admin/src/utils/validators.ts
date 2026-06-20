/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱字符串
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号（中国大陆）
 * @param phone - 手机号字符串
 * @returns 是否有效
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证密码强度
 * @param password - 密码字符串
 * @param minLength - 最小长度，默认 8
 * @returns 验证结果对象
 */
export const validatePassword = (password: string, minLength: number = 8): {
  valid: boolean;
  message: string;
} => {
  if (password.length < minLength) {
    return {
      valid: false,
      message: `密码长度至少 ${minLength} 位`,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个大写字母',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个小写字母',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个数字',
    };
  }

  return {
    valid: true,
    message: '密码强度符合要求',
  };
};

/**
 * 验证 URL
 * @param url - URL 字符串
 * @returns 是否有效
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证是否为有效的 JSON 字符串
 * @param str - 待验证字符串
 * @returns 是否有效
 */
export const validateJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证字符串长度范围
 * @param str - 字符串
 * @param min - 最小长度
 * @param max - 最大长度
 * @returns 是否在范围内
 */
export const validateLength = (str: string, min: number, max: number): boolean => {
  const length = str.length;
  return length >= min && length <= max;
};

/**
 * 验证数字范围
 * @param num - 数字
 * @param min - 最小值
 * @param max - 最大值
 * @returns 是否在范围内
 */
export const validateRange = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max;
};

/**
 * 验证是否为整数
 * @param value - 待验证值
 * @returns 是否为整数
 */
export const validateInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

/**
 * 验证必填字段
 * @param value - 待验证值
 * @returns 是否为空
 */
export const validateRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * 验证两个值是否相等
 * @param value1 - 值1
 * @param value2 - 值2
 * @returns 是否相等
 */
export const validateEqual = (value1: unknown, value2: unknown): boolean => {
  return value1 === value2;
};
