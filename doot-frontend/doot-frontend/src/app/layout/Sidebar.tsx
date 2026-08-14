import { LayoutDashboard, Send, CircleDollarSign, Receipt, PackageSearch } from 'lucide-react';
import { NavItem } from '@/components/molecules/NavItem';
import { StatusDot } from '@/components/atoms/StatusDot';

export function Sidebar() {
  return (
    <aside className="hidden w-[236px] shrink-0 border-r border-border-soft bg-white/[0.015] px-4 py-5 md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-mesh-blue to-mesh-purple shadow-glow">
          <div className="absolute inset-2 rounded-full bg-white/85" />
        </div>
        <span className="font-display text-[18px] font-bold tracking-tight">DOOT</span>
      </div>

      <div className="px-2 pb-2 pt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
        Simulator
      </div>
      <nav aria-label="Simulator navigation" className="flex flex-col gap-0.5">
        <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
        <NavItem icon={Send} label="Send Payment" to="/send-payment" />
      </nav>

      <div className="px-2 pb-2 pt-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
        Ledger
      </div>
      <nav aria-label="Ledger navigation" className="flex flex-col gap-0.5">
        <NavItem icon={CircleDollarSign} label="Accounts" to="/accounts" />
        <NavItem icon={Receipt} label="Transactions" to="/transactions" />
        <NavItem icon={PackageSearch} label="Packet Explorer" to="/packet-explorer" />
      </nav>

      <div className="mt-auto rounded-xl border border-border-soft bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusDot tone="green" />
          Mesh online · 4 nodes
        </div>
      </div>
    </aside>
  );
}
