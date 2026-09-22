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
    <div className="h-full flex flex-col justify-between" style={{ background: '#1e3a5f' }}>
      {/* Brand Header */}
      <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-5 border-b border-white/10" style={{ background: '#152d4a' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">
              EduControl
            </span>
            <p className="text-[10px] sm:text-[11px] text-blue-200/70">
              {language === 'uz' ? 'Ish vaqti hisobi' : 'Учёт рабочего времени'}
            </p>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 sm:py-4 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-semibold text-blue-200/50 uppercase tracking-widest">
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
              className={`flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-xs font-semibold'
                  : 'text-blue-100/70 hover:bg-white/8 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-200/60'}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 sm:p-3.5 border-t border-white/10 flex items-center justify-between shrink-0" style={{ background: '#152d4a' }}>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
            {user?.name ? user.name.slice(0, 2) : 'АД'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Администратор'}</p>
            <p className="text-[10px] sm:text-[11px] text-blue-200/50 truncate">{user?.email || 'admin@educontrol.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title={language === 'uz' ? 'Chiqish' : 'Выйти'}
          className="p-1.5 rounded-md hover:bg-white/10 text-blue-200/50 hover:text-red-300 transition flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 select-none h-full border-r border-slate-200/20">
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
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right flex flex-col select-none">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
