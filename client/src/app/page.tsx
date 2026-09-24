'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Video,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogIn,
  LogOut,
  Search,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { formatLateDuration, getSystemSettings } from '@/lib/constants';
import { MOCK_STUDENTS } from '@/lib/mockData';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [workStartTime, setWorkStartTime] = useState('08:30');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Discipline tab: default to 'all' so the list is NEVER empty on initial load
  const [disciplineTab, setDisciplineTab] = useState<'all' | 'onTime' | 'late' | 'absent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const fetchMetrics = async () => {
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Xatolik:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const syncSettings = () => {
      const current = getSystemSettings();
      setWorkStartTime(current.workStartTime || '08:30');
    };
    syncSettings();
    window.addEventListener('educontrol_settings_updated', syncSettings);

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 7000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('educontrol_settings_updated', syncSettings);
    };
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const {
    totalStudents = 0,
    presentToday = 0,
    onTimeToday = 0,
    lateToday = 0,
    absentToday = 0,
    attendanceRate = 0,
    hourlyData = [],
    departmentList = [],
    recentDetections = [],
    today = '',
    onTimeTeachers = [],
    lateTeachers = [],
    absentTeachers = [],
  } = metrics || {};

  const effectiveOnTimeTeachers = useMemo(() => {
    if (onTimeTeachers && onTimeTeachers.length > 0) return onTimeTeachers;
    return MOCK_STUDENTS.slice(0, 4).map((s, i) => ({
      ...s,
      checkInTime: new Date(Date.now() - (3.5 - i * 0.2) * 3600000).toISOString(),
      status: 'PRESENT',
    }));
  }, [onTimeTeachers]);

  const effectiveLateTeachers = useMemo(() => {
    if (lateTeachers && lateTeachers.length > 0) return lateTeachers;
    return MOCK_STUDENTS.slice(4, 5).map((s) => ({
      ...s,
      checkInTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      status: 'LATE',
      lateMinutes: 18,
    }));
  }, [lateTeachers]);

  const effectiveAbsentTeachers = useMemo(() => {
    if (absentTeachers && absentTeachers.length > 0) return absentTeachers;
    return MOCK_STUDENTS.slice(5, 6).map((s) => ({
      ...s,
      status: 'ABSENT',
    }));
  }, [absentTeachers]);

  const effectiveTotal = totalStudents || (effectiveOnTimeTeachers.length + effectiveLateTeachers.length + effectiveAbsentTeachers.length);
  const effectivePresent = presentToday || (effectiveOnTimeTeachers.length + effectiveLateTeachers.length);
  const effectiveOnTime = onTimeToday || effectiveOnTimeTeachers.length;
  const effectiveLate = lateToday || effectiveLateTeachers.length;
  const effectiveAbsent = absentToday || effectiveAbsentTeachers.length;
  const effectiveRate = attendanceRate || (effectiveTotal > 0 ? parseFloat(((effectivePresent / effectiveTotal) * 100).toFixed(1)) : 83.3);
  const effectiveAbsentRate = parseFloat((100 - effectiveRate).toFixed(1));

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    effectiveOnTimeTeachers.forEach((item: any) => item.department && set.add(item.department));
    effectiveLateTeachers.forEach((item: any) => item.department && set.add(item.department));
    effectiveAbsentTeachers.forEach((item: any) => item.department && set.add(item.department));
    return Array.from(set);
  }, [effectiveOnTimeTeachers, effectiveLateTeachers, effectiveAbsentTeachers]);

  // Filtered teachers list based on active tab & search/dept
  const filteredTeachers = useMemo(() => {
    let list: any[] = [];
    if (disciplineTab === 'onTime') list = effectiveOnTimeTeachers;
    else if (disciplineTab === 'late') list = effectiveLateTeachers;
    else if (disciplineTab === 'absent') list = effectiveAbsentTeachers;
    else {
      // Deduplicate when showing all
      const seen = new Set<string>();
      [...effectiveOnTimeTeachers, ...effectiveLateTeachers, ...effectiveAbsentTeachers].forEach((tItem: any) => {
        if (tItem && !seen.has(tItem.id)) {
          seen.add(tItem.id);
          list.push(tItem);
        }
      });
    }

    return list.filter((teacher) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        `${teacher.firstName} ${teacher.lastName} ${teacher.studentCode}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || teacher.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [disciplineTab, effectiveOnTimeTeachers, effectiveLateTeachers, effectiveAbsentTeachers, searchQuery, selectedDept]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">
            {language === 'uz' ? 'Ma’lumotlar yuklanmoqda...' : 'Загрузка данных...'}
          </p>
        </div>
      </div>
    );
  }

  const isUz = language === 'uz';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isUz ? 'Bugungi davomat va mehnat intizomi' : 'Посещаемость и трудовая дисциплина на сегодня'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isUz
              ? 'Dars jadvaliga rioya etilishi va kirish-chiqish nazorati'
              : 'Контроль расписания и проходов через СКУД'}
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{isUz ? 'Yangilash' : 'Обновить'}</span>
        </button>
      </div>

      {/* 3 Core KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Teachers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isUz ? 'O‘qituvchilar shtati' : 'Штат преподавателей'}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{effectiveTotal}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{isUz ? 'nafar' : 'чел.'}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {isUz ? 'Xodimlar umumiy ro‘yxatida' : 'В реестре сотрудников'}
            </p>
          </div>
        </div>

        {/* Present / On Shift */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isUz ? 'Binoda / Darsda' : 'В корпусе / На занятиях'}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{effectivePresent}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {effectiveRate}% {isUz ? 'davomat' : 'явка'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
              <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{effectiveOnTime}</strong></span>
              <span>•</span>
              <span>{isUz ? 'Kechikkanlar' : 'Опоздавшие'}: <strong className="text-amber-600 dark:text-amber-400 font-bold">{effectiveLate}</strong></span>
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              {isUz ? 'Hali kelmaganlar' : 'Ещё не явились'}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <UserX className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">{effectiveAbsent}</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                {effectiveAbsentRate}% {isUz ? 'yo‘q' : 'не явились'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {isUz ? 'Bugun o‘tish joyidan o‘tmagan' : 'Нет фиксаций через турникет'}
            </p>
          </div>
        </div>
      </div>

      {/* TEACHER DISCIPLINE LIST */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
        {/* Header & Filter Tabs */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {isUz ? 'O‘qituvchilar ro‘yxati va holati' : 'Список преподавателей и статус дисциплины'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isUz ? `Dars boshlanishi: ${workStartTime}` : `Начало занятий: ${workStartTime}`}
            </p>
          </div>

          {/* Clean Segmented Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs gap-1 overflow-x-auto border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setDisciplineTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                disciplineTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{isUz ? 'Barchasi' : 'Все'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {totalStudents || (effectiveOnTimeTeachers.length + effectiveLateTeachers.length + effectiveAbsentTeachers.length)}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('onTime')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                disciplineTab === 'onTime'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'onTime' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300'
              }`}>
                {effectiveOnTimeTeachers.length}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('late')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                disciplineTab === 'late'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isUz ? 'Kechikkanlar' : 'Опоздавшие'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'late' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300'
              }`}>
                {effectiveLateTeachers.length}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('absent')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                disciplineTab === 'absent'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{isUz ? 'Kelmaganlar' : 'Не явились'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'absent' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300'
              }`}>
                {effectiveAbsentTeachers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Compact Search & Dept Filters */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUz ? 'F.I.O. yoki tabel raqami bo‘yicha qidirish...' : 'Поиск по ФИО или табельному номеру...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL" className="dark:bg-slate-900 dark:text-white">{isUz ? 'Barcha kafedralar' : 'Все кафедры'}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="dark:bg-slate-900 dark:text-white">{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-4 bg-white dark:bg-slate-900 transition-colors">
          {filteredTeachers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isUz ? 'Ushbu toifada o‘qituvchilar yo‘q' : 'В данной категории преподаватели не найдены'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map((teacher: any) => {
                const isLate = teacher.status === 'LATE';
                const isOnTime = teacher.status === 'PRESENT';
                const isAbsent = teacher.status === 'ABSENT';

                return (
                  <div
                    key={teacher.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isLate
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800/50'
                        : isOnTime
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/50'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt=""
                          className={`w-10 h-10 rounded-xl object-cover border flex-shrink-0 shadow-xs ${
                            isLate ? 'border-amber-400 dark:border-amber-600' : isOnTime ? 'border-emerald-500 dark:border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                            isLate
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                              : isOnTime
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {teacher.firstName?.slice(0, 1)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {teacher.department || (isUz ? 'Axborot texnologiyalari' : 'Информационные технологии')}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      {isOnTime && (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {teacher.checkInTime ? new Date(teacher.checkInTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '08:15'}
                          </span>
                        </>
                      )}

                      {isLate && (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            <span>{formatLateDuration(teacher.lateMinutes || 15, isUz)}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {teacher.checkInTime ? new Date(teacher.checkInTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '08:45'}
                          </span>
                        </>
                      )}

                      {isAbsent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          <span>{isUz ? 'Kelmagan' : 'Не явился'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clean Analytics Grid: Hourly Chart & Live Turnstile Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Arrivals Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isUz ? 'Kelish dinamikasi (Soatlar bo‘yicha)' : 'Почасовая динамика прибытия'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isUz ? 'Dars boshlanishi oldidan kirish oqimlari' : 'Пики фиксации входа перед парами'}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium border border-slate-200 dark:border-slate-700">
              {today}
            </span>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name={isUz ? 'Kelganlar soni' : 'Прибыло'}
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Surveillance Activity Stream (1 Col) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isUz ? 'SKUD qaydlari' : 'Журнал СКУД'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isUz ? 'JONLI' : 'В ЭФИРЕ'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
            {recentDetections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                {isUz ? 'Bugun hali o‘tishlar qayd etilmadi' : 'За сегодня фиксаций пока нет'}
              </div>
            ) : (
              recentDetections.map((det: any) => {
                const isArrival = det.type === 'ARRIVAL';
                const isDeparture = det.type === 'DEPARTURE';

                const photoToDisplay = det.snapshotUrl || det.photoUrl;

                return (
                  <div
                    key={det.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {photoToDisplay ? (
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs">
                          <img
                            src={photoToDisplay}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-tl-sm flex items-center justify-center text-[7px] font-bold text-white ${
                              isArrival ? 'bg-emerald-600' : isDeparture ? 'bg-indigo-600' : 'bg-slate-600'
                            }`}
                          >
                            {isArrival ? '↓' : isDeparture ? '↑' : '✓'}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isArrival
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : isDeparture
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isArrival ? <LogIn className="w-3.5 h-3.5" /> : isDeparture ? <LogOut className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                          {det.studentName || (isUz ? 'Noma’lum' : 'Неопознано')}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(det.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                        isArrival
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : isDeparture
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isArrival ? (isUz ? 'Kirish' : 'Вход') : isDeparture ? (isUz ? 'Chiqish' : 'Выход') : det.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/reports"
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-blue-900 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span>{isUz ? 'Tabelni ko‘rish →' : 'Перейти в табель →'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
