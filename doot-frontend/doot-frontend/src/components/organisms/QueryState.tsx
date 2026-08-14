import type { ReactNode } from 'react';
import { ErrorState } from '@/components/organisms/ErrorState';

interface QueryStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  loadingFallback: ReactNode;
  errorDescription: string;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
  emptyFallback?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * Enforces the loading -> error -> empty -> success sequence for any query-backed view.
 * Usage: wrap a feature's rendered content instead of hand-checking status flags per page.
 */
export function QueryState<T>({
  isLoading,
  isError,
  data,
  loadingFallback,
  errorDescription,
  onRetry,
  isEmpty,
  emptyFallback,
  children,
}: QueryStateProps<T>) {
  if (isLoading) return <>{loadingFallback}</>;
  if (isError) return <ErrorState description={errorDescription} onRetry={onRetry} />;
  if (data === undefined) return <ErrorState description="No data returned." onRetry={onRetry} />;
  if (isEmpty?.(data) && emptyFallback) return <>{emptyFallback}</>;
  return <>{children(data)}</>;
}
