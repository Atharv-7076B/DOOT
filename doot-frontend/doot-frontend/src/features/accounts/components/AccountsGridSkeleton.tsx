import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AccountsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-[10px]" />
              <div>
                <Skeleton className="mb-1.5 h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-6 w-28" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
