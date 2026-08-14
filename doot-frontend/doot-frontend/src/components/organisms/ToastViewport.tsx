import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2.5" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="glass flex min-w-[280px] items-start gap-2.5 rounded-xl px-4 py-3"
          >
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-mesh-blue" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold">{toast.title}</p>
              <p className="text-[11.5px] text-muted-foreground">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
