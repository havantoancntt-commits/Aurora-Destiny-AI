// ==========================================
// REAL-TIME LUCK RADAR BAR (LIVE PULSE MONITOR)
// Smart real-time fortune & risk detection widget
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Compass,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import {
  calculateRealtimeSnapshot,
  RealtimeDestinySnapshot,
  LuckCategory
} from '../engine/realtimeEngine';
import { soundEngine } from '../services/soundEffects';
import { sacredSound } from '../services/soundService';

interface Props {
  calculation: CalculationResult | null;
  onOpenFullRadar: () => void;
}

export const RealTimeLuckRadarBar: React.FC<Props> = ({ calculation, onOpenFullRadar }) => {
  const [snapshot, setSnapshot] = useState<RealtimeDestinySnapshot>(() =>
    calculateRealtimeSnapshot(calculation, new Date())
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isAudioAlertActive, setIsAudioAlertActive] = useState<boolean>(false);
  const [lastAlertedSlotKey, setLastAlertedSlotKey] = useState<string>('');

  // Live real-time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const fresh = calculateRealtimeSnapshot(calculation, now);
      setSnapshot(fresh);

      // Smart audio alert check on hour branch transition
      const currentSlotKey = `${fresh.currentHourPillar.stem}_${fresh.currentHourPillar.branch}`;
      if (isAudioAlertActive && lastAlertedSlotKey && lastAlertedSlotKey !== currentSlotKey) {
        if (fresh.luckCategory === 'DAI_CAT') {
          soundEngine.playGoldenWindowAlert();
          sacredSound.playCelestialChime(880);
        } else if (fresh.luckCategory === 'DAI_HUNG') {
          soundEngine.playClashWarningChime();
        }
      }
      setLastAlertedSlotKey(currentSlotKey);
    }, 1000);

    return () => clearInterval(timer);
  }, [calculation, isAudioAlertActive, lastAlertedSlotKey]);

  const {
    currentSlot,
    luckCategory,
    luckPercentage,
    riskPercentage,
    secondsRemainingInCurrentHour,
    timeRemainingFormatted,
    microPhase,
    quickRemedy,
    auspiciousDirection
  } = snapshot;

  const isDaiCat = luckCategory === 'DAI_CAT';
  const isTieuCat = luckCategory === 'TIEU_CAT';
  const isDaiHung = luckCategory === 'DAI_HUNG';
  const isTieuHung = luckCategory === 'TIEU_HUNG';
  const isBinhHoa = luckCategory === 'BINH_HOA';

  // Badges & styling per category
  const getCategoryStyles = () => {
    if (isDaiCat) {
      return {
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        accentBorder: 'border-emerald-500/50',
        glowBg: 'from-emerald-950/40 via-[#070b14] to-teal-950/30',
        pulseColor: 'bg-emerald-400',
        statusLabel: 'ĐẠI CÁT • VƯỢNG KHÍ VÀNG',
        subLabel: 'Thời Khắc Cực Hên (Thiên Thời Đắc Lợi)'
      };
    }
    if (isTieuCat) {
      return {
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
        accentBorder: 'border-teal-500/40',
        glowBg: 'from-teal-950/30 via-[#070b14] to-cyan-950/20',
        pulseColor: 'bg-teal-400',
        statusLabel: 'TIỂU CÁT • HANH THÔNG',
        subLabel: 'Thuận Lợi & Dễ Đạt Thành Tựu'
      };
    }
    if (isDaiHung) {
      return {
        badgeBg: 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_18px_rgba(244,63,94,0.35)]',
        accentBorder: 'border-rose-500/60',
        glowBg: 'from-rose-950/50 via-[#0a0711] to-red-950/40',
        pulseColor: 'bg-rose-500',
        statusLabel: 'ĐẠI HUNG • NGUY CƠ CAO',
        subLabel: 'Thời Khắc Xui/Xung Sát (Cần Phòng Vệ Tuyệt Đối)'
      };
    }
    if (isTieuHung) {
      return {
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        accentBorder: 'border-amber-500/40',
        glowBg: 'from-amber-950/30 via-[#070b14] to-orange-950/20',
        pulseColor: 'bg-amber-400',
        statusLabel: 'TIỂU HUNG • CẦN THẬN TRỌNG',
        subLabel: 'Dễ Trục Trặc Hoặc Chậm Trễ'
      };
    }
    return {
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      accentBorder: 'border-white/15',
      glowBg: 'from-slate-900/40 via-[#070b14] to-indigo-950/20',
      pulseColor: 'bg-blue-400',
      statusLabel: 'BÌNH HÒA • TRUNG TÍNH',
      subLabel: 'Khí Trường Ổn Định Cân Bằng'
    };
  };

  const style = getCategoryStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative w-full rounded-2xl bg-gradient-to-r ${style.glowBg} border ${style.accentBorder} p-4 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden transition-all`}
    >
      {/* Top subtle light rail */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Main Bar Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Live Status & Hour Indicator */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative mt-1 sm:mt-0 shrink-0">
            <div className={`w-3.5 h-3.5 rounded-full ${style.pulseColor} animate-ping absolute inset-0 opacity-75`} />
            <div className={`w-3.5 h-3.5 rounded-full ${style.pulseColor} relative flex items-center justify-center shadow-[0_0_10px_currentColor]`} />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-bold">
                <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                RADAR THỜI GIAN THỰC
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-white">
                Giờ {snapshot.currentHourPillar.stem} {snapshot.currentHourPillar.branch} ({currentSlot.zodiacStarName})
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-200 border border-white/10 hidden sm:inline">
                {microPhase.phaseName} ({microPhase.progressPercentage}%)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badgeBg} font-cinzel`}>
                {style.statusLabel}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {style.subLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Probability Metrics & Countdown */}
        <div className="flex items-center gap-4 sm:gap-6 bg-black/40 rounded-xl px-4 py-2 border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Luck Probability */}
          <div className="text-left">
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              Tỷ Lệ Hên
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-300 flex items-baseline gap-0.5">
              <span>{luckPercentage}%</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Risk Probability */}
          <div className="text-left">
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
              Tỷ Lệ Xui
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-300 flex items-baseline gap-0.5">
              <span>{riskPercentage}%</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10" />

          {/* Countdown */}
          <div className="text-right">
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-2.5 h-2.5 text-teal-400" />
              Hết Giờ Sau
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-teal-200">
              {timeRemainingFormatted}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Toggle Audio Alert */}
          <button
            onClick={() => {
              const nextState = !isAudioAlertActive;
              setIsAudioAlertActive(nextState);
              if (nextState) {
                sacredSound.playCelestialChime(880);
              }
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioAlertActive
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={
              isAudioAlertActive
                ? 'Đang bật chuông thông báo khi chuyển giờ Cát/Hung'
                : 'Bật chuông thông báo tự động khi chuyển giờ'
            }
          >
            {isAudioAlertActive ? <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isAudioAlertActive ? 'Chuông: Bật' : 'Chuông: Tắt'}
            </span>
          </button>

          {/* Expand Details Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 sm:px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
            title="Xem chi tiết 4 lĩnh vực hên xui"
          >
            <span className="hidden sm:inline font-medium text-[11px]">
              {isExpanded ? 'Thu Gọn' : 'Soi 4 Cung'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Open Full Radar Modal */}
          <button
            onClick={onOpenFullRadar}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/25 to-indigo-500/25 hover:from-teal-500/35 hover:to-indigo-500/35 border border-teal-400/50 text-teal-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer shrink-0"
            title="Mở toàn bộ Radar 12 Giờ Thiên Văn"
          >
            <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-cinzel">Radar 24h</span>
          </button>
        </div>
      </div>

      {/* Instant Action & Emergency Remedy Notice */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs text-slate-300">
        <div className="flex items-start sm:items-center gap-2">
          <Zap className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isDaiHung ? 'text-rose-400 animate-bounce' : isDaiCat ? 'text-amber-300' : 'text-teal-400'}`} />
          <span className="text-[11px] sm:text-xs">
            <strong className="text-white font-semibold">Khuyên làm: </strong>
            {currentSlot.bestForActivities[0] || 'Tập trung công việc trọng tâm'}
            <span className="text-slate-500 mx-1.5">|</span>
            <strong className="text-rose-300 font-semibold">Nên tránh: </strong>
            {currentSlot.avoidActivities[0] || 'Quyết định cảm tính'}
          </span>
        </div>

        {quickRemedy && (
          <div className="text-[11px] text-amber-200/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 shrink-0">
            <strong className="text-amber-300">Mẹo hóa giải/khai vận: </strong>
            {quickRemedy}
          </div>
        )}
      </div>

      {/* Expandable 4-Pillar Fortune Radar Analysis */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase font-mono tracking-widest text-slate-300 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                PHÂN TÍCH HÊN - XUI THỜI GIAN THỰC 4 PHƯƠNG DIỆN
              </div>
              <span className="text-[11px] text-slate-400">
                Đang đối chiếu: Can Chi Giờ vs Tứ Trụ Bát Tự
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Tài Lộc */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    💰 Tài Lộc & Tiền Bạc
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    currentSlot.aspects.wealth.verdict === 'HEN'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : currentSlot.aspects.wealth.verdict === 'XUI'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {currentSlot.aspects.wealth.status} ({currentSlot.aspects.wealth.score}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentSlot.aspects.wealth.advice}
                </p>
              </div>

              {/* 2. Sự Nghiệp */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    💼 Công Việc & Hợp Đồng
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    currentSlot.aspects.career.verdict === 'HEN'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : currentSlot.aspects.career.verdict === 'XUI'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {currentSlot.aspects.career.status} ({currentSlot.aspects.career.score}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentSlot.aspects.career.advice}
                </p>
              </div>

              {/* 3. Nhân Duyên */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    ❤️ Nhân Duyên & Quý Nhân
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    currentSlot.aspects.relationship.verdict === 'HEN'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : currentSlot.aspects.relationship.verdict === 'XUI'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {currentSlot.aspects.relationship.status} ({currentSlot.aspects.relationship.score}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentSlot.aspects.relationship.advice}
                </p>
              </div>

              {/* 4. An Toàn */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    🛡️ An Toàn & Đi Lại
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    currentSlot.aspects.safety.verdict === 'HEN'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : currentSlot.aspects.safety.verdict === 'XUI'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {currentSlot.aspects.safety.status} ({currentSlot.aspects.safety.score}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentSlot.aspects.safety.advice}
                </p>
              </div>
            </div>

            {/* Tactical Advice Box */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-200 leading-relaxed">
                {currentSlot.tacticalAdvice}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
