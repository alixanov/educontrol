'use client';

import React, { useState, useEffect } from 'react';
import { Clock, WifiOff, Menu, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export const Navbar = ({ onToggleMenu }: { onToggleMenu?: () => void }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);

  useEffect(() => {
    const daysUz = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const daysRu = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const monthsUz = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
      if (language === 'uz') {
        setDate(`${now.getDate()}-${monthsUz[now.getMonth()]}, ${now.getFullYear()}-yil (${daysUz[now.getDay()]})`);
      } else {
        setDate(`${now.getDate()} ${monthsRu[now.getMonth()]} ${now.getFullYear()} г. (${daysRu[now.getDay()]})`);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/cameras', { method: 'HEAD' }).catch(() => null);
        if (res && res.status > 0) {
          setIsServerOnline(true);
          return;
        }
        await api.getDashboardMetrics();
        setIsServerOnline(true);
      } catch (err: any) {
        if (err?.response || err?.status || err?.message?.includes('401')) {
          setIsServerOnline(true);
        } else {
          setIsServerOnline(false);
        }
      }
    };
    checkServer();
    const pingTimer = setInterval(checkServer, 15000);
    return () => clearInterval(pingTimer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200 select-none">
      {/* Left: Mobile Menu Toggle & Date / Live Clock */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            aria-label="Toggle navigation menu"
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 hidden md:inline text-xs">{date}</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs">
            {time}
          </span>
        </div>
      </div>

      {/* Right side: Dark/Light Mode, Language Switcher & Server Status */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Dark / Light Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? (language === 'uz' ? 'Kunduzgi rejim (Kun)' : 'Дневной режим (День)') : (language === 'uz' ? 'Tungi rejim (Tun)' : 'Ночной режим (Ночь)')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 transition-transform duration-200 -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Language Switcher (UZ default / RU) */}
        <div className="inline-flex items-center gap-0.5 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-sm dark:bg-slate-800 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('uz')}
            title="O'zbek tili"
            className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              language === 'uz'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            UZ
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ru')}
            title="Русский язык"
            className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              language === 'ru'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            RU
          </button>
        </div>

        {/* Server Status Indicator */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold border transition ${
            isServerOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 animate-pulse'
          }`}
        >
          {isServerOnline ? (
            <>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="hidden sm:inline">{t('serverOnline')}</span>
              <span className="sm:hidden font-mono text-[10px]">OK</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 flex-shrink-0" />
              <span className="hidden sm:inline">{t('serverOffline')}</span>
              <span className="sm:hidden font-mono text-[10px]">OFF</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
