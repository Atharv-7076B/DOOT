import { Receipt } from 'lucide-react';
import { Topbar } from '@/app/layout/Topbar';
import { Card } from '@/components/ui/card';
import { QueryState } from '@/components/organisms/QueryState';
import { EmptyState } from '@/components/organisms/EmptyState';
import { PaginationControls } from '@/components/molecules/PaginationControls';
import { TransactionsToolbar } from '@/features/transactions/components/TransactionsToolbar';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';
import { TransactionsTableSkeleton } from '@/features/transactions/components/TransactionsTableSkeleton';
import { useTransactionsTable } from '@/features/transactions/hooks/useTransactionsTable';

export function TransactionsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    toggleSort,
    page,
    pageCount,
    setPage,
    rows,
    totalMatching,
  } = useTransactionsTable();

  return (
    <div>
      <Topbar title="Transactions" />

      <Card className="p-5">
        <TransactionsToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          resultCount={totalMatching}
        />

        <QueryState
          isLoading={isLoading}
          isError={isError}
          data={data}
          loadingFallback={<TransactionsTableSkeleton />}
          errorDescription="Couldn't load transactions from the backend. Confirm the server is running on :8080."
          onRetry={() => refetch()}
          isEmpty={() => rows.length === 0}
          emptyFallback={
            <EmptyState
              icon={Receipt}
              title="No matching transactions"
              description="Try a different search term or status filter, or send a payment to create one."
            />
          }
        >
          {() => (
            <>
              <TransactionsTable rows={rows} sortField={sortField} sortDirection={sortDirection} onSort={toggleSort} />
              <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
            </>
          )}
        </QueryState>
      </Card>
    </div>
  );
}
