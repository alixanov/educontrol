'use client';

import React, { useState } from 'react';
import { ShieldCheck, Video, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        language === 'uz'
          ? 'Email yoki parol noto‘g‘ri kiritildi. Qaytadan urinib ko‘ring.'
          : 'Неверный email или пароль. Пожалуйста, попробуйте снова.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@educontrol.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col lg:grid lg:grid-cols-12 transition-colors duration-200">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: CCTV & AI Biometric Surveillance Showcase */}
      <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 relative z-10 bg-slate-100/50 dark:bg-slate-900/40 transition-colors duration-200">
        {/* Top Brand Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{language === 'uz' ? 'AI Biometrik SKUD Tizimi' : 'Биометрическая СКУД на базе ИИ'}</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                EduControl
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'uz' ? 'Intellektual davomat va ish vaqti nazorati' : 'Интеллектуальный контроль доступа и учёта рабочего времени'}
              </p>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 leading-snug pt-1 max-w-xl">
            {language === 'uz'
              ? 'O‘qituvchilar va xodimlar davomatini kameralar orqali avtomatik hisobga olish'
              : 'Автоматический учёт рабочего времени преподавателей через камеры наблюдения'}
          </h2>
        </div>

        {/* Center CCTV Terminal Mockup with Face Detection HUD */}
        <div className="my-8 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden group max-w-2xl text-slate-100">
          {/* Terminal Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400 uppercase tracking-wider">● REC • LIVE</span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-300 font-semibold">CAM-01 [TURNIKET-KIRISH]</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950/70 px-2.5 py-0.5 rounded border border-emerald-800 text-[10px]">
              60 FPS • 1080p
            </span>
          </div>

          {/* Simulated Camera Viewfinder with Face Target */}
          <div className="relative h-48 sm:h-56 my-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Scanlines / Grid effect */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Scanning Laser Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />

            {/* Face Target Bounding Box */}
            <div className="relative w-32 h-36 sm:w-36 sm:h-40 border-2 border-emerald-400/90 rounded-2xl flex flex-col justify-between p-2.5 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
              {/* HUD Corner Accents */}
              <div className="flex justify-between">
                <span className="w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                <span className="w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
              </div>

              {/* Center Reticle */}
              <div className="self-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border border-dashed border-emerald-400/70 animate-spin" />
                <span className="text-[10px] font-mono font-bold text-emerald-300 mt-1">99.4% MATCH</span>
              </div>

              <div className="flex justify-between">
                <span className="w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                <span className="w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
              </div>

              {/* Floating Detection Badge */}
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-slate-950 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <span>✓</span>
                <span>{language === 'uz' ? 'ANIQLANDI: O‘QITUVCHI' : 'ИДЕНТИФИЦИРОВАН'}</span>
              </div>
            </div>

            {/* Telemetry OSD Overlay */}
            <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>AI ENGINE: <span className="text-cyan-300 font-semibold">TinyFace-v2</span></div>
              <div>LATENCY: <span className="text-emerald-400 font-semibold">18ms</span></div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-400">
              STATUS: <span className="text-emerald-400 font-bold">TURNIKET OCHILDI</span>
            </div>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-slate-800 text-center text-[10px] sm:text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-blue-400 block">3D-Yuz</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? '3 rakursli' : '3 ракурса'}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400 block">0.2 soniya</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? 'Tezkor qayd' : 'Скорость'}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-indigo-400 block">T-13 Excel</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? 'Avto-tabel' : 'Табель'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Assurance Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <Video className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>
            {language === 'uz'
              ? 'Noutbuk veb-kamerasi va RTSP IP-kameralar bilan to‘liq mos keladi.'
              : 'Поддержка веб-камер ноутбуков и внешних IP-камер (RTSP/ONVIF).'}
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="lg:col-span-5 xl:col-span-5 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between bg-white dark:bg-slate-900 relative z-10 transition-colors duration-200">
        {/* Top Bar: Dark/Light Mode & Language Selector */}
        <div className="flex items-center justify-end gap-2.5 mb-6">
          {/* Dark / Light Mode Toggle Button */}
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

          {/* Language Selector */}
          <div className="inline-flex items-center gap-0.5 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-sm dark:bg-slate-800 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('uz')}
              className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
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
              className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                language === 'ru'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              RU
            </button>
          </div>
        </div>

        {/* Main Login Form Area */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'uz' ? 'Tizimga kirish' : 'Вход в систему'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'uz'
                ? 'Boshqaruv paneli orqali xavfsiz avtorizatsiya'
                : 'Авторизация в панели администратора'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'uz' ? 'Administrator elektron pochtasi' : 'Email администратора'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@educontrol.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'uz' ? 'Maxfiy parol' : 'Пароль'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'uz' ? 'Ma’lumotlar tekshirilmoqda...' : 'Проверка данных...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'uz' ? 'Boshqaruv paneliga kirish' : 'Войти в панель управления'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                {language === 'uz'
                  ? 'Demo ma’lumotlarni to‘ldirish (admin@educontrol.com)'
                  : 'Заполнить демо-доступ (admin@educontrol.com)'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Security Tagline */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <span>
            {language === 'uz'
              ? 'EduControl • 256-bit shifrlangan xavfsiz tizim'
              : 'EduControl • Защищённая система с 256-битным шифрованием'}
          </span>
        </div>
      </div>
    </div>
  );
}
