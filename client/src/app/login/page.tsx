'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Video,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Delete,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Password submission (Tab 1)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'uz'
            ? 'Login yoki parol noto‘g‘ri kiritildi.'
            : 'Неверный логин или пароль.'),
      );
    } finally {
      setLoading(false);
    }
  };

  // PIN submission (Tab 2)
  const submitPin = async (pinValue: string) => {
    setError(null);
    setLoading(true);

    try {
      await login('admin', pinValue);
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'uz'
            ? 'PIN-kod noto‘g‘ri kiritildi (Standart: 1111).'
            : 'Неверный PIN-код (По умолчанию: 1111).'),
      );
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (loading) return;

    if (val === 'C') {
      setPin('');
      setError(null);
    } else if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      setError(null);
    } else {
      if (pin.length < 4) {
        const nextPin = pin + val;
        setPin(nextPin);
        setError(null);
        if (nextPin.length === 4) {
          submitPin(nextPin);
        }
      }
    }
  };

  // Physical keyboard listener for PIN mode
  useEffect(() => {
    if (loginMode !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('backspace');
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleKeypadPress('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loginMode, pin, loading]);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 relative overflow-hidden flex flex-col lg:grid lg:grid-cols-12">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: CCTV & AI Biometric Surveillance Showcase */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 p-6 sm:p-10 lg:p-12 xl:p-16 flex-col justify-between border-r border-slate-800/80 relative z-10 bg-slate-950/50">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-900 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{language === 'uz' ? 'AI Biometrik SKUD Tizimi' : 'Биометрическая СКУД на базе ИИ'}</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                EduControl
              </h1>
              <p className="text-xs text-slate-400 mt-1">
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

        {/* Center CCTV Terminal Mockup */}
        <div className="my-8 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl relative overflow-hidden group max-w-2xl text-slate-100">
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

          <div className="relative h-48 sm:h-56 my-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />

            <div className="relative w-32 h-36 sm:w-36 sm:h-40 border-2 border-emerald-400/90 rounded-2xl flex flex-col justify-between p-2.5 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
              <div className="flex justify-between">
                <span className="w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                <span className="w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
              </div>

              <div className="self-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border border-dashed border-emerald-400/70 animate-spin" />
                <span className="text-[10px] font-mono font-bold text-emerald-300 mt-1">99.4% MATCH</span>
              </div>

              <div className="flex justify-between">
                <span className="w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                <span className="w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
              </div>

              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-slate-950 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <span>✓</span>
                <span>{language === 'uz' ? 'ANIQLANDI: O‘QITUVCHI' : 'ИДЕНТИФИЦИРОВАН'}</span>
              </div>
            </div>

            <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>AI ENGINE: <span className="text-cyan-300 font-semibold">TinyFace-v2</span></div>
              <div>LATENCY: <span className="text-emerald-400 font-semibold">18ms</span></div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-400">
              STATUS: <span className="text-emerald-400 font-bold">TURNIKET OCHILDI</span>
            </div>
          </div>

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

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
          <Video className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            {language === 'uz'
              ? 'Noutbuk veb-kamerasi va RTSP IP-kameralar bilan to‘liq mos keladi.'
              : 'Поддержка веб-камер ноутбуков и внешних IP-камер (RTSP/ONVIF).'}
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Card */}
      <div className="col-span-12 lg:col-span-6 xl:col-span-6 min-h-screen p-4 sm:p-8 lg:p-12 flex flex-col items-center justify-center relative z-10">
        {/* Mobile/Tablet brand logo & title */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight leading-none">EduControl</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 border border-blue-800 text-blue-300">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'uz' ? 'Intellektual davomat va nazorat tizimi' : 'Интеллектуальная система контроля доступа'}
            </p>
          </div>
        </div>

        {/* Floating Card exactly matching reference */}
        <div className="w-full max-w-[430px] rounded-[28px] bg-[#111928]/95 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Card Top: Title, Subtitle, Theme & Language Buttons */}
          <div className="flex items-start justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {language === 'uz' ? 'Tizimga kirish' : 'Вход в систему'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] sm:max-w-none leading-relaxed">
                {language === 'uz'
                  ? 'Lavozimingizga qarab kirish usulini tanlang'
                  : 'Выберите способ входа в зависимости от должности'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle button styled exactly like reference */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-200 shadow-sm transition hover:bg-slate-700/80 text-xs font-medium cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>{language === 'uz' ? 'Kunduzgi' : 'Дневной'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-slate-300" />
                    <span>{language === 'uz' ? 'Tungi rejim' : 'Ночной режим'}</span>
                  </>
                )}
              </button>

              {/* Language toggle: [UZ | RU] */}
              <div className="inline-flex items-center rounded-xl bg-slate-800/70 p-0.5 border border-slate-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('uz')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    language === 'uz'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UZ
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ru')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    language === 'ru'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RU
                </button>
              </div>
            </div>
          </div>

          {/* TWO TABS: [Email va parol] vs [Tezkor PIN] */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                loginMode === 'password'
                  ? 'bg-[#29354d] text-white shadow-md border border-slate-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? 'Email va parol' : 'Email и пароль'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('pin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                loginMode === 'pin'
                  ? 'bg-[#1b253b] text-white shadow-md border-2 border-slate-300 dark:border-slate-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-300" />
              <span>{language === 'uz' ? 'Tezkor PIN (Kassir)' : 'Быстрый PIN (Кассир)'}</span>
            </button>
          </div>

          {/* Error message notification */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ===================== TAB 1: EMAIL VA PAROL ===================== */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'uz' ? 'Elektron pochta' : 'Электронная почта'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  {language === 'uz' ? 'Parol' : 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'uz' ? 'Kirilmoqda...' : 'Вход...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'uz' ? 'Panelga kirish' : 'Войти в панель'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===================== TAB 2: TEZKOR PIN (KASSIR) ===================== */}
          {loginMode === 'pin' && (
            <div className="space-y-4">
              <p className="text-center text-xs text-slate-400 font-medium">
                {language === 'uz'
                  ? '4 xonali shaxsiy PIN-kodingizni kiriting'
                  : 'Введите 4-значный персональный PIN-код'}
              </p>

              {/* 4 Circles PIN Indicators */}
              <div className="flex items-center justify-center gap-3.5 my-3">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                        isFilled
                          ? 'bg-blue-500 ring-4 ring-blue-500/20 scale-110'
                          : 'border-2 border-slate-700 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* 3x4 Keypad matching Image 2 */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[320px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    disabled={loading}
                    className="h-14 sm:h-15 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-xl font-bold text-white shadow-sm flex items-center justify-center transition cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* 'C' Clear Button */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('C')}
                  disabled={loading}
                  className="h-14 sm:h-15 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-lg font-bold text-slate-300 shadow-sm flex items-center justify-center transition cursor-pointer select-none"
                >
                  C
                </button>

                {/* '0' Button */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={loading}
                  className="h-14 sm:h-15 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-xl font-bold text-white shadow-sm flex items-center justify-center transition cursor-pointer select-none"
                >
                  0
                </button>

                {/* Backspace Button */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  disabled={loading}
                  className="h-14 sm:h-15 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 text-slate-300 shadow-sm flex items-center justify-center transition cursor-pointer select-none"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
