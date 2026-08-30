// ==========================================
// BACKTESTING STUDIO & HISTORICAL EMPIRICAL FIT
// Ultra-luxury animated Backtesting Studio
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { HistoricalEvent, BacktestResult, EventCategory, EventImpact } from '../types/backtest';
import { CalculationResult } from '../types/destiny';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';

interface Props {
  events: HistoricalEvent[];
  backtestResult: BacktestResult;
  calculation: CalculationResult;
  language: LanguageCode;
  onAddEvent: (eventData: Partial<HistoricalEvent>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export const BacktestingStudio: React.FC<Props> = ({
  events,
  backtestResult,
  calculation,
  language,
  onAddEvent,
  onDeleteEvent
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [year, setYear] = useState<number>(2021);
  const [month, setMonth] = useState<number>(6);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Career');
  const [impact, setImpact] = useState<EventImpact>('Breakthrough');
  const [intensity, setIntensity] = useState<number>(4);
  const [userConfidence, setUserConfidence] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddEvent({
        profileId: calculation.profileId,
        year,
        month,
        title,
        category,
        impact,
        intensity,
        userConfidence,
        description,
        evidenceNote
      });
      setTitle('');
      setDescription('');
      setEvidenceNote('');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel">
              Kiểm Chứng & Đối Chiếu Lịch Sử Thực Nghiệm
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Đối chiếu sự kiện thực tế trong quá khứ để đo lường độ trùng khớp vận trình số học.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi Nhận Sự Kiện Quá Khứ</span>
        </motion.button>
      </motion.div>

      {/* 1. SCORE OVERVIEW BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-teal-950/30 border border-teal-500/30 p-5 sm:p-7 backdrop-blur-2xl shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/15 border border-teal-500/40 text-teal-300 shadow-sm">
                {backtestResult.confidenceBand}
              </span>
              <span className="text-xs text-slate-400">
                ({backtestResult.totalEventsAnalyzed} sự kiện đã kiểm chứng)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-cinzel">
              Độ Nhất Quán Vận Trình Thực Nghiệm
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Chỉ số đo lường mức độ tương thích giữa biên độ sóng năng lượng toán học và kết quả các bước ngoặt thực tế trong đời sống.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-black/60 border border-teal-500/40 shadow-inner">
              <div className="text-3xl sm:text-4xl font-light font-mono text-teal-300">
                {backtestResult.destinyConsistencyScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold mt-1">Khớp Thực Nghiệm</span>
            </div>
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/10 text-center text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[10px] text-slate-400">Trùng Khớp Thuận Lợi</div>
            <div className="text-lg font-bold font-mono text-teal-400 mt-0.5">
              {backtestResult.matchedEventsCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[10px] text-slate-400">Dao Động Trung Tính</div>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {backtestResult.neutralEventsCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[10px] text-slate-400">Lệch Mẫu Tích Cực / Dị Biệt</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {backtestResult.divergentEventsCount}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. CHRONOLOGICAL EVENT COMPARISONS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-2xl shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Danh Sách Sự Kiện & Phân Tích Độ Khớp
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {events.length} mốc thời gian
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/40 border border-dashed border-white/10 space-y-2">
            <History className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm text-slate-300 font-semibold">Chưa có sự kiện nào</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Hãy bấm "Ghi Nhận Sự Kiện Quá Khứ" (VD: Đổi việc 2021, Mua nhà 2023, Khởi nghiệp...) để hệ thống tính toán điểm tương thích.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backtestResult.comparisons.map((cmp) => {
              const originalEvent = events.find((e) => e.id === cmp.eventId);
              const isMatch = cmp.status === 'Strong Match';
              const isDivergence = cmp.status === 'Anomalous Divergence';

              return (
                <motion.div
                  key={cmp.eventId}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMatch
                      ? 'bg-black/50 border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                      : isDivergence
                      ? 'bg-black/50 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-white/10 text-slate-200">
                        Năm {cmp.eventYear}
                      </span>
                      <h4 className="text-sm font-bold text-white">{cmp.eventTitle}</h4>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        {cmp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono ${
                          isMatch
                            ? 'bg-teal-950 text-teal-300 border border-teal-800'
                            : isDivergence
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {cmp.status} ({cmp.matchScore}%)
                      </span>
                      {originalEvent && (
                        <button
                          onClick={() => onDeleteEvent(cmp.eventId)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Xóa sự kiện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2.5 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">Tác động thực tế: </span>
                      <span className="font-semibold text-slate-200">{cmp.actualImpact}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Sóng cơ hội / Thận trọng: </span>
                      <span className="font-mono text-teal-400">{cmp.calculatedOpportunityScore}%</span> / <span className="font-mono text-rose-400">{cmp.calculatedCautionScore}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Thập Thần Lưu Niên: </span>
                      <span className="font-mono text-purple-300">{cmp.transitTenGod}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    💡 {cmp.explanation}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 3. EXPLAINABLE STRENGTHS & ANOMALIES SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
        >
          <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Điểm Trùng Khớp Nổi Bật</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {backtestResult.strengthsSummary.map((s, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
        >
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Phân Tích Dị Biệt & Ý Chí Tự Do</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {backtestResult.anomaliesSummary.map((s, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ADD HISTORICAL EVENT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 space-y-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white font-cinzel">
                  Ghi Nhận Bước Ngoặt Lịch Sử
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Năm diễn ra *</label>
                    <input
                      type="number"
                      min={1970}
                      max={new Date().getFullYear()}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:border-teal-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tháng (Tùy chọn)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tiêu đề sự kiện *</label>
                  <input
                    type="text"
                    placeholder="VD: Thành lập công ty, Mua nhà, Thăng chức..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:border-teal-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Lĩnh vực</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EventCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:border-teal-400 focus:outline-none"
                    >
                      <option value="Career">Sự nghiệp</option>
                      <option value="Finance">Tài chính / Đầu tư</option>
                      <option value="Relationship">Hôn nhân / Tình cảm</option>
                      <option value="Health">Sức khỏe</option>
                      <option value="Relocation">Di chuyển / Định cư</option>
                      <option value="MajorBreakthrough">Bước ngoặt lớn</option>
                      <option value="LossOrSetback">Thử thách / Tổn thất</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Mức độ tác động</label>
                    <select
                      value={impact}
                      onChange={(e) => setImpact(e.target.value as EventImpact)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:border-teal-400 focus:outline-none"
                    >
                      <option value="Breakthrough">Đột phá rực rỡ</option>
                      <option value="Positive">Thuận lợi / Tích cực</option>
                      <option value="Neutral">Bình hòa / Không đổi</option>
                      <option value="Negative">Trở ngại / Khó khăn</option>
                      <option value="Very Negative">Biến cố nặng nề</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ghi chú chi tiết</label>
                  <textarea
                    rows={2}
                    placeholder="Bối cảnh quyết định và diễn biến kết quả..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white resize-none focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-medium cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Đang phân tích...' : 'Lưu & Khớp Dữ Liệu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
