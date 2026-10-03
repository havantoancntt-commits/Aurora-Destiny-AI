// ==========================================
// 7 AI AGENTS INFLUENCE & WEIGHT ATTRIBUTION CHART
// Biểu đồ tương tác mức độ ảnh hưởng của 7 tác tử AI
// đối với kết quả dự báo tổng hợp hiện tại (Ensemble Model)
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Layers,
  Sparkles,
  Clock,
  Activity,
  Sliders,
  Shield,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Scale
} from 'lucide-react';
import { MultiAgentEnsemble, AgentReport } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';

interface AgentInfluenceChartProps {
  ensemble: MultiAgentEnsemble;
  calculation: CalculationResult;
  profile: UserProfile;
}

export type AgentDomainCategory = 'classical' | 'temporal_mindset' | 'validation_risk';

export interface AgentWeightItem {
  id: string;
  order: number;
  codeName: string;
  shortName: string;
  fullName: string;
  specialization: string;
  category: AgentDomainCategory;
  categoryLabel: string;
  rawReport: AgentReport;
  weightPercent: number; // Normalized to sum to 100%
  baseWeight: number;
  confidenceScore: number;
  impactLevel: 'Trụ cột cốt lõi' | 'Trọng yếu' | 'Bổ trợ then chốt' | 'Kiểm soát & Giám định';
  impactDescription: string;
  primaryMetric: string;
  themeColor: {
    name: string;
    text: string;
    bg: string;
    border: string;
    gradient: string;
    stroke: string;
    glow: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

export const AgentInfluenceChart: React.FC<AgentInfluenceChartProps> = ({
  ensemble,
  calculation,
  profile
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('bazi');
  const [viewMode, setViewMode] = useState<'bars' | 'donut'>('bars');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | AgentDomainCategory>('ALL');

  // Compute normalized weights for the 7 agents dynamically based on current calculation state
  const agentsData = useMemo<AgentWeightItem[]>(() => {
    const isEstimatedHour = calculation.ziwei.isEstimatedHour || calculation.bazi.hourPillar.isEstimated;
    const dayMasterStrength = calculation.bazi.dayMasterStrength;
    const transitOverall = calculation.annualTransits?.[0]?.overallScore ?? 75;

    // Base conceptual weights tuned to eastern astrology domain & ensemble theory
    // When birth hour is estimated, reduce ZiWei slightly and increase BaZi / Temporal / Five Elements
    const baseWeights: Record<string, number> = {
      traditional: 14.5,
      bazi: isEstimatedHour ? 22.0 : 19.5,
      ziwei: isEstimatedHour ? 13.5 : 20.0,
      temporal: 16.5,
      behavioral: 11.5,
      statistical: 8.5,
      risk: 8.5
    };

    // Extract confidence scores from ensemble reports
    const rawAgents: Array<{
      id: string;
      order: number;
      codeName: string;
      shortName: string;
      fullName: string;
      specialization: string;
      category: AgentDomainCategory;
      categoryLabel: string;
      report: AgentReport;
      baseWeight: number;
      impactLevel: 'Trụ cột cốt lõi' | 'Trọng yếu' | 'Bổ trợ then chốt' | 'Kiểm soát & Giám định';
      impactDescription: string;
      primaryMetric: string;
      themeColor: AgentWeightItem['themeColor'];
      icon: React.ComponentType<{ className?: string }>;
    }> = [
      {
        id: 'traditional',
        order: 1,
        codeName: 'AGENT-01',
        shortName: 'Ngũ Hành & Cổ Học',
        fullName: 'Thiên Văn Cổ Học & Ngũ Hành Âm Dương',
        specialization: ensemble.traditionalAstrologyAgent?.agentRole || 'Ngũ Hành & Khí Tiết',
        category: 'classical',
        categoryLabel: 'Cổ Học & Thiên Văn',
        report: ensemble.traditionalAstrologyAgent,
        baseWeight: baseWeights.traditional,
        impactLevel: 'Bổ trợ then chốt',
        impactDescription: 'Xác định gốc rễ vượng suy ngũ hành, âm dương thuận nghịch và mối tương hòa với thiên nhiên khí hậu thời khắc sinh.',
        primaryMetric: `Dụng Thần: ${calculation.bazi.favorableElements?.join(', ') || 'Hỏa, Thổ'}`,
        themeColor: {
          name: 'amber',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          gradient: 'from-amber-500 to-yellow-400',
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)'
        },
        icon: Compass
      },
      {
        id: 'bazi',
        order: 2,
        codeName: 'AGENT-02',
        shortName: 'Bát Tự Hà Lạc',
        fullName: 'Bát Tự Tứ Trụ & Thập Thần Cấu Trúc',
        specialization: ensemble.baziAnalystAgent?.agentRole || 'Tứ Trụ & Thập Thần Học',
        category: 'classical',
        categoryLabel: 'Cổ Học & Thiên Văn',
        report: ensemble.baziAnalystAgent,
        baseWeight: baseWeights.bazi,
        impactLevel: 'Trụ cột cốt lõi',
        impactDescription: 'Định hình cốt lõi bản thể, năng lượng Thập Thần, thế lực Nhật Chủ và cách cục vận mệnh xuyên suốt cuộc đời.',
        primaryMetric: `Cách Cục: ${calculation.bazi.structureType} (${dayMasterStrength})`,
        themeColor: {
          name: 'teal',
          text: 'text-teal-400',
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          gradient: 'from-teal-400 to-emerald-400',
          stroke: '#14b8a6',
          glow: 'rgba(20, 184, 166, 0.25)'
        },
        icon: Layers
      },
      {
        id: 'ziwei',
        order: 3,
        codeName: 'AGENT-03',
        shortName: 'Tử Vi Đẩu Số',
        fullName: 'Tử Vi Đẩu Số 12 Cung & Tinh Tú Cục Số',
        specialization: ensemble.ziweiAnalystAgent?.agentRole || '12 Cung & Tứ Hóa Tinh Tú',
        category: 'classical',
        categoryLabel: 'Cổ Học & Thiên Văn',
        report: ensemble.ziweiAnalystAgent,
        baseWeight: baseWeights.ziwei,
        impactLevel: isEstimatedHour ? 'Trọng yếu' : 'Trụ cột cốt lõi',
        impactDescription: 'Phân tích chi tiết 12 cung chức (Mệnh, Thân, Quan Lộc, Tài Bạch, v.v.), vòng Tràng Sinh và thế tam phương tứ chính.',
        primaryMetric: `Cung Mệnh: ${calculation.ziwei.palaces.life?.branch || 'Dần'} (${calculation.ziwei.palaces.life?.score || 85}đ)`,
        themeColor: {
          name: 'purple',
          text: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          gradient: 'from-purple-500 to-indigo-400',
          stroke: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.25)'
        },
        icon: Sparkles
      },
      {
        id: 'temporal',
        order: 4,
        codeName: 'AGENT-04',
        shortName: 'Chu Kỳ Vận Trình',
        fullName: 'Chu Kỳ Vận Trình, Đại Vận & Lưu Niên',
        specialization: ensemble.temporalPatternAgent?.agentRole || 'Lưu Niên & Chu Kỳ Vận Trình',
        category: 'temporal_mindset',
        categoryLabel: 'Thời Gian & Tâm Lý',
        report: ensemble.temporalPatternAgent,
        baseWeight: baseWeights.temporal,
        impactLevel: 'Trọng yếu',
        impactDescription: 'Xác định các cửa sổ thời cơ vàng, chu kỳ xung hợp lưu niên và nhịp điệu thăng trầm của năm phân tích hiện tại.',
        primaryMetric: `Lưu Niên: ${transitOverall}/100 (${calculation.analysisYear || new Date().getFullYear()})`,
        themeColor: {
          name: 'blue',
          text: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          gradient: 'from-blue-400 to-cyan-400',
          stroke: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.25)'
        },
        icon: Clock
      },
      {
        id: 'behavioral',
        order: 5,
        codeName: 'AGENT-05',
        shortName: 'Bối Cảnh Cá Nhân',
        fullName: 'Bối Cảnh Cá Nhân & Tâm Lý Hành Vi Thực Nghiệm',
        specialization: ensemble.behavioralContextAgent?.agentRole || 'Tâm Lý Học & Bối Cảnh',
        category: 'temporal_mindset',
        categoryLabel: 'Thời Gian & Tâm Lý',
        report: ensemble.behavioralContextAgent,
        baseWeight: baseWeights.behavioral,
        impactLevel: 'Bổ trợ then chốt',
        impactDescription: 'Cầu nối giữa lá số cổ và đời sống thực tế: liên kết điểm tựa hành vi, phong cách quyết định và môi trường thực tiễn.',
        primaryMetric: `Thiết Thực Hóa: ${profile.behavioralContext?.careerField || 'Chuyên nghiệp'}`,
        themeColor: {
          name: 'rose',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          gradient: 'from-rose-400 to-pink-400',
          stroke: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.25)'
        },
        icon: Activity
      },
      {
        id: 'statistical',
        order: 6,
        codeName: 'AGENT-06',
        shortName: 'Kiểm Định Thống Kê',
        fullName: 'Kiểm Định Nhất Quán Toán Học & Cross-Model Validation',
        specialization: ensemble.statisticalConsistencyAgent?.agentRole || 'Thống Kê & Nhất Quán Toán',
        category: 'validation_risk',
        categoryLabel: 'Kiểm Định & Rủi Ro',
        report: ensemble.statisticalConsistencyAgent,
        baseWeight: baseWeights.statistical,
        impactLevel: 'Kiểm soát & Giám định',
        impactDescription: 'So sánh chéo giữa Bát Tự và Tử Vi, tính toán độ lệch chuẩn, loại bỏ các kết luận mâu thuẫn để đảm bảo tính tất định.',
        primaryMetric: `Đồng Thuận: ${ensemble.overallConsistencyScore}/100`,
        themeColor: {
          name: 'indigo',
          text: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          gradient: 'from-indigo-400 to-violet-500',
          stroke: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.25)'
        },
        icon: Sliders
      },
      {
        id: 'risk',
        order: 7,
        codeName: 'AGENT-07',
        shortName: 'Quản Trị Rủi Ro',
        fullName: 'Quản Trị Rủi Ro, Biên Độ Bất Định & Vùng Đệm An Toàn',
        specialization: ensemble.riskUncertaintyAgent?.agentRole || 'Quản Trị Rủi Ro & Bất Định',
        category: 'validation_risk',
        categoryLabel: 'Kiểm Định & Rủi Ro',
        report: ensemble.riskUncertaintyAgent,
        baseWeight: baseWeights.risk,
        impactLevel: 'Kiểm soát & Giám định',
        impactDescription: 'Nhận diện điểm mù tâm lý, cảnh báo các tháng xung sát nguy cơ và thiết lập các khuyến nghị phòng thủ thực tế.',
        primaryMetric: `Độ Tin Cậy: ${ensemble.riskUncertaintyAgent?.confidenceScore || 85}%`,
        themeColor: {
          name: 'red',
          text: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          gradient: 'from-red-400 to-amber-500',
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.25)'
        },
        icon: Shield
      }
    ];

    // Compute raw adjusted weight = baseWeight * (0.6 + 0.4 * (confidence / 100))
    const weightedRaw = rawAgents.map((item) => {
      const conf = item.report?.confidenceScore || 80;
      const confFactor = 0.6 + 0.4 * (Math.max(50, Math.min(100, conf)) / 100);
      const rawScore = item.baseWeight * confFactor;
      return { item, rawScore, conf };
    });

    const totalRaw = weightedRaw.reduce((acc, curr) => acc + curr.rawScore, 0);

    // Normalize so that sum = 100.0% exactly with 1 decimal precision
    let sumPercent = 0;
    const result: AgentWeightItem[] = weightedRaw.map(({ item, rawScore, conf }, idx) => {
      let percent = Math.round((rawScore / totalRaw) * 1000) / 10;
      if (idx === weightedRaw.length - 1) {
        percent = Math.round((100 - sumPercent) * 10) / 10;
      } else {
        sumPercent += percent;
      }

      return {
        id: item.id,
        order: item.order,
        codeName: item.codeName,
        shortName: item.shortName,
        fullName: item.fullName,
        specialization: item.specialization,
        category: item.category,
        categoryLabel: item.categoryLabel,
        rawReport: item.report,
        weightPercent: percent,
        baseWeight: item.baseWeight,
        confidenceScore: conf,
        impactLevel: item.impactLevel,
        impactDescription: item.impactDescription,
        primaryMetric: item.primaryMetric,
        themeColor: item.themeColor,
        icon: item.icon
      };
    });

    return result;
  }, [ensemble, calculation, profile]);

  // Selected agent item
  const selectedAgent = useMemo(() => {
    return agentsData.find((a) => a.id === selectedAgentId) || agentsData[1] || agentsData[0];
  }, [agentsData, selectedAgentId]);

  // Category aggregations for method breakdown
  const categoryAggregates = useMemo(() => {
    const cats: Record<AgentDomainCategory, { label: string; totalWeight: number; count: number; color: string }> = {
      classical: { label: 'Cổ Học & Thiên Văn', totalWeight: 0, count: 0, color: 'from-amber-500 to-teal-400' },
      temporal_mindset: { label: 'Thời Gian & Tâm Lý', totalWeight: 0, count: 0, color: 'from-blue-400 to-rose-400' },
      validation_risk: { label: 'Kiểm Định & Rủi Ro', totalWeight: 0, count: 0, color: 'from-indigo-400 to-red-400' }
    };

    agentsData.forEach((a) => {
      cats[a.category].totalWeight += a.weightPercent;
      cats[a.category].count += 1;
    });

    // Round
    Object.keys(cats).forEach((k) => {
      cats[k as AgentDomainCategory].totalWeight = Math.round(cats[k as AgentDomainCategory].totalWeight * 10) / 10;
    });

    return cats;
  }, [agentsData]);

  // Filtered agents list if user clicks a category filter
  const displayedAgents = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return agentsData;
    return agentsData.filter((a) => a.category === activeCategoryFilter);
  }, [agentsData, activeCategoryFilter]);

  // Handle switching to next/prev agent
  const handleStepAgent = (direction: 'next' | 'prev') => {
    const currentIndex = agentsData.findIndex((a) => a.id === selectedAgentId);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % agentsData.length
        : (currentIndex - 1 + agentsData.length) % agentsData.length;
    setSelectedAgentId(agentsData[nextIndex].id);
  };

  // Compute SVG Donut Chart Coordinates
  const donutSlices = useMemo(() => {
    const size = 260;
    const center = size / 2;
    const radius = 88;
    const strokeWidth = 26;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercent = 0;

    return agentsData.map((agent) => {
      const startAngle = (accumulatedPercent / 100) * 360;
      const slicePercent = agent.weightPercent;
      accumulatedPercent += slicePercent;

      const strokeDasharray = `${(slicePercent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((startAngle / 360) * circumference);

      return {
        agent,
        strokeDasharray,
        strokeDashoffset,
        isSelected: agent.id === selectedAgentId,
        color: agent.themeColor.stroke
      };
    });
  }, [agentsData, selectedAgentId]);

  return (
    <div
      id="agent-influence-chart-section"
      className="mt-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-black/40 border border-white/10 p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden space-y-5 shadow-2xl"
    >
      {/* Subtle Ambient Decorative Glow */}
      <div
        className="absolute top-0 right-1/4 w-72 h-44 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: selectedAgent.themeColor.glow }}
      />

      {/* 1. SECTION HEADER & VIEW SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-4 rounded-full transition-colors duration-300"
              style={{ backgroundColor: selectedAgent.themeColor.stroke }}
            />
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white font-sans flex items-center gap-2">
              <span>Mức Độ Ảnh Hưởng 7 Tác Tử AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-normal">
                Ensemble Attribution
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Tỷ trọng đóng góp thực tế của từng chuyên gia AI trong hội đồng đa tầng đối với kết quả dự báo và luận giải hiện tại.
          </p>
        </div>

        {/* View Mode Segmented Switcher & Prev/Next Quick Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('bars')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                viewMode === 'bars'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Xem dạng biểu đồ thanh trực quan"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu Đồ Thanh</span>
            </button>
            <button
              onClick={() => setViewMode('donut')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                viewMode === 'donut'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Xem dạng vòng ma trận phân bổ năng lượng"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Ma Trận Donut</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NORMALIZED FULL SPECTRUM DISTRIBUTION TRACK (Interactive 100% Bar) */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span>Phổ trọng số chuẩn hóa tổng thể:</span>
            <strong className="text-white font-mono">100.0%</strong>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Nhấp vào phân đoạn để xem chi tiết
          </span>
        </div>

        {/* Continuous Segmented Bar */}
        <div className="w-full h-3 sm:h-3.5 rounded-full bg-black/60 p-0.5 border border-white/10 flex items-center gap-0.5 overflow-hidden shadow-inner">
          {agentsData.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                style={{
                  width: `${agent.weightPercent}%`,
                  backgroundColor: agent.themeColor.stroke
                }}
                className={`h-full rounded-sm transition-all duration-200 relative group cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-y-125 z-10 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'opacity-85 hover:opacity-100 hover:scale-y-110'
                }`}
                title={`${agent.codeName}: ${agent.shortName} (${agent.weightPercent}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. THREE METHODOLOGY PILLARS AGGREGATION BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-10">
        {(
          [
            {
              key: 'classical' as AgentDomainCategory,
              title: 'Cổ Học & Thiên Văn',
              desc: 'Ngũ Hành, Bát Tự, Tử Vi Đẩu Số',
              data: categoryAggregates.classical,
              accent: 'border-teal-500/30 text-teal-300'
            },
            {
              key: 'temporal_mindset' as AgentDomainCategory,
              title: 'Thời Gian & Tâm Lý',
              desc: 'Lưu Niên Vận Trình, Bối Cảnh Hành Vi',
              data: categoryAggregates.temporal_mindset,
              accent: 'border-blue-500/30 text-blue-300'
            },
            {
              key: 'validation_risk' as AgentDomainCategory,
              title: 'Kiểm Định & Rủi Ro',
              desc: 'Cross-Model Validation, Bất Định',
              data: categoryAggregates.validation_risk,
              accent: 'border-purple-500/30 text-purple-300'
            }
          ] as const
        ).map((group) => {
          const isFilterActive = activeCategoryFilter === group.key;
          return (
            <button
              key={group.key}
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === group.key ? 'ALL' : group.key)}
              className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                isFilterActive
                  ? 'bg-white/10 border-white/40 shadow-md ring-1 ring-white/20'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-200">{group.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{group.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base sm:text-lg font-mono font-bold text-white">
                  {group.data.totalWeight}%
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {group.data.count} tác tử
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN INTERACTIVE VISUALIZATION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 pt-1">
        {/* LEFT PANE: Chart Display (Bars or Donut) */}
        <div className="lg:col-span-6 space-y-2.5">
          {viewMode === 'bars' ? (
            /* Bar Chart List */
            <div className="space-y-2">
              {displayedAgents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const IconComponent = agent.icon;
                return (
                  <motion.div
                    key={agent.id}
                    layout
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden ${
                      isSelected
                        ? `${agent.themeColor.bg} ${agent.themeColor.border} shadow-lg ring-1 ring-white/20`
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/15'
                    }`}
                  >
                    {/* Active agent left accent border indicator */}
                    {isSelected && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: agent.themeColor.stroke }}
                      />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      {/* Left info: Icon, Name & Code */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${agent.themeColor.border} ${agent.themeColor.bg}`}
                        >
                          <IconComponent className={`w-4 h-4 ${agent.themeColor.text}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span>{agent.codeName}</span>
                            <span>·</span>
                            <span className="truncate">{agent.specialization}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                            {agent.shortName}
                          </div>
                        </div>
                      </div>

                      {/* Right info: Percentage & Confidence */}
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-mono font-bold text-white">
                            {agent.weightPercent}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ảnh hưởng</span>
                        </div>
                        <span className="text-[10px] text-teal-400 font-mono">
                          {agent.confidenceScore}% tin cậy
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: agent.themeColor.stroke
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.weightPercent * 3.8}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Donut Matrix Display */
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center relative min-h-[340px]">
              <div className="relative w-[260px] h-[260px] flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
                  {/* Background Track Circle */}
                  <circle
                    cx="130"
                    cy="130"
                    r="88"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="24"
                  />

                  {/* Dynamic Donut Slices */}
                  {donutSlices.map(({ agent, strokeDasharray, strokeDashoffset, isSelected, color }) => (
                    <circle
                      key={agent.id}
                      cx="130"
                      cy="130"
                      r="88"
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isSelected ? 30 : 24}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-300 hover:opacity-100"
                      style={{
                        opacity: isSelected ? 1 : 0.7,
                        filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none'
                      }}
                      onClick={() => setSelectedAgentId(agent.id)}
                    />
                  ))}
                </svg>

                {/* Donut Center Visual Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                    {selectedAgent.codeName}
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-0.5">
                    {selectedAgent.weightPercent}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 mt-0.5 line-clamp-1 max-w-[120px]">
                    {selectedAgent.shortName}
                  </div>
                  <div className="text-[9px] text-teal-400 font-mono mt-1">
                    {selectedAgent.confidenceScore}% Tin cậy
                  </div>
                </div>
              </div>

              {/* Quick Legend Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full">
                {agentsData.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 bg-white/[0.02]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: agent.themeColor.stroke }}
                      />
                      <span>{agent.shortName.split(' ')[0]}</span>
                      <span className="opacity-75">{agent.weightPercent}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Selected Agent Deep-Dive Attribution Inspector */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={`p-4 sm:p-5 rounded-2xl border ${selectedAgent.themeColor.border} bg-black/50 backdrop-blur-xl space-y-4 shadow-xl flex flex-col justify-between h-full`}
            >
              <div className="space-y-3.5">
                {/* Header of Inspector */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${selectedAgent.themeColor.border} ${selectedAgent.themeColor.bg}`}
                    >
                      <selectedAgent.icon className={`w-5 h-5 ${selectedAgent.themeColor.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tracking-widest text-slate-400">
                          {selectedAgent.codeName}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                          {selectedAgent.impactLevel}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {selectedAgent.fullName}
                      </h4>
                    </div>
                  </div>

                  {/* Previous / Next Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStepAgent('prev')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                      title="Tác tử trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStepAgent('next')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                      title="Tác tử kế tiếp"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score & Impact Attribution Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Tỷ Trọng Đóng Góp</div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-0.5">
                      {selectedAgent.weightPercent}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Trên tổng hợp Ensemble
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Độ Tin Cậy Chuyên Biệt</div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-teal-400 mt-0.5">
                      {selectedAgent.confidenceScore}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {selectedAgent.primaryMetric}
                    </div>
                  </div>
                </div>

                {/* Impact Rationale */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-400" />
                    <span>Cơ Chế Tác Động Dự Báo</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedAgent.impactDescription}
                  </p>
                </div>

                {/* Key Findings from Agent */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Nhận Định Trọng Tâm Từ Tác Tử</span>
                  </div>
                  <div className="space-y-1 pl-1">
                    {selectedAgent.rawReport?.keyFindings?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-teal-400 font-mono text-[10px] mt-0.5">▸</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {selectedAgent.rawReport?.recommendations?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-teal-400" />
                      <span>Khuyến Nghị Hành Động Đề Xuất</span>
                    </div>
                    <div className="space-y-1 pl-1">
                      {selectedAgent.rawReport.recommendations.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                          <span className="text-teal-300 font-mono text-[10px] mt-0.5">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Notations if present */}
                {selectedAgent.rawReport?.riskNotations?.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-200 space-y-1">
                    <div className="font-semibold text-[11px] text-red-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>Cảnh Báo Biên Độ Rủi Ro & Bất Định</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-200/90">
                      {selectedAgent.rawReport.riskNotations.join(' ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Indicator */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span>Thuộc nhóm: <strong className="text-slate-200">{selectedAgent.categoryLabel}</strong></span>
                <span className="font-mono">Chuẩn hóa toán học 100%</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
