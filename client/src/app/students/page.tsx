'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Camera,
  X,
  Clock,
  Calendar,
  Eye,
  AlertCircle,
  Upload,
  RefreshCw,
  Video,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import * as faceapi from 'face-api.js';
import { useLanguage } from '@/context/LanguageContext';
import { DEPARTMENTS, TEACHER_RANKS, getSystemDepartments, addSystemDepartment } from '@/lib/constants';

export default function StudentsPage() {
  const { t, language } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);

  // Dynamic Departments State
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [isAddingQuickDept, setIsAddingQuickDept] = useState(false);
  const [quickDeptInput, setQuickDeptInput] = useState('');

  useEffect(() => {
    const updateList = () => {
      const list = getSystemDepartments(language as 'uz' | 'ru');
      setDepartmentsList(list);
    };
    updateList();
    window.addEventListener('educontrol_departments_updated', updateList);
    return () => window.removeEventListener('educontrol_departments_updated', updateList);
  }, [language]);

  const handleQuickAddDept = () => {
    if (!quickDeptInput.trim()) return;
    const clean = quickDeptInput.trim();
    const updated = addSystemDepartment(clean, language as 'uz' | 'ru');
    setDepartmentsList(updated);
    setFormData((prev) => ({ ...prev, department: clean }));
    setQuickDeptInput('');
    setIsAddingQuickDept(false);
  };

  // Form State
  const [formData, setFormData] = useState({
    studentCode: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    grade: TEACHER_RANKS[language][3],
    photoUrl: '',
    faceDescriptor: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Webcam Capture State inside Modal
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  const [autoCaptureStatus, setAutoCaptureStatus] = useState<string>(
    language === 'uz' ? 'Yuzingizni kameraga qarating' : 'Наведите лицо на камеру'
  );
  const [cameraFlash, setCameraFlash] = useState(false);

  // Mirror state for webcam (default true so subject sees natural reflection)
  const [isMirrored, setIsMirrored] = useState(true);
  const isMirroredRef = useRef(true);

  // 3-Angle Multi-Biometric Capture (Анфас, Влево 15°, Вправо 15°)
  const [angleIndex, setAngleIndex] = useState(0);
  const [capturedAngles, setCapturedAngles] = useState<string[]>([]);
  const capturedAnglesRef = useRef<string[]>([]);
  const angleDescriptorsRef = useRef<Float32Array[]>([]);
  const angleIndexRef = useRef<number>(0);
  const isAngleSwitchingRef = useRef<boolean>(false);
  const firstTurnDirectionRef = useRef<'LEFT' | 'RIGHT' | null>(null);

  const ANGLE_CONFIG = language === 'uz' ? [
    {
      title: '1-rakurs (3 tadan): To‘g‘riga',
      prompt: 'To‘g‘riga qarang (Anfas)',
      badge: '1. To‘g‘riga',
      arrow: '• TO‘G‘RIGA •',
    },
    {
      title: '2-rakurs (3 tadan): Boshni burish',
      prompt: 'Boshni ozgina istalgan tomonga buring (~15°)',
      badge: '2. Burilish',
      arrow: '↔ BURILING',
    },
    {
      title: '3-rakurs (3 tadan): Qarama-qarshi tomon',
      prompt: 'Boshni qarama-qarshi tomonga buring (~15°)',
      badge: '3. Boshqa tomonga',
      arrow: '↔ BOSHQA TOMONGA',
    },
  ] : [
    {
      title: 'Ракурс 1 из 3: Анфас',
      prompt: 'Посмотрите прямо в камеру (Анфас)',
      badge: '1. Анфас (Прямо)',
      arrow: '• ПРЯМО •',
    },
    {
      title: 'Ракурс 2 из 3: Первый поворот',
      prompt: 'Слегка поверните голову в любую сторону (~15°)',
      badge: '2. Поворот головы',
      arrow: '↔ ПОВЕРНИТЕ ГОЛОВУ',
    },
    {
      title: 'Ракурс 3 из 3: Второй поворот',
      prompt: 'Поверните голову в противоположную сторону (~15°)',
      badge: '3. В другую сторону',
      arrow: '↔ В ДРУГУЮ СТОРОНУ',
    },
  ];

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalAnimRef = useRef<number | null>(null);
  const autoProgressRef = useRef<number>(0);
  const autoCapturedRef = useRef<boolean>(false);

  // Face descriptor extraction state
  const [descriptorStatus, setDescriptorStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelLoaded(true);
        console.log('[EduControl] Face recognition models loaded for enrollment');
      } catch (err) {
        console.error('[EduControl] Failed to load face models:', err);
      }
    };
    loadModels();
    fetchStudents();

    return () => {
      handleStopWebcam();
    };
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, department]);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents({ search, department });
      setStudents(data);
    } catch (e) {
      console.error('Failed to fetch students:', e);
    } finally {
      setLoading(false);
    }
  };

  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const depts = getSystemDepartments(language as 'uz' | 'ru');
    setFormData({
      studentCode: `TCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      firstName: '',
      lastName: '',
      email: '',
      department: depts[0] || '',
      grade: TEACHER_RANKS[language][3],
      photoUrl: '',
      faceDescriptor: '',
      status: 'ACTIVE',
    });
    setFormError(null);
    setDescriptorStatus('idle');
    setCapturedAngles([]);
    capturedAnglesRef.current = [];
    setIsWebcamOpen(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      department: student.department,
      grade: student.grade,
      photoUrl: student.photoUrl || '',
      faceDescriptor: student.faceDescriptor || '',
      status: student.status,
    });
    setFormError(null);
    setDescriptorStatus(student.faceDescriptor ? 'success' : 'idle');
    setCapturedAngles([]);
    capturedAnglesRef.current = [];
    setIsWebcamOpen(false);
    setIsAddModalOpen(true);
  };

  const handleStartWebcam = async () => {
    try {
      setAngleIndex(0);
      angleIndexRef.current = 0;
      setCapturedAngles([]);
      capturedAnglesRef.current = [];
      angleDescriptorsRef.current = [];
      firstTurnDirectionRef.current = null;
      isAngleSwitchingRef.current = false;
      autoProgressRef.current = 0;
      autoCapturedRef.current = false;
      setAutoCaptureProgress(0);
      setAutoCaptureStatus(ANGLE_CONFIG[0].prompt);
      setIsWebcamOpen(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      setTimeout(() => {
        if (modalVideoRef.current) {
          modalVideoRef.current.srcObject = stream;
          modalVideoRef.current.onloadedmetadata = () => {
            modalVideoRef.current?.play();
            startAutoCaptureLoop();
          };
        }
      }, 150);
    } catch (err: any) {
      alert(
        language === 'uz'
          ? 'Veb-kameradan foydalanish imkoni bo‘lmadi: ' + err.message
          : 'Не удалось получить доступ к веб-камере: ' + err.message
      );
      setIsWebcamOpen(false);
    }
  };

  // Helper to compute head yaw (left/front/right) from 68 facial landmarks
  const getHeadPose = (landmarks: any, mirrored: boolean = true): {
    yawRatio: number;
    direction: 'FRONT' | 'LEFT' | 'RIGHT';
  } => {
    const pts = landmarks.positions;
    const noseX = pts[30].x;
    const jawLeftX = pts[0].x;
    const jawRightX = pts[16].x;

    const distLeft = noseX - jawLeftX;
    const distRight = jawRightX - noseX;
    const rawRatio = distLeft / Math.max(1, distRight);

    // In mirrored mode:
    // Turning head to user’s left (left side of screen) -> nose moves to camera right in raw frame -> rawRatio > 1.14
    // Turning head to user’s right (right side of screen) -> nose moves to camera left in raw frame -> rawRatio < 0.88
    const ratio = mirrored ? rawRatio : (1 / Math.max(0.01, rawRatio));

    if (ratio > 1.14) {
      return { yawRatio: ratio, direction: 'LEFT' };
    } else if (ratio < 0.88) {
      return { yawRatio: ratio, direction: 'RIGHT' };
    } else {
      return { yawRatio: ratio, direction: 'FRONT' };
    }
  };

  // Extract 128-d face descriptor from an image element or canvas
  const extractFaceDescriptor = async (input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<Float32Array | null> => {
    if (!modelLoaded) return null;
    try {
      const detection = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        return detection.descriptor;
      }
      return null;
    } catch (e) {
      console.error('[EduControl] Descriptor extraction error:', e);
      return null;
    }
  };

  // Perform snapshot & descriptor extraction for current angle
  const executeSnapshot = async (video: HTMLVideoElement, descriptorOverride?: Float32Array | null) => {
    if (isAngleSwitchingRef.current) return;
    isAngleSwitchingRef.current = true;

    playShutterSound();
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 250);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isAngleSwitchingRef.current = false;
      return;
    }

    if (isMirroredRef.current) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    let descriptor = descriptorOverride;
    if (!descriptor) {
      descriptor = await extractFaceDescriptor(canvas);
    }
    // Fallback for side profile: reuse frontal descriptor if face-api misses extreme turn
    if (!descriptor && angleDescriptorsRef.current.length > 0) {
      descriptor = angleDescriptorsRef.current[0];
    }

    if (descriptor) {
      angleDescriptorsRef.current.push(descriptor);
      capturedAnglesRef.current.push(dataUrl);
      const updatedPhotos = [...capturedAnglesRef.current];
      setCapturedAngles(updatedPhotos);

      const currentIdx = angleIndexRef.current;
      if (currentIdx < 2) {
        const nextIdx = currentIdx + 1;
        angleIndexRef.current = nextIdx;
        setAngleIndex(nextIdx);
        autoProgressRef.current = 0;
        setAutoCaptureProgress(0);
        setAutoCaptureStatus(ANGLE_CONFIG[nextIdx].prompt);

        // Pause 1 second so student can adjust head angle
        setTimeout(() => {
          isAngleSwitchingRef.current = false;
        }, 1100);
      } else {
        // All 3 angles completed!
        const allDescs = angleDescriptorsRef.current.map((d) => Array.from(d));
        setFormData((prev) => ({
          ...prev,
          photoUrl: updatedPhotos[0] || dataUrl,
          faceDescriptor: JSON.stringify(allDescs),
        }));
        setDescriptorStatus('success');
        handleStopWebcam();
      }
    } else {
      setAutoCaptureStatus(
        language === 'uz' ? 'Yuz aniqlanmadi. Rakursni qaytadan oling.' : 'Лицо не определено. Повторите ракурс.'
      );
      isAngleSwitchingRef.current = false;
    }
  };

  // Loop that tracks face and automatically triggers snapshot when face is stable
  const startAutoCaptureLoop = () => {
    const video = modalVideoRef.current;
    const canvas = modalCanvasRef.current;
    if (!video || !canvas) return;

    let lastCheckTime = 0;
    let detectedFaceBox: { x: number; y: number; width: number; height: number } | null = null;
    let cachedDescriptor: Float32Array | null = null;

    const render = async () => {
      if (!modalVideoRef.current || modalVideoRef.current.paused || modalVideoRef.current.ended) {
        return;
      }

      if (isAngleSwitchingRef.current) {
        modalAnimRef.current = requestAnimationFrame(render);
        return;
      }

      const displayW = canvas.clientWidth || 480;
      const displayH = canvas.clientHeight || 360;
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, displayW, displayH);

        const now = Date.now();

        // Run detection every 160ms
        if (now - lastCheckTime > 160 && modelLoaded) {
          lastCheckTime = now;

          try {
            const detection = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.18 }))
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              const scaleX = displayW / video.videoWidth;
              const scaleY = displayH / video.videoHeight;
              detectedFaceBox = {
                x: detection.detection.box.x * scaleX,
                y: detection.detection.box.y * scaleY,
                width: detection.detection.box.width * scaleX,
                height: detection.detection.box.height * scaleY,
              };
              cachedDescriptor = detection.descriptor;

              const curIdx = angleIndexRef.current;
              const pose = getHeadPose(detection.landmarks, isMirroredRef.current);

              let isCorrectAngle = false;
              let feedbackText = '';

              if (curIdx === 0) {
                // Angle 1: Frontal (Анфас)
                if (pose.direction === 'FRONT') {
                  isCorrectAngle = true;
                  feedbackText = language === 'uz' ? '✓ Anfas: to‘g‘riga qarang, rasmga olinmoqda...' : '✓ Анфас: смотрите прямо, фиксируем...';
                } else {
                  feedbackText = language === 'uz' ? 'Kameraga to‘g‘ri qarang (Anfas)' : 'Посмотрите прямо в камеру (Анфас)';
                }
              } else if (curIdx === 1) {
                // Angle 2: First turn - accept ANY turn direction (left or right)!
                if (pose.direction === 'LEFT' || pose.direction === 'RIGHT') {
                  isCorrectAngle = true;
                  firstTurnDirectionRef.current = pose.direction;
                  const dirName = language === 'uz' ? (pose.direction === 'LEFT' ? 'chapga' : 'o‘ngga') : (pose.direction === 'LEFT' ? 'влево' : 'вправо');
                  feedbackText = language === 'uz' ? `✓ Boshni ${dirName} burish aniqlandi! Qimirlamang...` : `✓ Поворот ${dirName} пойман! Держите...`;
                } else {
                  feedbackText = language === 'uz' ? 'Boshni ozgina bir tomonga buring (~15°)' : 'Слегка поверните голову в сторону (~15°)';
                }
              } else if (curIdx === 2) {
                // Angle 3: Second turn - expect the OPPOSITE side
                const neededDir = firstTurnDirectionRef.current === 'LEFT' ? 'RIGHT' : 'LEFT';
                const neededLabel = language === 'uz'
                  ? (neededDir === 'LEFT' ? 'chapga ←' : 'o‘ngga →')
                  : (neededDir === 'LEFT' ? 'влево ←' : 'вправо →');
                if (pose.direction === neededDir) {
                  isCorrectAngle = true;
                  feedbackText = language === 'uz' ? `✓ ${neededLabel} burilish aniqlandi! Qimirlamang...` : `✓ Поворот ${neededLabel} пойман! Держите...`;
                } else if (pose.direction === firstTurnDirectionRef.current) {
                  feedbackText = language === 'uz' ? `Boshni QARAMA-QARSHI tomonga buring (${neededLabel})` : `Поверните в ДРУГУЮ сторону (${neededLabel})`;
                } else {
                  feedbackText = language === 'uz' ? `Boshni ${neededLabel} buring (~15°)` : `Поверните голову ${neededLabel} (~15°)`;
                }
              }

              if (isCorrectAngle) {
                autoProgressRef.current = Math.min(100, autoProgressRef.current + 25);
              } else {
                autoProgressRef.current = Math.max(0, autoProgressRef.current - 10);
              }

              setAutoCaptureProgress(autoProgressRef.current);
              const curCfg = ANGLE_CONFIG[curIdx] || ANGLE_CONFIG[0];
              setAutoCaptureStatus(`${curCfg.title}: ${feedbackText}`);

              // TRIGGER AUTO-SNAPSHOT AT 100%!
              if (autoProgressRef.current >= 100) {
                autoProgressRef.current = 0;
                setAutoCaptureProgress(0);
                executeSnapshot(video, cachedDescriptor);
                modalAnimRef.current = requestAnimationFrame(render);
                return;
              }
            } else {
              detectedFaceBox = null;
              autoProgressRef.current = Math.max(0, autoProgressRef.current - 12);
              setAutoCaptureProgress(autoProgressRef.current);
              setAutoCaptureStatus(
                language === 'uz'
                  ? 'Yuz ko‘rinmadi! Kameraga qarang (yengil burilish ~15°)'
                  : 'Лицо потеряно! Слегка повернитесь к камере (нужен лёгкий поворот ~15°)'
              );
            }
          } catch (e) {
            // Ignore frame error
          }
        }

        // Draw HUD overlay on modal canvas
        if (detectedFaceBox) {
          const padding = 20;
          const rawBoxX = Math.max(0, detectedFaceBox.x - padding);
          const rawBoxY = Math.max(0, detectedFaceBox.y - padding);
          const boxW = Math.min(displayW - rawBoxX, detectedFaceBox.width + padding * 2);
          const boxH = Math.min(displayH - rawBoxY, detectedFaceBox.height + padding * 2);
          const cornerLen = Math.min(28, boxW * 0.25);

          // Mirror box coordinate to match mirrored video
          const boxX = isMirroredRef.current ? Math.max(0, displayW - (rawBoxX + boxW)) : rawBoxX;
          const boxY = rawBoxY;

          const curCfg = ANGLE_CONFIG[angleIndexRef.current] || ANGLE_CONFIG[0];
          const isGoodAngle = autoProgressRef.current > 15;
          const boxColor = isGoodAngle ? '#16a34a' : '#f59e0b';

          ctx.lineWidth = 3.5;
          ctx.strokeStyle = boxColor;

          // Corner brackets
          ctx.beginPath(); ctx.moveTo(boxX, boxY + cornerLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cornerLen, boxY); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerLen, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + cornerLen); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX, boxY + boxH - cornerLen); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + cornerLen, boxY + boxH); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen); ctx.stroke();

          // Laser scan line
          const scanY = boxY + ((Date.now() / 6) % boxH);
          ctx.strokeStyle = isGoodAngle ? 'rgba(22, 163, 74, 0.7)' : 'rgba(245, 158, 11, 0.7)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(boxX + 4, scanY); ctx.lineTo(boxX + boxW - 4, scanY); ctx.stroke();

          // Directional guide badge above box
          const badgeText = curCfg.arrow;
          const badgeW = Math.max(140, badgeText.length * 9 + 30);
          const badgeX = Math.min(boxX, displayW - badgeW - 8);
          ctx.fillStyle = isGoodAngle ? '#16a34a' : '#2563eb';
          ctx.fillRect(badgeX, boxY - 26, badgeW, 22);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(badgeText, badgeX + 10, boxY - 10);

          // Progress bar right on canvas
          const pWidth = (autoProgressRef.current / 100) * boxW;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(boxX, boxY + boxH + 6, boxW, 18);
          ctx.fillStyle = boxColor;
          ctx.fillRect(boxX, boxY + boxH + 6, pWidth, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`${curCfg.badge.toUpperCase()}: ${autoProgressRef.current}%`, boxX + 6, boxY + boxH + 19);
        } else {
          // Centered dashed guide
          const gW = Math.round(displayW * 0.5);
          const gH = Math.round(displayH * 0.65);
          const gX = Math.round((displayW - gW) / 2);
          const gY = Math.round((displayH - gH) / 2.2);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(gX, gY, gW, gH);
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.fillRect(gX, gY - 24, gW, 20);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px sans-serif';
          const curCfg = ANGLE_CONFIG[angleIndexRef.current] || ANGLE_CONFIG[0];
          ctx.fillText(curCfg.prompt, gX + 10, gY - 10);
        }
      }

      modalAnimRef.current = requestAnimationFrame(render);
    };

    modalAnimRef.current = requestAnimationFrame(render);
  };

  const handleManualCapture = () => {
    if (!modalVideoRef.current) return;
    executeSnapshot(modalVideoRef.current);
  };

  const handleStopWebcam = () => {
    if (modalVideoRef.current && modalVideoRef.current.srcObject) {
      const stream = modalVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      modalVideoRef.current.srcObject = null;
    }
    if (modalAnimRef.current) {
      cancelAnimationFrame(modalAnimRef.current);
    }
    setIsWebcamOpen(false);
    setAutoCaptureProgress(0);
    autoProgressRef.current = 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) return;
      const dataUrl = event.target.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));

      // Extract descriptor from uploaded image
      setDescriptorStatus('loading');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const descriptor = await extractFaceDescriptor(img as any);
        if (descriptor) {
          setFormData((prev) => ({ ...prev, faceDescriptor: JSON.stringify(Array.from(descriptor)) }));
          setDescriptorStatus('success');
        } else {
          setDescriptorStatus('error');
          setFormData((prev) => ({ ...prev, faceDescriptor: '' }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCloseModal = () => {
    handleStopWebcam();
    setIsAddModalOpen(false);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError(
        language === 'uz'
          ? 'Iltimos, o‘qituvchining ismi va familiyasini kiriting'
          : 'Пожалуйста, введите имя и фамилию преподавателя'
      );
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, formData);
      } else {
        await api.createStudent(formData);
      }
      handleCloseModal();
      fetchStudents();
    } catch (err: any) {
      setFormError(
        err.message ||
          (language === 'uz'
            ? 'O‘qituvchi ma’lumotlarini saqlashda xatolik yuz berdi'
            : 'Ошибка сохранения данных преподавателя')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg =
      language === 'uz'
        ? `"${name}" o‘qituvchisini va barcha davomat tarixini o‘chirishni tasdiqlaysizmi?`
        : `Удалить преподавателя "${name}" и всю историю посещений?`;
    if (confirm(confirmMsg)) {
      try {
        await api.deleteStudent(id);
        fetchStudents();
      } catch (e: any) {
        alert(e.message || (language === 'uz' ? 'O‘chirishda xatolik yuz berdi' : 'Ошибка удаления'));
      }
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      const stu = await api.getStudentById(id);
      setViewingStudent(stu);
    } catch (e: any) {
      alert(
        language === 'uz'
          ? 'O‘qituvchi profilini yuklab bo‘lmadi: ' + e.message
          : 'Не удалось загрузить профиль преподавателя: ' + e.message
      );
    }
  };

  const departmentOptions = [
    language === 'uz' ? `Barcha kafedralar va bo\u2019limlar` : 'Все кафедры и подразделения',
    ...departmentsList,
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('navStudents')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'uz'
              ? 'O‘qituvchilar va biometriya bazasi'
              : 'Реестр преподавателей и биометрии'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'uz' ? 'Yangi o‘qituvchini ro‘yxatga olish' : 'Зарегистрировать преподавателя'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchTeacherPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 dark:focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value === departmentOptions[0] ? '' : e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none font-medium w-full sm:w-auto"
          >
            {departmentOptions.map((d) => (
              <option key={d} value={d === departmentOptions[0] ? '' : d} className="dark:bg-slate-900 dark:text-white">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
            {language === 'uz' ? 'O‘qituvchilar ro‘yxati yuklanmoqda...' : 'Загрузка списка преподавателей...'}
          </div>
        ) : students.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center mx-auto mb-2.5 text-blue-700 dark:text-blue-300">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'uz' ? 'O‘qituvchilar tarkibi bo‘sh' : 'Штат преподавателей пуст'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {language === 'uz'
                ? 'O‘qituvchini ro‘yxatdan o‘tkazish uchun quyidagi tugmani bosing.'
                : 'Нажмите кнопку ниже, чтобы зарегистрировать преподавателя.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'uz' ? 'Birinchi o‘qituvchini ro‘yxatga olish' : 'Зарегистрировать первого преподавателя'}</span>
            </button>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-slate-950/40 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.firstName}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 flex-shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-mono font-medium">
                        {student.studentCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        student.status === 'ACTIVE'
                          ? 'bg-green-50 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-green-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {student.status === 'ACTIVE'
                        ? (language === 'uz' ? 'Faol' : 'Активен')
                        : (language === 'uz' ? 'Faol emas' : 'Неактивен')}
                    </span>
                    {student.faceDescriptor ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-0.5 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {(() => {
                          try {
                            const parsed = JSON.parse(student.faceDescriptor);
                            if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
                              return language === 'uz' ? '3D-Biometriya (3 rakurs)' : '3D-Биометрия (3 ракурса)';
                            }
                          } catch (e) {}
                          return language === 'uz' ? 'Biometriya' : 'Биометрия';
                        })()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                        {language === 'uz' ? 'Biometriyasiz' : 'Нет биометрии'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">{language === 'uz' ? `Kafedra / Bo‘lim:` : 'Кафедра / Отдел:'}</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight text-xs truncate">{student.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] flex-shrink-0">{language === 'uz' ? 'Lavozimi:' : 'Должность:'}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-xs">{student.grade}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">{language === 'uz' ? 'Elektron pochta:' : 'Эл. почта:'}</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 truncate text-xs">{student.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleViewProfile(student.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'uz' ? 'Davomat tarixi' : 'История посещений'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(student)}
                    title={language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                    title={language === 'uz' ? 'O‘chirish' : 'Удалить'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStudent
                  ? (language === 'uz' ? 'O‘qituvchi ma’lumotlarini tahrirlash' : 'Редактировать преподавателя')
                  : (language === 'uz' ? 'Yangi o‘qituvchini ro‘yxatga olish' : 'Регистрация преподавателя')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-rose-950/50 border border-red-200 dark:border-rose-900/50 text-red-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
              {/* Photo Enrollment Section with Biometric Status */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    {language === 'uz' ? 'Biometrik yuzni tanish uchun fotosurat' : 'Фото лица для биометрического распознавания'}
                  </label>
                  {isWebcamOpen && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMirrored((prev) => {
                            isMirroredRef.current = !prev;
                            return !prev;
                          });
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                          isMirrored
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        }`}
                        title={language === 'uz' ? 'Ko‘zgu rejimini o‘zgartirish' : 'Переключить зеркальный режим'}
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>{language === 'uz' ? (isMirrored ? 'Ko‘zgu: BOR' : 'Ko‘zgu: YO‘Q') : (isMirrored ? 'Зеркало: ВКЛ' : 'Зеркало: ВЫКЛ')}</span>
                      </button>
                      <span className="text-[10px] font-bold text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-green-200 dark:border-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-green-600 dark:text-emerald-400 animate-spin" />
                        {language === 'uz' ? 'AVTO-SURAT YOQILGAN' : 'АВТО-СНИМОК ВКЛЮЧЁН'}
                      </span>
                    </div>
                  )}
                </div>

                {isWebcamOpen ? (
                  <div className="space-y-3">
                    {/* 3-Angle Step Indicator */}
                    <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      {ANGLE_CONFIG.map((ang, idx) => {
                        const isDone = angleIndex > idx;
                        const isCurrent = angleIndex === idx;
                        return (
                          <div
                            key={idx}
                            className={`px-2 py-1 rounded text-center text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${
                              isDone
                                ? 'bg-green-100 dark:bg-emerald-950/70 text-green-800 dark:text-emerald-300 border border-green-300 dark:border-emerald-700'
                                : isCurrent
                                ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isDone ? <span>✓ {ang.badge}</span> : <span>{ang.badge}</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      <video
                        ref={modalVideoRef}
                        playsInline
                        muted
                        style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={modalCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                      {/* Camera Shutter Flash */}
                      {cameraFlash && (
                        <div className="absolute inset-0 bg-white pointer-events-none animate-pulse" />
                      )}
                    </div>

                    {/* Auto-Capture Status & Progress Bar */}
                    <div className="space-y-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{autoCaptureStatus}</span>
                        <span className={autoCaptureProgress > 0 ? 'text-green-700 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>
                          {autoCaptureProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-green-600 dark:bg-emerald-500 rounded-full transition-all duration-150"
                          style={{ width: `${autoCaptureProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleManualCapture}
                        className="flex-1 py-2 px-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>
                          {language === 'uz'
                            ? `Suratga olish (${angleIndex + 1}/3)`
                            : `Снять ракурс ${angleIndex + 1} из 3`}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleStopWebcam}
                        className="py-2 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {capturedAngles.length > 0 ? (
                        <div className="flex gap-2">
                          {capturedAngles.map((thumb, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                              <img src={thumb} alt={`Ракурс ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white text-center py-0.5 font-medium">
                                {idx === 0
                                  ? (language === 'uz' ? '1. To‘g‘riga' : '1. Анфас')
                                  : idx === 1
                                  ? (language === 'uz' ? '2. Burilish' : '2. Поворот')
                                  : (language === 'uz' ? '3. Qarama-qarshi' : '3. В другую сторону')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm relative">
                          {formData.photoUrl ? (
                            <img
                              src={formData.photoUrl}
                              alt={language === 'uz' ? 'Yuz surati' : 'Фото лица'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-2 text-slate-400 dark:text-slate-500">
                              <Camera className="w-6 h-6 mx-auto mb-0.5" />
                              <span className="text-[9px]">{language === 'uz' ? 'Suratsiz' : 'Нет фото'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleStartWebcam}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-sm transition bg-blue-600 hover:bg-blue-700 active:scale-95"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{language === 'uz' ? 'Kamerani yoqish (3 rakurs)' : 'Включить камеру (3 ракурса)'}</span>
                          </button>

                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer shadow-sm transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{language === 'uz' ? 'Fayl yuklash' : 'Загрузить файл'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Biometric Descriptor Status */}
                        {descriptorStatus === 'loading' && (
                          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-[11px] font-medium">
                              {language === 'uz' ? 'Biometriya hisoblanmoqda...' : 'Извлечение биометрии...'}
                            </span>
                          </div>
                        )}
                        {descriptorStatus === 'success' && (
                          <div className="flex items-center gap-1.5 text-green-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-green-600 dark:text-emerald-400" />
                            <span className="text-[11px] font-bold">
                              {capturedAngles.length === 3 || (formData.faceDescriptor && formData.faceDescriptor.startsWith('[['))
                                ? (language === 'uz'
                                    ? '3D-biometriya muvaffaqiyatli saqlandi ✓ (3 rakurs)'
                                    : '3D-биометрия зарегистрирована ✓ (3 ракурса: анфас, влево, вправо)')
                                : (language === 'uz'
                                    ? 'Biometriya kiritildi ✓'
                                    : 'Биометрия зарегистрирована ✓')}
                            </span>
                          </div>
                        )}
                        {descriptorStatus === 'error' && (
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-[11px] font-medium">
                              {language === 'uz' ? 'Yuz aniqlanmadi! Qaytadan suratga oling.' : 'Лицо не обнаружено! Сделайте фото заново.'}
                            </span>
                          </div>
                        )}
                        {descriptorStatus === 'idle' && !formData.photoUrl && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {language === 'uz'
                              ? '«Kamerani yoqish» tugmasini bosing: tizim 3 rakursda suratga oladi.'
                              : 'Нажмите «Включить камеру»: система снимет лицо в 3 ракурсах.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Ism' : 'Имя'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder={language === 'uz' ? 'Masalan: Shukurullo' : 'Например: Шукурулло'}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Familiya' : 'Фамилия'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder={language === 'uz' ? 'Masalan: Alixonov' : 'Например: Алихонов'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Tabel raqami / ID' : 'Табельный номер / ID'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentCode}
                    onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="TCH-2026-001"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Elektron pochta' : 'Электронная почта'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="teacher@educontrol.uz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {language === 'uz' ? `Kafedra / Bo‘lim` : 'Кафедра / Отдел'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingQuickDept(!isAddingQuickDept)}
                      className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{language === 'uz' ? 'Yangi qo‘shish' : '+ Новая'}</span>
                    </button>
                  </div>
                  {isAddingQuickDept ? (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <input
                        type="text"
                        value={quickDeptInput}
                        onChange={(e) => setQuickDeptInput(e.target.value)}
                        placeholder={language === 'uz' ? 'Kafedra nomi...' : 'Название кафедры...'}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-blue-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddDept}
                        className="px-2.5 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 cursor-pointer"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingQuickDept(false)}
                        className="px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none text-xs"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept} className="dark:bg-slate-900 dark:text-white">
                          {dept}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'uz' ? 'Lavozimi / Ilmiy darajasi' : 'Должность / Звание'}
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                  >
                    {TEACHER_RANKS[language].map((rank) => (
                      <option key={rank} value={rank} className="dark:bg-slate-900 dark:text-white">
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-white font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 active:scale-95 transition"
                >
                  {submitting
                    ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                    : editingStudent
                    ? (language === 'uz' ? 'Ma’lumotlarni yangilash' : 'Обновить данные')
                    : (language === 'uz' ? 'O‘qituvchini saqlash' : 'Сохранить преподавателя')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {viewingStudent.photoUrl ? (
                  <img
                    src={viewingStudent.photoUrl}
                    alt={viewingStudent.firstName}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewingStudent.firstName} {viewingStudent.lastName}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-mono">{viewingStudent.studentCode}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-hidden flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                {language === 'uz' ? 'Davomat jurnali' : 'Журнал посещаемости'}
              </h4>
              <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
                {viewingStudent.attendances && viewingStudent.attendances.length > 0 ? (
                  viewingStudent.attendances.map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-150 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.date}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            {language === 'uz' ? 'Kirish: ' : 'Вход: '}
                            {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                            {language === 'uz' ? 'Chiqish: ' : 'Выход: '}
                            {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (language === 'uz' ? 'Qayd etilmagan' : 'Не зафиксирован')}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.status === 'PRESENT'
                            ? 'bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800'
                            : rec.status === 'LATE'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {rec.status === 'PRESENT'
                          ? (language === 'uz' ? 'Kelgan' : 'Присутствует')
                          : rec.status === 'LATE'
                          ? (language === 'uz' ? 'Kechikkan' : 'Опоздал')
                          : (language === 'uz' ? 'Kelmadi' : 'Отсутствует')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                    {language === 'uz'
                      ? 'Davomat yozuvlari mavjud emas. Qayd etish uchun kamerani yoqing.'
                      : 'Записей посещаемости пока нет. Включите камеру для фиксации.'}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href={`/reports?search=${encodeURIComponent(viewingStudent.studentCode)}`}
                className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
              >
                <span>{language === 'uz' ? 'Jurnalda to‘liq tarixni ko‘rish →' : 'Открыть всю историю в Журнале →'}</span>
              </Link>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                {language === 'uz' ? 'Yopish' : 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
