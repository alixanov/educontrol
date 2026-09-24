'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <Navbar onToggleMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className={`flex-1 min-h-0 bg-slate-50 dark:bg-slate-950 transition-colors ${
          pathname === '/cameras'
            ? 'flex flex-col overflow-y-auto lg:overflow-hidden p-2.5 sm:p-3 lg:p-3.5 pb-20 lg:pb-3.5'
            : 'overflow-y-auto p-3 sm:p-4 lg:p-5 pb-20 lg:pb-5'
        }`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
