'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Camera,
  Plus,
  Trash2,
  Clock,
  Shield,
  CheckCircle2,
  Sliders,
  Save,
  Video,
  Building2,
  RotateCcw,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  getSystemSettings,
  saveSystemSettings,
  getSystemDepartments,
  addSystemDepartment,
  removeSystemDepartment,
  resetSystemDepartments,
} from '@/lib/constants';

export default function SettingsPage() {
  const { language } = useLanguage();
  const isUz = language === 'uz';

  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workStartTime, setWorkStartTime] = useState('08:30');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [cooldownSeconds, setCooldownSeconds] = useState(20);
  const [entranceDeviceId, setEntranceDeviceId] = useState('');
  const [exitDeviceId, setExitDeviceId] = useState('');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [teachersCountByDept, setTeachersCountByDept] = useState<Record<string, number>>({});

  // New Camera Form
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [newCam, setNewCam] = useState({
    name: '',
    location: '',
    type: 'ENTRANCE',
    streamUrl: 'rtsp://192.168.1.105:554/live',
    resolution: '1080p',
  });

  // Detect physical devices (webcam, phone camera, etc.)
  const isPhoneDevice = (dev: MediaDeviceInfo) =>
    /iriun|droidcam|phone|virtual|external|ip webcam|usb|rear|back|obs/i.test(dev.label);

  const isLaptopDevice = (dev: MediaDeviceInfo) =>
    /integrated|built-in|internal|facetime|webcam|front|pc|camera/i.test(dev.label) && !isPhoneDevice(dev);

  useEffect(() => {
    fetchCameras();
    const current = getSystemSettings();
    setWorkStartTime(current.workStartTime);
    setWorkEndTime(current.workEndTime);
    setConfidenceThreshold(current.confidenceThreshold);
    setCooldownSeconds(current.cooldownSeconds);

    const detectDevices = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(videoDevs);

          // If settings already have device selected, use it, else pick smart defaults
          const phoneDev = videoDevs.find(isPhoneDevice);
          const laptopDev = videoDevs.find(isLaptopDevice);

          if (current.entranceDeviceId) {
            setEntranceDeviceId(current.entranceDeviceId);
          } else if (laptopDev) {
            setEntranceDeviceId(laptopDev.deviceId);
          } else if (videoDevs[0]) {
            setEntranceDeviceId(videoDevs[0].deviceId);
          }

          if (current.exitDeviceId) {
            setExitDeviceId(current.exitDeviceId);
          } else if (phoneDev) {
            setExitDeviceId(phoneDev.deviceId);
          } else if (videoDevs[1]) {
            setExitDeviceId(videoDevs[1].deviceId);
          } else if (videoDevs[0]) {
            setExitDeviceId(videoDevs[0].deviceId);
          }
        }
      } catch (e) {}
    };
    detectDevices();
  }, []);

  const fetchCameras = async () => {
    try {
      const data = await api.getCameras();
      setCameras(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCamera(newCam);
      setIsAddingCamera(false);
      setNewCam({
        name: '',
        location: '',
        type: 'ENTRANCE',
        streamUrl: 'rtsp://192.168.1.105:554/live',
        resolution: '1080p',
      });
      fetchCameras();
    } catch (e: any) {
      alert(e.message || (isUz ? 'Kamera qo‘shishda xatolik' : 'Ошибка добавления камеры'));
    }
  };

  const handleDeleteCamera = async (id: string, name: string) => {
    const confirmMsg = isUz
      ? `«${name}» kamerasini tizimdan o‘chirishni tasdiqlaysizmi?`
      : `Удалить камеру «${name}» из системы?`;
    if (confirm(confirmMsg)) {
      try {
        await api.deleteCamera(id);
        fetchCameras();
      } catch (e: any) {
        alert(e.message || (isUz ? 'Kamerani o‘chirishda xatolik' : 'Ошибка удаления камеры'));
      }
    }
  };

  useEffect(() => {
    const langKey = isUz ? 'uz' : 'ru';
    setDepartments(getSystemDepartments(langKey));
    api.getStudents().then((teachers) => {
      const counts: Record<string, number> = {};
      teachers.forEach((t: any) => {
        if (t.department) {
          counts[t.department] = (counts[t.department] || 0) + 1;
        }
      });
      setTeachersCountByDept(counts);
    }).catch(() => {});
  }, [isUz]);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const langKey = isUz ? 'uz' : 'ru';
    const updated = addSystemDepartment(newDeptName, langKey);
    setDepartments(updated);
    setNewDeptName('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteDepartment = (deptName: string) => {
    const count = teachersCountByDept[deptName] || 0;
    const msg = isUz
      ? `«${deptName}» kafedrasini o‘chirishni tasdiqlaysizmi?${count > 0 ? ` (${count} nafar xodim biriktirilgan)` : ''}`
      : `Удалить кафедру «${deptName}»?${count > 0 ? ` (К ней привязано ${count} сотр.)` : ''}`;
    if (window.confirm(msg)) {
      const langKey = isUz ? 'uz' : 'ru';
      const updated = removeSystemDepartment(deptName, langKey);
      setDepartments(updated);
    }
  };

  const handleResetDepartments = () => {
    const msg = isUz
      ? 'Kafedralar ro‘yxatini standart holatiga qaytarishni xohlaysizmi?'
      : 'Сбросить перечень кафедр к стандартному списку?';
    if (window.confirm(msg)) {
      const langKey = isUz ? 'uz' : 'ru';
      const reset = resetSystemDepartments(langKey);
      setDepartments(reset);
    }
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemSettings({
      workStartTime,
      workEndTime,
      lateCutoff: workStartTime,
      confidenceThreshold,
      cooldownSeconds,
      entranceDeviceId,
      exitDeviceId,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isUz ? 'Tizim va uskuna sozlamalari' : 'Настройки системы и оборудования'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {isUz
            ? 'Videokameralar tarmog‘i, biometriya sezgirligi va ish vaqti qoidalari'
            : 'Конфигурация видеокамер наблюдения, параметров биометрии и рабочего графика'}
        </p>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            {isUz
              ? 'Sozlamalar muvaffaqiyatli saqlandi!'
              : 'Настройки успешно сохранены!'}
          </span>
        </div>
      )}

      {/* Attendance & Biometric Policy Card */}
      <form
        onSubmit={handleSavePolicies}
        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-xs"
      >
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-900 dark:text-blue-400" />
            <span>{isUz ? 'Ish vaqti reglamenti va biometriya aniqligi' : 'Регламент рабочего времени и биометрия'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isUz
              ? 'Ish boshlanishi, tugashi va yuzni tanish sezgirligi'
              : 'Время начала и окончания рабочего дня, порог распознавания'}
          </p>
        </div>

        {/* Working Hours (Start & End) */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" />
            <span>{isUz ? 'Rasmiy ish va dars jadvali' : 'Официальный график работы и занятий'}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isUz ? 'Ish / 1-dars boshlanishi (Kechikish chegarasi)' : 'Начало работы / 1-й пары (Порог опоздания)'}</span>
              </label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isUz
                  ? 'Ushbu vaqtdan keyin kirganlar avtomatik «Kechikkan» deb belgilanadi.'
                  : 'Приход после этого времени фиксируется как «Опоздание».'}
              </p>
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isUz ? 'Ish / dars yakunlanishi (Erta ketish chegarasi)' : 'Окончание работы / смены (Порог раннего ухода)'}</span>
              </label>
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isUz
                  ? 'Ushbu vaqtdan oldin chiqqanlar avtomatik «Erta ketgan» deb belgilanadi.'
                  : 'Уход до этого времени фиксируется как «Ранний уход».'}
              </p>
            </div>
          </div>
        </div>

        {/* Biometrics & Cooldown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              {isUz ? `Biometrik o‘xshashlik chegarasi (${confidenceThreshold}%)` : `Порог совпадения лица (${confidenceThreshold}%)`}
            </label>
            <input
              type="range"
              min={60}
              max={99}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full cursor-pointer accent-blue-900 dark:accent-blue-500 mt-2"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {isUz
                ? 'Shaxsni tasdiqlash uchun talab etiladigan minimal yuzni tanish aniqligi.'
                : 'Минимальный процент сходства для подтверждения личности преподавателя.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              {isUz ? 'Qayta qayd etish tanaffusi (soniya)' : 'Интервал повторной фиксации (сек)'}
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={cooldownSeconds}
              onChange={(e) => setCooldownSeconds(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {isUz
                ? 'Bitta xodimni qayta-qayta yozib yubormaslik uchun kutish vaqti.'
                : 'Пауза перед повторной отметкой того же сотрудника (защита от дублей).'}
            </p>
          </div>
        </div>

        {/* Card 1 Save Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isUz ? 'Saqlash' : 'Сохранить'}</span>
          </button>
        </div>
      </form>

      {/* Surveillance Camera Setup Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-900 dark:text-blue-400" />
              <span>{isUz ? 'Nazorat kameralari va turniketlar' : 'Сеть камер наблюдения и турникетов'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isUz
                ? 'Noutbuk kamerasi yoki tashqi IP-kameralar (RTSP/ONVIF)'
                : 'Подключённые устройства: веб-камера ноутбука, IP-камеры (RTSP)'}
            </p>
          </div>
          <button
            onClick={() => setIsAddingCamera(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold shadow-md shadow-blue-500/20 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUz ? 'Kamera ulash' : 'Подключить камеру'}</span>
          </button>
        </div>

        {/* Camera List */}
        <div className="space-y-3">
          {cameras.map((cam) => {
            const isEntrance = cam.type === 'ENTRANCE';
            const assignedDeviceId = isEntrance ? entranceDeviceId : exitDeviceId;
            const assignedDevice = videoDevices.find((d) => d.deviceId === assignedDeviceId);

            return (
              <div
                key={cam.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{cam.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isEntrance
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        {isEntrance ? (isUz ? 'Kirish turniketi' : 'Входной турникет') : (isUz ? 'Chiqish turniketi' : 'Выходной турникет')}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isUz ? 'FAOL' : 'АКТИВНА'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{isUz ? 'Joylashuvi:' : 'Локация:'} {cam.location}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteCamera(cam.id, cam.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title={isUz ? 'Kamerani o‘chirish' : 'Удалить камеру'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Hardware Device Selector for this Camera/Turnstile */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-900 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEntrance
                          ? (isUz ? 'Fizik uskuna (1-kamera: Noutbuk kamerasi):' : 'Физическое устройство (Камера №1: Ноутбук):')
                          : (isUz ? 'Fizik uskuna (2-kamera: Telefon kamerasi):' : 'Физическое устройство (Камера №2: Телефон):')}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isEntrance
                          ? (isUz ? 'Ushbu post uchun noutbuk veb-kamerasi biriktiriladi' : 'К этому турникету привязана веб-камера ноутбука')
                          : (isUz ? 'Ushbu post uchun ulangan telefon kamerasi biriktiriladi' : 'К этому турникету привязана камера телефона')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={assignedDeviceId}
                      onChange={(e) => {
                        const newDevId = e.target.value;
                        if (isEntrance) {
                          setEntranceDeviceId(newDevId);
                          saveSystemSettings({
                            workStartTime,
                            workEndTime,
                            lateCutoff: workStartTime,
                            confidenceThreshold,
                            cooldownSeconds,
                            entranceDeviceId: newDevId,
                            exitDeviceId,
                          });
                        } else {
                          setExitDeviceId(newDevId);
                          saveSystemSettings({
                            workStartTime,
                            workEndTime,
                            lateCutoff: workStartTime,
                            confidenceThreshold,
                            cooldownSeconds,
                            entranceDeviceId,
                            exitDeviceId: newDevId,
                          });
                        }
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs cursor-pointer w-full sm:w-[280px]"
                    >
                      {videoDevices.length === 0 && (
                        <option value="">{isUz ? 'Kamera aniqlanmadi (Ruxsat bering)' : 'Камера не обнаружена'}</option>
                      )}
                      {videoDevices.map((dev, idx) => {
                        const isLap = isLaptopDevice(dev);
                        const isPh = isPhoneDevice(dev);
                        const tag = isPh
                          ? (isUz ? ' (Telefon)' : ' (Телефон)')
                          : isLap
                          ? (isUz ? ' (Noutbuk)' : ' (Ноутбук)')
                          : '';
                        return (
                          <option key={dev.deviceId || idx} value={dev.deviceId} className="dark:bg-slate-900 dark:text-white">
                            {dev.label ? `${dev.label}${tag}` : `${isUz ? 'Kamera' : 'Камера'} #${idx + 1}${tag}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Camera Form Modal */}
        {isAddingCamera && (
          <form
            onSubmit={handleCreateCamera}
            className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/40 space-y-3 animate-fade-in"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">{isUz ? 'Yangi videokamera parametrlari' : 'Параметры нового видеопотока'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{isUz ? 'Kamera nomi' : 'Название камеры'}</label>
                <input
                  type="text"
                  required
                  value={newCam.name}
                  onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                  placeholder={isUz ? 'Masalan: Bosh korpus turniketi' : 'Например: Турникет Главный вход'}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{isUz ? 'Bino / Hudud' : 'Зона / Локация'}</label>
                <input
                  type="text"
                  required
                  value={newCam.location}
                  onChange={(e) => setNewCam({ ...newCam, location: e.target.value })}
                  placeholder={isUz ? 'Masalan: 1-bino, 1-qavat' : 'Например: Корпус А, Вестибюль'}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{isUz ? 'Vazifasi' : 'Назначение'}</label>
                <select
                  value={newCam.type}
                  onChange={(e) => setNewCam({ ...newCam, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none text-xs"
                >
                  <option value="ENTRANCE">{isUz ? 'KIRISH' : 'ВХОД'}</option>
                  <option value="EXIT">{isUz ? 'CHIQISH' : 'ВЫХОД'}</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{isUz ? 'RTSP oqim manzili' : 'RTSP-ссылка'}</label>
                <input
                  type="text"
                  value={newCam.streamUrl}
                  onChange={(e) => setNewCam({ ...newCam, streamUrl: e.target.value })}
                  placeholder="rtsp://admin:pass@192.168.1.100:554/live"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCamera(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                {isUz ? 'Bekor qilish' : 'Отмена'}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold shadow-md shadow-blue-500/20 transition"
              >
                {isUz ? 'Saqlash' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}

        {/* Card 2 Save Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSavePolicies}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isUz ? 'Saqlash' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      {/* 3. Kafedralar va bo'limlar (Кафедры и подразделения) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isUz ? 'Kafedralar va bo‘limlar ro‘yxati' : 'Кафедры и подразделения'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUz
                  ? 'O‘qituvchilarni biriktirish uchun kafedralarni boshqarish (qo‘shish va o‘chirish)'
                  : 'Управление перечнем кафедр для распределения преподавателей и штата'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDepartments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isUz ? 'Standart ro‘yxatni tiklash' : 'Сбросить к исходным'}</span>
          </button>
        </div>

        {/* Add new department form */}
        <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder={isUz ? 'Masalan: Kiberxavfsizlik va tarmoqlar kafedrasi' : 'Например: Кафедра кибербезопасности и сетей'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUz ? 'Kafedra qo‘shish' : 'Добавить кафедру'}</span>
          </button>
        </form>

        {/* Existing departments grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {departments.map((dept) => {
            const count = teachersCountByDept[dept] || 0;
            return (
              <div
                key={dept}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dept}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{count > 0 ? (isUz ? `${count} nafar xodim` : `${count} сотр.`) : (isUz ? 'Xodimlar yo‘q' : 'Нет сотрудников')}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDepartment(dept)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex-shrink-0"
                  title={isUz ? 'Kafedrani o‘chirish' : 'Удалить кафедру'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
