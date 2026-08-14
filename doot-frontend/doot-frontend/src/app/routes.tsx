import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { RouteFallback } from '@/app/layout/RouteFallback';

const LandingPage = lazy(() => import('@/features/landing').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })));
const SendPaymentPage = lazy(() =>
  import('@/features/send-payment').then((m) => ({ default: m.SendPaymentPage })),
);
const AccountsPage = lazy(() => import('@/features/accounts').then((m) => ({ default: m.AccountsPage })));
const TransactionsPage = lazy(() =>
  import('@/features/transactions').then((m) => ({ default: m.TransactionsPage })),
);
const PacketExplorerPage = lazy(() =>
  import('@/features/packet-explorer').then((m) => ({ default: m.PacketExplorerPage })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/send-payment" element={<SendPaymentPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/packet-explorer" element={<PacketExplorerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
