import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, pageCount, onPageChange }: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center justify-between pt-3" aria-label="Pagination">
      <span className="font-mono text-[11px] text-muted-foreground">
        Page {page + 1} of {pageCount}
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
