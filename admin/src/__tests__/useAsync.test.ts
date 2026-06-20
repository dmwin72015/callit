/**
 * useAsync Hook 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../hooks/useAsync';

describe('useAsync', () => {
  describe('基本功能', () => {
    it('应该返回初始状态', () => {
      const asyncFn = vi.fn();
      const { result } = renderHook(() => useAsync(asyncFn));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('应该在执行成功时返回数据', async () => {
      const mockData = { id: 1, name: 'test' };
      const asyncFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useAsync(asyncFn));

      let executeResult: any;
      await act(async () => {
        executeResult = await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(executeResult).toEqual(mockData);
    });

    it('应该在执行失败时返回错误', async () => {
      const mockError = new Error('Test error');
      const asyncFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    it('应该在执行期间设置 loading', async () => {
      let resolveFn: (value: any) => void;
      const asyncFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFn = resolve;
          })
      );

      const { result } = renderHook(() => useAsync(asyncFn));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      await act(async () => {
        resolveFn({ id: 1 });
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('回调函数', () => {
    it('应该在成功时调用 onSuccess', async () => {
      const onSuccess = vi.fn();
      const asyncFn = vi.fn().mockResolvedValue({ id: 1 });

      const { result } = renderHook(() => useAsync(asyncFn, { onSuccess }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    });

    it('应该在失败时调用 onError', async () => {
      const onError = vi.fn();
      const mockError = new Error('Test error');
      const asyncFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAsync(asyncFn, { onError }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('reset 方法', () => {
    it('应该重置所有状态', async () => {
      const asyncFn = vi.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useAsync(asyncFn));

      // 先执行一次
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual({ id: 1 });

      // 重置
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('参数传递', () => {
    it('应该向异步函数传递参数', async () => {
      const asyncFn = vi.fn().mockImplementation((id: number) => Promise.resolve({ id }));

      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute(42);
      });

      expect(asyncFn).toHaveBeenCalledWith(42);
      expect(result.current.data).toEqual({ id: 42 });
    });

    it('应该支持多个参数', async () => {
      const asyncFn = vi.fn().mockImplementation((a: number, b: number) => Promise.resolve(a + b));

      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute(1, 2);
      });

      expect(asyncFn).toHaveBeenCalledWith(1, 2);
      expect(result.current.data).toBe(3);
    });
  });

  describe('多次执行', () => {
    it('应该能够在多次执行中正确处理状态', async () => {
      const asyncFn = vi
        .fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const { result } = renderHook(() => useAsync(asyncFn));

      // 第一次执行
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toEqual({ id: 1 });

      // 第二次执行
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toEqual({ id: 2 });
    });

    it('应该取消之前的执行', async () => {
      let resolve1: (value: any) => void;
      let resolve2: (value: any) => void;

      const asyncFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            if (!resolve1) {
              resolve1 = resolve;
            } else {
              resolve2 = resolve;
            }
          })
      );

      const { result } = renderHook(() => useAsync(asyncFn));

      // 第一次执行
      act(() => {
        result.current.execute();
      });

      // 第二次执行（应该取消第一次）
      act(() => {
        result.current.execute();
      });

      // 完成第二次
      await act(async () => {
        resolve2({ id: 2 });
      });

      // 应该得到第二次的结果
      expect(result.current.data).toEqual({ id: 2 });
    });
  });
});
