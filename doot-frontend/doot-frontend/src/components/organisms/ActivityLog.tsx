import { AnimatePresence } from 'framer-motion';
import { LogLine } from '@/components/molecules/LogLine';
import { EmptyState } from '@/components/organisms/EmptyState';
import { ScrollText } from 'lucide-react';
import type { LogEntry } from '@/types/network';

interface ActivityLogProps {
  entries: LogEntry[];
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No activity yet"
        description="Log entries will appear here as packets move through the mesh."
      />
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Mesh activity log"
      className="flex h-[206px] flex-col-reverse gap-1.5 overflow-y-auto pr-1"
    >
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <LogLine key={entry.id} entry={entry} />
        ))}
      </AnimatePresence>
    </div>
  );
}
