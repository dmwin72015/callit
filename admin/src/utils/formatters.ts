/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date - 日期对象或时间戳
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化日期
 * @param date - 日期对象或时间戳
 * @returns 格式化后的日期字符串 'YYYY-MM-DD'
 */
export const formatDate = (date: Date | number | string): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化时间
 * @param date - 日期对象或时间戳
 * @returns 格式化后的时间字符串 'HH:mm:ss'
 */
export const formatTime = (date: Date | number | string): string => {
  return formatDateTime(date, 'HH:mm:ss');
};

/**
 * 格式化相对时间（如：3分钟前）
 * @param date - 日期对象或时间戳
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: Date | number | string): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else {
    return formatDate(date);
  }
};

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(2)} ${units[i]}`;
};

/**
 * 格式化数字
 * @param num - 数字
 * @returns 格式化后的数字字符串（带千位分隔符）
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化百分比
 * @param value - 数值
 * @param total - 总数
 * @param decimals - 小数位数，默认 2
 * @returns 百分比字符串
 */
export const formatPercent = (value: number, total: number, decimals: number = 2): string => {
  if (total === 0) return '0%';
  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals)}%`;
};

/**
 * 截断文本
 * @param text - 原文
 * @param maxLength - 最大长度
 * @param suffix - 截断后缀，默认 '...'
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}${suffix}`;
};

/**
 * 隐藏敏感信息（手机号、邮箱等）
 * @param value - 敏感信息字符串
 * @param startChars - 开头保留字符数，默认 3
 * @param endChars - 结尾保留字符数，默认 4
 * @returns 脱敏后的字符串
 */
export const maskSensitiveInfo = (
  value: string,
  startChars: number = 3,
  endChars: number = 4
): string => {
  if (value.length <= startChars + endChars) {
    return '*'.repeat(value.length);
  }

  const start = value.slice(0, startChars);
  // 修复：slice(-0) 会返回整个字符串，所以需要特殊处理
  const end = endChars > 0 ? value.slice(-endChars) : '';
  const masked = '*'.repeat(value.length - startChars - endChars);

  return `${start}${masked}${end}`;
};

/**
 * 格式化手机号
 * @param phone - 手机号
 * @returns 格式化后的手机号 '138****8888'
 */
export const formatPhone = (phone: string): string => {
  return maskSensitiveInfo(phone, 3, 4);
};

/**
 * 格式化邮箱
 * @param email - 邮箱
 * @returns 格式化后的邮箱 't***@example.com'
 */
export const formatEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return maskSensitiveInfo(email, 1, 0);

  const maskedLocal = localPart.length > 1 ? `${localPart[0]}***` : localPart;
  return `${maskedLocal}@${domain}`;
};
