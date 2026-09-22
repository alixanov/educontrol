'use client';

import React, { useState } from 'react';
import { ShieldCheck, Video, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main 2-Column Responsive Card Container */}
      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT COLUMN: CCTV & AI Biometric Surveillance Showcase (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Glow inside left card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'uz' ? 'AI Biometrik SKUD Tizimi' : 'Биометрическая СКУД на базе ИИ'}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  EduControl
                </h1>
                <p className="text-[11px] font-medium text-slate-400">
                  {language === 'uz' ? 'Intellektual davomat nazorati' : 'Интеллектуальный контроль доступа'}
                </p>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-200 leading-snug pt-1">
              {language === 'uz'
                ? 'O‘qituvchilar va xodimlar davomatini kameralar orqali avtomatik hisobga olish'
                : 'Автоматический учёт рабочего времени преподавателей через камеры наблюдения'}
            </h2>
          </div>

          {/* Center CCTV Terminal Mockup with Face Detection HUD */}
          <div className="my-6 relative z-10 rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-xl overflow-hidden group">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-400 uppercase tracking-wider">● REC • LIVE</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-semibold">CAM-01 [TURNIKET-KIRISH]</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                60 FPS • 1080p
              </span>
            </div>

            {/* Simulated Camera Viewfinder with Face Target */}
            <div className="relative h-44 sm:h-48 my-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center overflow-hidden">
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
              <div className="relative w-28 h-32 sm:w-32 sm:h-36 border-2 border-emerald-400/90 rounded-2xl flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(52,211,153,0.25)]">
                {/* HUD Corner Accents */}
                <div className="flex justify-between">
                  <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-300" />
                  <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-300" />
                </div>

                {/* Center Reticle */}
                <div className="self-center flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border border-dashed border-emerald-400/60 animate-spin" />
                  <span className="text-[9px] font-mono font-bold text-emerald-300 mt-1">99.4% MATCH</span>
                </div>

                <div className="flex justify-between">
                  <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-300" />
                  <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-300" />
                </div>

                {/* Floating Detection Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <span>✓</span>
                  <span>{language === 'uz' ? 'ANIQLANDI: O‘QITUVCHI' : 'ИДЕНТИФИЦИРОВАН'}</span>
                </div>
              </div>

              {/* Telemetry OSD Overlay */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 space-y-0.5">
                <div>AI ENGINE: <span className="text-cyan-400">TinyFace-v2</span></div>
                <div>LATENCY: <span className="text-emerald-400">18ms</span></div>
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400">
                STATUS: <span className="text-emerald-400 font-bold">TURNIKET OCHILDI</span>
              </div>
            </div>

            {/* Bottom 3 Feature Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-sky-400 block">3D-Yuz</span>
                <span className="text-slate-400 text-[9px]">{language === 'uz' ? '3 rakursli' : '3 ракурса'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-emerald-400 block">0.2 soniya</span>
                <span className="text-slate-400 text-[9px]">{language === 'uz' ? 'Tezkor qayd' : 'Скорость'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-indigo-400 block">T-13 Excel</span>
                <span className="text-slate-400 text-[9px]">{language === 'uz' ? 'Avto-tabel' : 'Табель'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance Note */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 pt-1">
            <Video className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>
              {language === 'uz'
                ? 'Noutbuk veb-kamerasi va RTSP IP-kameralar bilan to‘liq mos keladi.'
                : 'Поддержка веб-камер ноутбуков и внешних IP-камер (RTSP/ONVIF).'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-slate-900/50">
          {/* Top Bar: Language Selector */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow-inner">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              <button
                type="button"
                onClick={() => setLanguage('uz')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  language === 'uz'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                O‘zbekcha
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ru')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  language === 'ru'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Русский
              </button>
            </div>
          </div>

          {/* Main Login Form Area */}
          <div className="my-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'uz' ? 'Tizimga kirish' : 'Вход в систему'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
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
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@educontrol.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  {language === 'uz' ? 'Maxfiy parol' : 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
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
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {language === 'uz'
                    ? 'Demo ma’lumotlarni to‘ldirish (admin@educontrol.com)'
                    : 'Заполнить демо-доступ (admin@educontrol.com)'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Security Tagline */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            <span>
              {language === 'uz'
                ? 'EduControl • 256-bit shifrlangan xavfsiz tizim'
                : 'EduControl • Защищённая система с 256-битным шифрованием'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
