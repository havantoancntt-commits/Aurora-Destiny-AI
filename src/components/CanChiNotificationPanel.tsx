// ==========================================================
// AURORA DESTINY AI — CAN-CHI & MULTI-PROFILE PUSH NOTIFICATION COMMAND PANEL
// Ultra-luxury personalized push notifications & multi-profile watchdog
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Send,
  Calendar,
  Compass,
  RefreshCw,
  Info,
  Sliders,
  ChevronRight,
  Trash2,
  Crown,
  Users,
  Coins,
  ShieldAlert,
  Moon,
  Sun,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CalculationResult, LanguageCode } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  CanChiNotificationConfig,
  getNotificationConfig,
  saveNotificationConfig,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  sendMultiProfileTestPush,
  send12hTrueSolarTestPush,
  getNext12hTrueSolarMilestones,
  getUpcomingAlertSchedule,
  getNotificationHistory,
  clearNotificationHistory,
  CanChiNotificationLog,
  UpcomingAlertItem,
  TrueSolarMilestonesInfo
} from '../services/destinyPushNotification';
import {
  scanMajorEventsForProfiles,
  MajorDestinyEvent
} from '../engine/destinyAlertWatchdog';
import { sacredSound } from '../services/soundService';

interface Props {
  calculation: CalculationResult | null;
  profile: UserProfile | null;
  profiles?: UserProfile[];
  language?: LanguageCode;
  onClose?: () => void;
}

export const CanChiNotificationPanel: React.FC<Props> = ({
  calculation,
  profile,
  profiles = [],
  language = 'vi',
  onClose
}) => {
  const [config, setConfig] = useState<CanChiNotificationConfig>(() => getNotificationConfig());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting12h, setIsTesting12h] = useState<boolean>(false);
  const [test12hResult, setTest12hResult] = useState<{ success: boolean; message: string } | null>(null);
  const [milestonesInfo, setMilestonesInfo] = useState<TrueSolarMilestonesInfo | null>(() =>
    getNext12hTrueSolarMilestones(calculation, profile)
  );
  const [activeTab, setActiveTab] = useState<'watchdog' | 'settings' | 'schedule' | 'history'>('watchdog');
  const [schedule, setSchedule] = useState<UpcomingAlertItem[]>([]);
  const [history, setHistory] = useState<CanChiNotificationLog[]>([]);
  const [watchdogEvents, setWatchdogEvents] = useState<MajorDestinyEvent[]>([]);
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<string>('ALL');

  const allActiveProfiles = profiles.length > 0 ? profiles : (profile ? [profile] : []);

  // Load schedule, watchdog events, 12h milestones, and history
  const refreshData = () => {
    if (calculation && profile) {
      setSchedule(getUpcomingAlertSchedule(calculation, profile));
      setMilestonesInfo(getNext12hTrueSolarMilestones(calculation, profile));
    }
    setHistory(getNotificationHistory());

    if (allActiveProfiles.length > 0) {
      const calcsMap: Record<string, CalculationResult | null> = {};
      if (profile && calculation) {
        calcsMap[profile.id] = calculation;
      }
      const events = scanMajorEventsForProfiles(allActiveProfiles, calcsMap, new Date());
      setWatchdogEvents(events);
    }
  };

  useEffect(() => {
    refreshData();
    setPermission(getNotificationPermission());
    setMilestonesInfo(getNext12hTrueSolarMilestones(calculation, profile));
  }, [calculation, profile, profiles, config]);

  // Request permission
  const handleRequestPermission = async () => {
    sacredSound.playCelestialChime(768);
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      const updated = { ...config, enabled: true };
      setConfig(updated);
      saveNotificationConfig(updated);
    }
  };

  // Update a config field
  const updateField = <K extends keyof CanChiNotificationConfig>(
    key: K,
    value: CanChiNotificationConfig[K]
  ) => {
    sacredSound.playCelestialChime(528);
    const next = { ...config, [key]: value };
    setConfig(next);
    saveNotificationConfig(next);
  };

  // Test multi-profile notification button
  const handleSendTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const calcsMap: Record<string, CalculationResult | null> = {};
      if (profile && calculation) calcsMap[profile.id] = calculation;
      const res = await sendMultiProfileTestPush(allActiveProfiles, calcsMap);
      setTestResult(res);
      setPermission(getNotificationPermission());
      refreshData();
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Có lỗi xảy ra khi gửi thông báo'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test 12-hour True Solar Time Shift notification button
  const handleSend12hTest = async () => {
    setIsTesting12h(true);
    setTest12hResult(null);

    try {
      sacredSound.playCelestialChime(639);
      const res = await send12hTrueSolarTestPush(calculation, profile);
      setTest12hResult(res);
      setPermission(getNotificationPermission());
      refreshData();
    } catch (e: any) {
      setTest12hResult({
        success: false,
        message: e?.message || 'Có lỗi xảy ra khi gửi thông báo chuyển vận 12h'
      });
    } finally {
      setIsTesting12h(false);
    }
  };

  const handleClearHistory = () => {
    clearNotificationHistory();
    setHistory([]);
  };

  // Filtered watchdog events
  const filteredEvents = selectedProfileFilter === 'ALL'
    ? watchdogEvents
    : watchdogEvents.filter((e) => e.profileId === selectedProfileFilter);

  return (
    <div className="space-y-5 text-slate-200">
      {/* 1. Header Banner with Permission Status & Instant Simulation */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950/80 to-purple-950/40 border border-amber-500/20 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                  Hệ Thống Cảnh Báo Vận Mệnh Thông Minh
                </h3>
                {permission === 'granted' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã Kích Hoạt Đẩy Thiết Bị
                  </span>
                ) : permission === 'denied' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Bị Chặn Trên Trình Duyệt
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Chờ Cấp Quyền Đẩy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Tự động giám sát biến động <strong className="text-amber-300">Thiên Khắc Địa Xung, Lục Xung, Quý Nhân, Lộc Thần, Tiết Khí</strong> cho tất cả hồ sơ gia đình & đối tác bạn đã lưu trên ứng dụng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
              >
                Cấp Quyền Đẩy Ngay
              </button>
            ) : (
              <>
                <button
                  onClick={handleSendTest}
                  disabled={isTesting}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Phát thông báo đẩy thử nghiệm cho hồ sơ bản mệnh"
                >
                  <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Đang gửi...' : 'Thử Can-Chi'}</span>
                </button>
                <button
                  onClick={handleSend12hTest}
                  disabled={isTesting12h}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 text-amber-200 border border-amber-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
                  title="Phát thử thông báo chuyển vận 12 giờ theo Giờ Sinh Chân Mặt Trời"
                >
                  <Sun className={`w-3.5 h-3.5 text-amber-400 ${isTesting12h ? 'animate-spin' : ''}`} />
                  <span>{isTesting12h ? 'Đang gửi...' : 'Thử Chuyển Vận 12h'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Test Result Feedback */}
        {(testResult || test12hResult) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              (testResult?.success || test12hResult?.success)
                ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-200 border-rose-500/40'
            }`}
          >
            {(testResult?.success || test12hResult?.success) ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{testResult?.message || test12hResult?.message}</span>
            <button
              onClick={() => {
                setTestResult(null);
                setTest12hResult(null);
              }}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('watchdog')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'watchdog'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Sự Kiện Đa Hồ Sơ ({watchdogEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          <span>Lịch 12 Canh Giờ ({schedule.filter((s) => s.willTrigger).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Cấu Hình Thông Báo</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Nhật Ký Đã Phát ({history.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: WATCHDOG MULTI-PROFILE EVENTS */}
        {activeTab === 'watchdog' && (
          <motion.div
            key="watchdog"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Profile Filter Pills */}
            {allActiveProfiles.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-mono text-[11px] shrink-0">Lọc theo hồ sơ:</span>
                <button
                  onClick={() => setSelectedProfileFilter('ALL')}
                  className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
                    selectedProfileFilter === 'ALL'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  Tất cả hồ sơ ({watchdogEvents.length})
                </button>
                {allActiveProfiles.map((p) => {
                  const count = watchdogEvents.filter((e) => e.profileId === p.id).length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfileFilter(p.id)}
                      className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer shrink-0 ${
                        selectedProfileFilter === p.id
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {p.name} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-white font-cinzel">Hôm Nay Thuộc Vận Trình Bình Hòa</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Không phát hiện xung khắc cực đoan hay điểm bất thường lớn nào đối với các lá số đang theo dõi. Mọi việc duy trì nhịp độ ổn định và hanh thông.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[520px] overflow-y-auto custom-scrollbar p-0.5">
                {filteredEvents.map((event) => {
                  const isPositive =
                    event.severity === 'CRITICAL_POSITIVE' ||
                    event.severity === 'HIGH_POSITIVE' ||
                    event.eventType === 'THIEN_AT_QUY_NHAN' ||
                    event.eventType === 'LOC_THAN_TAI_BACH' ||
                    event.eventType === 'TAM_HOP_CAT_KHANH';

                  const isDanger =
                    event.severity === 'HIGH_DANGER' ||
                    event.eventType === 'THIEN_KHAC_DIA_XUNG';

                  return (
                    <div
                      key={event.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isPositive
                          ? 'bg-gradient-to-br from-amber-950/40 via-slate-950/70 to-emerald-950/30 border-amber-500/35 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                          : isDanger
                          ? 'bg-gradient-to-br from-rose-950/50 via-slate-950/70 to-red-950/40 border-rose-500/40 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                          : 'bg-gradient-to-br from-slate-950/70 to-slate-900/60 border-amber-500/20 hover:border-amber-500/35'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                              isPositive
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : isDanger
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800 text-slate-300 border-white/10'
                            }`}
                          >
                            {event.eventType === 'THIEN_AT_QUY_NHAN' ? (
                              <Crown className="w-5 h-5 text-amber-400" />
                            ) : event.eventType === 'LOC_THAN_TAI_BACH' ? (
                              <Coins className="w-5 h-5 text-emerald-400" />
                            ) : isDanger ? (
                              <ShieldAlert className="w-5 h-5 text-rose-400" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-amber-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full border ${
                                  isPositive
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : isDanger
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : 'bg-slate-800 text-slate-300 border-white/10'
                                }`}
                              >
                                {event.relationshipTag} • {event.profileName}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {event.targetTime}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                              {event.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5 font-medium">
                              {event.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                              isPositive
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isDanger
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            Độ Ưu Tiên: {event.urgency}%
                          </span>
                        </div>
                      </div>

                      {/* Summary & Detailed Advice */}
                      <div className="pt-3 space-y-2.5">
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {event.summary}
                        </p>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 leading-relaxed space-y-1">
                          <strong className="text-amber-300 font-medium block">
                            🎯 Lời Khuyên Hành Động & Định Tâm:
                          </strong>
                          <span>{event.detailedAdvice}</span>
                        </div>

                        {/* Actionable Dos and Donts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                            <span className="text-emerald-400 font-bold block mb-1">
                              ✓ Nên Thực Hiện:
                            </span>
                            <ul className="space-y-0.5 text-slate-300 text-[11px] list-disc list-inside">
                              {event.actionableDos.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs">
                            <span className="text-rose-400 font-bold block mb-1">
                              ✕ Cần Thận Trọng / Tránh:
                            </span>
                            <ul className="space-y-0.5 text-slate-300 text-[11px] list-disc list-inside">
                              {event.actionableDonts.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Directions & Colors */}
                        {(event.favorableDirections || event.luckyColors) && (
                          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                            {event.favorableDirections && (
                              <span>🧭 Hướng xuất hành cát: <strong className="text-amber-300">{event.favorableDirections}</strong></span>
                            )}
                            {event.luckyColors && (
                              <span>🎨 Màu sắc trợ vận: <strong className="text-teal-300">{event.luckyColors}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: SCHEDULE OF 12 HOURS */}
        {activeTab === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Danh sách 12 canh giờ hôm nay & dự kiến kích hoạt thông báo:</span>
              <span>Dựa trên lá số: <strong className="text-amber-300">{profile?.name || 'Đương số'}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto custom-scrollbar p-0.5">
              {schedule.map((item, index) => {
                const isAuspicious = item.alertType === 'AUSPICIOUS';
                const isClash = item.alertType === 'INAUSPICIOUS';

                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.slot.isCurrent
                        ? 'bg-gradient-to-br from-teal-950/60 to-black/80 border-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                        : isAuspicious
                        ? 'bg-white/[0.03] border-amber-500/25 hover:border-amber-500/40'
                        : isClash
                        ? 'bg-white/[0.03] border-rose-500/25 hover:border-rose-500/40'
                        : 'bg-white/[0.02] border-white/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-cinzel">
                          Giờ {item.slot.stemNameVi} {item.slot.branchNameVi}
                        </span>
                        {item.slot.isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-teal-500/30 text-teal-300 border border-teal-500/50">
                            Hiện tại
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {item.timeRange}
                      </span>
                    </div>

                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">
                          Sao {item.slot.zodiacStarName} ({item.slot.isZodiacAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo'})
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          isAuspicious
                            ? 'bg-amber-500/20 text-amber-300'
                            : isClash
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.slot.resonanceScore}% Hên
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                        {item.previewMessage}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                        <span className="text-slate-400">Trạng thái:</span>
                        {item.willTrigger ? (
                          <span className="text-emerald-300 flex items-center gap-1 font-medium">
                            <BellRing className="w-3 h-3 text-emerald-400" /> Sẽ gửi thông báo
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <BellOff className="w-3 h-3" /> Không báo động
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Master Switch */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Kích Hoạt Nhắc Nhở Tự Động</span>
                  {config.enabled && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <p className="text-xs text-slate-400">
                  Tự động đánh giá và đẩy thông báo khi đến giờ hoàng đạo hoặc giờ xung khắc của bạn.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>

            {/* 12-Hour True Solar Time Shift Notification Feature Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/35 via-slate-950/80 to-purple-950/35 border border-amber-500/35 space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sun className="w-4 h-4 text-amber-400" />
                    </span>
                    <h4 className="text-sm font-bold text-white font-cinzel">
                      Cảnh Báo Chuyển Vận 12 Giờ Theo Giờ Sinh Chân Mặt Trời
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Chu Kỳ 12h Diệu Dụng
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Hệ thống tự động kích hoạt thông báo đẩy Web Push định kỳ 12 giờ một lần bám sát trục nhật quỹ chân mặt trời của bản mệnh (mốc sinh thực sau khi bù kinh độ địa lý & phương trình EOT, cùng mốc đối cực nghịch chuyển 12 giờ sau). Tổng hợp thời cơ Đại Vận 10 năm, Tiết Khí thiên văn, Dụng Thần và các khung giờ cát khánh trong 12 giờ kế tiếp.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={config.notify12hTrueSolarShift}
                    onChange={(e) => updateField('notify12hTrueSolarShift', e.target.checked)}
                    disabled={!config.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 disabled:opacity-40"></div>
                </label>
              </div>

              {/* Milestone Details */}
              {milestonesInfo ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mốc 1: Bình Minh Bản Mệnh</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span className="text-base font-bold text-amber-300 font-mono">
                        {milestonesInfo.milestone1TimeStr}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Giờ sinh chân mặt trời (Dương thăng)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mốc 2: Tịch Chiếu Đối Cực</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span className="text-base font-bold text-purple-300 font-mono">
                        {milestonesInfo.milestone2TimeStr}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Đối xứng kinh tuyến 12h (Âm quy)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-teal-500/10 border border-teal-500/30 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Mốc Chuyển Vận Tiếp Theo</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span className="text-base font-bold text-teal-300 font-mono">
                        {milestonesInfo.timeRemainingFormatted}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {milestonesInfo.nextPhase === 1 ? 'Đang đón Mốc 1 (Bản Mệnh)' : 'Đang đón Mốc 2 (Đối Cực)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-400">
                  Chọn hoặc lập lá số để kích hoạt tính toán mốc giờ sinh chân mặt trời chính xác.
                </div>
              )}

              {/* Action row with test button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono text-slate-400">
                  Trạng thái: {config.notify12hTrueSolarShift && config.enabled ? (
                    <strong className="text-emerald-400">Sẵn sàng đẩy định kỳ mỗi 12 giờ</strong>
                  ) : (
                    <span className="text-slate-500">Đang tạm ngưng</span>
                  )}
                </span>
                <button
                  onClick={handleSend12hTest}
                  disabled={isTesting12h || !config.enabled}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-40 self-end sm:self-auto"
                >
                  <Send className={`w-3 h-3 ${isTesting12h ? 'animate-spin' : ''}`} />
                  <span>{isTesting12h ? 'Đang gửi...' : 'Phát Thử Thông Báo 12h'}</span>
                </button>
              </div>
            </div>

            {/* Individual Notification Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Multi-Profile Watchdog Switch */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono uppercase">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giám Sát Toàn Bộ Hồ Sơ Gia Đình</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tự động cảnh báo sự kiện đại cát hoặc xung sát cho tất cả người thân, vợ chồng, con cái đã lưu.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyMultiProfiles}
                  onChange={(e) => updateField('notifyMultiProfiles', e.target.checked)}
                  disabled={!config.enabled}
                  className="mt-1 w-4 h-4 text-teal-600 rounded bg-black/40 border-white/20 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Major Clashes Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 font-mono uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Thiên Khắc Địa Xung & Lục Xung</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cảnh báo trọng yếu khi gặp ngày hoặc giờ trực xung với Chi Năm hoặc Chi Ngày sinh của bạn.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyMajorClashes}
                  onChange={(e) => updateField('notifyMajorClashes', e.target.checked)}
                  disabled={!config.enabled}
                  className="mt-1 w-4 h-4 text-teal-600 rounded bg-black/40 border-white/20 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Quý Nhân & Lộc Thần Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono uppercase">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thiên Ất Quý Nhân & Lộc Thần</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Báo trước khi bước vào canh giờ cát khánh, quý nhân tương trợ hoặc đắc vị tài lộc hanh thông.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyQuyNhanLocThan}
                  onChange={(e) => updateField('notifyQuyNhanLocThan', e.target.checked)}
                  disabled={!config.enabled}
                  className="mt-1 w-4 h-4 text-teal-600 rounded bg-black/40 border-white/20 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* 24 Solar Terms Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 font-mono uppercase">
                    <Compass className="w-3.5 h-3.5 text-teal-400" />
                    <span>Chuyển Giao 24 Tiết Khí</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Điểm tin thiên văn thời điểm Đất Trời chuyển giao tiết khí (Lập Xuân, Hạ Chí, Thu Phân, Đông Chí...).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifySolarTerms}
                  onChange={(e) => updateField('notifySolarTerms', e.target.checked)}
                  disabled={!config.enabled}
                  className="mt-1 w-4 h-4 text-teal-600 rounded bg-black/40 border-white/20 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Advance Notice Selector */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 font-mono uppercase">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Thời Điểm Gửi Báo</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nhắc nhở chuẩn bị tâm thế trước khi chuyển giao canh giờ mới.
                  </p>
                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      onClick={() => updateField('advanceNoticeMinutes', 10)}
                      disabled={!config.enabled}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        config.advanceNoticeMinutes === 10
                          ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      Trước 10 phút (Khuyên dùng)
                    </button>
                    <button
                      onClick={() => updateField('advanceNoticeMinutes', 0)}
                      disabled={!config.enabled}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        config.advanceNoticeMinutes === 0
                          ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      Đúng giờ chuyển canh
                    </button>
                  </div>
                </div>
              </div>

              {/* Sacred Sound & Vibration */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 font-mono uppercase">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Chuông Huyền Học 528Hz</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Phát chuông tịnh hóa Solfeggio 528Hz & rung phản hồi định tâm khi thông báo xuất hiện.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.soundEnabled}
                        onChange={(e) => updateField('soundEnabled', e.target.checked)}
                        disabled={!config.enabled}
                        className="w-3.5 h-3.5 text-purple-600 rounded bg-black/40 border-white/20 cursor-pointer"
                      />
                      <span>Chuông Âm</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.vibrate}
                        onChange={(e) => updateField('vibrate', e.target.checked)}
                        disabled={!config.enabled}
                        className="w-3.5 h-3.5 text-purple-600 rounded bg-black/40 border-white/20 cursor-pointer"
                      />
                      <span>Rung Thiết Bị</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Lịch sử các thông báo đẩy đã phát gần đây:</span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa lịch sử</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  Chưa có thông báo nào được gửi. Khi hệ thống tự động phát hiện sự kiện hoặc khi bạn nhấn "Phát Thử Thông Báo Đẩy", nhật ký sẽ lưu tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar p-0.5">
                {history.map((log) => {
                  const isSolar12h = log.type === 'SOLAR_12H_SHIFT';
                  const isAuspicious = !isSolar12h && (log.type === 'AUSPICIOUS' || log.severity === 'CRITICAL_POSITIVE' || log.severity === 'HIGH_POSITIVE');
                  const isClash = !isSolar12h && (log.type === 'INAUSPICIOUS' || log.severity === 'HIGH_DANGER' || log.severity === 'CAUTION_WARNING');

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border space-y-1 transition-all ${
                        isSolar12h
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {isSolar12h ? (
                            <span className="p-1 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-500/40">
                              <Sun className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          ) : isAuspicious ? (
                            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          ) : isClash ? (
                            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
                              <Bell className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="font-bold text-white font-cinzel">
                            {log.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.timeFormatted}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-6">
                        {log.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
