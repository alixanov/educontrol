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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Language Switcher Pill */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-lg">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setLanguage('uz')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
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
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                language === 'ru'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Русский
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-xl shadow-sky-500/20 mb-3 ring-4 ring-slate-800/80">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">EduControl</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {language === 'uz'
              ? 'O‘qituvchilar davomatini kameralar orqali intellektual nazorat qilish tizimi'
              : 'Система автоматического видеоконтроля посещаемости преподавателей'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              {language === 'uz' ? 'Tizimga kirish' : 'Вход в систему'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'uz'
                ? 'Boshqaruv paneli orqali avtorizatsiya'
                : 'Авторизация в панели управления'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'uz' ? 'Ma’lumotlar tekshirilmoqda...' : 'Проверка учетных данных...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'uz' ? 'Boshqaruv paneliga kirish' : 'Войти в панель управления'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Button */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 flex items-center justify-center gap-2 transition"
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

        {/* Footer Notes */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Video className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {language === 'uz'
              ? 'EduControl • Biometrik davomat nazorati'
              : 'EduControl • Биометрический контроль посещаемости'}
          </span>
        </div>
      </div>
    </div>
  );
}
