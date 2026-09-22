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
        await api.getDashboardMetrics();
        setIsServerOnline(true);
      } catch (e) {
        setIsServerOnline(false);
      }
    };
    checkServer();
    const pingTimer = setInterval(checkServer, 15000);
    return () => clearInterval(pingTimer);
  }, []);

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between z-10 select-none transition-colors">
      {/* Left: Mobile Menu Toggle & Date / Live Clock */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            aria-label="Toggle navigation menu"
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 hidden md:inline text-xs">{date}</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs">
            {time}
          </span>
        </div>
      </div>

      {/* Right side: Dark/Light Mode, Language Switcher & Server Status */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? (language === 'uz' ? 'Kunduzgi rejim (Yorug‘)' : 'Светлая тема') : (language === 'uz' ? 'Tungi rejim (Qorong‘i)' : 'Тёмная тема')}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[11px] font-medium text-amber-300">
                {language === 'uz' ? 'Kunduzgi' : 'Светлая'}
              </span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline text-[11px] font-medium text-slate-600">
                {language === 'uz' ? 'Tungi' : 'Тёмная'}
              </span>
            </>
          )}
        </button>

        {/* Language Switcher (UZ default / RU) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-inner">
          <button
            onClick={() => setLanguage('uz')}
            title="O'zbek tili (Lotin)"
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 ${
              language === 'uz'
                ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇺🇿</span>
            <span className="hidden sm:inline">O‘zbekcha</span>
            <span className="sm:hidden">UZ</span>
          </button>
          <button
            onClick={() => setLanguage('ru')}
            title="Русский язык"
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 ${
              language === 'ru'
                ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇷🇺</span>
            <span className="hidden sm:inline">Русский</span>
            <span className="sm:hidden">RU</span>
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition ${
            isServerOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
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
