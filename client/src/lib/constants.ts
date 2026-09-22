export const DEFAULT_DEPARTMENTS = {
  uz: [
    'Axborot texnologiyalari kafedrasi',
    'Dasturiy injiniring kafedrasi',
    'Kiberxavfsizlik kafedrasi',
    'Oliy matematika kafedrasi',
    'Chet tillari kafedrasi',
    'O‘quv bo‘limi va ma’muriyat',
  ],
  ru: [
    'Кафедра информационных технологий',
    'Кафедра программной инженерии',
    'Кафедра кибербезопасности',
    'Кафедра высшей математики',
    'Кафедра иностранных языков',
    'Учебная часть и администрация',
  ],
};

export const DEPARTMENTS = DEFAULT_DEPARTMENTS;

export function getSystemDepartments(lang: 'uz' | 'ru' = 'ru'): string[] {
  if (typeof window === 'undefined') return DEFAULT_DEPARTMENTS[lang];
  try {
    const saved = localStorage.getItem(`educontrol_departments_${lang}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_DEPARTMENTS[lang];
}

export function saveSystemDepartments(list: string[], lang: 'uz' | 'ru' = 'ru') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`educontrol_departments_${lang}`, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('educontrol_departments_updated', { detail: { lang, list } }));
}

export function addSystemDepartment(name: string, lang: 'uz' | 'ru' = 'ru'): string[] {
  const cleanName = name.trim();
  if (!cleanName) return getSystemDepartments(lang);
  const current = getSystemDepartments(lang);
  if (!current.includes(cleanName)) {
    const updated = [...current, cleanName];
    saveSystemDepartments(updated, lang);
    return updated;
  }
  return current;
}

export function removeSystemDepartment(name: string, lang: 'uz' | 'ru' = 'ru'): string[] {
  const current = getSystemDepartments(lang);
  const updated = current.filter((d) => d !== name);
  saveSystemDepartments(updated, lang);
  return updated;
}

export function resetSystemDepartments(lang: 'uz' | 'ru' = 'ru'): string[] {
  saveSystemDepartments(DEFAULT_DEPARTMENTS[lang], lang);
  return DEFAULT_DEPARTMENTS[lang];
}

export const TEACHER_RANKS = {
  uz: [
    'Kafedra mudiri',
    'Professor',
    'Dotsent',
    'Katta o‘qituvchi',
    'Assistent',
    'Stajyor-o‘qituvchi',
  ],
  ru: [
    'Заведующий кафедрой',
    'Профессор',
    'Доцент',
    'Старший преподаватель',
    'Ассистент',
    'Преподаватель-стажёр',
  ],
};

export interface SystemSettings {
  workStartTime: string;       // e.g. "08:30" (Dars/ish boshlanishi)
  workEndTime: string;         // e.g. "17:00" (Dars/ish yakunlanishi)
  lateCutoff?: string;         // backward compatibility alias for workStartTime
  confidenceThreshold: number; // e.g. 80
  cooldownSeconds: number;     // e.g. 20
  entranceDeviceId?: string;   // Hardware camera deviceId or label for Entrance
  exitDeviceId?: string;       // Hardware camera deviceId or label for Exit
}

export const DEFAULT_SETTINGS: SystemSettings = {
  workStartTime: '08:30',
  workEndTime: '17:00',
  lateCutoff: '08:30',
  confidenceThreshold: 80,
  cooldownSeconds: 20,
  entranceDeviceId: '',
  exitDeviceId: '',
};

export function getSystemSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem('educontrol_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const startTime = parsed.workStartTime || parsed.lateCutoff || DEFAULT_SETTINGS.workStartTime;
      const endTime = parsed.workEndTime || DEFAULT_SETTINGS.workEndTime;
      return {
        workStartTime: startTime,
        workEndTime: endTime,
        lateCutoff: startTime,
        confidenceThreshold: typeof parsed.confidenceThreshold === 'number' ? parsed.confidenceThreshold : DEFAULT_SETTINGS.confidenceThreshold,
        cooldownSeconds: typeof parsed.cooldownSeconds === 'number' ? parsed.cooldownSeconds : DEFAULT_SETTINGS.cooldownSeconds,
        entranceDeviceId: parsed.entranceDeviceId || '',
        exitDeviceId: parsed.exitDeviceId || '',
      };
    }
  } catch (e) {
    console.warn('Error reading educontrol_settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSystemSettings(settings: SystemSettings) {
  if (typeof window === 'undefined') return;
  const payload = {
    ...settings,
    lateCutoff: settings.workStartTime, // keep sync for legacy code
  };
  localStorage.setItem('educontrol_settings', JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('educontrol_settings_updated', { detail: payload }));
}

/**
 * Format minutes into a user-friendly hours and minutes string
 * e.g. 626 -> "10ч 26мин" (RU) / "10 soat 26 daq" (UZ)
 * e.g. 45 -> "45 мин" (RU) / "45 daq" (UZ)
 */
export function formatMinutes(totalMinutes: number, isUz: boolean): string {
  const abs = Math.abs(Math.round(totalMinutes || 0));
  if (abs === 0) return isUz ? '0 daq' : '0 мин';
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0 && m > 0) {
    return isUz ? `${h} soat ${m} daq` : `${h}ч ${m}мин`;
  }
  if (h > 0) {
    return isUz ? `${h} soat` : `${h}ч`;
  }
  return isUz ? `${m} daq` : `${m} мин`;
}

export function formatLateDuration(lateMinutes: number, isUz: boolean): string {
  return `+${formatMinutes(lateMinutes, isUz)}`;
}

export function formatEarlyDuration(earlyMinutes: number, isUz: boolean): string {
  return `-${formatMinutes(earlyMinutes, isUz)}`;
}
