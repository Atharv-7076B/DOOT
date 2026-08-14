import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StatusFilter } from '@/features/transactions/hooks/useTransactionsTable';

interface TransactionsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  resultCount: number;
}

export function TransactionsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  resultCount,
}: TransactionsToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search sender, receiver, packet hash…"
            className="pl-8"
            aria-label="Search transactions"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="SETTLED">Settled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">{resultCount} matching</span>
    </div>
  );
}
