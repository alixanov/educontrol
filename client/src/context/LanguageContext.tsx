'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'uz' | 'ru';

export interface Translations {
  [key: string]: {
    uz: string;
    ru: string;
  };
}

export const translations = {
  // Navigation & App Brand
  appTitle: {
    uz: 'EduControl — O‘qituvchilar ish vaqtini hisobga olish tizimi',
    ru: 'EduControl — Учёт рабочего времени преподавателей',
  },
  appSubtitle: {
    uz: 'Biometrik SKUD va mehnat intizomi nazorati',
    ru: 'Биометрический СКУД и контроль трудовой дисциплины',
  },
  navDashboard: {
    uz: 'Boshqaruv paneli',
    ru: 'Главная панель',
  },
  navCameras: {
    uz: 'SKUD O‘tish joyi (Kamera)',
    ru: 'Проходная (СКУД)',
  },
  navStudents: {
    uz: 'O‘qituvchilar va xodimlar',
    ru: 'Преподаватели и штат',
  },
  navReports: {
    uz: 'Ish vaqti tabeli',
    ru: 'Табель рабочего времени',
  },
  navSettings: {
    uz: 'Tizim sozlamalari',
    ru: 'Настройки системы',
  },

  // Navbar
  serverOnline: {
    uz: 'Server faol',
    ru: 'Сервер в сети',
  },
  serverOffline: {
    uz: 'Server bilan aloqa yo‘q',
    ru: 'Сервер недоступен',
  },
  standaloneMode: {
    uz: 'Avtonom rejim (Noutbuk)',
    ru: 'Автономный режим (Ноутбук)',
  },
  themeLight: {
    uz: 'Kunduzgi',
    ru: 'Светлая',
  },
  themeDark: {
    uz: 'Tungi',
    ru: 'Тёмная',
  },

  // Dashboard KPI
  teachersTotal: {
    uz: 'O‘qituvchilar shtati',
    ru: 'Штат преподавателей',
  },
  inStaffRegistry: {
    uz: 'Xodimlar ro‘yxatida',
    ru: 'В реестре сотрудников',
  },
  onShiftToday: {
    uz: 'Binoda / Smenada',
    ru: 'На смене / в корпусе',
  },
  ofTotalStaff: {
    uz: 'umumiy shtatdan',
    ru: 'от общего штата',
  },
  onTimeLabel: {
    uz: 'O‘z vaqtida',
    ru: 'Вовремя',
  },
  lateLabel: {
    uz: 'Kechikishlar',
    ru: 'Опоздания',
  },
  absentToday: {
    uz: 'Ishga kelmaganlar',
    ru: 'Не вышли на смену',
  },
  noPassDetected: {
    uz: 'O‘tish joyida qayd etilmagan',
    ru: 'Нет фиксаций через проходную',
  },
  activeCameras: {
    uz: 'Nazorat kameralari',
    ru: 'Камеры наблюдения',
  },
  connectedLive: {
    uz: 'Ulangan',
    ru: 'Подключено',
  },
  cameraTypes: {
    uz: 'Noutbuk kamerasi / RTSP oqimlar',
    ru: 'Камера ноутбука / RTSP потоки',
  },

  // Dashboard Charts & Streams
  hourlyArrivals: {
    uz: 'Soatlar bo‘yicha kelish taqsimoti',
    ru: 'Почасовое распределение прибытия',
  },
  hourlyArrivalsSub: {
    uz: 'O‘qituvchilarning kun davomida kirish cho‘qqilari',
    ru: 'Пики фиксации входа сотрудников по времени суток',
  },
  todayLabel: {
    uz: 'Bugun',
    ru: 'Сегодня',
  },
  arrivedLabel: {
    uz: 'Keldi',
    ru: 'Прибыло',
  },
  deptAttendance: {
    uz: 'Kafedralar va bo‘limlar bo‘yicha davomat',
    ru: 'Посещаемость по кафедрам / отделам',
  },
  liveJournal: {
    uz: 'Operativ qaydlar jurnali',
    ru: 'Оперативный журнал',
  },
  liveJournalOnline: {
    uz: 'JONLI EFIR',
    ru: 'ОНЛАЙН',
  },
  liveJournalSub: {
    uz: 'Biometrik modulning so‘nggi qaydlari:',
    ru: 'Последние фиксации биометрического модуля:',
  },
  noDetectionsToday: {
    uz: 'Bugun uchun hali qaydlar mavjud emas.',
    ru: 'За сегодня фиксаций не зарегистрировано.',
  },
  openFullJournal: {
    uz: 'To‘liq davomat jurnalini ochish',
    ru: 'Открыть полный журнал посещаемости',
  },
  refreshBtn: {
    uz: 'Yangilash',
    ru: 'Обновить',
  },

  // Discipline Widget (On-time vs Late)
  disciplineTitle: {
    uz: 'O‘qituvchilarning bugungi mehnat intizomi monitoringi',
    ru: 'Мониторинг явки преподавателей на сегодня',
  },
  disciplineSubtitle: {
    uz: 'Dars jadvali va ish vaqtiga rioya etilishi nazorati (dars boshlanishi 08:30)',
    ru: 'Контроль соблюдения расписания и трудовой дисциплины (начало 08:30)',
  },
  tabOnTime: {
    uz: 'O‘z vaqtida kelganlar',
    ru: 'Прибыли вовремя',
  },
  tabLate: {
    uz: 'Kechikkanlar',
    ru: 'Опоздавшие',
  },
  tabAbsent: {
    uz: 'Hali kelmaganlar',
    ru: 'Ещё не явились',
  },
  tabAll: {
    uz: 'Barcha xodimlar',
    ru: 'Все сотрудники',
  },
  tabDeparted: {
    uz: 'Smenani yakunlaganlar',
    ru: 'Завершили смену',
  },
  onTimeBadge: {
    uz: 'Jadval bo‘yicha (1-darsga o‘z vaqtida)',
    ru: 'В графике (Вовремя к 1-й паре)',
  },
  lateBadge: {
    uz: 'daqiqa kechikish',
    ru: 'мин. опоздания',
  },
  searchTeacherPlaceholder: {
    uz: 'O‘qituvchini F.I.O. yoki kafedra bo‘yicha qidirish...',
    ru: 'Поиск преподавателя по ФИО или кафедре...',
  },
  allDepartments: {
    uz: 'Barcha kafedralar',
    ru: 'Все кафедры',
  },
  noTeachersFound: {
    uz: 'Ushbu toifada o‘qituvchilar topilmadi',
    ru: 'В данной категории преподаватели не найдены',
  },
  checkInTimeLabel: {
    uz: 'Birinchi kirish:',
    ru: 'Первый вход:',
  },
  checkOutTimeLabel: {
    uz: 'Oxirgi chiqish:',
    ru: 'Последний выход:',
  },
  workedHoursLabel: {
    uz: 'Ishlangan vaqt:',
    ru: 'Отработано:',
  },
  entryLabel: {
    uz: 'Kirish',
    ru: 'Вход',
  },
  exitLabel: {
    uz: 'Chiqish',
    ru: 'Выход',
  },

  // Checkpoint (Cameras) Page
  terminalTitle: {
    uz: 'Biometrik SKUD nazorat posti',
    ru: 'Биометрический пост контроля СКУД',
  },
  terminalSubtitle: {
    uz: 'Yuzni tanish va ish vaqtini avtomatik qayd etish terminali',
    ru: 'Терминал распознавания лиц и автоматического учёта рабочего времени',
  },
  startTerminalBtn: {
    uz: 'Terminalni ishga tushirish',
    ru: 'Запустить терминал',
  },
  stopTerminalBtn: {
    uz: 'To‘xtatish',
    ru: 'Остановить',
  },
  cameraReady: {
    uz: 'Kamera tayyor',
    ru: 'Камера готова',
  },
  faceApiActive: {
    uz: 'Face-API faol',
    ru: 'Face-API активен',
  },
  autoSkudMode: {
    uz: 'Rejim: Avto-SKUD',
    ru: 'Режим: Авто-СКУД',
  },
  staffVerificationCard: {
    uz: 'Xodimni biometrik identifikatsiya qilish',
    ru: 'Идентификация сотрудника / преподавателя',
  },
  turnstileNumber: {
    uz: 'SKUD TURNIKET #1',
    ru: 'СКУД ТУРНИКЕТ #1',
  },
  teacherRole: {
    uz: 'O‘QITUVCHI',
    ru: 'ПРЕПОДАВАТЕЛЬ',
  },
  tabNumber: {
    uz: 'Tabel №',
    ru: 'Таб. №',
  },
  workDayStarted: {
    uz: 'ISH KUNI BOSHLANDI (KIRISH)',
    ru: 'РАБОЧИЙ ДЕНЬ НАЧАТ (ВХОД)',
  },
  shiftEnded: {
    uz: 'SMENA YAKUNLANDI (CHIQISH)',
    ru: 'СМЕНА ОКОНЧЕНА (ВЫХОД)',
  },
  disciplineArrivalStatus: {
    uz: 'Kelish intizomi:',
    ru: 'Дисциплина прихода:',
  },
  workedPerDay: {
    uz: 'Kunda ishlangan vaqt:',
    ru: 'Отработано за день:',
  },
  bioSimilarity: {
    uz: 'Biometrik o‘xshashlik:',
    ru: 'Биометрическое сходство:',
  },
  waitingAtCheckpoint: {
    uz: 'O‘tish joyi kutish rejimida',
    ru: 'Проходная в режиме ожидания',
  },
  waitingAtCheckpointSub: {
    uz: 'Kirish yoki chiqishni qayd etish uchun kameraga qarang',
    ru: 'Подойдите к камере для фиксации прихода или ухода',
  },
  realtimeFeedTitle: {
    uz: 'O‘tishlar jonli tasmasi',
    ru: 'Лента проходов в реальном времени',
  },
  filterAllPasses: {
    uz: 'Barchasi',
    ru: 'Все',
  },
  filterOnTimePasses: {
    uz: 'O‘z vaqtida',
    ru: 'Вовремя',
  },
  filterLatePasses: {
    uz: 'Kechikishlar',
    ru: 'Опоздания',
  },
  filterExitPasses: {
    uz: 'Chiqish',
    ru: 'Выход',
  },

  // Reports / Timesheet Page
  reportsPageTitle: {
    uz: 'Ish vaqti tabeli',
    ru: 'Табель рабочего времени',
  },
  reportsPageSubtitle: {
    uz: 'O‘qituvchilarning davomat va ish vaqti hisoboti',
    ru: 'Учёт явки и отработанного времени',
  },
  periodToday: {
    uz: 'Bugun',
    ru: 'Сегодня',
  },
  periodWeek: {
    uz: 'Joriy hafta (7 kun)',
    ru: 'Текущая неделя (7 дней)',
  },
  periodMonth: {
    uz: 'Joriy oy',
    ru: 'Текущий месяц',
  },
  periodCustom: {
    uz: 'Ixtiyoriy muddat',
    ru: 'Произвольный период',
  },
  exportExcelBtn: {
    uz: 'Excel hisobotini yuklab olish (.xlsx)',
    ru: 'Экспорт в Excel (.xlsx)',
  },
  exportExcelT13: {
    uz: 'Tabelni yuklab olish (.xlsx)',
    ru: 'Скачать табель (.xlsx)',
  },
  colTabNo: {
    uz: 'Tabel №',
    ru: 'Табельный №',
  },
  colFio: {
    uz: 'F.I.O.',
    ru: 'ФИО',
  },
  colDept: {
    uz: 'Kafedra',
    ru: 'Кафедра',
  },
  colDate: {
    uz: 'Sana',
    ru: 'Дата',
  },
  colCheckIn: {
    uz: 'Kirish',
    ru: 'Вход',
  },
  colCheckOut: {
    uz: 'Chiqish',
    ru: 'Выход',
  },
  colWorkedHours: {
    uz: 'Ishlangan vaqt',
    ru: 'Отработано',
  },
  colDisciplineStatus: {
    uz: 'Holat',
    ru: 'Статус',
  },
  colActions: {
    uz: 'Amallar',
    ru: 'Действия',
  },
  statusNorm: {
    uz: 'O‘z vaqtida',
    ru: 'В норме',
  },
  statusLate: {
    uz: 'Kechikish',
    ru: 'Опоздание',
  },
  statusAbsent: {
    uz: 'Kelmagan',
    ru: 'Неявка',
  },
  editEntry: {
    uz: 'Tahrirlash',
    ru: 'Редактировать',
  },
  saveChanges: {
    uz: 'Saqlash',
    ru: 'Сохранить',
  },
  cancelChanges: {
    uz: 'Bekor qilish',
    ru: 'Отмена',
  },
  resetFilters: {
    uz: 'Filtrlarni tozalash',
    ru: 'Сбросить фильтры',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  setLanguage: () => {},
  t: (key) => translations[key]?.uz || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('uz');

  useEffect(() => {
    const saved = localStorage.getItem('educontrol_lang') as Language | null;
    if (saved === 'uz' || saved === 'ru') {
      setLanguageState(saved);
    } else {
      setLanguageState('uz');
      localStorage.setItem('educontrol_lang', 'uz');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('educontrol_lang', lang);
  };

  const t = (key: keyof typeof translations): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item['uz'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
