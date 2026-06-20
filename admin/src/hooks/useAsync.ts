import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncReturn<T, A extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

/**
 * 异步状态管理 Hook
 * @param asyncFunction - 异步函数
 * @param options - 配置选项
 * @returns 异步状态和执行函数
 */
export function useAsync<T, A extends unknown[]>(
  asyncFunction: (...args: A) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, A> {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // 初始执行一次（如果需要）
  }, [execute]);

  return { data, loading, error, execute, reset };
}
