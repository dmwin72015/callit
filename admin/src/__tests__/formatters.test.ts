/**
 * 格式化工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatDateTime,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatFileSize,
  formatNumber,
  formatPercent,
  truncateText,
  maskSensitiveInfo,
  formatPhone,
  formatEmail,
} from '../utils/formatters';

describe('formatDateTime', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDateTime(date);
    expect(result).toBe('2024-01-15 10:30:00');
  });

  it('should format timestamp correctly', () => {
    const timestamp = new Date('2024-01-15T10:30:00').getTime();
    const result = formatDateTime(timestamp);
    expect(result).toBe('2024-01-15 10:30:00');
  });

  it('should format date string correctly', () => {
    const result = formatDateTime('2024-01-15T10:30:00');
    expect(result).toBe('2024-01-15 10:30:00');
  });

  it('should support custom format', () => {
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDateTime(date, 'YYYY/MM/DD');
    expect(result).toBe('2024/01/15');
  });

  it('should handle edge case: midnight', () => {
    const date = new Date('2024-01-15T00:00:00');
    const result = formatDateTime(date);
    expect(result).toBe('2024-01-15 00:00:00');
  });

  it('should handle edge case: end of year', () => {
    const date = new Date('2024-12-31T23:59:59');
    const result = formatDateTime(date);
    expect(result).toBe('2024-12-31 23:59:59');
  });
});

describe('formatDate', () => {
  it('should format to YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00');
    expect(formatDate(date)).toBe('2024-01-15');
  });
});

describe('formatTime', () => {
  it('should format to HH:mm:ss', () => {
    const date = new Date('2024-01-15T10:30:45');
    expect(formatTime(date)).toBe('10:30:45');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "刚刚" for less than 1 minute', () => {
    const date = new Date('2024-01-15T11:59:30');
    expect(formatRelativeTime(date)).toBe('刚刚');
  });

  it('should return "X分钟前" for minutes ago', () => {
    const date = new Date('2024-01-15T11:50:00');
    expect(formatRelativeTime(date)).toBe('10分钟前');
  });

  it('should return "X小时前" for hours ago', () => {
    const date = new Date('2024-01-15T08:00:00');
    expect(formatRelativeTime(date)).toBe('4小时前');
  });

  it('should return "X天前" for days ago (less than 30)', () => {
    const date = new Date('2024-01-10T12:00:00');
    expect(formatRelativeTime(date)).toBe('5天前');
  });

  it('should return formatted date for 30+ days ago', () => {
    const date = new Date('2023-12-01T12:00:00');
    expect(formatRelativeTime(date)).toBe('2023-12-01');
  });
});

describe('formatFileSize', () => {
  it('should return "0 B" for zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500.00 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(2048)).toBe('2.00 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
  });

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.00 TB');
  });

  it('should handle fractional sizes', () => {
    expect(formatFileSize(1536)).toBe('1.50 KB');
  });
});

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should not add separators for small numbers', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });
});

describe('formatPercent', () => {
  it('should calculate percentage correctly', () => {
    expect(formatPercent(25, 100)).toBe('25.00%');
    expect(formatPercent(50, 200)).toBe('25.00%');
  });

  it('should return "0%" when total is zero', () => {
    expect(formatPercent(10, 0)).toBe('0%');
  });

  it('should support custom decimal places', () => {
    expect(formatPercent(1, 3, 4)).toBe('33.3333%');
  });

  it('should handle 100%', () => {
    expect(formatPercent(100, 100)).toBe('100.00%');
  });

  it('should handle values greater than total', () => {
    expect(formatPercent(150, 100)).toBe('150.00%');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('should truncate long text with default suffix', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });

  it('should truncate long text with custom suffix', () => {
    expect(truncateText('hello world', 5, '…')).toBe('hello…');
  });

  it('should handle exact length', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('maskSensitiveInfo', () => {
  it('should mask middle characters with defaults', () => {
    expect(maskSensitiveInfo('13812345678')).toBe('138****5678');
  });

  it('should mask with custom start/end chars', () => {
    // start=3, end=4, length=11, masked=4 stars
    expect(maskSensitiveInfo('13812345678', 3, 4)).toBe('138****5678');
    // start=4, end=3, length=11, masked=4 stars
    expect(maskSensitiveInfo('13812345678', 4, 3)).toBe('1381****678');
  });

  it('should mask entire string if too short', () => {
    // length=3, start+end=7, 3<=7 -> true
    expect(maskSensitiveInfo('123', 3, 4)).toBe('***');
    // length=3, start+end=2, 3<=2 -> false, but start=1, end=1, masked=1
    expect(maskSensitiveInfo('abc', 1, 1)).toBe('a*c');
  });

  it('should handle email masking', () => {
    // 'test@example.com' length=16, start=1, end=0, 16<=1 -> false
    // start='t', end='', masked=15 stars
    expect(maskSensitiveInfo('test@example.com', 1, 0)).toBe('t***************');
  });
});

describe('formatPhone', () => {
  it('should format phone number with default masking', () => {
    expect(formatPhone('13812345678')).toBe('138****5678');
  });

  it('should format phone number with custom masking', () => {
    expect(formatPhone('13812345678')).toBe('138****5678'); // default: 3, 4
  });
});

describe('formatEmail', () => {
  it('should format email correctly', () => {
    // 'test@example.com': local='test', masked='t***'
    expect(formatEmail('test@example.com')).toBe('t***@example.com');
  });

  it('should handle long local part', () => {
    // 'testuser@example.com': local='testuser', masked='t***' (固定3个星号)
    expect(formatEmail('testuser@example.com')).toBe('t***@example.com');
  });

  it('should handle single character local part', () => {
    expect(formatEmail('t@example.com')).toBe('t@example.com');
  });

  it('should handle missing domain', () => {
    // 'testonly': no '@', mask with start=1, end=0
    // length=8, start+end=1, 8<=1 -> false
    // start='t', end='', masked=7 stars
    expect(formatEmail('testonly')).toBe('t*******');
  });
});
