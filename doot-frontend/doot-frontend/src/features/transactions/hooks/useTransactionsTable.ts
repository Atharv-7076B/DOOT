import { useMemo, useState } from 'react';
import { useTransactions } from '@/features/transactions/api/useTransactions';
import type { TransactionDto, TransactionStatus } from '@/types/api';

export type SortField = 'settledAt' | 'amount' | 'hopCount';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'ALL' | TransactionStatus;

const PAGE_SIZE = 8;

export function useTransactionsTable() {
  const query = useTransactions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('settledAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    const term = search.trim().toLowerCase();

    return rows.filter((tx) => {
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        tx.sender.toLowerCase().includes(term) ||
        tx.receiver.toLowerCase().includes(term) ||
        tx.packetHash.toLowerCase().includes(term)
      );
    });
  }, [query.data, search, statusFilter]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort((a: TransactionDto, b: TransactionDto) => {
      let compare = 0;
      if (sortField === 'settledAt') compare = new Date(a.settledAt).getTime() - new Date(b.settledAt).getTime();
      if (sortField === 'amount') compare = a.amount - b.amount;
      if (sortField === 'hopCount') compare = a.hopCount - b.hopCount;
      return sortDirection === 'asc' ? compare : -compare;
    });
    return rows;
  }, [filtered, sortField, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const paginated = useMemo(
    () => sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE),
    [sorted, clampedPage],
  );

  return {
    ...query,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(0);
    },
    statusFilter,
    setStatusFilter: (value: StatusFilter) => {
      setStatusFilter(value);
      setPage(0);
    },
    sortField,
    sortDirection,
    toggleSort,
    page: clampedPage,
    pageCount,
    setPage,
    rows: paginated,
    totalMatching: sorted.length,
  };
}
