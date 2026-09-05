// ==========================================
// 8-DOMAIN LIFE RADAR & MULTI-AGENT SYNTHESIS
// Ultra-luxury animated Life Radar View
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radar as RadarIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { MultiAgentEnsemble, LifeDomainItem } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';

interface Props {
  ensemble: MultiAgentEnsemble;
  calculation: CalculationResult;
  language: LanguageCode;
}

export const LifeRadarView: React.FC<Props> = ({ ensemble, calculation, language }) => {
  const [selectedDomainKey, setSelectedDomainKey] = useState<string>(ensemble.lifeRadar[0]?.domainKey || 'career');
  const [activeAgentTab, setActiveAgentTab] = useState<number>(0);

  const selectedDomain = ensemble.lifeRadar.find((d) => d.domainKey === selectedDomainKey) || ensemble.lifeRadar[0];

  const radarDomains = ensemble.lifeRadar || [];
  const totalAxes = radarDomains.length || 8;

  // Geometry configuration for 380x380 SVG Canvas with generous padding
  const cx = 190;
  const cy = 190;
  const maxR = 98; // Maximum radius of outer grid

  // Compute overall average score & strategic life stage badge
  const averageScore = useMemo(() => {
    if (!radarDomains || radarDomains.length === 0) return 80;
    const total = radarDomains.reduce((sum, d) => sum + (d.score || 0), 0);
    return Math.round(total / radarDomains.length);
  }, [radarDomains]);

  const stageBadgeText = useMemo(() => {
    if (averageScore >= 88) return 'Tiềm Năng Đột Phá';
    if (averageScore >= 80) return 'Cân Bằng Cao';
    if (averageScore >= 70) return 'Vững Vàng Tích Lũy';
    return 'Chuyển Tiếp Thích Ứng';
  }, [averageScore]);

  // Short clean label for radar axes to prevent label clipping
  const getDomainShortLabel = (item: LifeDomainItem): string => {
    switch (item.domainKey) {
      case 'career': return 'SỰ NGHIỆP';
      case 'finance': return 'TÀI CHÍNH';
      case 'relationships': return 'TÌNH CẢM';
      case 'family': return 'GIA ĐẠO';
      case 'learning': return 'TRI THỨC';
      case 'growth': return 'PHÁT TRIỂN';
      case 'opportunity': return 'CƠ HỘI';
      case 'risk': return 'RỦI RO';
      default:
        return ((item as any).domain || '').split('&')[0].trim().toUpperCase();
    }
  };

  // Concentric grid polygon rings at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = useMemo(() => {
    return gridLevels.map((lvl) => {
      const r = maxR * lvl;
      const pts = radarDomains.map((_, i) => {
        const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return { level: lvl, points: pts };
    });
  }, [radarDomains, totalAxes]);

  // Axis lines radiating from center
  const axesLines = useMemo(() => {
    return radarDomains.map((_, i) => {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const x = cx + maxR * Math.cos(angle);
      const y = cy + maxR * Math.sin(angle);
      return { x1: cx, y1: cy, x2: x, y2: y };
    });
  }, [radarDomains, totalAxes]);

  // Actual data energy polygon
  const dataPolygonPoints = useMemo(() => {
    return radarDomains.map((item, i) => {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const r = Math.max(16, ((item.score || 50) / 100) * maxR);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [radarDomains, totalAxes]);

  // Data nodes at vertices
  const dataNodes = useMemo(() => {
    return radarDomains.map((item, i) => {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const r = Math.max(16, ((item.score || 50) / 100) * maxR);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const isSelected = item.domainKey === selectedDomainKey;
      return { item, x, y, isSelected };
    });
  }, [radarDomains, totalAxes, selectedDomainKey]);

  // Label positions with intelligent dynamic radial offset and anti-overlapping anchors
  const labelNodes = useMemo(() => {
    return radarDomains.map((item, i) => {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Adaptive radial breathing room to prevent card boundary clipping
      const radialDist = Math.abs(sin) > 0.8 ? maxR + 34 : (Math.abs(cos) > 0.8 ? maxR + 26 : maxR + 30);
      const x = cx + radialDist * cos;
      const y = cy + radialDist * sin;
      const isSelected = item.domainKey === selectedDomainKey;

      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (cos > 0.25) textAnchor = 'start';
      else if (cos < -0.25) textAnchor = 'end';

      let dy1 = 0;
      if (sin > 0.7) dy1 = 6;
      else if (sin < -0.7) dy1 = -6;

      const shortLabel = getDomainShortLabel(item);

      return {
        item,
        x,
        y,
        textAnchor,
        dy1,
        isSelected,
        shortLabel
      };
    });
  }, [radarDomains, totalAxes, selectedDomainKey]);

  const agentsList = [
    ensemble.traditionalAstrologyAgent,
    ensemble.baziAnalystAgent,
    ensemble.ziweiAnalystAgent,
    ensemble.temporalPatternAgent,
    ensemble.behavioralContextAgent,
    ensemble.statisticalConsistencyAgent,
    ensemble.riskUncertaintyAgent
  ];

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
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]"></span>
            <h2 className="text-base sm:text-lg font-light tracking-[0.15em] text-white uppercase font-sans flex items-center gap-2">
              <span>Radar Cuộc Sống 8 Chiều</span>
              <span className="font-bold opacity-75 text-teal-400">AI</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp dữ liệu từ 7 chuyên gia AI kết hợp mô hình xác suất toán học.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-sm">
            Độ Nhất Quán Đa Tầng: {ensemble.overallConsistencyScore}/100
          </span>
        </div>
      </motion.div>

      {/* Central Visual Radar Stage & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visual Canvas Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl flex flex-col justify-between p-4 sm:p-5 overflow-hidden backdrop-blur-2xl shadow-xl relative"
        >
          {/* Dot Grid Subtle Ambient Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-immersive-radial" />

          {/* TOP BAR: Title & Current Stage Badge */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 z-10 w-full">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <RadarIcon className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                Đa Trục Năng Lượng Đời Sống
              </span>
            </div>

            {/* Strategic Life Stage Badge (Completely separated from canvas) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider hidden sm:inline">
                Giai Đoạn:
              </span>
              <span className="text-xs font-mono font-bold text-purple-200 uppercase">
                {stageBadgeText}
              </span>
            </div>
          </div>

          {/* CENTER RADAR CANVAS: Mathematical SVG with zero overlapping */}
          <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-square mx-auto my-2 flex items-center justify-center select-none">
            <svg
              className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(45,212,191,0.25)]"
              viewBox="0 0 380 380"
            >
              <defs>
                <linearGradient id="radarPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.18" />
                </linearGradient>
                <radialGradient id="centerCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2dd4bf" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Center Ambient Core */}
              <circle cx={cx} cy={cy} r={maxR} fill="url(#centerCoreGlow)" />

              {/* Concentric Grid Levels (25%, 50%, 75%, 100%) */}
              {gridPolygons.map((poly, idx) => (
                <polygon
                  key={idx}
                  points={poly.points}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={idx === 3 ? 1.2 : 0.8}
                  strokeDasharray={idx < 3 ? '3 3' : undefined}
                />
              ))}

              {/* Grid Scale Percentage Indicators shifted off-axis at 22.5° to eliminate overlap */}
              {[0.5, 0.75, 1.0].map((lvl, idx) => {
                const scaleAngle = -Math.PI / 2 + Math.PI / 8; // 22.5 deg off vertical axis
                const sx = cx + (maxR * lvl) * Math.cos(scaleAngle);
                const sy = cy + (maxR * lvl) * Math.sin(scaleAngle);
                return (
                  <g key={`scale-${idx}`}>
                    <rect
                      x={sx - 11}
                      y={sy - 6}
                      width={22}
                      height={12}
                      rx={3}
                      fill="rgba(5, 8, 18, 0.85)"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={sx}
                      y={sy + 3}
                      fill="#64748b"
                      fontSize="7.5"
                      fontWeight="600"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {Math.round(lvl * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Radiating Axes Lines */}
              {axesLines.map((line, idx) => (
                <line
                  key={idx}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="0.9"
                />
              ))}

              {/* Dynamic Data Polygon */}
              <polygon
                points={dataPolygonPoints}
                fill="url(#radarPolygonGrad)"
                stroke="#2dd4bf"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Vertices & Interactive Nodes */}
              {dataNodes.map((node) => (
                <g
                  key={node.item.domainKey}
                  onClick={() => setSelectedDomainKey(node.item.domainKey)}
                  className="cursor-pointer group"
                >
                  {node.isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={9}
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.isSelected ? 5 : 3.5}
                    fill={node.isSelected ? '#ffffff' : '#2dd4bf'}
                    stroke={node.isSelected ? '#2dd4bf' : 'rgba(0,0,0,0.6)'}
                    strokeWidth={node.isSelected ? 2.5 : 1}
                    filter="url(#nodeGlow)"
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              ))}

              {/* Smart Non-overlapping Axis Labels with Optical Text Halos */}
              {labelNodes.map((lbl) => (
                <g
                  key={lbl.item.domainKey}
                  onClick={() => setSelectedDomainKey(lbl.item.domainKey)}
                  className="cursor-pointer group select-none"
                >
                  {/* Background Optical Shield Halo for Title */}
                  <text
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    dy={lbl.dy1}
                    fill="#050814"
                    stroke="#050814"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                    letterSpacing="0.08em"
                  >
                    {lbl.shortLabel}
                  </text>

                  {/* Foreground Domain Title */}
                  <text
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    dy={lbl.dy1}
                    fill={lbl.isSelected ? '#2dd4bf' : '#cbd5e1'}
                    fontSize="10"
                    fontWeight={lbl.isSelected ? '700' : '600'}
                    fontFamily="monospace"
                    letterSpacing="0.08em"
                    className="transition-colors group-hover:fill-teal-300"
                  >
                    {lbl.shortLabel}
                  </text>

                  {/* Background Optical Shield Halo for Score */}
                  <text
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    dy={lbl.dy1 + 13}
                    fill="#050814"
                    stroke="#050814"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {lbl.item.score}đ
                  </text>

                  {/* Foreground Domain Score Pill Subtext */}
                  <text
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    dy={lbl.dy1 + 13}
                    fill={
                      lbl.isSelected
                        ? '#a855f7'
                        : lbl.item.score >= 80
                        ? '#34d399'
                        : lbl.item.score <= 50
                        ? '#f87171'
                        : '#94a3b8'
                    }
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {lbl.item.score}đ
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* BOTTOM BAR: Selection Details & Interaction Guide */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 z-10 w-full text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-400 text-[11px]">Đang chọn:</span>
              <span className="font-semibold text-white text-[11px]">{selectedDomain.domain}</span>
              <span className="text-teal-400 font-mono font-bold text-xs">({selectedDomain.score}/100)</span>
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              * Chạm trực tiếp vào đỉnh để xem chi tiết
            </span>
          </div>
        </motion.div>

        {/* Selected Domain Deep Drill-down */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-5 sm:p-6 backdrop-blur-2xl space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Lĩnh Vực: {selectedDomain.domain}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Đánh giá chiều năng lượng và các điều kiện kích hoạt thành công
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-teal-400 uppercase tracking-wider">Chỉ Số Năng Lượng</div>
              <div className="text-2xl font-light font-mono text-white">
                {selectedDomain.score}<span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Supporting Factors */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Yếu Tố Trợ Lực</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedDomain.supportingFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-teal-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uncertainty Factors */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Ranh Giới Bất Định</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedDomain.uncertaintyFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 8-Domain Interactive Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ensemble.lifeRadar.map((domain) => {
          const isSelected = selectedDomainKey === domain.domainKey;
          const trendLabel = domain.trend === 'Rising' ? 'Tăng Trưởng' : domain.trend === 'Volatile' ? 'Biến Động' : 'Ổn Định';
          return (
            <motion.button
              key={domain.domainKey}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDomainKey(domain.domainKey)}
              className={`flex flex-col p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md cursor-pointer ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500/60 shadow-[0_0_20px_rgba(124,58,237,0.25)] ring-1 ring-purple-500/40'
                  : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-medium ${isSelected ? 'text-teal-300 font-semibold' : 'text-slate-200'}`}>
                  {domain.domain}
                </span>
                <span className="text-xs font-mono font-light text-white">
                  {domain.score}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${domain.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-1.5 text-[10px] text-slate-400 border-t border-white/5 w-full">
                <span className="flex items-center gap-0.5">
                  {domain.trend === 'Rising' ? (
                    <TrendingUp className="w-3 h-3 text-teal-400" />
                  ) : domain.trend === 'Volatile' ? (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Minus className="w-3 h-3 text-slate-400" />
                  )}
                  {trendLabel}
                </span>
                <span>{domain.confidence}% Tin cậy</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 7 Specialized AI Agents Consensus Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-md shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
          <h3 className="text-xs uppercase tracking-widest text-white font-semibold">
            Đồng Thuận Phân Tích Từ 7 Chuyên Gia AI
          </h3>
        </div>

        {/* Agents Tab Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {agentsList.map((agent, idx) => (
            <button
              key={idx}
              onClick={() => setActiveAgentTab(idx)}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                activeAgentTab === idx
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-200 font-semibold shadow-sm'
                  : 'bg-black/30 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{agent.agentName.split('—')[0].trim()}</span>
              <span className="text-[10px] font-mono text-teal-400">({agent.confidenceScore}%)</span>
            </button>
          ))}
        </div>

        {/* Active Agent Findings & Recommendations */}
        {agentsList[activeAgentTab] && (
          <motion.div
            key={activeAgentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-medium text-white">
                  {agentsList[activeAgentTab].agentName}
                </h4>
                <div className="text-[11px] text-teal-400 font-mono mt-0.5">
                  {agentsList[activeAgentTab].agentRole}
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Độ Tin Cậy: {agentsList[activeAgentTab].confidenceScore}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 text-[11px]">Nhận Định Trọng Tâm</div>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                {agentsList[activeAgentTab].keyFindings.map((item, i) => (
                  <li key={i} className="list-disc list-inside text-slate-300 text-[11px] leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 text-[11px]">Khuyến Nghị Hành Động Chiến Lược</div>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                {agentsList[activeAgentTab].recommendations.map((item, i) => (
                  <li key={i} className="list-disc list-inside text-slate-300 text-[11px] leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {agentsList[activeAgentTab].riskNotations.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] text-purple-300 bg-purple-950/20 p-3 rounded-xl border border-purple-900/30">
                <span className="font-semibold text-purple-200">Lưu ý rủi ro: </span>
                {agentsList[activeAgentTab].riskNotations.join(' ')}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
