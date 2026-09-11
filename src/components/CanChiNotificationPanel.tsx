// ==========================================================
// AURORA DESTINY AI — CAN-CHI PUSH NOTIFICATION COMMAND PANEL
// Personalized hourly push notification configuration & schedule
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
  Trash2
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
  getUpcomingAlertSchedule,
  getNotificationHistory,
  clearNotificationHistory,
  CanChiNotificationLog,
  UpcomingAlertItem
} from '../services/destinyPushNotification';
import { sacredSound } from '../services/soundService';

interface Props {
  calculation: CalculationResult | null;
  profile: UserProfile | null;
  language?: LanguageCode;
  onClose?: () => void;
}

export const CanChiNotificationPanel: React.FC<Props> = ({
  calculation,
  profile,
  language = 'vi',
  onClose
}) => {
  const [config, setConfig] = useState<CanChiNotificationConfig>(() => getNotificationConfig());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'schedule' | 'history'>('settings');
  const [schedule, setSchedule] = useState<UpcomingAlertItem[]>([]);
  const [history, setHistory] = useState<CanChiNotificationLog[]>([]);

  // Load schedule and history
  const refreshData = () => {
    if (calculation && profile) {
      setSchedule(getUpcomingAlertSchedule(calculation, profile));
      setHistory(getNotificationHistory());
    }
  };

  useEffect(() => {
    refreshData();
    setPermission(getNotificationPermission());
  }, [calculation, profile, config]);

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

  // Test notification button
  const handleSendTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await sendTestNotification(calculation, profile);
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

  const handleClearHistory = () => {
    clearNotificationHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-5 text-slate-200">
      {/* 1. Header Banner with Permission Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-black/70 to-teal-950/30 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                  Thông Báo Đẩy Can Chi Cá Nhân Hóa
                </h3>
                {permission === 'granted' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã Kích Hoạt
                  </span>
                ) : permission === 'denied' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Bị Chặn Trên Trình Duyệt
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Cần Cấp Quyền
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Hệ thống tự động đồng bộ theo 12 canh giờ Bát Tự & Tử Vi, nhắc nhở tức thời các thời điểm <strong className="text-amber-300">Hoàng Đạo / Quý Nhân</strong> và cảnh báo các khung giờ <strong className="text-rose-300">Hắc Đạo / Xung Khắc</strong> đối với bản mệnh của bạn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
              >
                Cấp Quyền Ngay
              </button>
            ) : (
              <button
                onClick={handleSendTest}
                disabled={isTesting}
                className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Gửi thông báo đẩy mẫu tới thiết bị"
              >
                <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Đang gửi...' : 'Gửi Thử Mẫu'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-200 border-rose-500/40'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{testResult.message}</span>
            <button
              onClick={() => setTestResult(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Tùy Biến Cảnh Báo</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          <span>Lịch 12 Canh Giờ ({schedule.filter((s) => s.willTrigger).length} Báo Động)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Nhật Ký ({history.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: SETTINGS */}
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

            {/* Individual Notification Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Auspicious Hours Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giờ Hoàng Đạo & Quý Nhân</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Báo trước khi bước vào các canh giờ <strong className="text-amber-300">Tam Hợp, Lục Hợp, Thiên Ất Quý Nhân</strong> hoặc ngũ hành Dụng Thần tương sinh.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyAuspiciousHours}
                  onChange={(e) => updateField('notifyAuspiciousHours', e.target.checked)}
                  disabled={!config.enabled}
                  className="mt-1 w-4 h-4 text-teal-600 rounded bg-black/40 border-white/20 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Inauspicious / Clash Hours Trigger */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 font-mono uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Giờ Hắc Đạo & Xung Khắc</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cảnh báo thận trọng khi bước vào canh giờ <strong className="text-rose-300">Lục Xung</strong> với chi ngày/năm sinh hoặc phạm hung tinh, kỵ thần.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyInauspiciousHours}
                  onChange={(e) => updateField('notifyInauspiciousHours', e.target.checked)}
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
                      <span>Rung Điện Thoại</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
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

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Lịch sử các thông báo đẩy đã gửi gần đây:</span>
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
                  Chưa có thông báo nào được gửi. Khi đến canh giờ mới hoặc khi bạn nhấn "Gửi Thử Mẫu", nhật ký sẽ lưu tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar p-0.5">
                {history.map((log) => {
                  const isAuspicious = log.type === 'AUSPICIOUS';
                  const isClash = log.type === 'INAUSPICIOUS';

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {isAuspicious ? (
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
