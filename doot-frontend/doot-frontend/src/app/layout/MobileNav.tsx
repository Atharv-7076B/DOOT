import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X, LayoutDashboard, Send, CircleDollarSign, Receipt, PackageSearch } from 'lucide-react';
import { NavItem } from '@/components/molecules/NavItem';
import { StatusDot } from '@/components/atoms/StatusDot';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="relative flex items-center justify-between border-b border-border-soft px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-mesh-blue to-mesh-purple">
          <div className="absolute inset-2 rounded-full bg-white/85" />
        </div>
        <span className="font-display text-[16px] font-bold tracking-tight">DOOT</span>
      </div>

      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="glass absolute left-3 right-3 top-[60px] z-50 flex flex-col gap-1 rounded-2xl p-3"
          >
            <div onClick={() => setOpen(false)}>
              <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
              <NavItem icon={Send} label="Send Payment" to="/send-payment" />
              <NavItem icon={CircleDollarSign} label="Accounts" to="/accounts" />
              <NavItem icon={Receipt} label="Transactions" to="/transactions" />
              <NavItem icon={PackageSearch} label="Packet Explorer" to="/packet-explorer" />
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-xs text-muted-foreground">
              <StatusDot tone="green" />
              Mesh online · 4 nodes
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
