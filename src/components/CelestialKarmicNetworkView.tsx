// ==============================================================================
// AURORA DESTINY AI — CELESTIAL KARMIC NETWORK & RESONANCE GRAPH VIEW
// Interactive multi-profile orbit graph, bilateral energy exchange & Quý Nhân radar
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Crown,
  Coins,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Heart,
  Briefcase,
  Layers,
  Zap,
  Flame,
  Droplets,
  PlusCircle,
  HelpCircle,
  Share2,
  TrendingUp,
  RefreshCw,
  Compass
} from 'lucide-react';
import { CalculationResult, LanguageCode, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  buildKarmicNetworkAnalysis,
  KarmicNetworkAnalysis,
  KarmicConnectionEdge,
  KarmicRoleType
} from '../engine/karmicNetworkEngine';
import { soundEngine } from '../services/soundEffects';
import { sacredSound } from '../services/soundService';

interface Props {
  activeProfile: UserProfile;
  calculation: CalculationResult;
  allProfiles: UserProfile[];
  language: LanguageCode;
  onOpenNewProfileModal?: () => void;
  cachedCalculations?: Record<string, CalculationResult | null>;
}

export const CelestialKarmicNetworkView: React.FC<Props> = ({
  activeProfile,
  calculation,
  allProfiles,
  language,
  onOpenNewProfileModal,
  cachedCalculations = {}
}) => {
  // Build Full Network Analysis
  const networkAnalysis: KarmicNetworkAnalysis = useMemo(() => {
    return buildKarmicNetworkAnalysis(
      activeProfile,
      calculation,
      allProfiles,
      cachedCalculations
    );
  }, [activeProfile, calculation, allProfiles, cachedCalculations]);

  // Selected Node for Deep Bilateral Detail
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(() => {
    return networkAnalysis.connections[0]?.targetProfileId || null;
  });

  const selectedEdge: KarmicConnectionEdge | undefined = useMemo(() => {
    if (!selectedProfileId) return networkAnalysis.connections[0];
    return networkAnalysis.connections.find((c) => c.targetProfileId === selectedProfileId) || networkAnalysis.connections[0];
  }, [networkAnalysis, selectedProfileId]);

  const otherProfilesCount = allProfiles.filter((p) => p.id !== activeProfile.id).length;

  return (
    <div className="space-y-6 text-slate-200">
      {/* 1. Header Hero Panel with Network Vitality Metric */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0d1b] via-[#121327] to-[#090a14] border border-amber-500/25 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-bold tracking-wider">
                <Crown className="w-3.5 h-3.5" /> Bản Đồ Mạng Lưới Độc Quyền
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                {networkAnalysis.totalMembers} Thành Viên Khảo Sát
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-cinzel">
              Bản Đồ Mạng Lưới Quý Nhân &amp; Ma Trận Năng Lượng
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Soi chiếu toàn diện dòng chảy năng lượng tương sinh - tương khắc giữa <strong className="text-amber-300">{activeProfile.name}</strong> và mạng lưới gia đình, người thân, đối tác kinh doanh đã lưu trên ứng dụng.
            </p>
          </div>

          {/* Network Health Score Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl shrink-0 self-start lg:self-center shadow-xl">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-white/10 fill-none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * networkAnalysis.networkHealthScore) / 100}
                  className="text-amber-400 fill-none transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold font-mono text-white">
                {networkAnalysis.networkHealthScore}%
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Hòa Khí Mạng Lưới
              </div>
              <div className="text-sm font-bold text-amber-300 font-cinzel mt-0.5">
                {networkAnalysis.energyEquilibrium}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold">
                  {networkAnalysis.topBenefactors.length} Quý Nhân
                </span>
                <span>•</span>
                <span className={networkAnalysis.frictionAlerts.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {networkAnalysis.frictionAlerts.length} Điểm Ma Sát
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button to add profile if only 1 member */}
        {otherProfilesCount === 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-200">
                Hãy lưu thêm ít nhất một hồ sơ người thân, vợ/chồng hoặc đối tác để kích hoạt biểu đồ mạng lưới tương tác thực tế.
              </p>
            </div>
            {onOpenNewProfileModal && (
              <button
                onClick={() => {
                  sacredSound.playCelestialChime(768);
                  onOpenNewProfileModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                + Lập Thêm Hồ Sơ
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive Orbit Constellation Radar (Visual Orbit Graph) */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0b0c18] to-[#070810] border border-white/10 p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-cinzel flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Biểu Đồ Tinh Cầu Quý Nhân (Orbital Resonance Graph)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhấp vào từng thành viên xung quanh để xem phân tích dòng năng lượng hai chiều và đơn thuốc hóa giải.
            </p>
          </div>

          {onOpenNewProfileModal && (
            <button
              onClick={() => {
                sacredSound.playCelestialChime(528);
                onOpenNewProfileModal();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-300 hover:text-white font-mono flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Thêm Thành Viên</span>
            </button>
          )}
        </div>

        {/* Visual Celestial Stage */}
        <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-4 select-none">
          {/* Orbital Concentric Background Rings */}
          <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-teal-500/15 pointer-events-none" />
          <div className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full border border-dashed border-amber-500/15 pointer-events-none animate-spin" style={{ animationDuration: '120s' }} />

          {/* Connecting SVG Beams */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {networkAnalysis.connections.map((edge, index) => {
              const total = networkAnalysis.connections.length;
              const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
              // Assuming center is 50%, 50%
              return (
                <line
                  key={edge.targetProfileId}
                  x1="50%"
                  y1="50%"
                  x2={`${50 + 38 * Math.cos(angle)}%`}
                  y2={`${50 + 38 * Math.sin(angle)}%`}
                  stroke={
                    edge.roleType === 'QUY_NHAN_CUU_GIAI'
                      ? 'rgba(245, 158, 11, 0.45)'
                      : edge.roleType === 'TAI_TINH_KHOI_NGHIEP'
                      ? 'rgba(16, 185, 129, 0.45)'
                      : edge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA'
                      ? 'rgba(244, 63, 94, 0.4)'
                      : 'rgba(56, 189, 248, 0.35)'
                  }
                  strokeWidth={selectedProfileId === edge.targetProfileId ? '3' : '1.5'}
                  strokeDasharray={edge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA' ? '4 4' : 'none'}
                />
              );
            })}
          </svg>

          {/* Central Core Sun Node (Active Profile) */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 25px rgba(245, 158, 11, 0.3)',
                  '0 0 45px rgba(245, 158, 11, 0.5)',
                  '0 0 25px rgba(245, 158, 11, 0.3)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 border-2 border-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-2xl cursor-default"
            >
              <div className="text-center p-1">
                <span className="text-[10px] font-mono uppercase block text-amber-950 font-black">
                  HẠT NHÂN
                </span>
                <span className="text-xs sm:text-sm font-extrabold truncate block max-w-[80px]">
                  {activeProfile.name}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Orbiting Member Nodes */}
          {networkAnalysis.connections.map((edge, index) => {
            const total = networkAnalysis.connections.length;
            const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
            const radiusPercent = total <= 4 ? 36 : 40;
            const xPercent = 50 + radiusPercent * Math.cos(angle);
            const yPercent = 50 + radiusPercent * Math.sin(angle);
            const isSelected = selectedProfileId === edge.targetProfileId;

            return (
              <motion.button
                key={edge.targetProfileId}
                onClick={() => {
                  soundEngine.playRadarTick();
                  setSelectedProfileId(edge.targetProfileId);
                }}
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute z-20 flex flex-col items-center cursor-pointer transition-all ${
                  isSelected ? 'scale-110 z-30' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${
                    edge.roleType === 'QUY_NHAN_CUU_GIAI'
                      ? 'bg-gradient-to-br from-amber-500/30 to-amber-950 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : edge.roleType === 'TAI_TINH_KHOI_NGHIEP'
                      ? 'bg-gradient-to-br from-emerald-500/30 to-teal-950 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : edge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA'
                      ? 'bg-gradient-to-br from-rose-500/30 to-red-950 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : 'bg-gradient-to-br from-cyan-500/30 to-blue-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  } ${isSelected ? 'ring-4 ring-white/30' : ''}`}
                >
                  {edge.roleType === 'QUY_NHAN_CUU_GIAI' ? (
                    <Crown className="w-5 h-5 animate-pulse" />
                  ) : edge.roleType === 'TAI_TINH_KHOI_NGHIEP' ? (
                    <Coins className="w-5 h-5 animate-pulse" />
                  ) : edge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-300" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                {/* Member Label Pill */}
                <div
                  className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap border shadow-md ${
                    isSelected
                      ? 'bg-white text-slate-950 border-white font-extrabold'
                      : 'bg-black/80 text-white border-white/20'
                  }`}
                >
                  {edge.targetProfileName}
                </div>
                <span className="text-[9px] font-mono text-amber-300 font-medium">
                  {edge.resonanceScore}% Hòa
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Node Bilateral Resonance Detail Card */}
      {selectedEdge && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedEdge.targetProfileId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`rounded-3xl p-5 sm:p-7 border backdrop-blur-xl relative overflow-hidden transition-all shadow-2xl ${
              selectedEdge.roleType === 'QUY_NHAN_CUU_GIAI'
                ? 'bg-gradient-to-br from-amber-950/40 via-slate-950/80 to-emerald-950/30 border-amber-500/40'
                : selectedEdge.roleType === 'TAI_TINH_KHOI_NGHIEP'
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-950/80 to-teal-950/30 border-emerald-500/40'
                : selectedEdge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA'
                ? 'bg-gradient-to-br from-rose-950/45 via-slate-950/80 to-red-950/30 border-rose-500/40'
                : 'bg-gradient-to-br from-cyan-950/30 via-slate-950/80 to-slate-900/60 border-cyan-500/30'
            }`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl border text-xl ${
                    selectedEdge.roleType === 'QUY_NHAN_CUU_GIAI'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : selectedEdge.roleType === 'TAI_TINH_KHOI_NGHIEP'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : selectedEdge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  }`}
                >
                  {selectedEdge.roleType === 'QUY_NHAN_CUU_GIAI' ? '👑' : selectedEdge.roleType === 'TAI_TINH_KHOI_NGHIEP' ? '💰' : selectedEdge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA' ? '⚡' : '🤝'}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white font-bold">
                      {selectedEdge.targetRelationshipTag}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Tương tác: {selectedEdge.dominantInteraction}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {selectedEdge.targetProfileName} ↔ {activeProfile.name}
                  </h3>
                  <p className="text-xs font-medium text-amber-300 font-cinzel">
                    {selectedEdge.roleTitleVi}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Cộng Hưởng
                  </div>
                  <div className="text-xl font-black font-mono text-amber-300">
                    {selectedEdge.resonanceScore}%
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/15" />
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase border ${
                    selectedEdge.roleType === 'XUNG_KHAC_CAN_DUNG_HOA'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {selectedEdge.synergyLevel}
                </span>
              </div>
            </div>

            {/* Bilateral Energy Exchange Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
              {/* Box 1: What They Bring To You */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Họ Mang Lại Gì Cho Bạn?</span>
                  </span>
                  <span className="text-emerald-300">
                    {selectedEdge.receiveEnergyScore}% Hấp Thu
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedEdge.whatTheyBringToYou}
                </p>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300">
                  <strong className="text-amber-300">Quà Tặng Ngũ Hành: </strong>
                  <span>{selectedEdge.elementalGift.explanation}</span>
                </div>
              </div>

              {/* Box 2: What You Bring To Them */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bạn Trao Lại Gì Cho Họ?</span>
                  </span>
                  <span className="text-cyan-300">
                    {selectedEdge.giveEnergyScore}% Trao Đi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedEdge.whatYouBringToThem}
                </p>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300">
                  <strong className="text-teal-300">Tác Động Dưỡng Khí: </strong>
                  <span>Sự đồng hành của bạn giúp họ vững vàng và phát huy năng khiếu chuyên môn.</span>
                </div>
              </div>
            </div>

            {/* Special Feature: Bridging Remedy (If Clash / Friction Exists) */}
            {selectedEdge.bridgingRemedy && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-amber-950/40 to-slate-950/60 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Đơn Thuốc Hóa Giải Xung Khắc (Cầu Nối Ngũ Hành {selectedEdge.bridgingRemedy.nameVi})</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedEdge.bridgingRemedy.tacticalAdvice}
                </p>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-[11px] text-slate-300">
                  <strong className="text-teal-300">Phong Thủy Thực Chiến: </strong>
                  <span>{selectedEdge.bridgingRemedy.actionableFengShui}</span>
                </div>
              </div>
            )}

            {/* Tags Pill Bar */}
            {selectedEdge.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-3">
                <span className="text-[10px] font-mono text-slate-400">Đặc tính:</span>
                {selectedEdge.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* 4. Strategic Network Advice & Collective Synergy */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c0d1b] to-black border border-white/10 p-5 sm:p-7 space-y-4">
        <h4 className="text-sm sm:text-base font-bold text-white font-cinzel flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Chiến Lược Tối Ưu Hóa Mạng Lưới Nhân Sự &amp; Gia Đạo</span>
        </h4>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {networkAnalysis.strategicNetworkAdvice}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-1">
            <span className="text-emerald-400 font-bold block font-mono">
              ★ Thế Mạnh Hợp Lực Của Mạng Lưới:
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              {networkAnalysis.collectiveStrengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs space-y-1">
            <span className="text-amber-400 font-bold block font-mono">
              ⚠️ Điểm Cần Cân Bằng &amp; Tránh Xung Đột:
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              {networkAnalysis.collectiveVulnerabilities.map((vul, idx) => (
                <li key={idx}>{vul}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
