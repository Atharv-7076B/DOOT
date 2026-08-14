import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { TransactionDto } from '@/types/api';

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: () => apiFetch<TransactionDto[]>('/transactions'),
  });
}
