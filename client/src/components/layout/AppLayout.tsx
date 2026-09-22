'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const [forceReady, setForceReady] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (loading && !forceReady && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">
            {language === 'uz' ? 'EduControl tizimi yuklanmoqda...' : 'Загрузка системы EduControl...'}
          </p>
        </div>
      </div>
    );
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
