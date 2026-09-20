// ==========================================
// REAL-TIME CELESTIAL ALERT CENTER (MASTER RADAR MODAL)
// Ultra-luxury astronomical quantum radar with interactive 12-hour timeline & smart notifications
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Clock,
  Sparkles,
  AlertTriangle,
  Compass,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  Bell,
  BellRing,
  Sliders,
  Send,
  ArrowRight,
  Sun,
  Moon,
  Flame,
  Droplets,
  Trees,
  Mountain,
  Disc
} from 'lucide-react';
import { CalculationResult, LanguageCode } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  calculateRealtimeSnapshot,
  RealtimeDestinySnapshot,
  HourlySlotInsight
} from '../engine/realtimeEngine';
import { soundEngine } from '../services/soundEffects';
import { sacredSound } from '../services/soundService';
import { CanChiNotificationPanel } from './CanChiNotificationPanel';
import {
  getNotificationPermission,
  sendTestNotification,
  requestNotificationPermission
} from '../services/destinyPushNotification';

interface Props {
  calculation: CalculationResult | null;
  profile?: UserProfile | null;
  language: LanguageCode;
  initialMode?: 'radar' | 'notifications';
  onClose: () => void;
}

export const RealTimeAlertCenter: React.FC<Props> = ({
  calculation,
  profile,
  language,
  initialMode = 'radar',
  onClose
}) => {
  const [activeMode, setActiveMode] = useState<'radar' | 'notifications'>(initialMode);
  const [snapshot, setSnapshot] = useState<RealtimeDestinySnapshot>(() =>
    calculateRealtimeSnapshot(calculation, new Date())
  );
  const [selectedSlot, setSelectedSlot] = useState<HourlySlotInsight | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermission()
  );
  const notificationEnabled = notificationPerm === 'granted';
  const [isTestingPush, setIsTestingPush] = useState<boolean>(false);
  const [testPushMsg, setTestPushMsg] = useState<string | null>(null);

  // Live real-time tick (each second)
  useEffect(() => {
    const timer = setInterval(() => {
      const fresh = calculateRealtimeSnapshot(calculation, new Date());
      setSnapshot(fresh);
      // Keep selected slot in sync if viewing current
      if (!selectedSlot || selectedSlot.isCurrent) {
        setSelectedSlot(fresh.currentSlot);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [calculation, selectedSlot]);

  // Set initial selected slot to current
  useEffect(() => {
    if (!selectedSlot) {
      setSelectedSlot(snapshot.currentSlot);
    }
  }, [snapshot]);

  // Manual rescan with audio feedback
  const handleRescan = () => {
    setIsScanning(true);
    soundEngine.playRadarTick();
    setTimeout(() => {
      const fresh = calculateRealtimeSnapshot(calculation, new Date());
      setSnapshot(fresh);
      setSelectedSlot(fresh.currentSlot);
      setIsScanning(false);
      if (fresh.alertLevel === 'GOLDEN_WINDOW') {
        soundEngine.playGoldenWindowAlert();
      } else if (fresh.alertLevel === 'CLASH_ANOMALY') {
        soundEngine.playClashWarningChime();
      } else {
        soundEngine.playHarmonicChime(528, 1.2);
      }
    }, 450);
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
    if (!nextState) {
      soundEngine.playHarmonicChime(528, 1.0);
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPerm(permission);
        if (permission === 'granted') {
          soundEngine.playHarmonicChime(660, 0.8);
          new Notification('Aurora Destiny AI • Cảnh Báo Thời Gian Thực', {
            body: `Đã kích hoạt hệ thống radar thiên văn. Canh giờ hiện tại: ${snapshot.currentHourPillar.stem} ${snapshot.currentHourPillar.branch} (${snapshot.currentSlot.zodiacStarName}) • Độ cộng hưởng: ${snapshot.resonanceScore}%`,
            icon: '/icon.png'
          });
        }
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  const isGolden = snapshot.alertLevel === 'GOLDEN_WINDOW';
  const isClash = snapshot.alertLevel === 'CLASH_ANOMALY';
  const activeSlot = selectedSlot || snapshot.currentSlot;

  // Element Icon helper
  const getElementBadge = (el: string) => {
    switch (el) {
      case 'Fire': return <span className="flex items-center gap-1 text-red-400"><Flame className="w-3.5 h-3.5" /> Hỏa</span>;
      case 'Water': return <span className="flex items-center gap-1 text-sky-400"><Droplets className="w-3.5 h-3.5" /> Thủy</span>;
      case 'Wood': return <span className="flex items-center gap-1 text-emerald-400"><Trees className="w-3.5 h-3.5" /> Mộc</span>;
      case 'Metal': return <span className="flex items-center gap-1 text-slate-200"><Disc className="w-3.5 h-3.5" /> Kim</span>;
      case 'Earth': return <span className="flex items-center gap-1 text-amber-400"><Mountain className="w-3.5 h-3.5" /> Thổ</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-5xl my-auto rounded-3xl bg-gradient-to-b from-[#0c0c16] via-[#080811] to-[#040409] border border-white/15 shadow-[0_0_80px_rgba(124,58,237,0.25)] overflow-hidden"
      >
        {/* Top Ambient Glow Bar */}
        <div
          className={`h-1.5 w-full ${
            isGolden
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_20px_#10b981]'
              : isClash
              ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-red-600 shadow-[0_0_20px_#f43f5e]'
              : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-400 shadow-[0_0_20px_#8b5cf6]'
          }`}
        />

        {/* 1. Modal Top Bar */}
        <div className="px-5 sm:px-8 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                isGolden
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isClash
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
              }`}
            >
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-cinzel">
                  Trung Tâm Cảnh Báo Thiên Thời & Thông Báo Đẩy
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-white/10 border border-white/20 text-slate-300">
                  LIVE RADAR
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{snapshot.currentDateStr}</span>
                <span className="text-slate-600">•</span>
                <span className="text-teal-400 font-medium">{snapshot.solarTerm}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-200">{snapshot.hourStr}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-full bg-black/60 border border-white/15 shadow-inner">
              <button
                onClick={() => {
                  sacredSound.playCelestialChime(528);
                  setActiveMode('radar');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono transition-all cursor-pointer ${
                  activeMode === 'radar'
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Radar Trực Quan</span>
              </button>

              <button
                onClick={() => {
                  sacredSound.playCelestialChime(768);
                  setActiveMode('notifications');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono transition-all cursor-pointer ${
                  activeMode === 'notifications'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Thông Báo Đẩy Can Chi</span>
              </button>
            </div>

            {/* Quick Rescan Button */}
            {activeMode === 'radar' && (
              <button
                onClick={handleRescan}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 font-medium transition-all active:scale-95 cursor-pointer"
                title="Quét lại tần số năng lượng hiện tại"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Quét Lại</span>
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-teal-300 transition-all cursor-pointer"
              title={isMuted ? 'Bật chuông tần số Solfeggio 528Hz' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playRadarTick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
              title="Đóng radar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {activeMode === 'notifications' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CanChiNotificationPanel
                calculation={calculation}
                profile={profile || null}
                language={language}
                onClose={onClose}
              />
            </motion.div>
          ) : (
            <>
          {/* A. REAL-TIME DIRECTIVE HERO CARD */}
          <div
            className={`rounded-2xl p-5 sm:p-6 border backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
              isGolden
                ? 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-black/60 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
                : isClash
                ? 'bg-gradient-to-br from-rose-950/40 via-amber-950/20 to-black/60 border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.15)]'
                : 'bg-gradient-to-br from-purple-950/40 via-indigo-950/20 to-black/60 border-purple-500/35 shadow-[0_0_30px_rgba(124,58,237,0.12)]'
            }`}
          >
            {/* Background SVG Radar Rings */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-72 h-72 pointer-events-none opacity-20">
              <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" style={{ animationDuration: '6s' }} />
              <div className="absolute inset-6 rounded-full border border-white/20" />
              <div className="absolute inset-16 rounded-full border border-white/15" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Column: Directives */}
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                      isGolden
                        ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300 shadow-[0_0_15px_#10b981]'
                        : isClash
                        ? 'bg-rose-900/60 border-rose-400 text-rose-300 shadow-[0_0_15px_#f43f5e]'
                        : 'bg-teal-900/60 border-teal-400 text-teal-300 shadow-[0_0_15px_#2dd4bf]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    {isGolden ? 'Cửa Sổ Hoàng Kim' : isClash ? 'Cảnh Báo Xung Khắc' : 'Dòng Chảy Ổn Định'}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/40 border border-white/10 text-slate-300">
                    Canh Giờ: {snapshot.currentHourPillar.stem} {snapshot.currentHourPillar.branch} ({snapshot.currentSlot.timeRangeStr})
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {snapshot.currentSlot.zodiacStarName} ({snapshot.currentSlot.isZodiacAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo'})
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide font-cinzel leading-snug">
                  {snapshot.headlineMessage}
                </h3>

                <p className="text-sm text-slate-200/90 leading-relaxed font-sans">
                  {snapshot.actionGuidance}
                </p>

                <div className="flex items-start gap-2 pt-1 text-xs text-slate-300 font-mono bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <Compass className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-teal-300 font-bold uppercase tracking-wider">Giao thức tối ưu: </span>
                    <span>{snapshot.mitigationProtocol}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Resonance Gauge & Countdown */}
              <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 w-full lg:w-auto shrink-0 bg-black/40 p-4 rounded-2xl border border-white/10">
                {/* 360° Circular Resonance Meter */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    {/* Dynamic Meter */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={isGolden ? '#10b981' : isClash ? '#f43f5e' : '#2dd4bf'}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * snapshot.resonanceScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  {/* Inner Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-mono font-bold text-white tracking-tight">
                      {snapshot.luckPercentage}
                      <span className="text-xs text-slate-400 font-normal">%</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono font-bold">
                      Tỷ Lệ Hên
                    </span>
                  </div>
                </div>

                {/* Luck vs Risk Heuristic Resonance Summary */}
                <div className="w-full flex items-center justify-between gap-3 text-xs font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">CHỈ SỐ CÁT:</span>
                    <span className="font-bold text-emerald-400">{snapshot.luckPercentage}/100</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">CHỈ SỐ HUNG:</span>
                    <span className="font-bold text-rose-400">{snapshot.riskPercentage}/100</span>
                  </div>
                </div>

                {/* Next Transition Countdown */}
                <div className="text-center lg:text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '10s' }} />
                    <span>Chuyển canh giờ sau:</span>
                  </div>
                  <div className="text-sm sm:text-base font-mono font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-lg border border-amber-500/30 shadow-inner">
                    {snapshot.timeRemainingFormatted}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. MICRO-ACTIONS & AUSPICIOUS VECTORS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Phương vị & Hướng cát */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-teal-300 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Phương Vị Xuất Hành</span>
              </div>
              <p className="text-sm font-bold text-white">
                {snapshot.auspiciousDirection}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tăng cường cát khí khi bắt đầu cuộc gặp gỡ hoặc hướng bàn làm việc trong canh giờ này.
              </p>
            </div>

            {/* Card 2: Sắc thái bổ trợ ngũ hành */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Màu Sắc Bổ Trợ</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: snapshot.luckyColorHex }}
                />
                <p className="text-sm font-bold text-white">
                  {snapshot.luckyColorName}
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kích hoạt từ trường hài hòa, giảm thiểu áp lực căng thẳng thần kinh.
              </p>
            </div>

            {/* Card 3: Trình duyệt thông minh & Thông báo */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Chuông Báo Thiên Thời</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nhận thông báo chủ động khi bước vào Cửa Sổ Hoàng Kim tiếp theo.
                </p>
              </div>
              <button
                onClick={handleRequestNotification}
                disabled={notificationEnabled}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  notificationEnabled
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white active:scale-95'
                }`}
              >
                {notificationEnabled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã Bật Thông Báo Live</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bật Thông Báo Trình Duyệt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* C. 24-HOUR INTERACTIVE CHRONO HORIZON (12 CANH GIỜ TRONG NGÀY) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white font-cinzel flex items-center gap-2">
                  <span>Toàn Cảnh 12 Canh Giờ Hôm Nay (24-Hour Horizon)</span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    (Nhấn vào từng canh giờ để xem chi tiết)
                  </span>
                </h4>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Hoàng Đạo / Thuận Khí
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Xung Khắc / Cần Thận Trọng
                </span>
              </div>
            </div>

            {/* Horizontal Timeline Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {snapshot.hourlySlots.map((slot) => {
                const isSelected = activeSlot.branchKey === slot.branchKey;
                const slotIsGolden = slot.alertLevel === 'GOLDEN_WINDOW';
                const slotIsClash = slot.alertLevel === 'CLASH_ANOMALY';

                return (
                  <button
                    key={slot.branchKey}
                    onClick={() => {
                      soundEngine.playRadarTick();
                      setSelectedSlot(slot);
                    }}
                    className={`relative p-3 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                      slot.isCurrent
                        ? 'ring-2 ring-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.3)] bg-teal-950/40 border-teal-400/80'
                        : isSelected
                        ? 'bg-white/10 border-white/40 shadow-md'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                    }`}
                  >
                    {/* Live Badge for Current */}
                    {slot.isCurrent && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-teal-500 text-[8px] font-mono font-bold text-black uppercase tracking-wider">
                        HIỆN TẠI
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-white font-mono">
                        {slot.stemNameVi} {slot.branchNameVi}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          slotIsGolden ? 'text-emerald-400' : slotIsClash ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {slot.resonanceScore}%
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mb-2">
                      {slot.timeRangeStr}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10">
                      <span
                        className={`font-medium ${
                          slot.isZodiacAuspicious ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {slot.zodiacStarName}
                      </span>
                      <span>{getElementBadge(slot.element)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* D. SELECTED HOURLY SLOT DEEP INSIGHT DRAWER */}
            {activeSlot && (
              <motion.div
                key={activeSlot.branchKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-black/80 border border-white/15 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-white font-cinzel">
                      Chi Tiết Canh Giờ: {activeSlot.stemNameVi} {activeSlot.branchNameVi} ({activeSlot.timeRangeStr})
                    </span>
                    {activeSlot.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        Đang Diễn Ra
                      </span>
                    )}
                    {activeSlot.isGuiRen && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Thiên Ất Quý Nhân
                      </span>
                    )}
                    {activeSlot.isClash && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Địa Chi Lục Xung
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                    <span>Thập thần: <strong className="text-teal-300">{activeSlot.tenGodName}</strong></span>
                    <span>•</span>
                    <span>Sao chủ: <strong className="text-amber-300">{activeSlot.zodiacStarName}</strong> ({activeSlot.isZodiacAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo'})</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {activeSlot.tacticalAdvice}
                </p>

                {/* 4 Life Fortune Aspects Grid */}
                {activeSlot.aspects && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">💰 Tài Lộc</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          activeSlot.aspects.wealth.verdict === 'HEN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activeSlot.aspects.wealth.verdict === 'XUI'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {activeSlot.aspects.wealth.score}% ({activeSlot.aspects.wealth.verdict === 'HEN' ? 'Hên' : activeSlot.aspects.wealth.verdict === 'XUI' ? 'Xui' : 'Bình'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {activeSlot.aspects.wealth.advice}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-300">💼 Công Việc</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          activeSlot.aspects.career.verdict === 'HEN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activeSlot.aspects.career.verdict === 'XUI'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {activeSlot.aspects.career.score}% ({activeSlot.aspects.career.verdict === 'HEN' ? 'Hên' : activeSlot.aspects.career.verdict === 'XUI' ? 'Xui' : 'Bình'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {activeSlot.aspects.career.advice}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-300">❤️ Nhân Duyên</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          activeSlot.aspects.relationship.verdict === 'HEN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activeSlot.aspects.relationship.verdict === 'XUI'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {activeSlot.aspects.relationship.score}% ({activeSlot.aspects.relationship.verdict === 'HEN' ? 'Hên' : activeSlot.aspects.relationship.verdict === 'XUI' ? 'Xui' : 'Bình'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {activeSlot.aspects.relationship.advice}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-300">🛡️ An Toàn</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          activeSlot.aspects.safety.verdict === 'HEN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activeSlot.aspects.safety.verdict === 'XUI'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {activeSlot.aspects.safety.score}% ({activeSlot.aspects.safety.verdict === 'HEN' ? 'Hên' : activeSlot.aspects.safety.verdict === 'XUI' ? 'Xui' : 'Bình'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {activeSlot.aspects.safety.advice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Best For vs Avoid Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Việc Khuyên Làm Trong Khung Giờ Này</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                      {activeSlot.bestForActivities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/25 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">
                      <XCircle className="w-4 h-4" />
                      <span>Việc Cần Thận Trọng & Tránh Xung Đột</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                      {activeSlot.avoidActivities.map((av, i) => (
                        <li key={i}>{av}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
            </>
          )}
        </div>

        {/* 3. Modal Bottom Action Bar */}
        <div className="px-5 sm:px-8 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            * Dữ liệu thời gian thực được tính toán động dựa trên quy luật Nhật Khởi Thời Quyết & 12 Thần Sát Hoàng Đạo.
          </p>

          <button
            onClick={() => {
              soundEngine.playRadarTick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-medium font-mono uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] cursor-pointer"
          >
            Đã Nắm Rõ Vận Khắc
          </button>
        </div>
      </motion.div>
    </div>
  );
};
