// ==========================================
// PERSONAL ENERGY ALERT BANNER COMPONENT
// Thông báo cảnh báo nhẹ nhàng dựa trên dữ liệu biểu đồ năng lượng 12 tháng
// Phát hiện sụt giảm hoặc tăng vọt đột ngột trong chu kỳ để định hướng hành động
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Compass,
  X,
  Info
} from 'lucide-react';
import { EnergyShiftAlert, MonthlyEnergyPoint } from '../engine/personalEnergyEngine';
import { ELEMENT_RELATIONS } from '../engine/canchi';

interface Props {
  alerts: EnergyShiftAlert[];
  onSelectMonth?: (pointMonth: { year: number; month: number }) => void;
  onOpenReportModal?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const PersonalEnergyAlertBanner: React.FC<Props> = ({
  alerts,
  onSelectMonth,
  onOpenReportModal,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);

  if (isDismissed) {
    return (
      <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>
            {alerts.length > 0
              ? `Có ${alerts.length} nhịp biến thiên năng lượng 12 tháng đã được lưu ý`
              : 'Dòng năng lượng 12 tháng bình hòa ổn định'}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-amber-300 hover:text-amber-200 text-[11px] underline cursor-pointer"
        >
          Mở lại thông báo
        </button>
      </div>
    );
  }

  // Nếu không có đột biến nào quá ngưỡng
  if (!alerts || alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-teal-950/20 via-black/40 to-slate-900/30 border border-teal-500/20 backdrop-blur-md text-xs text-slate-300 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-white flex items-center gap-1.5">
              <span>Chu Kỳ 12 Tháng Hài Hòa</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Ổn Định
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Không ghi nhận biến động sụt giảm hay tăng vọt cực đoan; khí vận chuyển dịch êm thuận theo Đại Vận.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  const dropCount = alerts.filter((a) => a.type === 'drop').length;
  const surgeCount = alerts.filter((a) => a.type === 'surge').length;
  const currentAlert = alerts[activeAlertIndex] || alerts[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl overflow-hidden border backdrop-blur-xl shadow-xl transition-all ${
        currentAlert.type === 'drop'
          ? 'bg-gradient-to-b from-amber-950/30 via-[#0e1017] to-black/60 border-amber-500/30 shadow-[0_4px_24px_rgba(245,158,11,0.08)]'
          : 'bg-gradient-to-b from-emerald-950/30 via-[#0e1317] to-black/60 border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.08)]'
      } ${className}`}
    >
      {/* BANNER HEADER */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              currentAlert.type === 'drop'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {currentAlert.type === 'drop' ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                Cảnh Báo Nhịp Vận 12 Tháng
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border ${
                  currentAlert.type === 'drop'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {alerts.length} nhịp dao động ({dropCount > 0 ? `${dropCount} giảm` : ''}
                {dropCount > 0 && surgeCount > 0 ? ' • ' : ''}
                {surgeCount > 0 ? `${surgeCount} tăng vọt` : ''})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Hệ thống quan sát chu kỳ năng lượng phát hiện biến thiên giữa các tháng liên tiếp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BANNER CONTENT */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-3.5 sm:p-5 space-y-4"
          >
            {/* Multiple Alerts Tab Switcher if > 1 */}
            {alerts.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {alerts.map((al, idx) => (
                  <button
                    key={al.id}
                    onClick={() => setActiveAlertIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeAlertIndex === idx
                        ? al.type === 'drop'
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm'
                          : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {al.type === 'drop' ? (
                      <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{al.label}</span>
                    <span className="font-mono text-[10px]">
                      {al.delta > 0 ? `+${al.delta}đ` : `${al.delta}đ`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Current Selected Alert Card */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                currentAlert.type === 'drop'
                  ? 'bg-amber-950/15 border-amber-500/25'
                  : 'bg-emerald-950/15 border-emerald-500/25'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1.5 rounded-lg ${
                      currentAlert.type === 'drop'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {currentAlert.type === 'drop' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {currentAlert.title}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="text-amber-300 font-mono font-medium">{currentAlert.fullLabel}</span>
                      <span>({currentAlert.canChiName})</span>
                      <span>• Hành {ELEMENT_RELATIONS[currentAlert.element]?.vi || currentAlert.element}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                      currentAlert.type === 'drop'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    Biến động: {currentAlert.delta > 0 ? `+${currentAlert.delta}` : currentAlert.delta} điểm
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({currentAlert.fromScore}đ → {currentAlert.toScore}đ)
                  </span>
                </div>
              </div>

              {/* Guidance Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAlert.shortWarning}
              </p>

              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Định Hướng Chiến Lược:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentAlert.detailedGuidance}
                </p>
                <div className="text-[11px] text-teal-300 font-medium pt-0.5">
                  {currentAlert.strategicRemedy}
                </div>
                {currentAlert.favorableElementHint && (
                  <div className="text-[10px] text-purple-300 italic pt-0.5 border-t border-white/5">
                    ✨ {currentAlert.favorableElementHint}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {onSelectMonth && (
                  <button
                    onClick={() => onSelectMonth({ year: currentAlert.year, month: currentAlert.month })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all cursor-pointer border border-white/10 text-[11px]"
                  >
                    <span>Xem điểm này trên biểu đồ</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </button>
                )}

                {onOpenReportModal && (
                  <button
                    onClick={onOpenReportModal}
                    className="text-teal-300 hover:text-teal-200 underline font-medium text-[11px] cursor-pointer"
                  >
                    Mở Báo Cáo Chuyên Sâu Cả Năm
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
