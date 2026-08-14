import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MetricCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-start justify-between">
        <Skeleton className="h-8 w-8 rounded-[9px]" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="mb-2 h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}
