import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/format';
import type { LogEntry, LogTag } from '@/types/network';

const TAG_CLASSES: Record<LogTag, string> = {
  info: 'bg-mesh-blue/15 text-mesh-blue',
  relay: 'bg-mesh-cyan/15 text-mesh-cyan',
  crypto: 'bg-mesh-purple/15 text-mesh-purple',
  ok: 'bg-mesh-green/15 text-mesh-green',
  warn: 'bg-mesh-amber/15 text-mesh-amber',
};

export function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground"
    >
      <span className={cn('mt-px shrink-0 rounded px-1.5 py-px text-[9.5px]', TAG_CLASSES[entry.tag])}>
        {entry.tag}
      </span>
      <span className="flex-1">{entry.message}</span>
      <span className="shrink-0 text-[10px] text-muted-foreground/60">
        {formatTimestamp(new Date(entry.timestamp))}
      </span>
    </motion.div>
  );
}
