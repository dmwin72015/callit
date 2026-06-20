/**
 * 验证工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUrl,
  validateJson,
  validateLength,
  validateRange,
  validateInteger,
  validateRequired,
  validateEqual,
} from '../utils/validators';

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test @example.com')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should validate correct Chinese phone numbers', () => {
    expect(validatePhone('13812345678')).toBe(true);
    expect(validatePhone('15912345678')).toBe(true);
    expect(validatePhone('18812345678')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('12345678901')).toBe(false); // starts with 1 but second digit not 3-9
    expect(validatePhone('2381234567')).toBe(false); // wrong length
    expect(validatePhone('1381234567')).toBe(false); // 10 digits instead of 11
    expect(validatePhone('abcdefghijk')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('Test1234');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('密码强度符合要求');
  });

  it('should reject short passwords', () => {
    const result = validatePassword('Test1', 8);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码长度至少 8 位');
  });

  it('should reject passwords without uppercase', () => {
    const result = validatePassword('test1234');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码必须包含至少一个大写字母');
  });

  it('should reject passwords without lowercase', () => {
    const result = validatePassword('TEST1234');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码必须包含至少一个小写字母');
  });

  it('should reject passwords without numbers', () => {
    const result = validatePassword('Testtest');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码必须包含至少一个数字');
  });

  it('should support custom minLength', () => {
    const result = validatePassword('Abc123', 5);
    expect(result.valid).toBe(true);
  });

  it('should check all requirements together', () => {
    const result = validatePassword('test');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密码长度至少 8 位'); // checks length first
  });
});

describe('validateUrl', () => {
  it('should validate correct URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
    expect(validateUrl('https://example.com/path?query=1')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('')).toBe(false);
    expect(validateUrl('example.com')).toBe(false);
  });
});

describe('validateJson', () => {
  it('should validate correct JSON strings', () => {
    expect(validateJson('{}')).toBe(true);
    expect(validateJson('{"key": "value"}')).toBe(true);
    expect(validateJson('[1, 2, 3]')).toBe(true);
  });

  it('should reject invalid JSON strings', () => {
    expect(validateJson('{invalid}')).toBe(false);
    expect(validateJson('')).toBe(false);
    expect(validateJson('undefined')).toBe(false);
  });
});

describe('validateLength', () => {
  it('should validate strings within range', () => {
    expect(validateLength('hello', 3, 10)).toBe(true);
    expect(validateLength('test', 4, 4)).toBe(true); // exact boundary
  });

  it('should reject strings outside range', () => {
    expect(validateLength('hi', 3, 10)).toBe(false); // too short
    expect(validateLength('verylongstring', 3, 5)).toBe(false); // too long
  });
});

describe('validateRange', () => {
  it('should validate numbers within range', () => {
    expect(validateRange(5, 1, 10)).toBe(true);
    expect(validateRange(1, 1, 10)).toBe(true); // min boundary
    expect(validateRange(10, 1, 10)).toBe(true); // max boundary
  });

  it('should reject numbers outside range', () => {
    expect(validateRange(0, 1, 10)).toBe(false); // below min
    expect(validateRange(11, 1, 10)).toBe(false); // above max
    expect(validateRange(-5, 0, 10)).toBe(false);
  });
});

describe('validateInteger', () => {
  it('should validate integers', () => {
    expect(validateInteger(0)).toBe(true);
    expect(validateInteger(100)).toBe(true);
    expect(validateInteger(-50)).toBe(true);
  });

  it('should reject non-integers', () => {
    expect(validateInteger(1.5)).toBe(false);
    expect(validateInteger(0.1)).toBe(false);
    expect(validateInteger(NaN)).toBe(false);
    expect(validateInteger(Infinity)).toBe(false);
  });
});

describe('validateRequired', () => {
  it('should validate non-empty values', () => {
    expect(validateRequired('hello')).toBe(true);
    expect(validateRequired(123)).toBe(true);
    expect(validateRequired(true)).toBe(true);
    expect(validateRequired([1, 2, 3])).toBe(true);
  });

  it('should reject null and undefined', () => {
    expect(validateRequired(null)).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });

  it('should reject empty string', () => {
    expect(validateRequired('')).toBe(false);
    expect(validateRequired('   ')).toBe(false); // whitespace only
  });

  it('should reject empty array', () => {
    expect(validateRequired([])).toBe(false);
  });

  it('should handle zero as valid', () => {
    expect(validateRequired(0)).toBe(true);
  });
});

describe('validateEqual', () => {
  it('should validate equal values', () => {
    expect(validateEqual(1, 1)).toBe(true);
    expect(validateEqual('test', 'test')).toBe(true);
    expect(validateEqual(null, null)).toBe(true);
    expect(validateEqual(undefined, undefined)).toBe(true);
  });

  it('should reject unequal values', () => {
    expect(validateEqual(1, 2)).toBe(false);
    expect(validateEqual('test', 'other')).toBe(false);
    expect(validateEqual(null, undefined)).toBe(false);
  });
});
