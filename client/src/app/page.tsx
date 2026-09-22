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

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    onTimeTeachers.forEach((item: any) => item.department && set.add(item.department));
    lateTeachers.forEach((item: any) => item.department && set.add(item.department));
    absentTeachers.forEach((item: any) => item.department && set.add(item.department));
    return Array.from(set);
  }, [onTimeTeachers, lateTeachers, absentTeachers]);

  // Filtered teachers list based on active tab & search/dept
  const filteredTeachers = useMemo(() => {
    let list: any[] = [];
    if (disciplineTab === 'onTime') list = onTimeTeachers;
    else if (disciplineTab === 'late') list = lateTeachers;
    else if (disciplineTab === 'absent') list = absentTeachers;
    else {
      // Deduplicate when showing all
      const seen = new Set<string>();
      [...onTimeTeachers, ...lateTeachers, ...absentTeachers].forEach((tItem: any) => {
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
  }, [disciplineTab, onTimeTeachers, lateTeachers, absentTeachers, searchQuery, selectedDept]);

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
    <div className="space-y-5">
      {/* Clean Header without redundant links */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isUz ? 'Bugungi davomat va mehnat intizomi' : 'Посещаемость и трудовая дисциплина на сегодня'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUz
              ? 'Dars jadvaliga rioya etilishi va kirish-chiqish nazorati'
              : 'Контроль расписания и проходов через СКУД'}
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{isUz ? 'Yangilash' : 'Обновить'}</span>
        </button>
      </div>

      {/* 3 Core KPI Cards (Zero Fluff: Removed camera card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Teachers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUz ? 'O‘qituvchilar shtati' : 'Штат преподавателей'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">{isUz ? 'nafar' : 'чел.'}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isUz ? 'Xodimlar ro‘yxatida' : 'В реестре сотрудников'}
          </p>
        </div>

        {/* Present / On Shift */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {isUz ? 'Binoda / Darsda' : 'В корпусе / На занятиях'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{presentToday}</span>
            <span className="text-xs font-bold text-emerald-700">
              {attendanceRate}% {isUz ? 'davomat' : 'явка'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}: <strong className="text-emerald-800 font-bold">{onTimeToday}</strong></span>
            <span>•</span>
            <span>{isUz ? 'Kechikkanlar' : 'Опоздавшие'}: <strong className="text-amber-700 font-bold">{lateToday}</strong></span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {isUz ? 'Hali kelmaganlar' : 'Ещё не явились'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{absentToday}</span>
            <span className="text-xs text-rose-600 font-bold">
              {totalStudents > 0 ? Math.max(0, 100 - attendanceRate) : 0}% {isUz ? 'yo‘q' : 'не явились'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isUz ? 'Bugun o‘tish joyidan o‘tmagan' : 'Нет фиксаций через турникет'}
          </p>
        </div>
      </div>

      {/* TEACHER DISCIPLINE LIST (Instant Clarity: Defaults to 'all', Never Empty) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Filter Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {isUz ? 'O‘qituvchilar ro‘yxati va holati' : 'Список преподавателей и статус дисциплины'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUz ? `Dars boshlanishi: ${workStartTime}` : `Начало занятий: ${workStartTime}`}
            </p>
          </div>

          {/* Clean Segmented Tabs */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs gap-1 overflow-x-auto">
            <button
              onClick={() => setDisciplineTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                disciplineTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{isUz ? 'Barchasi' : 'Все'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
                {totalStudents}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('onTime')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                disciplineTab === 'onTime'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'onTime' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {onTimeTeachers.length}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('late')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                disciplineTab === 'late'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isUz ? 'Kechikkanlar' : 'Опоздавшие'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'late' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {lateTeachers.length}
              </span>
            </button>

            <button
              onClick={() => setDisciplineTab('absent')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                disciplineTab === 'absent'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{isUz ? 'Kelmaganlar' : 'Не явились'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                disciplineTab === 'absent' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'
              }`}>
                {absentTeachers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Compact Search & Dept Filters */}
        <div className="p-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUz ? 'F.I.O. yoki tabel raqami bo‘yicha qidirish...' : 'Поиск по ФИО или табельному номеру...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none font-medium"
            >
              <option value="ALL">{isUz ? 'Barcha kafedralar' : 'Все кафедры'}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-4">
          {filteredTeachers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs font-semibold text-slate-500">
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
                        ? 'bg-amber-50/50 border-amber-200/90'
                        : isOnTime
                        ? 'bg-emerald-50/40 border-emerald-200/90'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt=""
                          className={`w-10 h-10 rounded-xl object-cover border flex-shrink-0 shadow-xs ${
                            isLate ? 'border-amber-400' : isOnTime ? 'border-emerald-500' : 'border-slate-300'
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                            isLate
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isOnTime
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {teacher.firstName?.slice(0, 1)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-xs truncate">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {teacher.department || (isUz ? 'Axborot texnologiyalari' : 'Информационные технологии')}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      {isOnTime && (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{isUz ? 'O‘z vaqtida' : 'Вовремя'}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                            {teacher.checkInTime ? new Date(teacher.checkInTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '08:15'}
                          </span>
                        </>
                      )}

                      {isLate && (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>{formatLateDuration(teacher.lateMinutes || 15, isUz)}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                            {teacher.checkInTime ? new Date(teacher.checkInTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '08:45'}
                          </span>
                        </>
                      )}

                      {isAbsent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hourly Arrivals Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isUz ? 'Kelish dinamikasi (Soatlar bo‘yicha)' : 'Почасовая динамика прибытия'}
              </h2>
              <p className="text-xs text-slate-500">
                {isUz ? 'Dars boshlanishi oldidan kirish oqimlari' : 'Пики фиксации входа перед парами'}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
              {today}
            </span>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e3a5f',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name={isUz ? 'Kelganlar soni' : 'Прибыло'}
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Surveillance Activity Stream (1 Col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-900" />
              <h2 className="text-sm font-bold text-slate-900">
                {isUz ? 'SKUD qaydlari' : 'Журнал СКУД'}
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isUz ? 'JONLI' : 'В ЭФИРЕ'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
            {recentDetections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
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
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {photoToDisplay ? (
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100 shadow-xs">
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
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDeparture
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isArrival ? <LogIn className="w-3.5 h-3.5" /> : isDeparture ? <LogOut className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-[11px]">
                          {det.studentName || (isUz ? 'Noma’lum' : 'Неопознано')}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(det.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                        isArrival
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDeparture
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isArrival ? (isUz ? 'Kirish' : 'Вход') : isDeparture ? (isUz ? 'Chiqish' : 'Выход') : det.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100">
            <Link
              href="/reports"
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-800"
            >
              <span>{isUz ? 'Tabelni ko‘rish →' : 'Перейти в табель →'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
