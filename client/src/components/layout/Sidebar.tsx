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
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const Sidebar = ({ isMobileOpen, onClose }: { isMobileOpen?: boolean; onClose?: () => void }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t, language } = useLanguage();

  const navigation = [
    { name: t('navDashboard'), href: '/', icon: LayoutDashboard },
    { name: t('navCameras'), href: '/cameras', icon: Video },
    { name: t('navStudents'), href: '/students', icon: Users },
    { name: t('navReports'), href: '/reports', icon: CalendarCheck },
    { name: t('navSettings'), href: '/settings', icon: Settings },
  ];

  const renderContent = (isMobile = false) => (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
              EduControl
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {language === 'uz' ? 'Ish vaqti hisobi' : 'Учёт рабочего времени'}
            </span>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {language === 'uz' ? 'Asosiy menyu' : 'Главное меню'}
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs uppercase flex-shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user?.name || (language === 'uz' ? 'Administrator' : 'Администратор')}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email || 'admin@educontrol.uz'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title={language === 'uz' ? 'Chiqish' : 'Выйти'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900 transition flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 select-none h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
        {renderContent(false)}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right flex flex-col select-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
