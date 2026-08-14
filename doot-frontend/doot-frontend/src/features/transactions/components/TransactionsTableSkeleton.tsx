import { Skeleton } from '@/components/ui/skeleton';

export function TransactionsTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-soft p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}
