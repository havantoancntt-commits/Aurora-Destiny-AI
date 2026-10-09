// ==========================================
// PERSONAL ENERGY 12-MONTH FORECAST CHART
// Trực quan hóa dự báo năng lượng cá nhân 12 tháng tới
// dựa trên các giá trị Đại Vận calculation.cycles & Bát Tự
// Tích hợp cảnh báo nhẹ nhàng khi có biến động tăng vọt hoặc sụt giảm đột ngột
// Built with Recharts & Tailwind CSS
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Compass,
  Calendar,
  Layers,
  Shield,
  Zap,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  Bell
} from 'lucide-react';
import { CalculationResult, DecadeCycle, FiveElement, EarthlyBranch, HeavenlyStem } from '../types/destiny';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import {
  compute12MonthsEnergyTrajectory,
  detectEnergyShifts,
  MonthlyEnergyPoint,
  EnergyShiftAlert,
  SOLAR_TERM_MONTH_NAMES
} from '../engine/personalEnergyEngine';
import { PersonalEnergyAlertBanner } from './PersonalEnergyAlertBanner';

export type { MonthlyEnergyPoint, EnergyShiftAlert };

interface PersonalEnergy12MonthsChartProps {
  calculation: CalculationResult;
  onOpenReportModal?: () => void;
  selectedMonthTarget?: { year: number; month: number } | null;
  onSelectMonthTarget?: (target: { year: number; month: number } | null) => void;
  showInlineAlerts?: boolean;
}

export type ForecastMetricKey = 'all' | 'vitality' | 'opportunity' | 'harmony';

export const PersonalEnergy12MonthsChart: React.FC<PersonalEnergy12MonthsChartProps> = ({
  calculation,
  onOpenReportModal,
  selectedMonthTarget,
  onSelectMonthTarget,
  showInlineAlerts = true
}) => {
  const [activeMetric, setActiveMetric] = useState<ForecastMetricKey>('all');
  const [selectedMonth, setSelectedMonth] = useState<MonthlyEnergyPoint | null>(null);

  // Compute 12-month trajectory starting from current month using calculation.cycles & Bazi
  const monthlyData: MonthlyEnergyPoint[] = useMemo(() => {
    return compute12MonthsEnergyTrajectory(calculation);
  }, [calculation]);

  // Extract cycles reliably from calculation.cycles or calculation.decades
  const cycles: DecadeCycle[] = useMemo(() => {
    return (calculation as any)?.cycles || calculation?.decades || [];
  }, [calculation]);

  // Detect sudden surges or sudden drops
  const alerts: EnergyShiftAlert[] = useMemo(() => {
    return detectEnergyShifts(monthlyData, {
      favorableElements: calculation?.bazi?.favorableElements,
      unfavorableElements: calculation?.bazi?.unfavorableElements
    });
  }, [monthlyData, calculation?.bazi?.favorableElements, calculation?.bazi?.unfavorableElements]);

  // Sync external selectedMonthTarget if provided
  useEffect(() => {
    if (selectedMonthTarget) {
      const match = monthlyData.find(
        (m) => m.year === selectedMonthTarget.year && m.month === selectedMonthTarget.month
      );
      if (match) {
        setSelectedMonth(match);
      }
    }
  }, [selectedMonthTarget, monthlyData]);

  // Insights highlights
  const peakMonth = useMemo(() => {
    return [...monthlyData].sort((a, b) => b.compositeEnergy - a.compositeEnergy)[0] || monthlyData[0];
  }, [monthlyData]);

  const cautionMonth = useMemo(() => {
    return [...monthlyData].sort((a, b) => a.compositeEnergy - b.compositeEnergy)[0] || monthlyData[0];
  }, [monthlyData]);

  const averageEnergy = useMemo(() => {
    if (monthlyData.length === 0) return 70;
    const sum = monthlyData.reduce((acc, curr) => acc + curr.compositeEnergy, 0);
    return Math.round(sum / monthlyData.length);
  }, [monthlyData]);

  // Custom Tooltip component for Recharts with sudden drop/surge alerts
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MonthlyEnergyPoint = payload[0]?.payload;
    if (!data) return null;

    const monthAlert = alerts.find((a) => a.year === data.year && a.month === data.month);

    return (
      <div className="bg-[#0b0f19]/95 border border-amber-500/30 p-3.5 rounded-xl shadow-2xl backdrop-blur-xl text-xs max-w-xs space-y-2 z-50 pointer-events-none">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">{data.fullLabel}</span>
            <span className="text-amber-300 font-mono">({data.canChiName})</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              data.statusTag === 'VƯỢNG KHÍ'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : data.statusTag === 'CÁT LỢI'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : data.statusTag === 'THẬN TRỌNG'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-700/50 text-slate-300'
            }`}
          >
            {data.statusTag}
          </span>
        </div>

        <div className="space-y-1 py-0.5">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Năng Lượng Sinh Khí:
            </span>
            <span className="font-mono font-bold text-emerald-400">{data.vitalityEnergy}/100</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Cơ Hội & Bứt Phá:
            </span>
            <span className="font-mono font-bold text-amber-300">{data.opportunityScore}/100</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Cân Bằng & Tâm Thức:
            </span>
            <span className="font-mono font-bold text-purple-300">{data.harmonyScore}/100</span>
          </div>
        </div>

        {/* Gentle Warning in Tooltip if Month has Sudden Shift */}
        {monthAlert && (
          <div
            className={`p-2 rounded-lg text-[11px] border flex items-start gap-1.5 ${
              monthAlert.type === 'drop'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {monthAlert.type === 'drop' ? '⚠️' : '⚡'}
            </span>
            <div>
              <span className="font-semibold">{monthAlert.title}: </span>
              <span>{monthAlert.shortWarning}</span>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-1.5 space-y-1 text-[11px]">
          <div className="text-slate-400">
            <span className="text-amber-400/80 font-medium">Chu kỳ trực chiếu:</span> {data.activeCycleName}
          </div>
          <div className="text-slate-300 italic bg-white/[0.03] p-1.5 rounded border border-white/5">
            "{data.strategicAdvice}"
          </div>
        </div>
      </div>
    );
  }

  const handleSelectMonthFromAlert = (target: { year: number; month: number }) => {
    const match = monthlyData.find((m) => m.year === target.year && m.month === target.month);
    if (match) {
      setSelectedMonth(match);
      if (onSelectMonthTarget) {
        onSelectMonthTarget(target);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-white/[0.05] via-[#090d16] to-black/60 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-medium text-white tracking-wide">
              Biểu Đồ Dự Báo Năng Lượng Cá Nhân 12 Tháng Tới
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Live Cycles Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Mô phỏng động lượng sinh khí, cơ hội và điểm rơi tài lộc qua 12 tiết khí sắp tới,
            tính toán dựa trên nhịp vận hành của các chu kỳ Đại Vận ({cycles.length} chu kỳ xác định).
          </p>
        </div>

        {/* METRIC FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveMetric('vitality')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'vitality'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Sinh Khí
          </button>
          <button
            onClick={() => setActiveMetric('opportunity')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'opportunity'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Cơ Hội
          </button>
          <button
            onClick={() => setActiveMetric('harmony')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeMetric === 'harmony'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Cân Bằng
          </button>
        </div>
      </div>

      {/* GENTLE ALERT NOTIFICATION BANNER (IF DETECTED) */}
      {showInlineAlerts && alerts.length > 0 && (
        <PersonalEnergyAlertBanner
          alerts={alerts}
          onSelectMonth={handleSelectMonthFromAlert}
          onOpenReportModal={onOpenReportModal}
          defaultExpanded={true}
        />
      )}

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Peak Month */}
        <div
          onClick={() => setSelectedMonth(peakMonth)}
          className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1 cursor-pointer hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
            <span>Tháng Đỉnh Cao</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-light text-white font-mono">
              {peakMonth.label}
            </span>
            <span className="text-xs text-amber-300 font-medium">({peakMonth.canChiName})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Chỉ số vượng: <span className="text-emerald-400 font-mono font-bold">{peakMonth.compositeEnergy}/100</span>
          </div>
        </div>

        {/* Caution Month */}
        <div
          onClick={() => setSelectedMonth(cautionMonth)}
          className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 space-y-1 cursor-pointer hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-[11px] text-rose-400 font-semibold">
            <span>Tháng Cần Thận Trọng</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-light text-white font-mono">
              {cautionMonth.label}
            </span>
            <span className="text-xs text-rose-300 font-medium">({cautionMonth.canChiName})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Điểm đáy: <span className="text-rose-400 font-mono font-bold">{cautionMonth.compositeEnergy}/100</span>
          </div>
        </div>

        {/* Average Energy */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Năng Lượng Bình Quân</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-light text-white font-mono">
            {averageEnergy} / 100
          </div>
          <div className="text-[11px] text-slate-400">
            Thế vận 12 tháng: <span className="text-amber-300">{averageEnergy >= 75 ? 'Khởi sắc hanh thông' : 'Ổn định tích lũy'}</span>
          </div>
        </div>

        {/* Active Cycle from calculation.cycles */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold">
            <span>Đại Vận Chủ Đạo</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-medium text-white truncate" title={peakMonth.activeCycleName}>
            {peakMonth.activeCycleName.split('(')[0]}
          </div>
          <div className="text-[11px] text-slate-400">
            Hài hòa chu kỳ: <span className="text-purple-300 font-mono font-bold">{peakMonth.activeCycleScore}/100</span>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="w-full h-[320px] sm:h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const clickedPoint = e.activePayload[0].payload;
                setSelectedMonth(clickedPoint);
                if (onSelectMonthTarget) {
                  onSelectMonthTarget({ year: clickedPoint.year, month: clickedPoint.month });
                }
              }
            }}
          >
            <defs>
              <linearGradient id="vitalityGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="opportunityGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="harmonyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />

            <YAxis
              domain={[40, 100]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Baseline Reference Line (70 - Neutral Equilibrium) */}
            <ReferenceLine
              y={70}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
              label={{
                value: 'Ngưỡng Cân Bằng (70)',
                fill: '#64748b',
                fontSize: 10,
                position: 'insideBottomRight'
              }}
            />

            {(activeMetric === 'all' || activeMetric === 'vitality') && (
              <Line
                type="monotone"
                dataKey="vitalityEnergy"
                name="Sinh Khí & Thể Lực"
                stroke="url(#vitalityGlow)"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 3.5, strokeWidth: 1, stroke: '#064e3b' }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'opportunity') && (
              <Line
                type="monotone"
                dataKey="opportunityScore"
                name="Cơ Hội & Bứt Phá"
                stroke="url(#opportunityGlow)"
                strokeWidth={2.5}
                dot={{ fill: '#f59e0b', r: 3.5, strokeWidth: 1, stroke: '#78350f' }}
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'harmony') && (
              <Line
                type="monotone"
                dataKey="harmonyScore"
                name="Cân Bằng & Tâm Thức"
                stroke="url(#harmonyGlow)"
                strokeWidth={2.5}
                dot={{ fill: '#8b5cf6', r: 3.5, strokeWidth: 1, stroke: '#4c1d95' }}
                activeDot={{ r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CHART LEGEND & INTERACTION GUIDE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Sinh Khí & Thể Lực</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Cơ Hội & Bứt Phá</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Cân Bằng & Tâm Thức</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Nhấp vào bất kỳ điểm tháng trên biểu đồ để xem chi tiết chiến lược</span>
        </div>
      </div>

      {/* SELECTED MONTH ACTION DETAILS CARD (ON-CLICK INTERACTION) */}
      <AnimatePresence>
        {selectedMonth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#0d1322] to-purple-500/10 border border-amber-500/30 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-400/20 text-amber-300 font-bold font-mono">
                  {selectedMonth.fullLabel}
                </span>
                <span className="text-white font-medium">
                  {selectedMonth.canChiName} ({selectedMonth.solarTermName})
                </span>
                <span className="text-slate-400">
                  • {selectedMonth.elementInteraction}
                </span>
              </div>
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-[11px] cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">Sinh Khí & Thể Lực</div>
                <div className="text-lg font-light text-white font-mono">{selectedMonth.vitalityEnergy}/100</div>
                <div className="text-[11px] text-slate-300">Thể trạng dồi dào, phù hợp tăng tải công việc.</div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-amber-400 uppercase font-semibold">Cơ Hội & Tài Lộc</div>
                <div className="text-lg font-light text-white font-mono">{selectedMonth.opportunityScore}/100</div>
                <div className="text-[11px] text-slate-300">Điểm rơi quyết định cho tài chính và hợp đồng.</div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="text-[10px] text-purple-400 uppercase font-semibold">Cân Bằng & Tâm Trí</div>
                <div className="text-lg font-light text-white font-mono">{selectedMonth.harmonyScore}/100</div>
                <div className="text-[11px] text-slate-300">Sự hòa hợp giữa áp lực bên ngoài và bình an nội tâm.</div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-amber-300/90 font-medium">
                💡 Lời khuyên chiến lược: {selectedMonth.strategicAdvice}
              </span>
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="flex items-center gap-1 text-teal-300 hover:text-teal-200 underline font-medium cursor-pointer"
                >
                  Xem Báo Cáo Chuyên Sâu <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
