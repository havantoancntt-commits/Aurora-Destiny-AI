// ==========================================
// 8-DOMAIN LIFE RADAR & MULTI-AGENT SYNTHESIS
// Ultra-luxury animated Life Radar View
// ==========================================

import React, { useState } from 'react';
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
          className="lg:col-span-6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl relative flex items-center justify-center p-8 overflow-hidden min-h-[340px] backdrop-blur-2xl shadow-xl"
        >
          {/* Dot Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-immersive-radial" />
          
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Concentric rings */}
            <div className="absolute inset-0 border border-white/10 rounded-full"></div>
            <div className="absolute inset-8 border border-white/10 rounded-full"></div>
            <div className="absolute inset-16 border border-white/10 rounded-full"></div>
            <div className="absolute inset-24 border border-white/10 rounded-full"></div>
            
            {/* Cardinal axis labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5 text-[10px] tracking-widest text-teal-300 uppercase font-mono">Sự Nghiệp</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5 text-[10px] tracking-widest text-purple-300 uppercase font-mono">Tài Chính</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-9 text-[10px] tracking-widest text-slate-300 uppercase font-mono rotate-90">Sức Khỏe</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-9 text-[10px] tracking-widest text-amber-300 uppercase font-mono -rotate-90">Phát Triển</div>

            {/* Glowing polygon */}
            <div className="w-full h-full p-2 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[70%] h-[70%] bg-purple-500/15 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" viewBox="0 0 100 100">
                <polygon
                  points="50,16 78,38 72,82 28,82 22,38"
                  fill="rgba(45, 212, 191, 0.22)"
                  stroke="#2dd4bf"
                  strokeWidth="1.4"
                />
                <circle cx="50" cy="16" r="3" fill="#2dd4bf" className="animate-ping" />
                <circle cx="50" cy="16" r="2.5" fill="#2dd4bf" />
                <circle cx="78" cy="38" r="2.5" fill="#2dd4bf" />
                <circle cx="72" cy="82" r="2.5" fill="#2dd4bf" />
                <circle cx="28" cy="82" r="2.5" fill="#2dd4bf" />
                <circle cx="22" cy="38" r="2.5" fill="#2dd4bf" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            <span className="text-[10px] opacity-60 uppercase tracking-widest text-slate-400">Giai Đoạn Hiện Tại:</span>
            <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-0.5 rounded-lg text-purple-300 uppercase border border-white/10 shadow-sm">
              Cân Bằng Cao
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
