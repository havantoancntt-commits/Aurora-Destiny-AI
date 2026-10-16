// ==========================================
// AURORA DESTINY AI — STRATEGIC CHRONO-NAVIGATOR VIEW
// La Bàn Định Thời Chiến Lược: Thời Gian Thực, Chân Giờ Mặt Trời,
// 4 Khung Giờ Vàng Hành Động & Giao Thức PWA Độc Quyền
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sun,
  Clock,
  MapPin,
  Sparkles,
  FileCheck2,
  Coins,
  PlaneTakeoff,
  ShieldCheck,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Navigation,
  Globe2
} from 'lucide-react';
import { CalculationResult, LanguageCode, EarthlyBranch } from '../types/destiny';
import {
  computeStrategicChronoNavigator,
  ChronoNavigatorReport,
  ChronoNavigatorLocation,
  PRESET_NAVIGATOR_CITIES,
  StrategicActionType
} from '../engine/chronoNavigator';
import { ReflectionJournal } from './ReflectionJournal';
import { UserProfile } from '../types/user';
import { DailyGoldenCompassCard } from './DailyGoldenCompassCard';

interface Props {
  calculation: CalculationResult;
  language: LanguageCode;
  profile?: UserProfile;
  onOpenAlertCenter?: () => void;
  onOpenSponsorshipModal?: () => void;
}

export const StrategicChronoNavigatorView: React.FC<Props> = ({
  calculation,
  language,
  profile,
  onOpenAlertCenter,
  onOpenSponsorshipModal
}) => {
  const [selectedCity, setSelectedCity] = useState<ChronoNavigatorLocation>(PRESET_NAVIGATOR_CITIES[0]);
  const [activeActionType, setActiveActionType] = useState<StrategicActionType>('CONTRACT_SIGNING');
  const [selectedBranch, setSelectedBranch] = useState<EarthlyBranch | null>(null);
  const [subView, setSubView] = useState<'navigator' | 'journal'>('navigator');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [pwaNotificationState, setPwaNotificationState] = useState<'default' | 'granted' | 'denied'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as 'default' | 'granted' | 'denied';
    }
    return 'default';
  });
  const [pwaToastMsg, setPwaToastMsg] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Navigator Report
  const report: ChronoNavigatorReport = useMemo(() => {
    return computeStrategicChronoNavigator(calculation, currentTime, selectedCity);
  }, [calculation, currentTime, selectedCity]);

  const { civilTime, trueSolarTime, snapshot, actionWindows, nextBestWindow, pwaPushPayload } = report;

  // Selected or current slot
  const currentSlot = snapshot.currentSlot;
  const activeSlot = useMemo(() => {
    if (selectedBranch) {
      return snapshot.hourlySlots.find(s => s.branchKey === selectedBranch) || currentSlot;
    }
    return currentSlot;
  }, [selectedBranch, snapshot.hourlySlots, currentSlot]);

  // Request PWA Notification Permission
  const handleRequestPWANotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPwaToastMsg('Trình duyệt không hỗ trợ thông báo đẩy trực tiếp.');
      setTimeout(() => setPwaToastMsg(null), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPwaNotificationState(permission);
      if (permission === 'granted') {
        setPwaToastMsg('Đã kích hoạt đồng bộ thông báo Giờ Vàng PWA thành công!');
        // Show test greeting notification via service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_CHRONO_NOTIFICATION',
            payload: pwaPushPayload
          });
        }
      } else {
        setPwaToastMsg('Thông báo bị từ chối trong cài đặt trình duyệt.');
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
    setTimeout(() => setPwaToastMsg(null), 4000);
  };

  // Try fetching actual device GPS coordinates
  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const customLoc: ChronoNavigatorLocation = {
            cityName: `Vị trí hiện tại (${pos.coords.longitude.toFixed(2)}°E, ${pos.coords.latitude.toFixed(2)}°N)`,
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
            isCustomGps: true
          };
          setSelectedCity(customLoc);
          setPwaToastMsg('Đã cập nhật Chân Giờ Mặt Trời theo tọa độ GPS thiết bị.');
          setTimeout(() => setPwaToastMsg(null), 3500);
        },
        (err) => {
          setPwaToastMsg('Không thể lấy tọa độ GPS. Đang duy trì tọa độ trạm Hà Nội.');
          setTimeout(() => setPwaToastMsg(null), 3500);
        }
      );
    }
  };

  const actionWindowDef = actionWindows[activeActionType];

  return (
    <div className="space-y-6">
      {/* 0. NHẬT THỜI KHANG NINH: LA BÀN HOÀNG KIM 24 GIỜ */}
      {profile && (
        <DailyGoldenCompassCard
          profile={profile}
          calculation={calculation}
          onOpenSponsorshipModal={onOpenSponsorshipModal}
        />
      )}

      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
              La Bàn Định Thời Chiến Lược
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Chrono-Navigator 360°
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hệ thống định vị thiên cơ thời gian thực đối chiếu giữa <strong className="text-slate-200">Chân Giờ Mặt Trời</strong> và trường khí Bát Tự cá nhân, kích hoạt các khung giờ vàng hành động tối thượng.
          </p>
        </div>

        {/* Action Controls & Subview switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/15">
            <button
              onClick={() => setSubView('navigator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                subView === 'navigator'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>La Bàn Giờ Vàng</span>
            </button>
            <button
              onClick={() => setSubView('journal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                subView === 'journal'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nhật Ký Quán Chiếu</span>
            </button>
          </div>

          <button
            onClick={handleRequestPWANotification}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              pwaNotificationState === 'granted'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] border-white/15 hover:border-amber-400/50 text-slate-300 hover:text-amber-200'
            }`}
            title="Đăng ký thông báo PWA nhắc nhở khi đến khung giờ hoàng đạo"
          >
            <Bell className={`w-3.5 h-3.5 ${pwaNotificationState === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{pwaNotificationState === 'granted' ? 'PWA Đã Bật' : 'Bật Nhắc Giờ Vàng'}</span>
          </button>
        </div>
      </div>

      {/* PWA Feedback Toast */}
      {pwaToastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{pwaToastMsg}</span>
          </div>
          <button onClick={() => setPwaToastMsg(null)} className="text-amber-400/60 hover:text-amber-200 cursor-pointer">✕</button>
        </motion.div>
      )}

      {subView === 'journal' ? (
        <ReflectionJournal calculation={calculation} language={language} />
      ) : (
        <>
          {/* 2. REAL-TIME DUAL-CHRONO COCKPIT (CIVIL VS TRUE SOLAR TIME) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Box 1: Dual Clock Synchronization */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-amber-950/20 border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    Đồng Bộ Thời Không Khí Học
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white font-cinzel">
                      {selectedCity.cityName}
                    </span>
                    <button
                      onClick={handleDetectGPS}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Sử dụng GPS thiết bị"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>GPS Tự Động</span>
                    </button>
                  </div>
                </div>

                {/* City Preset Selector */}
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedCity.cityName}
                    onChange={(e) => {
                      const found = PRESET_NAVIGATOR_CITIES.find(c => c.cityName === e.target.value);
                      if (found) setSelectedCity(found);
                    }}
                    className="bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400/60 cursor-pointer"
                  >
                    {PRESET_NAVIGATOR_CITIES.map(c => (
                      <option key={c.cityName} value={c.cityName}>{c.cityName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dual Digital Displays */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {/* Civil Clock */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Giờ Dân Dụng (Civil Time)
                    </span>
                    <span className="text-[10px] text-slate-500">Đồng Hồ GPS</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-light text-slate-200 tracking-wider">
                    {civilTime.formatted}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Múi giờ UTC{calculation.inputSnapshot?.timezoneOffset ? (calculation.inputSnapshot.timezoneOffset >= 0 ? `+${calculation.inputSnapshot.timezoneOffset}` : calculation.inputSnapshot.timezoneOffset) : '+7'}
                  </div>
                </div>

                {/* True Solar Time Clock */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center justify-between text-xs text-amber-300">
                    <span className="flex items-center gap-1.5 font-mono font-bold">
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                      Chân Giờ Mặt Trời (True Solar)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                      {trueSolarTime.deltaFormatted}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tracking-wider">
                    {trueSolarTime.formatted}
                  </div>
                  <div className="text-[11px] text-amber-200/70 font-mono">
                    EoT: {trueSolarTime.equationOfTimeMinutes.toFixed(1)}m · Kinh tuyến: {trueSolarTime.longitudeCorrectionMinutes >= 0 ? '+' : ''}{trueSolarTime.longitudeCorrectionMinutes.toFixed(1)}m
                  </div>
                </div>
              </div>

              {/* Real-time Status Strip */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">
                    Đang ở canh giờ: <strong className="text-white font-mono">{currentSlot.stemNameVi} {currentSlot.branchNameVi}</strong> ({currentSlot.timeRangeStr})
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    currentSlot.isZodiacAuspicious ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {currentSlot.isZodiacAuspicious ? 'HOÀNG ĐẠO' : 'HẮC ĐẠO'} • {currentSlot.zodiacStarName}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Thời lượng còn: <span className="text-amber-300 font-bold">{snapshot.timeRemainingFormatted}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Next Golden Window Smart Kicker */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] via-black/40 to-teal-950/30 border border-teal-500/30 flex flex-col justify-between backdrop-blur-xl shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
                    Cơ Hội Vàng Kế Tiếp
                  </span>
                  <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                    {nextBestWindow.hoursUntil === 0 ? 'Hiện Tại' : `Khoảng ${nextBestWindow.hoursUntil} giờ nữa`}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-cinzel leading-snug">
                  {actionWindows[nextBestWindow.actionType].titleVi}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {nextBestWindow.message}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  Phương vị Tài Thần: <span className="text-teal-300 font-bold">{actionWindows[nextBestWindow.actionType].auspiciousDirection}</span>
                </div>
                <button
                  onClick={() => setActiveActionType(nextBestWindow.actionType)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-teal-300 hover:text-white font-bold cursor-pointer transition-colors"
                >
                  <span>Chi tiết</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. 4 STRATEGIC GOLDEN ACTION TABS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-400 rounded-full" />
                <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                  4 Khung Giờ Vàng Hành Động Cá Nhân Hóa
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                Lựa chọn mục tiêu để nhận chỉ dẫn thực chiến
              </span>
            </div>

            {/* 4 Large Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { type: 'CONTRACT_SIGNING' as StrategicActionType, icon: FileCheck2, label: 'Ký Kết Hợp Đồng', sub: 'Chốt thương vụ & Pháp lý' },
                { type: 'WEALTH_CATALYST' as StrategicActionType, icon: Coins, label: 'Đàm Phán Tài Chính', sub: 'Cầu tài & Đầu tư dòng vốn' },
                { type: 'INITIATION_TRAVEL' as StrategicActionType, icon: PlaneTakeoff, label: 'Khởi Sự & Xuất Hành', sub: 'Gặp đối tác VIP & Bang giao' },
                { type: 'QUIET_REFLECTION' as StrategicActionType, icon: ShieldCheck, label: 'Tĩnh Tâm & Quản Trị', sub: 'Rà soát rủi ro & Bảo toàn' }
              ].map((item) => {
                const isSelected = activeActionType === item.type;
                const windowData = actionWindows[item.type];
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.type}
                    onClick={() => setActiveActionType(item.type)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500/15 via-white/[0.04] to-black/80 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.06] text-slate-300'}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {windowData.idealSlot && (
                          <span className="text-[10px] font-mono bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded border border-white/10">
                            {windowData.idealSlot.timeRangeStr.split(' - ')[0]}
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold font-cinzel ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.sub}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Giờ đắc địa:</span>
                      <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                        Giờ {windowData.idealSlot?.branchNameVi}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Playbook for Active Action Window */}
            <motion.div
              key={activeActionType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.02] border border-amber-500/30 space-y-6 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      Chiến Lược Hành Động Tối Ưu
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {actionWindowDef.tagline}</span>
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-white mt-1">
                    {actionWindowDef.titleVi}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/15 text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Phương Vị Cát Lợi</span>
                    <span className="text-xs font-mono font-bold text-teal-300">{actionWindowDef.auspiciousDirection}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/15 text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Thần Sát Hộ Mệnh</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{actionWindowDef.auspiciousDeity}</span>
                  </div>
                </div>
              </div>

              {/* Rationale Insight */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                <strong className="text-amber-300 font-semibold font-cinzel block mb-1">Cơ Chế Khí Vận & Thiên Cơ:</strong>
                {actionWindowDef.strategicRationale}
              </div>

              {/* Recommended Hours Grid */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Các Canh Giờ Tương Hợp Trong Ngày:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {actionWindowDef.recommendedSlots.map((slot, idx) => (
                    <div
                      key={slot.branchKey}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        slot.branchKey === actionWindowDef.idealSlot?.branchKey
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-black/40 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono">
                          Giờ {slot.stemNameVi} {slot.branchNameVi}
                        </span>
                        {slot.branchKey === actionWindowDef.idealSlot?.branchKey && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-400 text-black font-bold">
                            LÝ TƯỞNG NHẤT
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mb-2">
                        {slot.timeRangeStr}
                      </div>
                      <div className="text-[11px] text-slate-300 leading-snug">
                        {slot.tacticalAdvice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Do vs Avoid Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nên Tiến Hành (Do List)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-emerald-400">
                    {actionWindowDef.doList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs font-mono uppercase tracking-wider">
                    <XCircle className="w-4 h-4" />
                    <span>Cần Thận Trọng & Né Tránh (Avoid List)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-rose-400">
                    {actionWindowDef.avoidList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4. 12-HOUR INTERACTIVE CHRONO-DIAL (BÀN XOAY 12 CANH GIỜ HOÀNG ĐẠO) */}
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold font-cinzel text-white">
                  Toàn Cảnh 12 Canh Giờ Khí Vận Ngày Hôm Nay
                </h4>
                <p className="text-xs text-slate-400">
                  Nhấp vào từng canh giờ để tra cứu chi tiết năng lượng, cát hung và sự tương thích với bản mệnh.
                </p>
              </div>

              {selectedBranch && (
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                >
                  Trở về giờ hiện tại ({currentSlot.branchNameVi})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
              {snapshot.hourlySlots.map((slot) => {
                const isSelected = (selectedBranch ? selectedBranch === slot.branchKey : slot.isCurrent);
                return (
                  <button
                    key={slot.branchKey}
                    onClick={() => setSelectedBranch(slot.branchKey)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : slot.isCurrent
                        ? 'bg-white/[0.08] border-teal-400/60'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{slot.timeRangeStr.split(' - ')[0]}</span>
                        <span className={slot.isZodiacAuspicious ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {slot.isZodiacAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {slot.stemNameVi} {slot.branchNameVi}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Sao {slot.zodiacStarName}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{slot.luckCategory}</span>
                      <span className={`font-bold ${slot.isClash ? 'text-rose-400' : slot.luckPercentage >= 75 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {slot.luckPercentage}đ
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
