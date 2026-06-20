/**
 * useLocalStorage Hook 测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('基本功能', () => {
    it('应该返回初始值', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      expect(result.current[0]).toBe('initial');
    });

    it('应该从 localStorage 读取已存在的值', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      expect(result.current[0]).toBe('stored-value');
    });

    it('应该能够更新值', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('应该能够使用函数式更新', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it('应该能够删除值', () => {
      localStorage.setItem('test-key', JSON.stringify('value'));

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toBe('initial');
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('数据类型支持', () => {
    it('应该支持字符串', () => {
      const { result } = renderHook(() => useLocalStorage('str-key', 'hello'));

      act(() => {
        result.current[1]('world');
      });

      expect(result.current[0]).toBe('world');
    });

    it('应该支持数字', () => {
      const { result } = renderHook(() => useLocalStorage('num-key', 0));

      act(() => {
        result.current[1](42);
      });

      expect(result.current[0]).toBe(42);
    });

    it('应该支持布尔值', () => {
      const { result } = renderHook(() => useLocalStorage('bool-key', false));

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('应该支持对象', () => {
      const { result } = renderHook(() => useLocalStorage('obj-key', { name: '' }));

      act(() => {
        result.current[1]({ name: 'test' });
      });

      expect(result.current[0]).toEqual({ name: 'test' });
    });

    it('应该支持数组', () => {
      const { result } = renderHook(() => useLocalStorage('arr-key', []));

      act(() => {
        result.current[1]([1, 2, 3]);
      });

      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('应该支持 null', () => {
      const { result } = renderHook(() => useLocalStorage('null-key', null));

      act(() => {
        result.current[1]({ key: 'value' });
      });

      expect(result.current[0]).toEqual({ key: 'value' });
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的 JSON', () => {
      localStorage.setItem('bad-json', 'not-json');
      const { result } = renderHook(() => useLocalStorage('bad-json', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('应该同步到 localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'));

      act(() => {
        result.current[1]('synced');
      });

      const stored = JSON.parse(localStorage.getItem('sync-key') || '""');
      expect(stored).toBe('synced');
    });

    it('应该在删除后使用初始值', () => {
      localStorage.setItem('key', JSON.stringify('stored'));

      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      // 初始应该从 localStorage 读取
      expect(result.current[0]).toBe('stored');

      // 删除
      act(() => {
        result.current[2]();
      });

      // 应该回到初始值
      expect(result.current[0]).toBe('initial');
    });
  });
});
