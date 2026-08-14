import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusIndicator } from '@/features/transactions/components/StatusIndicator';
import { HopRoute } from '@/features/transactions/components/HopRoute';
import { formatCurrency, truncateHash } from '@/lib/format';
import type { SortDirection, SortField } from '@/features/transactions/hooks/useTransactionsTable';
import type { TransactionDto } from '@/types/api';

interface TransactionsTableProps {
  rows: TransactionDto[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function SortableHead({
  field,
  label,
  current,
  direction,
  onSort,
}: {
  field: SortField;
  label: string;
  current: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = current === field;
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1 text-inherit hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className={isActive ? 'h-3 w-3 text-mesh-cyan' : 'h-3 w-3 opacity-50'} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

export function TransactionsTable({ rows, sortField, sortDirection, onSort }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sender → Receiver</TableHead>
          <SortableHead field="amount" label="Amount" current={sortField} direction={sortDirection} onSort={onSort} />
          <TableHead>Packet Hash</TableHead>
          <TableHead>Route</TableHead>
          <SortableHead field="hopCount" label="Hops" current={sortField} direction={sortDirection} onSort={onSort} />
          <TableHead>Status</TableHead>
          <SortableHead field="settledAt" label="Time" current={sortField} direction={sortDirection} onSort={onSort} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-mono text-[11.5px]">
              {tx.sender} → {tx.receiver}
            </TableCell>
            <TableCell className="font-mono">{formatCurrency(tx.amount)}</TableCell>
            <TableCell>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-muted-foreground">{truncateHash(tx.packetHash)}</span>
                </TooltipTrigger>
                <TooltipContent>{tx.packetHash}</TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <HopRoute hopCount={tx.hopCount} bridgeNodeId={tx.bridgeNodeId} />
            </TableCell>
            <TableCell className="font-mono">{tx.hopCount}</TableCell>
            <TableCell>
              <StatusIndicator status={tx.status} />
            </TableCell>
            <TableCell className="font-mono text-muted-foreground">
              {new Date(tx.settledAt).toLocaleString('en-IN', { hour12: false })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
