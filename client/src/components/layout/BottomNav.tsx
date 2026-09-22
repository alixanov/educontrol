'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  Users,
  CalendarCheck,
  Settings,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const BottomNav = () => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isUz = language === 'uz';

  const navItems = [
    {
      name: isUz ? 'Boshqaruv' : 'Панель',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: isUz ? 'Kameralar' : 'СКУД',
      href: '/cameras',
      icon: Video,
    },
    {
      name: isUz ? 'Xodimlar' : 'Штат',
      href: '/students',
      icon: Users,
    },
    {
      name: isUz ? 'Tabel' : 'Табель',
      href: '/reports',
      icon: CalendarCheck,
    },
    {
      name: isUz ? 'Sozlamalar' : 'Настройки',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all text-center flex-1 max-w-[72px] ${
              isActive
                ? 'text-blue-900 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition ${
                isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate w-full">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
