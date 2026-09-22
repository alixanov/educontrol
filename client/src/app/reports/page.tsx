'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Edit,
  Save,
  X,
  FileSpreadsheet,
  RefreshCw,
  Award,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getSystemSettings } from '@/lib/constants';

export default function AttendanceReportsPage() {
  const { t, language } = useLanguage();
  const [systemSettings, setSystemSettings] = useState(() => getSystemSettings());
  const [records, setRecords] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setSystemSettings(getSystemSettings());
  }, []);

  // Period filter states: 'today' | 'week' | 'month' | 'custom'
  const [periodType, setPeriodType] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Editing dialog
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editInTime, setEditInTime] = useState('');
  const [editOutTime, setEditOutTime] = useState('');

  // Helper date formatting
  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize or update dates when periodType changes
  useEffect(() => {
    const now = new Date();
    if (periodType === 'today') {
      const todayStr = formatDateStr(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (periodType === 'week') {
      // Calculate Monday of current week
      const dayOfWeek = now.getDay() || 7; // 1 = Mon, 7 = Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      setStartDate(formatDateStr(monday));
      setEndDate(formatDateStr(sunday));
    } else if (periodType === 'month') {
      // First day of current month to last day
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setStartDate(formatDateStr(firstDay));
      setEndDate(formatDateStr(lastDay));
    }
  }, [periodType]);

  const formatDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return '—';
    if (!checkOut) return language === 'uz' ? 'Binoda' : 'В здании';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '—';
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    if (hours === 0 && minutes === 0) return '< 1 min';
    if (hours === 0) return `${minutes} ${language === 'uz' ? 'daq' : 'мин'}`;
    if (minutes === 0) return `${hours} ${language === 'uz' ? 'soat' : 'ч'}`;
    return `${hours} ${language === 'uz' ? 'soat' : 'ч'} ${minutes} ${language === 'uz' ? 'daq' : 'мин'}`;
  };

  const formatMinutesToHours = (totalMinutes: number) => {
    if (totalMinutes <= 0) return '0 ' + (language === 'uz' ? 'daq' : 'мин');
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) {
      return language === 'uz' ? `${h} soat ${m} daq` : `${h}ч ${m}мин`;
    }
    if (h > 0) {
      return language === 'uz' ? `${h} soat` : `${h}ч`;
    }
    return language === 'uz' ? `${m} daq` : `${m}мин`;
  };

  const fetchRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [recData, teachersData] = await Promise.all([
        api.getAttendanceRecords({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status || undefined,
          search: search || undefined,
        }),
        api.getStudents(),
      ]);
      setRecords(recData);
      setAllTeachers(teachersData);
    } catch (e) {
      console.error('Ошибка загрузки отчетов:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchRecords();
      const interval = setInterval(() => fetchRecords(true), 6000);
      return () => clearInterval(interval);
    }
  }, [startDate, endDate, status, search]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    allTeachers.forEach((t) => t.department && set.add(t.department));
    records.forEach((r) => r.student?.department && set.add(r.student.department));
    return Array.from(set);
  }, [allTeachers, records]);

  // Filtered records based on selected department
  const filteredRecords = useMemo(() => {
    if (selectedDept === 'ALL') return records;
    return records.filter((r) => r.student?.department === selectedDept);
  }, [records, selectedDept]);

  // Summary Metrics for the active period
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const onTimeCount = filteredRecords.filter((r) => r.status === 'PRESENT').length;
    const lateCount = filteredRecords.filter((r) => r.status === 'LATE').length;
    const absentCount = filteredRecords.filter((r) => r.status === 'ABSENT').length;
    const disciplineRate = total > 0 ? Math.round((onTimeCount / total) * 100) : 0;
    return { total, onTimeCount, lateCount, absentCount, disciplineRate };
  }, [filteredRecords]);

  // =========================================================================
  // CLEAN AND CONCISE EXCEL EXPORT (Name, Surname, Date, In/Out Time, Status)
  // =========================================================================
  const handleExportStandardExcel = () => {
    if (!startDate || !endDate) {
      alert(language === 'uz' ? 'Iltimos, hisobot davrini tanlang.' : 'Пожалуйста, выберите период отчёта.');
      return;
    }
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    if (isNaN(startD.getTime()) || isNaN(endD.getTime()) || startD > endD) {
      alert(language === 'uz' ? 'Sana oralig‘i noto‘g‘ri kiritildi.' : 'Неверно указан диапазон дат.');
      return;
    }

    if (filteredRecords.length === 0) {
      alert(language === 'uz' ? 'Eksport qilish uchun ma’lumotlar yo‘q.' : 'Нет записей для экспорта.');
      return;
    }

    const isUz = language === 'uz';
    const wb = XLSX.utils.book_new();

    const headers = [
      isUz ? 'T/r' : '№',
      isUz ? 'Ism' : 'Имя',
      isUz ? 'Familiya' : 'Фамилия',
      isUz ? 'Kafedra' : 'Кафедра',
      isUz ? 'Sana' : 'Дата',
      isUz ? 'Kirish vaqti' : 'Время входа',
      isUz ? 'Chiqish vaqti' : 'Время выхода',
      isUz ? 'Ishlangan vaqt' : 'Отработано',
      isUz ? 'Holat' : 'Статус',
    ];

    const rows: any[][] = [headers];

    filteredRecords.forEach((rec, idx) => {
      const inStr = rec.checkInTime
        ? new Date(rec.checkInTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        : '—';
      const outStr = rec.checkOutTime
        ? new Date(rec.checkOutTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        : '—';
      const durStr = formatDuration(rec.checkInTime, rec.checkOutTime);

      // Status string (clear and precise)
      let statusStr = isUz ? 'O‘z vaqtida' : 'Вовремя';
      if (rec.status === 'ABSENT' || (!rec.checkInTime && !rec.checkOutTime)) {
        statusStr = isUz ? 'Kelmagan' : 'Не явился';
      } else if (rec.checkInTime && !rec.checkOutTime) {
        statusStr = isUz ? 'Binoda' : 'В здании';
      } else if (rec.status === 'LATE') {
        statusStr = isUz ? 'Kechikish' : 'Опоздание';
      }

      rows.push([
        idx + 1,
        rec.student?.firstName || '',
        rec.student?.lastName || '',
        rec.student?.department || '',
        rec.date,
        inStr,
        outStr,
        durStr,
        statusStr,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },  // №
      { wch: 18 }, // Ism / Имя
      { wch: 20 }, // Familiya / Фамилия
      { wch: 28 }, // Kafedra / Кафедра
      { wch: 14 }, // Sana / Дата
      { wch: 15 }, // Kirish vaqti / Время входа
      { wch: 15 }, // Chiqish vaqti / Время выхода
      { wch: 16 }, // Ishlangan vaqt / Отработано
      { wch: 16 }, // Holat / Статус
    ];

    XLSX.utils.book_append_sheet(wb, ws, isUz ? 'Tabel' : 'Табель');

    const fileName = `Tabel_${startDate}_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Editing handlers
  const handleOpenEdit = (rec: any) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditInTime(rec.checkInTime ? new Date(rec.checkInTime).toTimeString().slice(0, 5) : '');
    setEditOutTime(rec.checkOutTime ? new Date(rec.checkOutTime).toTimeString().slice(0, 5) : '');
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      const payload: any = {
        status: editStatus,
        checkInTime: editInTime ? `${editingRecord.date}T${editInTime}:00` : null,
        checkOutTime: editOutTime ? `${editingRecord.date}T${editOutTime}:00` : null,
      };
      await api.updateAttendance(editingRecord.id, payload);
      setEditingRecord(null);
      fetchRecords();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResetFilters = () => {
    setPeriodType('month');
    setStatus('');
    setSelectedDept('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('reportsPageTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('reportsPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refreshBtn')}</span>
          </button>

          {/* POWERFUL EXCEL EXPORT BUTTON */}
          <button
            onClick={handleExportStandardExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition transform active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcelT13')}</span>
          </button>
        </div>
      </div>

      {/* PERIOD SELECTOR TABS & DATE RANGE BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Preset Period Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs w-full md:w-auto">
          <button
            onClick={() => setPeriodType('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex-1 md:flex-initial text-center ${
              periodType === 'today'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodToday')}
          </button>
          <button
            onClick={() => setPeriodType('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex-1 md:flex-initial text-center ${
              periodType === 'week'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodWeek')}
          </button>
          <button
            onClick={() => setPeriodType('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex-1 md:flex-initial text-center ${
              periodType === 'month'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodMonth')}
          </button>
          <button
            onClick={() => setPeriodType('custom')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex-1 md:flex-initial text-center ${
              periodType === 'custom'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('periodCustom')}
          </button>
        </div>

        {/* Date Inputs Range */}
        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPeriodType('custom');
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          <span className="text-slate-400 dark:text-slate-500 font-semibold">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPeriodType('custom');
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
        </div>

        {/* Quick Period Summary KPI */}
        <div className="flex items-center gap-3 text-xs bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-3 py-1.5 rounded-lg w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 dark:text-slate-400">{language === 'uz' ? 'Jami qaydlar:' : 'Всего явок:'}</span>
            <strong className="text-blue-900 dark:text-blue-400 font-bold">{stats.total}</strong>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-700 dark:text-emerald-400">{language === 'uz' ? 'O‘z vaqtida:' : 'Вовремя:'}</span>
            <strong className="text-emerald-800 dark:text-emerald-300 font-bold">{stats.onTimeCount}</strong>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-700 dark:text-amber-400">{language === 'uz' ? 'Kechikish:' : 'Опоздания:'}</span>
            <strong className="text-amber-800 dark:text-amber-300 font-bold">{stats.lateCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar: Search, Department, Status */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchTeacherPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none font-medium w-full sm:w-auto"
          >
            <option value="ALL">{t('allDepartments')}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept} className="dark:bg-slate-900 dark:text-white">{dept}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none font-medium w-full sm:w-auto"
          >
            <option value="">{language === 'uz' ? 'Barcha holatlar' : 'Все статусы'}</option>
            <option value="PRESENT">{language === 'uz' ? 'O‘z vaqtida' : 'Вовремя'}</option>
            <option value="LATE">{language === 'uz' ? 'Kechikish bilan' : 'Опоздание'}</option>
            <option value="ABSENT">{language === 'uz' ? 'Kelmagan' : 'Неявка'}</option>
          </select>
        </div>

        {(status || search || selectedDept !== 'ALL') && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold px-2 py-1 transition flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('resetFilters')}</span>
          </button>
        )}
      </div>

      {/* Table: Timesheet Records */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">{t('colFio')}</th>
                <th className="py-3 px-4">{t('colTabNo')}</th>
                <th className="py-3 px-4">{t('colDept')}</th>
                <th className="py-3 px-4">{t('colDate')}</th>
                <th className="py-3 px-4">{t('colCheckIn')}</th>
                <th className="py-3 px-4">{t('colCheckOut')}</th>
                <th className="py-3 px-4">{t('colWorkedHours')}</th>
                <th className="py-3 px-4">{t('colDisciplineStatus')}</th>
                <th className="py-3 px-4 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {language === 'uz' ? 'Tabel ma’lumotlari yuklanmoqda...' : 'Загрузка записей табеля...'}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {language === 'uz' ? 'Tanlangan davr uchun qaydlar topilmadi.' : 'Записей по заданным критериям не найдено.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const student = rec.student;
                  const isAbsent = rec.status === 'ABSENT' || (!rec.checkInTime && !rec.checkOutTime);

                  // Calculate Arrival discipline against workStartTime
                  let isLateArrival = false;
                  let lateMins = 0;
                  if (rec.checkInTime) {
                    const inD = new Date(rec.checkInTime);
                    const [sH, sM] = (systemSettings.workStartTime || '08:30').split(':').map(Number);
                    const inMinutes = inD.getHours() * 60 + inD.getMinutes();
                    const startMinutes = sH * 60 + sM;
                    if (inMinutes > startMinutes) {
                      isLateArrival = true;
                      lateMins = inMinutes - startMinutes;
                    }
                  }

                  // Calculate Departure discipline against workEndTime
                  let isEarlyDeparture = false;
                  let earlyMins = 0;
                  if (rec.checkOutTime) {
                    const outD = new Date(rec.checkOutTime);
                    const [eH, eM] = (systemSettings.workEndTime || '17:00').split(':').map(Number);
                    const outMinutes = outD.getHours() * 60 + outD.getMinutes();
                    const endMinutes = eH * 60 + eM;
                    if (outMinutes < endMinutes) {
                      isEarlyDeparture = true;
                      earlyMins = endMinutes - outMinutes;
                    }
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      {/* Teacher name & photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {student?.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              {student?.firstName?.slice(0, 1)}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {student?.firstName} {student?.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Tab Number */}
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {student?.studentCode || '—'}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {student?.department || '—'}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.date}
                      </td>

                      {/* In Time */}
                      <td className="py-3 px-4 font-mono">
                        {rec.checkInTime ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            {new Date(rec.checkInTime).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Out Time */}
                      <td className="py-3 px-4 font-mono">
                        {rec.checkOutTime ? (
                          <span className="text-blue-700 dark:text-blue-400 font-bold">
                            {new Date(rec.checkOutTime).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Worked Hours */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {formatDuration(rec.checkInTime, rec.checkOutTime)}
                      </td>

                      {/* Discipline Status Badge */}
                      <td className="py-3 px-4">
                        {isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <UserX className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>{language === 'uz' ? 'Kelmagan' : 'Не явился'}</span>
                          </span>
                        ) : isLateArrival && isEarlyDeparture ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            <span>+{formatMinutesToHours(lateMins)} / -{formatMinutesToHours(earlyMins)}</span>
                          </span>
                        ) : isLateArrival ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>+{formatMinutesToHours(lateMins)}</span>
                          </span>
                        ) : isEarlyDeparture ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                            <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            <span>-{formatMinutesToHours(earlyMins)}</span>
                          </span>
                        ) : rec.checkInTime && rec.checkOutTime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{language === 'uz' ? 'O‘z vaqtida' : 'Вовремя'}</span>
                          </span>
                        ) : rec.checkInTime ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                            <span>{language === 'uz' ? 'Binoda' : 'В здании'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                          title={t('editEntry')}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('editEntry')}: {editingRecord.student?.firstName} {editingRecord.student?.lastName}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('colDisciplineStatus')}:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="PRESENT" className="dark:bg-slate-900 dark:text-white">{t('statusNorm')}</option>
                  <option value="LATE" className="dark:bg-slate-900 dark:text-white">{t('statusLate')}</option>
                  <option value="ABSENT" className="dark:bg-slate-900 dark:text-white">{t('statusAbsent')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('colCheckIn')}:</label>
                <input
                  type="time"
                  value={editInTime}
                  onChange={(e) => setEditInTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('colCheckOut')}:</label>
                <input
                  type="time"
                  value={editOutTime}
                  onChange={(e) => setEditOutTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition cursor-pointer"
              >
                {t('cancelChanges')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs transition cursor-pointer"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
