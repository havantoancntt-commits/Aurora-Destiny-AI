// ==========================================
// 100-YEAR LIFETIME ENERGY HEATMAP COMPONENT
// Bản Đồ Nhiệt Vận Mệnh & Chu Kỳ 100 Năm Cuộc Đời
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Award,
  Sparkles,
  ShieldAlert,
  Flame,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Maximize2
} from 'lucide-react';
import { CalculationResult, BirthData } from '../types/destiny';
import {
  generate100YearHeatmap,
  LifetimeHeatmapData,
  YearHeatmapCell,
  HeatmapColorTier
} from '../engine/lifetimeHeatmapEngine';
import { soundEngine } from '../services/soundEffects';

interface Props {
  birthData: BirthData;
  calculation: CalculationResult;
  onSelectYear?: (year: number) => void;
}

export const LifetimeHeatmap100Years: React.FC<Props> = ({
  birthData,
  calculation,
  onSelectYear
}) => {
  const heatmapData: LifetimeHeatmapData = useMemo(() => {
    return generate100YearHeatmap(birthData, calculation);
  }, [birthData, calculation]);

  const [selectedCell, setSelectedCell] = useState<YearHeatmapCell>(() => {
    const current = heatmapData.allYears.find(y => y.age === heatmapData.currentAge);
    return current || heatmapData.allYears[0];
  });

  const [filterTier, setFilterTier] = useState<HeatmapColorTier | 'ALL'>('ALL');

  const filteredYears = useMemo(() => {
    if (filterTier === 'ALL') return heatmapData.allYears;
    return heatmapData.allYears.filter(y => y.tier === filterTier);
  }, [heatmapData, filterTier]);

  const getTierColorClasses = (tier: HeatmapColorTier, isCurrent: boolean, isSelected: boolean) => {
    let base = '';
    switch (tier) {
      case 'GOLDEN':
        base = 'bg-amber-500/80 hover:bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] border-amber-300';
        break;
      case 'AUSPICIOUS':
        base = 'bg-emerald-600/70 hover:bg-emerald-500 text-white border-emerald-400/40';
        break;
      case 'BALANCED':
        base = 'bg-blue-600/50 hover:bg-blue-500 text-slate-100 border-blue-400/30';
        break;
      case 'CAUTION':
        base = 'bg-orange-700/60 hover:bg-orange-600 text-amber-100 border-orange-500/40';
        break;
      case 'CRISIS':
        base = 'bg-rose-900/80 hover:bg-rose-700 text-rose-100 border-rose-500/50';
        break;
      default:
        base = 'bg-white/10 text-slate-300';
    }

    if (isSelected) {
      base += ' ring-2 ring-white ring-offset-2 ring-offset-black scale-110 z-10';
    } else if (isCurrent) {
      base += ' ring-2 ring-teal-400 ring-offset-1 ring-offset-black';
    }

    return base;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/30 via-purple-950/20 to-black/70 border border-amber-500/30 p-5 sm:p-7 backdrop-blur-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                100-YEAR LIFE ENERGY HEATMAP
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
                Tuổi Hiện Tại: {heatmapData.currentAge} ({heatmapData.currentYear})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel">
              Bản Đồ Nhiệt Vận Mệnh Toàn Đời (1 - 100 Tuổi)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Trực quan hóa biên độ năng lượng qua 10 chu kỳ Đại Vận. Chạm vào bất kỳ ô tuổi nào để soi chiếu chi tiết vận thế và kịch bản chiến lược tương ứng.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 bg-black/50 p-3 rounded-2xl border border-white/10 self-start sm:self-auto">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Điểm Đỉnh Cao</div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-300">
                {heatmapData.peakYear.overallScore}%
              </div>
              <div className="text-[9px] text-slate-400">Tuổi {heatmapData.peakYear.age}</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Trung Bình Đời</div>
              <div className="text-base sm:text-lg font-bold font-mono text-teal-300">
                {heatmapData.lifetimeAverageScore}%
              </div>
              <div className="text-[9px] text-slate-400">10 Đại Vận</div>
            </div>
          </div>
        </div>

        {/* Legend Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Lọc theo tầng năng lượng:
            </span>
            <button
              onClick={() => setFilterTier('ALL')}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                filterTier === 'ALL' ? 'bg-white/20 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả (100 năm)
            </button>
            <button
              onClick={() => setFilterTier('GOLDEN')}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                filterTier === 'GOLDEN' ? 'bg-amber-500 text-black font-bold' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              ★ Hoàng Kim (≥84%)
            </button>
            <button
              onClick={() => setFilterTier('AUSPICIOUS')}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                filterTier === 'AUSPICIOUS' ? 'bg-emerald-500 text-white font-bold' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Cát Lợi (72-83%)
            </button>
            <button
              onClick={() => setFilterTier('BALANCED')}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                filterTier === 'BALANCED' ? 'bg-blue-500 text-white font-bold' : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              Bình Hòa (58-71%)
            </button>
            <button
              onClick={() => setFilterTier('CRISIS')}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                filterTier === 'CRISIS' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Phòng Ngự (≤45%)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 100-Year Heatmap Grid Matrix */}
      <div className="rounded-3xl bg-black/40 border border-white/10 p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Ma trận 10x10 tuổi (Hàng: từng 10 năm đại vận, Cột: các năm lẻ)</span>
          <span className="flex items-center gap-1.5 text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-teal-400 animate-pulse" />
            Viền xanh: Năm hiện tại của bạn
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {heatmapData.allYears.map((cell) => {
            const isCurrent = cell.age === heatmapData.currentAge;
            const isSelected = selectedCell.age === cell.age;
            const isDimmed = filterTier !== 'ALL' && cell.tier !== filterTier;

            return (
              <button
                key={cell.age}
                onClick={() => {
                  soundEngine.playRadarTick();
                  setSelectedCell(cell);
                  if (onSelectYear) onSelectYear(cell.solarYear);
                }}
                className={`relative p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex flex-col items-center justify-between text-center cursor-pointer ${
                  getTierColorClasses(cell.tier, isCurrent, isSelected)
                } ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
                title={`Tuổi ${cell.age} (${cell.solarYear} - ${cell.yearCanChiVi}): ${cell.overallScore}% - ${cell.tierLabelVi}`}
              >
                <div className="text-[10px] font-mono leading-none opacity-80">
                  {cell.age}t
                </div>
                <div className="text-xs sm:text-sm font-bold font-mono my-0.5">
                  {cell.overallScore}
                </div>
                <div className="text-[9px] font-mono leading-none opacity-80 truncate max-w-full">
                  {cell.solarYear}
                </div>

                {/* Peak or Valley indicator pin */}
                {cell.isPeakGolden && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Year Deep Radar Analysis Drawer */}
      <AnimatePresence mode="wait">
        {selectedCell && (
          <motion.div
            key={selectedCell.age}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-black/80 border border-white/15 p-5 sm:p-7 space-y-4 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-white font-cinzel">
                    Chi Tiết Tuổi {selectedCell.age} • Năm {selectedCell.solarYear} ({selectedCell.yearCanChiVi})
                  </span>
                  {selectedCell.age === heatmapData.currentAge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Năm Nay
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Thuộc Đại Vận {selectedCell.decadeAgeRange} (Cung {selectedCell.decadePalaceName})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Tổng Điểm Năm</div>
                  <div className="text-2xl font-bold font-mono text-amber-300">{selectedCell.overallScore}%</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border font-cinzel ${
                  selectedCell.tier === 'GOLDEN'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : selectedCell.tier === 'CRISIS'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}>
                  {selectedCell.tierLabelVi}
                </span>
              </div>
            </div>

            {/* 4 Multi-dimensional Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Tài Lộc & Đầu Tư</div>
                <div className="text-base font-bold font-mono text-amber-300">{selectedCell.wealthScore}%</div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${selectedCell.wealthScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Công Danh & Sự Nghiệp</div>
                <div className="text-base font-bold font-mono text-indigo-300">{selectedCell.careerScore}%</div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full" style={{ width: `${selectedCell.careerScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Sức Khỏe & Thể Lực</div>
                <div className="text-base font-bold font-mono text-teal-300">{selectedCell.healthScore}%</div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full" style={{ width: `${selectedCell.healthScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Nhân Duyên & Gia Đạo</div>
                <div className="text-base font-bold font-mono text-rose-300">{selectedCell.relationshipScore}%</div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full" style={{ width: `${selectedCell.relationshipScore}%` }} />
                </div>
              </div>
            </div>

            {/* Strategic Advice for this age */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {selectedCell.summaryAdvice}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Golden Windows & Crisis Valleys Master Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Golden Windows List */}
        <div className="rounded-3xl bg-amber-950/20 border border-amber-500/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>CÁC CỬA SỔ HOÀNG KIM TRỌNG ĐẠI (GOLDEN WINDOWS)</span>
          </div>

          <div className="space-y-3">
            {heatmapData.goldenWindows.map((gw, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-amber-200 font-bold font-cinzel">{gw.theme}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                    {gw.startYear} - {gw.endYear} (TB: {gw.averageScore}%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gw.actionProtocol}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Valleys List */}
        <div className="rounded-3xl bg-rose-950/20 border border-rose-500/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>CÁC THUNG LŨNG CẦN PHÒNG NGỰ (CRISIS VALLEYS)</span>
          </div>

          <div className="space-y-3">
            {heatmapData.crisisValleys.map((cv, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-rose-200 font-bold font-cinzel">{cv.vulnerabilityTheme}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">
                    {cv.startYear} - {cv.endYear} (TB: {cv.averageScore}%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cv.defensiveProtocol}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
