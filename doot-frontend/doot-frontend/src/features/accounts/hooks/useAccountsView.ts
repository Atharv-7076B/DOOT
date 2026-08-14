import { useMemo } from 'react';
import { useAccounts } from '@/api/useAccounts';

export function useAccountsView() {
  const query = useAccounts();

  const sortedAccounts = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => b.balance - a.balance),
    [query.data],
  );

  const maxBalance = useMemo(
    () => sortedAccounts.reduce((max, account) => Math.max(max, account.balance), 0),
    [sortedAccounts],
  );

  const totalBalance = useMemo(
    () => sortedAccounts.reduce((sum, account) => sum + account.balance, 0),
    [sortedAccounts],
  );

  return { ...query, sortedAccounts, maxBalance, totalBalance };
}
