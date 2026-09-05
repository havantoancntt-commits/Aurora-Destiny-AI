// ==========================================
// EXECUTIVE SYNASTRY & BOARDROOM MATCHING STUDIO
// Thẩm Định Đối Tác Chiến Lược, Đồng Sáng Lập & Nhân Sự Cao Cấp
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  Scale,
  Sparkles,
  FileText,
  Lock,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  evaluateExecutiveSynergy,
  ExecutivePartnershipType,
  ExecutiveSynergyScorecard
} from '../engine/executiveSynastry';
import { soundEngine } from '../services/soundEffects';

interface Props {
  userProfile: UserProfile;
  userCalc: CalculationResult;
  partnerProfile: UserProfile;
  partnerCalc?: CalculationResult;
}

export const ExecutiveSynastryStudio: React.FC<Props> = ({
  userProfile,
  userCalc,
  partnerProfile,
  partnerCalc
}) => {
  const [partnershipType, setPartnershipType] = useState<ExecutivePartnershipType>('CO_FOUNDER');

  const scorecard: ExecutiveSynergyScorecard = useMemo(() => {
    return evaluateExecutiveSynergy(
      userProfile,
      userCalc,
      partnerProfile,
      partnerCalc,
      partnershipType
    );
  }, [userProfile, userCalc, partnerProfile, partnerCalc, partnershipType]);

  const {
    overallSynergyScore,
    wealthCatalystScore,
    governanceAlignmentScore,
    trustIntegrityScore,
    executionComplementScore,
    tierVerdict,
    tierLabelVi,
    executiveSummary,
    roleAllocation,
    catalystPillars,
    strategicRisks,
    governanceProtocols
  } = scorecard;

  const getTierBadgeStyle = () => {
    switch (tierVerdict) {
      case 'DIAMOND_ALLIANCE':
        return 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]';
      case 'GOLDEN_PARTNERSHIP':
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'CONDITIONAL_COLLAB':
        return 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-indigo-300 border-indigo-400/50';
      case 'HIGH_RISK_WARNING':
        return 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            Mô Thức Thẩm Định:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'CO_FOUNDER', label: 'Đồng Sáng Lập / Góp Vốn' },
            { id: 'KEY_EXECUTIVE', label: 'Tuyển Dụng C-Level' },
            { id: 'STRATEGIC_ADVISOR', label: 'Cố Vấn / Đối Tác' },
            { id: 'LIFE_COMPANION', label: 'Bạn Đời Đồng Hành' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                soundEngine.playRadarTick();
                setPartnershipType(mode.id as ExecutivePartnershipType);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                partnershipType === mode.id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Executive Scorecard Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950/80 via-black/90 to-indigo-950/40 border border-amber-500/30 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${getTierBadgeStyle()}`}>
              {tierLabelVi}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
              {userProfile.name} & {partnerProfile.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
              {executiveSummary}
            </p>
          </div>

          {/* Master Overall Gauge */}
          <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-black/60 border border-white/10 shrink-0 min-w-[200px] text-center space-y-2">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Chỉ Số Tương Hợp Chiến Lược
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-300 tracking-tight">
              {overallSynergyScore}%
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-700"
                style={{ width: `${overallSynergyScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Chuẩn Thẩm Định Cấp Ban Lãnh Đạo
            </span>
          </div>
        </div>

        {/* 4 Pillars Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-white/10">
          {catalystPillars.map((pillar, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{pillar.title}</span>
                <span className={`text-xs font-mono font-bold ${
                  pillar.score >= 75 ? 'text-emerald-400' : pillar.score <= 55 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {pillar.score}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    pillar.score >= 75 ? 'bg-emerald-400' : pillar.score <= 55 ? 'bg-rose-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Optimal Role Allocation (Phân Quyền Tối Ưu) */}
      <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-cinzel">
            Kịch Bản Phân Định Vai Trò Ban Lãnh Đạo Đề Xuất
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-black/60 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                Vai Trò Trọng Tâm
              </span>
              <strong className="text-white text-sm font-cinzel">{roleAllocation.primaryLeader.profileName}</strong>
            </div>
            <div className="text-sm font-bold text-amber-300">
              {roleAllocation.primaryLeader.titleVi}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {roleAllocation.primaryLeader.rationale}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-black/60 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                Vai Trò Trọng Yếu
              </span>
              <strong className="text-white text-sm font-cinzel">{roleAllocation.secondaryLeader.profileName}</strong>
            </div>
            <div className="text-sm font-bold text-teal-300">
              {roleAllocation.secondaryLeader.titleVi}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {roleAllocation.secondaryLeader.rationale}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Nguyên tắc biểu quyết:</strong> {roleAllocation.decisionRule}</span>
        </div>
      </div>

      {/* 4. Strategic Risks & Governance Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risks */}
        <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Rủi Ro Tiềm Ẩn Cần Nhận Diện Sớm</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 list-disc list-inside">
            {strategicRisks.map((risk, idx) => (
              <li key={idx} className="leading-relaxed">{risk}</li>
            ))}
          </ul>
        </div>

        {/* Legal & Governance Protocols */}
        <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Quy Trình Quản Trị & Pháp Lý Khuyến Nghị</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 list-disc list-inside">
            {governanceProtocols.map((protocol, idx) => (
              <li key={idx} className="leading-relaxed">{protocol}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
