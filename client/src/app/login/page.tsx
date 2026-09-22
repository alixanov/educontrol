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
    <div className="min-h-screen w-full bg-[#0c1829] text-slate-100 relative overflow-hidden flex flex-col lg:grid lg:grid-cols-12">
      {/* Background Decorative Ambient Glows & Seamless Grid Pattern (NO BLUR OVERLAY BOX) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1e3a5f]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#152d4a]/30 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* LEFT COLUMN: CCTV & AI Biometric Surveillance Showcase (Full Height, Edge-to-Edge) */}
      <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#254773] relative z-10 bg-[#102036]/80">
        {/* Top Brand Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a5f]/40 border border-[#2f588f] text-blue-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'uz' ? 'AI Biometrik SKUD Tizimi' : 'Биометрическая СКУД на базе ИИ'}</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] border border-[#2f588f] flex items-center justify-center text-white shadow-lg shadow-[#1e3a5f]/40 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                EduControl
              </h1>
              <p className="text-xs font-medium text-blue-200/70">
                {language === 'uz' ? 'Intellektual davomat va ish vaqti nazorati' : 'Интеллектуальный контроль доступа и учёта рабочего времени'}
              </p>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-200 leading-snug pt-1 max-w-xl">
            {language === 'uz'
              ? 'O‘qituvchilar va xodimlar davomatini kameralar orqali avtomatik hisobga olish'
              : 'Автоматический учёт рабочего времени преподавателей через камеры наблюдения'}
          </h2>
        </div>

        {/* Center CCTV Terminal Mockup with Face Detection HUD */}
        <div className="my-8 rounded-2xl bg-[#0c1829] border border-[#254773] p-4 sm:p-5 shadow-2xl relative overflow-hidden group max-w-2xl">
          {/* Terminal Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#254773] text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400 uppercase tracking-wider">● REC • LIVE</span>
              <span className="text-slate-500">|</span>
              <span className="text-blue-200 font-semibold">CAM-01 [TURNIKET-KIRISH]</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950/70 px-2.5 py-0.5 rounded border border-emerald-800 text-[10px]">
              60 FPS • 1080p
            </span>
          </div>

          {/* Simulated Camera Viewfinder with Face Target */}
          <div className="relative h-48 sm:h-56 my-3 rounded-xl bg-gradient-to-b from-[#0e1d32] to-[#091322] border border-[#254773]/80 flex items-center justify-center overflow-hidden">
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
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-[#0c1829] font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <span>✓</span>
                <span>{language === 'uz' ? 'ANIQLANDI: O‘QITUVCHI' : 'ИДЕНТИФИЦИРОВАН'}</span>
              </div>
            </div>

            {/* Telemetry OSD Overlay */}
            <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-blue-200/70 space-y-0.5">
              <div>AI ENGINE: <span className="text-cyan-300 font-semibold">TinyFace-v2</span></div>
              <div>LATENCY: <span className="text-emerald-400 font-semibold">18ms</span></div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-blue-200/70">
              STATUS: <span className="text-emerald-400 font-bold">TURNIKET OCHILDI</span>
            </div>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-[#254773] text-center text-[10px] sm:text-[11px]">
            <div className="p-2 rounded-xl bg-[#0c1829] border border-[#254773]">
              <span className="font-bold text-blue-300 block">3D-Yuz</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? '3 rakursli' : '3 ракурса'}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0c1829] border border-[#254773]">
              <span className="font-bold text-emerald-400 block">0.2 soniya</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? 'Tezkor qayd' : 'Скорость'}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#0c1829] border border-[#254773]">
              <span className="font-bold text-indigo-300 block">T-13 Excel</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">{language === 'uz' ? 'Avto-tabel' : 'Табель'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Assurance Note */}
        <div className="flex items-center gap-2 text-xs text-blue-200/70 pt-2">
          <Video className="w-4 h-4 text-blue-300 flex-shrink-0" />
          <span>
            {language === 'uz'
              ? 'Noutbuk veb-kamerasi va RTSP IP-kameralar bilan to‘liq mos keladi.'
              : 'Поддержка веб-камер ноутбуков и внешних IP-камер (RTSP/ONVIF).'}
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form (Full Height, Edge-to-Edge) */}
      <div className="lg:col-span-5 xl:col-span-5 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-between bg-[#12233a] relative z-10">
        {/* Top Bar: Dark/Light Mode & Language Selector */}
        <div className="flex items-center justify-end gap-2.5 mb-6">
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? (language === 'uz' ? 'Kunduzgi rejim (Yorug‘)' : 'Светлая тема') : (language === 'uz' ? 'Tungi rejim (Qorong‘i)' : 'Тёмная тема')}
            className="p-1.5 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-[#0c1829] border-[#254773] text-slate-200 hover:text-white hover:bg-[#1b3455] cursor-pointer shadow-xs"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-medium text-amber-300">
                  {language === 'uz' ? 'Kunduzgi' : 'Светлая'}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] font-medium text-slate-300">
                  {language === 'uz' ? 'Tungi' : 'Тёмная'}
                </span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0c1829] border border-[#254773] text-xs shadow-inner">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setLanguage('uz')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                language === 'uz'
                  ? 'bg-[#1e3a5f] text-white shadow-xs border border-[#2f588f]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              O‘zbekcha
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ru')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                language === 'ru'
                  ? 'bg-[#1e3a5f] text-white shadow-xs border border-[#2f588f]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Русский
            </button>
          </div>
        </div>

        {/* Main Login Form Area (Centered Vertically) */}
        <div className="my-auto max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {language === 'uz' ? 'Tizimga kirish' : 'Вход в систему'}
            </h2>
            <p className="text-xs text-blue-200/70 mt-1">
              {language === 'uz'
                ? 'Boshqaruv paneli orqali xavfsiz avtorizatsiya'
                : 'Авторизация в панели администратора'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0c1829] border border-[#254773] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2f588f] focus:border-[#2f588f] transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0c1829] border border-[#254773] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2f588f] focus:border-[#2f588f] transition"
                />
              </div>
            </div>

            {/* Official Brand #1e3a5f Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1e3a5f] hover:bg-[#284e7e] active:bg-[#152d4a] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#1e3a5f]/40 border border-[#2f588f] flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
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
              className="w-full py-2.5 px-3 rounded-xl bg-[#0c1829] hover:bg-[#1b3455] text-slate-300 hover:text-white text-xs font-semibold border border-[#254773] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {language === 'uz'
                  ? 'Demo ma’lumotlarni to‘ldirish (admin@educontrol.com)'
                  : 'Заполнить демо-доступ (admin@educontrol.com)'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Security Tagline */}
        <div className="pt-6 border-t border-[#254773] text-center text-[11px] text-blue-200/50">
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
