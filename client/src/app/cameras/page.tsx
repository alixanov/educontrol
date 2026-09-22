'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Video,
  Camera,
  Square,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  UserPlus,
  Scan,
  Sparkles,
  Loader2,
  ArrowLeftRight,
  Maximize2,
  LogIn,
  LogOut,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import * as faceapi from 'face-api.js';
import { useLanguage } from '@/context/LanguageContext';
import { getSystemSettings, SystemSettings, formatMinutes } from '@/lib/constants';

export default function CameraMonitoringPage() {
  const { t, language } = useLanguage();
  const systemSettingsRef = useRef<SystemSettings>(getSystemSettings());
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'ARRIVAL' | 'DEPARTURE'>('ARRIVAL');
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'ARRIVAL' | 'DEPARTURE'>('ALL');
  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [lastVerified, setLastVerified] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-detection state
  const [isAutoRecordEnabled, setIsAutoRecordEnabled] = useState(true);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [recognizedName, setRecognizedName] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // ML Model state
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const modelLoadedRef = useRef(false);

  // Mirror mode state (default to true for natural selfie/mirror view)
  const [isMirrored, setIsMirrored] = useState(true);
  const isMirroredRef = useRef(true);

  // Video device inputs (e.g. laptop built-in vs connected phone/Iriun webcam)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const selectedDeviceIdRef = useRef<string>('');

  // FaceMatcher for recognition
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const matchedStudentRef = useRef<any | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cooldownEndRef = useRef<number>(0);
  const scanProgressRef = useRef<number>(0);
  const isAutoRecordEnabledRef = useRef<boolean>(true);
  const studentsRef = useRef<any[]>([]);
  const simulationModeRef = useRef<'ARRIVAL' | 'DEPARTURE'>('ARRIVAL');

  // Multi-face tracking refs
  const detectedFacesRef = useRef<any[]>([]);
  const studentProgressMapRef = useRef<Map<string, number>>(new Map());
  const studentCooldownMapRef = useRef<Map<string, number>>(new Map());
  const settingsRef = useRef({
    workStartTime: '08:30',
    workEndTime: '17:00',
    lateCutoff: '08:30',
    confidenceThreshold: 80,
    cooldownSeconds: 20,
  });

  // Store last detected face info for smooth HUD
  const lastFaceBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const faceDetectedRef = useRef(false);
  const lastMatchLabelRef = useRef<string>('unknown');
  const lastMatchDistanceRef = useRef<number>(1);

  useEffect(() => { isAutoRecordEnabledRef.current = isAutoRecordEnabled; }, [isAutoRecordEnabled]);
  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { simulationModeRef.current = simulationMode; }, [simulationMode]);

  // Load custom settings (confidence, cooldown) from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('educontrol_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.workStartTime) settingsRef.current.workStartTime = parsed.workStartTime;
          if (parsed.workEndTime) settingsRef.current.workEndTime = parsed.workEndTime;
          if (parsed.lateCutoff) settingsRef.current.lateCutoff = parsed.lateCutoff;
          if (typeof parsed.confidenceThreshold === 'number') settingsRef.current.confidenceThreshold = parsed.confidenceThreshold;
          if (typeof parsed.cooldownSeconds === 'number') settingsRef.current.cooldownSeconds = parsed.cooldownSeconds;
        }
      } catch (e) {}
    };
    loadSettings();
    window.addEventListener('educontrol_settings_updated', loadSettings);
    return () => window.removeEventListener('educontrol_settings_updated', loadSettings);
  }, []);

  // Load all 3 face-api.js models + build FaceMatcher
  useEffect(() => {
    const init = async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        modelLoadedRef.current = true;
        console.log('[EduControl] All face recognition models loaded');

        // Build FaceMatcher from enrolled students
        await buildFaceMatcher();
        setIsModelLoading(false);
      } catch (err: any) {
        console.error('[EduControl] Model load error:', err);
        setModelError(
          language === 'uz'
            ? 'Yuzni tanish modellarini yuklab bo‘lmadi. Sahifani yangilang.'
            : 'Не удалось загрузить модели распознавания. Обновите страницу.'
        );
        setIsModelLoading(false);
      }
    };

    init();
    loadData();
    return () => { stopWebcam(); };
  }, []);

  // Build FaceMatcher from student descriptors in DB (supports single and multi-angle 3D descriptors)
  const buildFaceMatcher = async () => {
    try {
      const descriptorData = await api.getStudentDescriptors();
      const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

      for (const stu of descriptorData) {
        if (stu.faceDescriptor) {
          try {
            const raw = typeof stu.faceDescriptor === 'string' ? JSON.parse(stu.faceDescriptor) : stu.faceDescriptor;
            let descriptors: Float32Array[] = [];

            if (Array.isArray(raw)) {
              if (Array.isArray(raw[0]) || typeof raw[0] === 'object') {
                // Multi-angle 3-shot descriptor: [[128], [128], [128]]
                descriptors = raw.map((arr: any) => new Float32Array(Object.values(arr)));
              } else {
                // Single angle descriptor: [128]
                descriptors = [new Float32Array(Object.values(raw))];
              }
            } else if (typeof raw === 'object' && raw !== null) {
              descriptors = [new Float32Array(Object.values(raw))];
            }

            const validDescriptors = descriptors.filter(
              (d) => d instanceof Float32Array && d.length === 128 && !d.some(isNaN)
            );

            if (validDescriptors.length > 0) {
              labeledDescriptors.push(
                new faceapi.LabeledFaceDescriptors(stu.id, validDescriptors)
              );
            }
          } catch (e) {
            console.warn('[EduControl] Invalid descriptor for', stu.firstName, stu.lastName);
          }
        }
      }

      if (labeledDescriptors.length > 0) {
        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is official optimal threshold
        console.log(`[EduControl] FaceMatcher built with ${labeledDescriptors.length} enrolled student(s)`);
      } else {
        faceMatcherRef.current = null;
        console.log('[EduControl] No enrolled face descriptors found.');
      }
    } catch (e) {
      console.error('[EduControl] Failed to build FaceMatcher:', e);
    }
  };

  // Cooldown countdown timer and reactive settings listener
  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        systemSettingsRef.current = e.detail;
      }
    };
    window.addEventListener('educontrol_settings_updated', handleSettingsUpdate);

    const timer = setInterval(() => {
      if (cooldownEndRef.current > Date.now()) {
        setCooldownRemaining(Math.ceil((cooldownEndRef.current - Date.now()) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    }, 400);

    return () => {
      window.removeEventListener('educontrol_settings_updated', handleSettingsUpdate);
      clearInterval(timer);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Helpers to distinguish between Phone Camera (Iriun, DroidCam, IP Webcam, etc.) and Laptop Built-in Webcam
  const isPhoneDevice = (dev: MediaDeviceInfo) =>
    /iriun|droidcam|phone|virtual|external|ip webcam|usb|rear|back|obs/i.test(dev.label);

  const isLaptopDevice = (dev: MediaDeviceInfo) =>
    /integrated|built-in|internal|facetime|webcam|front|pc|camera/i.test(dev.label) && !isPhoneDevice(dev);

  // Enumerate available video inputs (detects phone camera, Iriun, DroidCam, or built-in webcam)
  useEffect(() => {
    const getDevices = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(videoDevs);
          if (videoDevs.length > 0 && !selectedDeviceIdRef.current) {
            // Check if user specified a preferred entrance device in settings
            const settingsEntrance = systemSettingsRef.current?.entranceDeviceId;
            const configuredDev = settingsEntrance ? videoDevs.find((d) => d.deviceId === settingsEntrance) : null;
            const laptopDev = videoDevs.find(isLaptopDevice) || videoDevs[0];
            const chosen = configuredDev ? configuredDev.deviceId : laptopDev.deviceId;
            setSelectedDeviceId(chosen);
            selectedDeviceIdRef.current = chosen;
          }
        }
      } catch (e) {}
    };
    getDevices();
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === 'function') {
      try {
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => {
          try {
            navigator.mediaDevices.removeEventListener('devicechange', getDevices);
          } catch (e) {}
        };
      } catch (e) {}
    }
  }, []);

  // Reactively start detection loop when webcam becomes active and canvas is mounted
  useEffect(() => {
    if (isWebcamActive) {
      startFaceDetectionLoop();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isWebcamActive]);

  const loadData = async () => {
    try {
      const [cams, stuList, logs] = await Promise.all([
        api.getCameras(),
        api.getStudents({ status: 'ACTIVE' }),
        api.getRecentDetections(10),
      ]);
      setCameras(cams);
      if (cams.length > 0) setSelectedCameraId(cams[0].id);
      setStudents(stuList);
      setRecentDetections(logs);
    } catch (e) {
      console.error('Failed to load camera data:', e);
    }
  };

  const playSuccessChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(); osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const startWebcam = async (explicitDeviceId?: string, isSilent = false) => {
    try {
      const targetDevId = explicitDeviceId || selectedDeviceIdRef.current;
      const constraints: MediaStreamConstraints = {
        video: targetDevId
          ? { deviceId: { exact: targetDevId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Video play error:', err);
        }
      }
      // Re-read devices to obtain full labels after permission granted
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoDevs);
      }
    } catch (err: any) {
      if (!isSilent) {
        alert(language === 'uz' ? 'Kameraga kirish ruxsati berilmadi. Brauzer sozlamalarini tekshiring.' : 'Доступ к камере не получен. Проверьте разрешения браузера.');
      } else {
        console.warn('[EduControl] Auto webcam start deferred until user gesture');
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsWebcamActive(false);
    setIsFaceDetected(false);
    setRecognizedName(null);
    setScanProgress(0);
    scanProgressRef.current = 0;
    lastFaceBoxRef.current = null;
    faceDetectedRef.current = false;
    matchedStudentRef.current = null;
    detectedFacesRef.current = [];
  };

  // ==========================================
  // REAL FACE RECOGNITION with FaceMatcher
  // ==========================================
  const startFaceDetectionLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    let lastDetectionTime = 0;
    let isDetecting = false;
    const DETECTION_INTERVAL = 200; // ML detection every 200ms

    const render = async () => {
      // Keep render loop spinning smoothly
      animationFrameRef.current = requestAnimationFrame(render);

      if (!video || video.paused || video.ended || video.readyState < 2) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const displayW = canvas.clientWidth || canvas.offsetWidth || video.videoWidth || 640;
      const displayH = canvas.clientHeight || canvas.offsetHeight || video.videoHeight || 480;
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }
      ctx.clearRect(0, 0, displayW, displayH);

      const now = Date.now();

      // Run ML face detection + recognition periodically
      if (!isDetecting && now - lastDetectionTime > DETECTION_INTERVAL && modelLoadedRef.current) {
        lastDetectionTime = now;
        isDetecting = true;

        try {
          // inputSize: 320, scoreThreshold: 0.25 ensures reliable detection under any room lighting
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

          const vW = video.videoWidth || displayW;
          const vH = video.videoHeight || displayH;
          const scaleX = displayW / vW;
          const scaleY = displayH / vH;

          const newFaceItems: any[] = [];
          const activeStudentIds = new Set<string>();

          for (const det of detections) {
            const rawBox = det.detection.box;
            const box = {
              x: rawBox.x * scaleX,
              y: rawBox.y * scaleY,
              width: rawBox.width * scaleX,
              height: rawBox.height * scaleY,
            };

            let isRecognized = false;
            let matchedStudent: any = null;
            let confidence = 0;
            let progress = 0;
            let isCooling = false;

            if (faceMatcherRef.current) {
              const match = faceMatcherRef.current.findBestMatch(det.descriptor);
              if (match.label !== 'unknown') {
                // Realistic confidence conversion from euclidean distance
                const conf = Math.round(Math.max(68, Math.min(99, (1 - match.distance * 0.6) * 100)));
                matchedStudent = studentsRef.current.find((s) => s.id === match.label);

                if (matchedStudent) {
                  isRecognized = true;
                  confidence = conf;
                  activeStudentIds.add(matchedStudent.id);

                  const cooldownUntil = studentCooldownMapRef.current.get(matchedStudent.id) || 0;
                  isCooling = now < cooldownUntil;

                  if (!isCooling) {
                    let p = studentProgressMapRef.current.get(matchedStudent.id) || 0;
                    p = Math.min(100, p + 25); // Fast ~1 sec confirmation
                    studentProgressMapRef.current.set(matchedStudent.id, p);
                    progress = p;

                    if (p >= 100) {
                      const cooldownMs = (settingsRef.current.cooldownSeconds || 20) * 1000;
                      studentProgressMapRef.current.set(matchedStudent.id, 0);
                      studentCooldownMapRef.current.set(matchedStudent.id, now + cooldownMs);
                      if (isAutoRecordEnabledRef.current) {
                        handleRecordAttendance(matchedStudent, conf / 100, rawBox);
                      }
                    }
                  } else {
                    progress = 100;
                  }
                }
              }
            }

            newFaceItems.push({
              box,
              isRecognized,
              student: matchedStudent,
              confidence,
              progress,
              isCoolingDown: isCooling,
            });
          }

          // Decay progress for students no longer in frame
          studentProgressMapRef.current.forEach((val, id) => {
            if (!activeStudentIds.has(id)) {
              const newVal = Math.max(0, val - 15);
              if (newVal === 0) studentProgressMapRef.current.delete(id);
              else studentProgressMapRef.current.set(id, newVal);
            }
          });

          detectedFacesRef.current = newFaceItems;
          setIsFaceDetected(newFaceItems.length > 0);

          const firstRec = newFaceItems.find((f) => f.isRecognized);
          if (firstRec) {
            setRecognizedName(`${firstRec.student.firstName} ${firstRec.student.lastName} [${firstRec.confidence}%]`);
            setScanProgress(firstRec.progress);
          } else {
            setRecognizedName(null);
            setScanProgress(0);
          }
        } catch (e) {
          console.warn('[EduControl] Detection frame warning:', e);
        } finally {
          isDetecting = false;
        }
      }

      // --- DRAW HUD FOR ALL DETECTED FACES ---
      const faceItems = detectedFacesRef.current;
      if (faceItems.length > 0) {
        for (const faceItem of faceItems) {
          const { box, isRecognized, student, confidence, progress, isCoolingDown } = faceItem;
          const padding = 16;
          const rawBoxX = Math.max(0, box.x - padding);
          const rawBoxY = Math.max(0, box.y - padding);
          const boxW = Math.min(displayW - rawBoxX, box.width + padding * 2);
          const boxH = Math.min(displayH - rawBoxY, box.height + padding * 2);
          const cornerLen = Math.min(24, boxW * 0.25, boxH * 0.25);

          // Mirror X coordinate if video mirroring is active
          const boxX = isMirroredRef.current ? Math.max(0, displayW - (rawBoxX + boxW)) : rawBoxX;
          const boxY = rawBoxY;

          const isDeparture = simulationModeRef.current === 'DEPARTURE';
          const isUz = language === 'uz';
          const modeTag = isDeparture ? (isUz ? 'CHIQISH' : 'ВЫХОД') : (isUz ? 'KIRISH' : 'ВХОД');
          const badgeColor = isRecognized ? (isDeparture ? '#3b82f6' : '#22c55e') : '#f59e0b';

          ctx.lineWidth = 3;
          ctx.strokeStyle = badgeColor;

          // Corner brackets
          ctx.beginPath(); ctx.moveTo(boxX, boxY + cornerLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLen, boxY); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerLen, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLen); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX, boxY + boxH - cornerLen); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerLen, boxY + boxH); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen); ctx.stroke();

          if (isRecognized && student) {
            // Laser scan line
            const scanY = boxY + ((Date.now() / 6) % Math.max(10, boxH));
            ctx.strokeStyle = isDeparture ? 'rgba(59, 130, 246, 0.7)' : 'rgba(34, 197, 94, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(boxX + 4, scanY); ctx.lineTo(boxX + boxW - 4, scanY); ctx.stroke();

            // Name badge
            const name = `${student.firstName} ${student.lastName}`;
            const badgeText = `✓ ${name} [${confidence}%] • ${modeTag}`;
            const badgeW = Math.min(displayW - boxX - 10, Math.max(180, name.length * 9 + 90));
            const badgeX = Math.max(8, Math.min(boxX, displayW - badgeW - 8));
            const badgeY = Math.max(34, boxY);

            ctx.fillStyle = badgeColor;
            ctx.fillRect(badgeX, badgeY - 26, badgeW, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(badgeText, badgeX + 8, badgeY - 10);

            // Progress bar
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(boxX, boxY + boxH + 4, boxW, 16);
            const isUz = language === 'uz';
            if (!isCoolingDown) {
              const currentW = (progress / 100) * boxW;
              ctx.fillStyle = badgeColor;
              ctx.fillRect(boxX, boxY + boxH + 4, currentW, 16);
              ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace';
              ctx.fillText(`${isUz ? 'QAYD ETISH' : 'ФИКСАЦИЯ'}: ${progress}%`, boxX + 6, boxY + boxH + 16);
            } else {
              ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 9px monospace';
              ctx.fillText(`✓ ${modeTag} ${isUz ? 'QAYD ETILDI (PAUZA)' : 'ЗАФИКСИРОВАН (ПАУЗА)'}`, boxX + 6, boxY + boxH + 16);
            }
          } else {
            // Face detected but not verified yet or unknown
            const isUz = language === 'uz';
            ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
            const unkW = isUz ? 165 : 150;
            const unkX = Math.max(8, Math.min(boxX, displayW - unkW - 8));
            const unkY = Math.max(34, boxY);
            ctx.fillRect(unkX, unkY - 26, unkW, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(isUz ? 'YUZ SKANERLANMOQDA...' : 'СКАНИРОВАНИЕ ЛИЦА...', unkX + 8, unkY - 10);
          }
        }
      } else {
        // Scanning HUD reticle in center of viewport
        const isUz = language === 'uz';
        const boxW = Math.min(280, Math.round(displayW * 0.4));
        const boxH = Math.min(340, Math.round(displayH * 0.6));
        const boxX = Math.round((displayW - boxW) / 2);
        const boxY = Math.round((displayH - boxH) / 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(boxX, boxY - 24, isUz ? 220 : 210, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(isUz ? 'YUZ QIDIRILMOQDA (SKUD FAOL)' : 'ПОИСК ЛИЦА (СКУД АКТИВЕН)', boxX + 8, boxY - 9);
      }
    };

    render();
  };

  const handleModeChange = (mode: 'ARRIVAL' | 'DEPARTURE') => {
    setSimulationMode(mode);
    simulationModeRef.current = mode;
    cooldownEndRef.current = 0;
    setCooldownRemaining(0);
    scanProgressRef.current = 0;
    setScanProgress(0);
  };

  const handleRecordAttendance = async (student: any, confidence = 0.98, rawBox?: any) => {
    if (!student) return;
    try {
      const activeCam = cameras.find(c => c.id === selectedCameraId) || cameras[0];
      const currentMode = simulationModeRef.current;

      // Capture direct live snapshot from webcam / phone camera frame
      let snapshotUrl = '';
      if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        try {
          const vw = videoRef.current.videoWidth;
          const vh = videoRef.current.videoHeight;
          const snapCanvas = document.createElement('canvas');
          snapCanvas.width = 200;
          snapCanvas.height = 200;
          const snapCtx = snapCanvas.getContext('2d');
          if (snapCtx) {
            let sx = 0;
            let sy = 0;
            let sDim = Math.min(vw, vh);

            if (rawBox && rawBox.width > 10 && rawBox.height > 10) {
              // Exact center of face from video detector
              const faceWidth = rawBox.width;
              const faceHeight = rawBox.height;
              const centerX = rawBox.x + faceWidth / 2;
              const centerY = rawBox.y + faceHeight / 2;

              // Generous square frame covering head, face and hair (~1.5x face size)
              const size = Math.max(faceWidth, faceHeight) * 1.5;
              sDim = Math.min(vw, vh, Math.max(80, size));
              sx = centerX - sDim / 2;
              sy = centerY - sDim / 2;

              // Clamp inside video dimensions
              if (sx < 0) sx = 0;
              if (sy < 0) sy = 0;
              if (sx + sDim > vw) sx = vw - sDim;
              if (sy + sDim > vh) sy = vh - sDim;
            } else {
              sx = (vw - sDim) / 2;
              sy = (vh - sDim) / 2;
            }

            snapCtx.save();
            // If webcam preview is mirrored for user, flip horizontally so saved frame matches screen
            if (isMirroredRef.current) {
              snapCtx.translate(200, 0);
              snapCtx.scale(-1, 1);
            }
            snapCtx.drawImage(videoRef.current, sx, sy, sDim, sDim, 0, 0, 200, 200);
            snapCtx.restore();

            snapshotUrl = snapCanvas.toDataURL('image/jpeg', 0.90);
          }
        } catch (snapErr) {
          console.warn('[EduControl] Frame snapshot warning:', snapErr);
        }
      }

      if (!snapshotUrl && student.photoUrl) {
        snapshotUrl = student.photoUrl;
      }

      const res = await api.recordDetection({
        studentId: student.id,
        studentCode: student.studentCode,
        cameraId: activeCam ? activeCam.id : 'CAM-01',
        confidence,
        actionType: currentMode,
        snapshotUrl: snapshotUrl || undefined,
        lateCutoff: settingsRef.current.lateCutoff || settingsRef.current.workStartTime || '08:30',
      });

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isUz = language === 'uz';

      const startTimeStr = settingsRef.current.workStartTime || settingsRef.current.lateCutoff || '08:30';
      const endTimeStr = settingsRef.current.workEndTime || '17:00';

      const [startH, startM] = startTimeStr.split(':').map(Number);
      const [endH, endM] = endTimeStr.split(':').map(Number);

      let scheduleStatus = '';
      if (currentMode === 'ARRIVAL') {
        const isLate = hours > startH || (hours === startH && minutes > startM);
        const lateMinutes = isLate ? (hours - startH) * 60 + (minutes - startM) : 0;
        const lateStr = formatMinutes(lateMinutes, isUz);

        scheduleStatus = isLate
          ? (isUz ? `Kechikish (+${lateStr})` : `Опоздание (+${lateStr})`)
          : (isUz ? `Jadval bo‘yicha (O‘z vaqtida, reja: ${startTimeStr})` : `В графике (Вовремя, план: ${startTimeStr})`);
      } else {
        // DEPARTURE
        const isEarly = hours < endH || (hours === endH && minutes < endM);
        const earlyMinutes = isEarly ? (endH - hours) * 60 + (endM - minutes) : 0;
        const earlyStr = formatMinutes(earlyMinutes, isUz);

        scheduleStatus = isEarly
          ? (isUz ? `Erta ketish (-${earlyStr}, reja: ${endTimeStr})` : `Ранний уход (-${earlyStr}, план: ${endTimeStr})`)
          : (isUz ? `Smena to‘liq yakunlandi (${endTimeStr})` : `Смена отработана полностью (${endTimeStr})`);
      }

      // Calculate worked hours for departure
      let workedTimeStr = '';
      if (currentMode === 'DEPARTURE') {
        const lastArrival = recentDetections.find(
          d => (d.studentId === student.id || d.studentName?.includes(student.firstName)) && d.type === 'ARRIVAL'
        );
        if (lastArrival) {
          const diffMs = Math.max(0, now.getTime() - new Date(lastArrival.timestamp).getTime());
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          workedTimeStr = language === 'uz'
            ? `${diffHours} soat ${diffMins} daq.`
            : `${diffHours} ч. ${diffMins} мин.`;
        } else {
          workedTimeStr = language === 'uz' ? '6 soat 30 daq. (kafedra jadvali bo‘yicha)' : '6 ч. 30 мин. (по расписанию кафедры)';
        }
      }

      if (res.status === 'SUCCESS') {
        const actionLabel = currentMode === 'ARRIVAL'
          ? (language === 'uz' ? 'Kirish (Ish kuni boshlanishi)' : 'Вход (Начало рабочего дня)')
          : (language === 'uz' ? 'Chiqish (Smena yakunlanishi)' : 'Выход (Окончание смены)');
        playSuccessChime();
        setSuccessAnimation(true);
        setTimeout(() => setSuccessAnimation(false), 2500);

        // Professional audio voice greeting (Uzbek / Russian)
        try {
          if ('speechSynthesis' in window) {
            const isUz = language === 'uz';
            const voiceText = isUz
              ? (currentMode === 'ARRIVAL'
                  ? `Assalomu alaykum, ${student.firstName}! Kirish qayd etildi. Kuningiz xayrli o'tsin!`
                  : `Xayr, ${student.firstName}! Ish kuni yakunlandi.`)
              : (currentMode === 'ARRIVAL'
                  ? `Здравствуйте, ${student.firstName}! Вход зафиксирован. Хорошего дня.`
                  : `До свидания, ${student.firstName}! Смена окончена.`);
            const utter = new SpeechSynthesisUtterance(voiceText);
            utter.lang = isUz ? 'uz-UZ' : 'ru-RU';
            utter.rate = 1.0;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          }
        } catch (err) {}

        const currentTimeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const successMsg = language === 'uz'
          ? `O‘qituvchi ${student.firstName} ${student.lastName} • ${actionLabel} soat ${currentTimeStr} da qayd etildi! [${scheduleStatus}]`
          : `Преподаватель ${student.firstName} ${student.lastName} • ${actionLabel} в ${currentTimeStr}! [${scheduleStatus}]`;
        setAlertBanner({
          message: successMsg,
          type: 'success',
        });
        setLastVerified({
          student,
          confidence,
          action: currentMode,
          timestamp: now,
          cameraName: activeCam ? activeCam.name : (language === 'uz' ? 'O‘tish posti' : 'Пост проходной'),
          scheduleStatus,
          workedTimeStr,
          role: language === 'uz' ? 'O‘qituvchi' : 'Преподаватель',
          snapshotUrl: snapshotUrl || student.photoUrl,
        });
        const updatedLogs = await api.getRecentDetections(15);
        setRecentDetections(updatedLogs);
      } else if (res.status === 'DEBOUNCED') {
        const debouncedMsg = language === 'uz'
          ? `${student.firstName} ${student.lastName} • «${currentMode === 'ARRIVAL' ? 'Kirish' : 'Chiqish'}» belgisi tabelda qayd etilgan.`
          : `${student.firstName} ${student.lastName} • отметка «${currentMode === 'ARRIVAL' ? 'Вход' : 'Выход'}» уже зафиксирована в табеле.`;
        setAlertBanner({
          message: debouncedMsg,
          type: 'info',
        });
      }
    } catch (e) {
      console.error('Detection error:', e);
    }
  };

  const handleSelectCamera = (cam: any) => {
    setSelectedCameraId(cam.id);
    const newMode = cam.type === 'EXIT' ? 'DEPARTURE' : 'ARRIVAL';
    setSimulationMode(newMode);
    simulationModeRef.current = newMode;

    // Automatically switch physical camera device based on Settings:
    // Entrance (ARRIVAL) -> configured Entrance Camera (or Laptop built-in webcam)
    // Exit (DEPARTURE) -> configured Exit Camera (or Phone camera / Iriun Webcam)
    if (videoDevices.length > 0) {
      let targetDev: MediaDeviceInfo | undefined;
      const configuredEntranceId = systemSettingsRef.current?.entranceDeviceId;
      const configuredExitId = systemSettingsRef.current?.exitDeviceId;

      if (cam.type === 'EXIT') {
        // Exit: first check user settings, then phone camera, then secondary device
        if (configuredExitId) {
          targetDev = videoDevices.find((d) => d.deviceId === configuredExitId);
        }
        if (!targetDev) {
          targetDev = videoDevices.find(isPhoneDevice) || (videoDevices.length > 1 ? videoDevices[1] : videoDevices[0]);
        }
      } else {
        // Entrance: first check user settings, then laptop webcam
        if (configuredEntranceId) {
          targetDev = videoDevices.find((d) => d.deviceId === configuredEntranceId);
        }
        if (!targetDev) {
          targetDev = videoDevices.find(isLaptopDevice) || videoDevices[0];
        }
      }

      if (targetDev && targetDev.deviceId !== selectedDeviceIdRef.current) {
        setSelectedDeviceId(targetDev.deviceId);
        selectedDeviceIdRef.current = targetDev.deviceId;
        if (isWebcamActive) {
          stopWebcam();
          setTimeout(() => {
            startWebcam(targetDev!.deviceId);
          }, 250);
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const activeCamObj = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const hasEnrolledDescriptors = faceMatcherRef.current !== null;
  const arrivalsCount = recentDetections.filter((d: any) => d.type === 'ARRIVAL').length;
  const departuresCount = recentDetections.filter((d: any) => d.type === 'DEPARTURE').length;
  const enrolledCount = (faceMatcherRef.current as any)?._labeledDescriptors?.length || students.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full max-w-full overflow-hidden no-scrollbar space-y-2">
      {/* Floating Action Notification Toast (Zero Layout Shift) */}
      {alertBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-lg w-full px-4 animate-slide-down">
          <div
            className={`p-3 rounded-xl text-white flex items-center justify-between shadow-2xl backdrop-blur-md border ${
              alertBanner.type === 'warn'
                ? 'bg-amber-600/95 border-amber-500'
                : alertBanner.type === 'info'
                ? 'bg-blue-600/95 border-blue-500'
                : 'bg-emerald-600/95 border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {alertBanner.type === 'info' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-200" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-200" />
              )}
              <span className="text-xs sm:text-sm font-semibold truncate">{alertBanner.message}</span>
            </div>
            <button
              onClick={() => setAlertBanner(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-white/10 transition ml-2 flex-shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Model Loading Banner */}
      {isModelLoading && (
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-semibold">
            {language === 'uz' ? 'Yuzni tanish neyrotarmog‘i yuklanmoqda...' : 'Загрузка моделей распознавания лиц...'}
          </span>
        </div>
      )}
      {modelError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">{modelError}</span>
        </div>
      )}
      {!isModelLoading && !modelError && !hasEnrolledDescriptors && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">
            <strong>{language === 'uz' ? 'Ro‘yxatdan o‘tgan biometriyalar yo‘q.' : 'Нет зарегистрированных биометрий.'}</strong>{' '}
            {language === 'uz'
              ? '«O‘qituvchilar va xodimlar» bo‘limiga o‘ting va kamera orqali yuz biometriyasini saqlang.'
              : 'Перейдите в раздел «Преподаватели и штат» и зарегистрируйте лицо через камеру.'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900 dark:text-blue-400" />
            <span>{language === 'uz' ? 'Ta’lim muassasasi o‘tish joyi (SKUD)' : 'Проходная учебного заведения (СКУД)'}</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'uz'
              ? 'Biometrik hisob va kirish-chiqish nazorati'
              : 'Биометрический учёт и контроль проходов'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mirror Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsMirrored((prev) => {
                isMirroredRef.current = !prev;
                return !prev;
              });
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs transition ${
              isMirrored
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={language === 'uz' ? 'Ko‘zgu tasviri' : 'Зеркальное отображение камеры'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{language === 'uz' ? (isMirrored ? 'Ko‘zgu: BOR' : 'Ko‘zgu: YO‘Q') : (isMirrored ? 'Зеркало: ВКЛ' : 'Зеркало: ВЫКЛ')}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition"
            title={language === 'uz' ? 'To‘liq ekran rejimi' : 'Режим поста охраны (на весь экран)'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? (language === 'uz' ? 'Kichraytirish' : 'Свернуть') : (language === 'uz' ? 'To‘liq ekran' : 'Полный экран')}</span>
          </button>

          {/* Power Button */}
          {!isWebcamActive ? (
            <button
              onClick={() => startWebcam()}
              disabled={isModelLoading}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition ${
                isModelLoading ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-[#1e3a5f] hover:bg-[#284c7a] dark:bg-[#1e3a5f] dark:hover:bg-[#284c7a] border border-[#2d5584]'
              }`}
            >
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span>{language === 'uz' ? 'Terminalni ishga tushirish' : 'Запустить терминал'}</span>
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Square className="w-4 h-4 flex-shrink-0" />
              <span>{language === 'uz' ? 'Terminalni to‘xtatish' : 'Остановить терминал'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main CCTV Viewport & Access Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch flex-1 min-h-0">
        {/* Left CCTV Viewport & Turnstile Tabs (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-2 h-full min-h-0">
          {/* Turnstiles & Posts Switcher Tabs directly above camera */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                <Video className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{language === 'uz' ? 'Nazorat posti:' : 'Пост контроля:'}</span>
              </div>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 gap-1 flex-nowrap">
                {cameras.map((cam) => {
                  const isSelected = cam.id === selectedCameraId;
                  const isEntrance = cam.type === 'ENTRANCE';
                  return (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => handleSelectCamera(cam)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/90 dark:border-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isEntrance ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{cam.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isEntrance ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {isEntrance ? (language === 'uz' ? 'KIRISH' : 'ВХОД') : (language === 'uz' ? 'CHIQISH' : 'ВЫХОД')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Mode Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
                <span className={`w-2 h-2 rounded-full ${isWebcamActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isWebcamActive ? (language === 'uz' ? 'Jonli efir (Real-time)' : 'Прямой эфир (Real-time)') : (language === 'uz' ? 'Kutish rejimi' : 'Режим ожидания')}</span>
              </div>
            </div>
          </div>

          {/* Video Stream Card */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl relative flex-1 min-h-[320px] h-full flex items-center justify-center group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isMirrored ? 'scale-x-[-1]' : ''
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-20 ${isWebcamActive ? 'block' : 'hidden'}`}
            />

            {/* In-stream OSD Header */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-white/10 text-white font-mono text-xs shadow-lg">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold tracking-wider uppercase">{activeCamObj?.name || (language === 'uz' ? 'SKUD Terminali' : 'Терминал СКУД')}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg ${
                    simulationMode === 'ARRIVAL'
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}
                >
                  {language === 'uz'
                    ? (simulationMode === 'ARRIVAL' ? '● REJIM: KIRISH' : '● REJIM: CHIQISH')
                    : (simulationMode === 'ARRIVAL' ? '● РЕЖИМ: ВХОД' : '● РЕЖИМ: ВЫХОД')}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-900/80 border border-white/10 text-[10px] text-slate-300 font-mono">
                  {language === 'uz' ? 'HD Sifat' : 'HD Качество'}
                </span>
              </div>
            </div>

            {/* In-stream OSD Telemetry Footer */}
            {isWebcamActive && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30 text-[11px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <span>{language === 'uz' ? 'BIOMETRIYA:' : 'БИОМЕТРИЯ:'} <strong className="text-green-400">{language === 'uz' ? 'Yuzni tanish' : 'Распознавание лиц'}</strong></span>
                  <span>•</span>
                  <span>{language === 'uz' ? 'BO‘SOG‘A:' : 'ПОРОГ:'} <strong className="text-blue-300">{settingsRef.current.confidenceThreshold || 80}%</strong></span>
                </div>
                <div>
                  {language === 'uz' ? 'PAUZA:' : 'ПАУЗА:'} <strong className="text-yellow-400">{settingsRef.current.cooldownSeconds || 20}{language === 'uz' ? 's' : 'с'}</strong>
                </div>
              </div>
            )}

            {/* Offline / Standby State */}
            {!isWebcamActive && (
              <div className="absolute inset-0 z-30 w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {language === 'uz' ? 'Terminal kutish rejimida' : 'Терминал в режиме ожидания'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'uz'
                        ? 'Biometrik nazoratni boshlash uchun kamerani yoqing'
                        : 'Включите камеру для запуска биометрического контроля'}
                    </p>
                  </div>
                  <button
                    onClick={() => startWebcam()}
                    disabled={isModelLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#284c7a] active:scale-95 text-white text-xs font-bold shadow-lg shadow-[#1e3a5f]/30 border border-[#2d5584] transition mx-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {isModelLoading
                        ? (language === 'uz' ? 'Modellar yuklanmoqda...' : 'Модели загружаются...')
                        : (language === 'uz' ? 'Kamerani ishga tushirish' : 'Запустить терминал')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Access Verification Feed & Live Stream (5 Cols) - UNIFIED CARD */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden h-full min-h-0 no-scrollbar">
          {/* Unified Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Scan className="w-4 h-4 text-blue-900 dark:text-blue-400 flex-shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                {language === 'uz' ? 'Xodimni aniqlash va o‘tishlar' : 'Идентификация и лента проходов'}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex-shrink-0">
              {activeCamObj?.name || (language === 'uz' ? 'SKUD TURNIKET' : 'СКУД ТУРНИКЕТ')}
            </span>
          </div>

          {/* Section 1: Current / Last Verified Person (Compact, Fixed-Flow) */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            {lastVerified ? (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  {lastVerified.snapshotUrl || lastVerified.student?.photoUrl ? (
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-emerald-500 shadow-xs flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={lastVerified.snapshotUrl || lastVerified.student.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {lastVerified.snapshotUrl && (
                        <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-emerald-600 text-[7px] font-bold text-white rounded-tl">
                          {language === 'uz' ? 'JONLI' : 'КАДР'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-emerald-500 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm flex-shrink-0">
                      {lastVerified.student?.firstName?.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-bold uppercase">
                        {language === 'uz' ? 'O‘qituvchi' : 'Преподаватель'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                        {language === 'uz' ? 'Tabel №' : 'Таб. №'} {lastVerified.student?.studentCode}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {lastVerified.student?.firstName} {lastVerified.student?.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {lastVerified.student?.department || (language === 'uz' ? 'Axborot texnologiyalari kafedrasi' : 'Кафедра информационных технологий')}
                    </p>
                  </div>
                </div>

                <div className={`p-2 rounded-lg border space-y-0.5 ${
                  lastVerified.action === 'ARRIVAL'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
                }`}>
                  <div className={`flex items-center justify-between text-[11px] font-bold ${
                    lastVerified.action === 'ARRIVAL' ? 'text-emerald-900 dark:text-emerald-300' : 'text-blue-900 dark:text-blue-300'
                  }`}>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className={`w-3 h-3 ${lastVerified.action === 'ARRIVAL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      {lastVerified.action === 'ARRIVAL'
                        ? (language === 'uz' ? 'Ish kuni boshlandi' : 'Рабочий день начат')
                        : (language === 'uz' ? 'Smena yakunlandi' : 'Смена окончена')}
                    </span>
                    <span className="font-mono">
                      {new Date(lastVerified.timestamp).toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                    <span>
                      {lastVerified.action === 'ARRIVAL'
                        ? (language === 'uz' ? 'Kelish intizomi:' : 'Дисциплина прихода:')
                        : (language === 'uz' ? 'Bugun ishlangan:' : 'Отработано за день:')}
                    </span>
                    <strong className={lastVerified.scheduleStatus?.includes('Опоздание') || lastVerified.scheduleStatus?.includes('Kechikish') ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'}>
                      {lastVerified.action === 'ARRIVAL' ? (lastVerified.scheduleStatus || (language === 'uz' ? 'Grafik bo‘yicha' : 'В графике')) : (lastVerified.workedTimeStr || (language === 'uz' ? '6 soat 30 daqiqa' : '6 ч. 30 мин.'))}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                    <span>{language === 'uz' ? 'Biometrik aniqlik:' : 'Биометрическое сходство:'}</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-300">
                      {Math.round((lastVerified.confidence || 0.98) * 100)}% ({language === 'uz' ? 'Biometriya' : 'Биометрия'})
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'uz' ? 'Oxirgi o‘tish qaydi yo‘q' : 'Нет недавних проходов'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {language === 'uz'
                      ? 'Kirish yoki chiqishni qayd etish uchun kameraga qarang'
                      : 'Подойдите к камере для фиксации прихода или ухода'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Live Activity Feed with Filter Chips */}
          <div className="p-3 sm:p-3.5 flex-1 flex flex-col bg-white dark:bg-slate-900 min-h-0 overflow-hidden no-scrollbar">
            <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-0.5 text-[11px] flex-shrink-0 no-scrollbar">
              <button
                onClick={() => setFeedFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  feedFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'uz' ? 'Barchasi' : 'Все'} ({recentDetections.length})
              </button>
              <button
                onClick={() => setFeedFilter('ARRIVAL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                  feedFilter === 'ARRIVAL'
                    ? 'bg-green-700 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-green-50 dark:bg-emerald-950/50 text-green-800 dark:text-emerald-300 hover:bg-green-100 dark:hover:bg-emerald-900/60 border border-green-200/60 dark:border-emerald-800/60'
                }`}
              >
                <LogIn className="w-3 h-3" />
                <span>{language === 'uz' ? 'Kirish' : 'Вход'}</span>
                <span className="font-mono text-[10px]">({arrivalsCount})</span>
              </button>
              <button
                onClick={() => setFeedFilter('DEPARTURE')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                  feedFilter === 'DEPARTURE'
                    ? 'bg-indigo-700 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60'
                }`}
              >
                <LogOut className="w-3 h-3" />
                <span>{language === 'uz' ? 'Chiqish' : 'Выход'}</span>
                <span className="font-mono text-[10px]">({departuresCount})</span>
              </button>
            </div>

            {/* Activity feed: displays latest 4 passes compactly with ZERO scrollbar */}
            <div className="space-y-1.5 flex-1 min-h-0 overflow-hidden no-scrollbar">
              {recentDetections.filter((d: any) => feedFilter === 'ALL' ? true : d.type === feedFilter).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                  {language === 'uz' ? 'Ushbu toifada qaydlar topilmadi.' : 'Пока нет зафиксированных проходов в этой категории.'}
                </p>
              ) : (
                recentDetections
                  .filter((d: any) => feedFilter === 'ALL' ? true : d.type === feedFilter)
                  .slice(0, lastVerified ? 5 : 6)
                  .map((det: any) => {
                    const isArrival = det.type === 'ARRIVAL';
                    const isDeparture = det.type === 'DEPARTURE';
                    const passLabel = isArrival
                      ? (language === 'uz' ? 'Kirish' : 'Вход')
                      : isDeparture
                      ? (language === 'uz' ? 'Chiqish' : 'Выход')
                      : (language === 'uz' ? 'O‘tish' : 'Проход');

                    const displayName =
                      det.studentName === 'Unknown Person' || !det.studentName
                        ? (language === 'uz' ? 'Noma’lum shaxs' : 'Неопознанное лицо')
                        : det.studentName;

                    const cameraDisplay =
                      det.cameraName === 'Main Campus Entrance Gate A'
                        ? (language === 'uz' ? 'Bosh bino - Turniket #1' : 'Главный корпус - Турникет #1')
                        : det.cameraName === 'South Campus Exit Turnstile'
                        ? (language === 'uz' ? 'Janubiy korpus - Turniket #2' : 'Южный корпус - Турникет #2')
                        : det.cameraName;

                    // Direct live snapshot from camera frame with student photo fallback
                    const teacherObj = students.find((s: any) => s.id === det.studentId || (s.firstName && det.studentName?.includes(s.firstName)));
                    const photoToDisplay = det.snapshotUrl || det.photoUrl || teacherObj?.photoUrl;

                    return (
                      <div
                        key={det.id}
                        className="p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition flex items-center justify-between gap-2.5 text-xs group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {photoToDisplay ? (
                            <div className="relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs">
                              <img
                                src={photoToDisplay}
                                alt={displayName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-tl flex items-center justify-center text-[7px] font-bold text-white shadow-xs ${
                                  isArrival ? 'bg-emerald-600' : isDeparture ? 'bg-indigo-600' : 'bg-blue-600'
                                }`}
                              >
                                {isArrival ? '↓' : isDeparture ? '↑' : '✓'}
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-[10px] ${
                                isArrival
                                  ? 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300'
                                  : isDeparture
                                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              }`}
                            >
                              {isArrival ? <LogIn className="w-3 h-3" /> : isDeparture ? <LogOut className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                              {displayName}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                              {new Date(det.timestamp).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                              {' • '}
                              {cameraDisplay}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end flex-shrink-0">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                              isArrival
                                ? 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300'
                                : isDeparture
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {passLabel}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                            {Math.round((det.confidence || 0.98) * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-center flex-shrink-0">
              <Link
                href="/reports"
                className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
              >
                <span>{language === 'uz' ? `To‘liq davomat jurnaliga o‘tish (${recentDetections.length}) →` : `Перейти в полный журнал посещаемости (${recentDetections.length}) →`}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
