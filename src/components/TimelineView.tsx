// ==========================================
// INTERACTIVE TIMELINE & LIFETIME CYCLES VIEW
// Ultra-luxury animated Timeline View
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Calendar,
  Zap,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { CalculationResult, DecadeCycle, AnnualTransit } from '../types/destiny';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';

interface Props {
  calculation: CalculationResult;
  language: LanguageCode;
}

export const TimelineView: React.FC<Props> = ({ calculation, language }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDecadeIdx, setSelectedDecadeIdx] = useState<number>(2);

  const { decades = [], annualTransits = [] } = calculation || {};
  const currentTransit = annualTransits?.find((t) => t.year === selectedYear) || annualTransits?.[0] || {
    year: selectedYear,
    stem: 'Bing',
    branch: 'Wu_B',
    element: 'Fire',
    tenGod: 'Chính Quan',
    overallScore: 70,
    careerScore: 70,
    wealthScore: 70,
    relationshipScore: 70,
    healthScore: 70,
    growthScore: 70,
    opportunityWave: 70,
    cautionWave: 30,
    highlightSummary: 'Vận trình năm hiện tại',
    recommendedFocus: 'Cân bằng và kiên định'
  };
  const selectedDecade = decades?.[selectedDecadeIdx] || decades?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel">
              Dòng Thời Gian & Chu Kỳ Vận Trình (Timeline)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi nhịp điệu Đại Vận 10 năm và Lưu Niên từng năm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-sm">
            Năm Đang Chọn: {selectedYear}
          </span>
        </div>
      </motion.div>

      {/* 1. DECADE CYCLES (ĐẠI VẬN 10 NĂM) CAROUSEL */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-2xl shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Chu Kỳ Đại Vận 10 Năm (10-Year Decades)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Chọn giai đoạn tuổi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {decades.map((dec, idx) => {
            const isSelected = selectedDecadeIdx === idx;
            const isCurrentAge = dec.startYear <= currentYear && dec.endYear >= currentYear;
            return (
              <motion.button
                key={dec.index}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDecadeIdx(idx)}
                className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/60 shadow-[0_0_20px_rgba(124,58,237,0.3)] ring-1 ring-purple-500/40'
                    : isCurrentAge
                    ? 'bg-black/60 border-teal-400/50 text-teal-300 shadow-sm'
                    : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-200">
                    {dec.startAge}-{dec.endAge}t
                  </span>
                  {isCurrentAge && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#2dd4bf]" title="Giai đoạn hiện tại" />
                  )}
                </div>

                <div className="my-1.5">
                  <div className="text-xs font-bold text-purple-300">
                    {STEMS[dec.stem]?.nameVi || dec.stem} {BRANCHES[dec.branch]?.nameVi || dec.branch}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {dec.startYear}-{dec.endYear}
                  </div>
                </div>

                <div className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="truncate">{dec.tenGod}</span>
                  <span className="font-mono font-bold text-teal-400">{dec.harmonyScore}đ</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Decade Summary */}
        {selectedDecade && (
          <motion.div
            key={selectedDecadeIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-purple-500/30 text-xs space-y-3 shadow-inner"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-2.5">
              <span className="font-bold text-purple-300 text-sm">
                Đại Vận {selectedDecade.startAge} - {selectedDecade.endAge} Tuổi ({selectedDecade.startYear} - {selectedDecade.endYear}): {STEMS[selectedDecade.stem]?.nameVi || selectedDecade.stem} {BRANCHES[selectedDecade.branch]?.nameVi || selectedDecade.branch}
              </span>
              <span className="text-slate-400 font-mono">
                Cung Chủ Quản: <strong className="text-white uppercase">{selectedDecade.focalPalace}</strong> | Độ Hài Hòa: {selectedDecade.harmonyScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-300">
              <div className="space-y-1">
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Tín Hiệu Cơ Hội:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {selectedDecade.opportunitySignals.map((sig, i) => (
                    <li key={i}>{sig}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Tín Hiệu Thận Trọng:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                  {selectedDecade.cautionSignals.map((sig, i) => (
                    <li key={i}>{sig}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 2. ANNUAL TRANSITS (LƯU NIÊN) WAVE GRAPH & SLIDER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-2xl shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Biểu Đồ Sóng Vận Trình Từng Năm (Annual Transit Waves)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-teal-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf] inline-block" /> Sóng Cơ Hội
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Sóng Thận Trọng
            </span>
          </div>
        </div>

        {/* Year Selector Tabs Horizontal Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {annualTransits.map((transit) => {
            const isSelected = transit.year === selectedYear;
            const isCurrent = transit.year === currentYear;
            return (
              <motion.button
                key={transit.year}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedYear(transit.year)}
                className={`flex flex-col items-center p-2.5 rounded-2xl min-w-[76px] border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-400/60 shadow-[0_0_20px_rgba(45,212,191,0.3)] ring-1 ring-teal-400/40'
                    : isCurrent
                    ? 'bg-black/60 border-teal-500/40'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`text-xs font-bold font-mono ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                  {transit.year}
                </span>
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  {(STEMS[transit.stem]?.nameVi || transit.stem).charAt(0)}{(BRANCHES[transit.branch]?.nameVi || transit.branch).charAt(0)}
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden flex">
                  <div style={{ width: `${transit.opportunityWave}%` }} className="bg-teal-400 h-full shadow-[0_0_6px_#2dd4bf]" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detailed Metrics for Selected Year */}
        {currentTransit && (
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3.5 shadow-inner"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium text-teal-300">
                    Năm {currentTransit.year} ({STEMS[currentTransit.stem]?.nameVi || currentTransit.stem} {BRANCHES[currentTransit.branch]?.nameVi || currentTransit.branch} — {currentTransit.tenGod})
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-teal-950/80 border border-teal-500/30 text-teal-300">
                    Hành {ELEMENT_RELATIONS[currentTransit.element]?.vi || currentTransit.element}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{currentTransit.highlightSummary}</p>
              </div>

              <div className="text-right self-end sm:self-auto">
                <div className="text-[10px] text-slate-400">Tổng Điểm Vận Khí</div>
                <div className="text-2xl font-bold font-mono text-teal-400">
                  {currentTransit.overallScore}/100
                </div>
              </div>
            </div>

            {/* Domain Scores Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { label: 'Sự nghiệp', score: currentTransit.careerScore, color: 'text-purple-400' },
                { label: 'Tài chính', score: currentTransit.wealthScore, color: 'text-emerald-400' },
                { label: 'Tình cảm', score: currentTransit.relationshipScore, color: 'text-rose-400' },
                { label: 'Sức khỏe', score: currentTransit.healthScore, color: 'text-amber-400' },
                { label: 'Học tập / Bứt phá', score: currentTransit.growthScore, color: 'text-teal-400' },
              ].map(({ label, score, color }, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400">{label}</div>
                  <div className={`text-base font-bold font-mono ${color}`}>{score}đ</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-slate-400">Khuyến nghị điều phối:</span>
              <span className="text-teal-200 font-medium">{currentTransit.recommendedFocus}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
