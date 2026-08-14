import { Users, Wallet } from 'lucide-react';
import { Topbar } from '@/app/layout/Topbar';
import { QueryState } from '@/components/organisms/QueryState';
import { EmptyState } from '@/components/organisms/EmptyState';
import { MetricCard } from '@/components/molecules/MetricCard';
import { AccountsGrid } from '@/features/accounts/components/AccountsGrid';
import { AccountsGridSkeleton } from '@/features/accounts/components/AccountsGridSkeleton';
import { useAccountsView } from '@/features/accounts/hooks/useAccountsView';
import { formatCurrency } from '@/lib/format';

export function AccountsPage() {
  const { data, isLoading, isError, refetch, sortedAccounts, maxBalance, totalBalance } = useAccountsView();

  return (
    <div>
      <Topbar title="Accounts" />

      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <MetricCard
          icon={Users}
          iconClassName="bg-mesh-blue/15 text-mesh-blue"
          value={String(sortedAccounts.length)}
          label="Accounts on ledger"
        />
        <MetricCard
          icon={Wallet}
          iconClassName="bg-mesh-green/15 text-mesh-green"
          value={formatCurrency(totalBalance)}
          label="Total value across accounts"
        />
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        data={data}
        loadingFallback={<AccountsGridSkeleton />}
        errorDescription="Couldn't load accounts from the backend. Confirm the server is running on :8080."
        onRetry={() => refetch()}
        isEmpty={(accounts) => accounts.length === 0}
        emptyFallback={
          <EmptyState icon={Users} title="No accounts yet" description="Accounts appear here once the backend seeds the ledger." />
        }
      >
        {() => <AccountsGrid accounts={sortedAccounts} maxBalance={maxBalance} />}
      </QueryState>
    </div>
  );
}
