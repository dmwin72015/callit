/**
 * useDebounce Hook 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该立即返回初始值', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('应该在延迟后更新值', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // 更新值
    rerender({ value: 'updated', delay: 500 });

    // 延迟未到，应该还是旧值
    expect(result.current).toBe('initial');

    // 快进时间
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 应该更新为新值
    expect(result.current).toBe('updated');
  });

  it('should start new timer after each update', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 500 },
    });

    // 初始值应该是 'a'
    expect(result.current).toBe('a');

    // 第一次更新为 'b'
    rerender({ value: 'b', delay: 500 });
    // 延迟未到，仍为 'a'
    expect(result.current).toBe('a');

    // 在第一次延迟完成前再次更新为 'c'
    rerender({ value: 'c', delay: 500 });

    // 延迟未到，仍为 'a'
    expect(result.current).toBe('a');

    // 等待 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 现在应该更新为 'c'（最新的值）
    expect(result.current).toBe('c');
  });

  it('应该处理数字类型', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 0 },
    });

    rerender({ value: 100 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(100);
  });

  it('应该处理对象类型', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: { name: 'initial' } },
    });

    const newValue = { name: 'updated' };
    rerender({ value: newValue });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual(newValue);
  });

  it('应该处理数组类型', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: [1, 2, 3] },
    });

    rerender({ value: [4, 5, 6] });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual([4, 5, 6]);
  });

  it('应该在延迟为 0 时立即更新', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe('updated');
  });
});
