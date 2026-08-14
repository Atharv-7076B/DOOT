import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/app/layout/Sidebar';
import { MobileNav } from '@/app/layout/MobileNav';
import { ToastViewport } from '@/components/organisms/ToastViewport';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-6">
          <Outlet />
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
