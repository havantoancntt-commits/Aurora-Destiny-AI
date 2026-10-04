// ==========================================
// AURORA DESTINY AI — STRATEGIC SYNERGY & RELATIONSHIP MATRIX 360° VIEW
// Ma Trận Đồng Hóa & Tương Hợp 360° Độc Quyền
// Bổ Khuyết Dụng Thần Bát Tự 2 Chiều & Tứ Hóa Phi Tinh Chéo Cung Tử Vi
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Briefcase,
  Heart,
  Sparkles,
  Users,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Scale,
  Award,
  ArrowRight,
  Flame,
  Droplets,
  Trees,
  Mountain,
  CircleDot,
  Layers,
  FileText,
  UserPlus,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { CalculationResult, LanguageCode, Gender, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  computeSynergyMatrix360,
  SynergyMatrixMode,
  SynergyMatrix360Report,
  FlyingSiHuaCrossLink
} from '../engine/synergyMatrix360';
import { runFullDestinyCalculation } from '../engine/destinyEngine';
import { ELEMENT_RELATIONS } from '../engine/canchi';

interface Props {
  activeProfile: UserProfile;
  calculation: CalculationResult;
  allProfiles: UserProfile[];
  language: LanguageCode;
}

export const SynergyMatrix360View: React.FC<Props> = ({
  activeProfile,
  calculation,
  allProfiles,
  language
}) => {
  const [mode, setMode] = useState<SynergyMatrixMode>('B2B_BOARDROOM');

  // List of other profiles excluding current
  const otherProfiles = useMemo(
    () => allProfiles.filter(p => p.id !== activeProfile.id),
    [allProfiles, activeProfile.id]
  );

  // Partner selection mode: 'saved' or 'custom'
  const [partnerMode, setPartnerMode] = useState<'saved' | 'custom'>(
    otherProfiles.length > 0 ? 'saved' : 'custom'
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    otherProfiles[0]?.id || ''
  );

  // Custom Partner Input State
  const [customPartnerInput, setCustomPartnerInput] = useState({
    name: 'Đối tác / Bạn đời',
    gender: (activeProfile.birthData.gender === 'Male' ? 'Female' : 'Male') as Gender,
    solarYear: 1992,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 10,
    solarMinute: 30
  });

  // Build Partner Calculation Result
  const { partnerProfile, partnerCalc } = useMemo(() => {
    if (partnerMode === 'saved' && selectedPartnerId) {
      const found = otherProfiles.find(p => p.id === selectedPartnerId);
      if (found) {
        const calc = runFullDestinyCalculation(found.birthData, found.id, 0);
        return { partnerProfile: found, partnerCalc: calc };
      }
    }

    // Custom partner
    const customProf: UserProfile = {
      id: 'custom_partner_profile',
      userId: activeProfile.userId || 'guest_user',
      isPrimary: false,
      name: customPartnerInput.name,
      avatarSeed: 'partner_seed',
      behavioralContext: {
        careerField: '',
        employmentStatus: '',
        financialGoal: '',
        relationshipStatus: '',
        topPriority: '',
        personalNotes: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      birthData: {
        solarYear: customPartnerInput.solarYear,
        solarMonth: customPartnerInput.solarMonth,
        solarDay: customPartnerInput.solarDay,
        solarHour: customPartnerInput.solarHour,
        solarMinute: customPartnerInput.solarMinute,
        hasExactHour: true,
        birthCity: 'Hà Nội',
        birthCountry: 'Việt Nam',
        timezoneOffset: 7,
        timezoneName: 'Asia/Ho_Chi_Minh',
        gender: customPartnerInput.gender,
        calendarSystem: 'solar'
      }
    };

    const customCalc = runFullDestinyCalculation(customProf.birthData, customProf.id, 0);
    return { partnerProfile: customProf, partnerCalc: customCalc };
  }, [partnerMode, selectedPartnerId, otherProfiles, customPartnerInput, activeProfile]);

  // Compute 360 Synergy Matrix
  const report: SynergyMatrix360Report = useMemo(() => {
    return computeSynergyMatrix360(
      activeProfile,
      calculation,
      partnerProfile,
      partnerCalc,
      mode
    );
  }, [activeProfile, calculation, partnerProfile, partnerCalc, mode]);

  const { metrics, verdict, elementalDeficit, crossFlyingStars, boardroomAllocation, soulmateGuidance } = report;

  const getVerdictStyle = () => {
    switch (verdict.code) {
      case 'DIAMOND_ALLIANCE':
        return 'from-teal-500/20 via-cyan-500/20 to-emerald-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)]';
      case 'GOLDEN_HARMONY':
        return 'from-amber-500/20 via-yellow-500/20 to-orange-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
      case 'COMPLEMENTARY_GROWTH':
        return 'from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-400/50';
      case 'HIGH_STAKES_CAUTION':
        return 'from-rose-500/20 via-red-500/20 to-amber-500/20 text-rose-300 border-rose-400/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]';
    }
  };

  const getElementIcon = (el: FiveElement) => {
    switch (el) {
      case 'Fire': return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'Water': return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      case 'Wood': return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Metal': return <CircleDot className="w-3.5 h-3.5 text-slate-300" />;
      case 'Earth': return <Mountain className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & MODE SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
              Ma Trận Đồng Hóa &amp; Tương Hợp 360°
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Synergy Matrix 360°
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hệ thống thẩm định tương hợp cao cấp đối chiếu <strong className="text-slate-200">Dụng Thần Bát Tự bổ khuyết 2 chiều</strong> và <strong className="text-slate-200">Tứ Hóa Phi Tinh chéo cung Tử Vi</strong>.
          </p>
        </div>

        {/* 2 Mode Tabs: B2B vs Romantic */}
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/15">
          <button
            onClick={() => setMode('B2B_BOARDROOM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-cinzel transition-all cursor-pointer ${
              mode === 'B2B_BOARDROOM'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Hội Đồng Doanh Chủ B2B</span>
          </button>
          <button
            onClick={() => setMode('SOULMATE_LIFE_COMPANION')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-cinzel transition-all cursor-pointer ${
              mode === 'SOULMATE_LIFE_COMPANION'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Gia Đạo &amp; Tình Duyên Tri Kỷ</span>
          </button>
        </div>
      </div>

      {/* 2. PARTNER CHOOSER BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Chủ Thể Đối Sánh: <span className="text-white">{activeProfile.name}</span> &amp;
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {otherProfiles.length > 0 && (
              <button
                onClick={() => setPartnerMode('saved')}
                className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                  partnerMode === 'saved'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                    : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Hồ Sơ Có Sẵn ({otherProfiles.length})
              </button>
            )}
            <button
              onClick={() => setPartnerMode('custom')}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                partnerMode === 'custom'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              Nhập Thông Tin Mới
            </button>
          </div>
        </div>

        {partnerMode === 'saved' && otherProfiles.length > 0 ? (
          <div className="flex items-center gap-3">
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="bg-black/80 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-400/60 w-full sm:w-auto min-w-[240px] cursor-pointer"
            >
              {otherProfiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.birthData.gender === 'Male' ? 'Nam' : 'Nữ'} · {p.birthData.solarYear})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 font-mono">
              Lá số được tự động đồng bộ từ cơ sở dữ liệu.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-1">
            <div className="col-span-2 sm:col-span-2">
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Tên Đối Tác / Bạn Đời</label>
              <input
                type="text"
                value={customPartnerInput.name}
                onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-teal-400"
                placeholder="Nhập tên..."
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Giới Tính</label>
              <select
                value={customPartnerInput.gender}
                onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, gender: e.target.value as Gender }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Năm Sinh</label>
              <input
                type="number"
                min="1940"
                max="2030"
                value={customPartnerInput.solarYear}
                onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, solarYear: parseInt(e.target.value, 10) || 1990 }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Tháng / Ngày</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={customPartnerInput.solarMonth}
                  onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, solarMonth: parseInt(e.target.value, 10) || 1 }))}
                  className="w-1/2 bg-black/60 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center"
                  placeholder="Tháng"
                />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={customPartnerInput.solarDay}
                  onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, solarDay: parseInt(e.target.value, 10) || 1 }))}
                  className="w-1/2 bg-black/60 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center"
                  placeholder="Ngày"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Giờ Sinh</label>
              <select
                value={customPartnerInput.solarHour}
                onChange={(e) => setCustomPartnerInput(prev => ({ ...prev, solarHour: parseInt(e.target.value, 10) || 0 }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
              >
                {[...Array(24)].map((_, h) => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. VERDICT HERO & RADAR 360 SUMMARY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] via-black/80 to-white/[0.02] border border-white/15 relative overflow-hidden backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border bg-gradient-to-r ${getVerdictStyle()}`}>
                {verdict.badgeTitleVi}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {mode === 'B2B_BOARDROOM' ? 'Thẩm Định Cơ Cấu Cổ Đông' : 'Hòa Hợp Nhân Duyên'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-white leading-snug">
              {verdict.tagline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-light">
              {verdict.summaryParagraph}
            </p>
          </div>

          {/* Master 360 Score Badge */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-black/80 via-white/[0.04] to-black/90 border border-white/20 shadow-inner text-center p-3 relative group">
              <div className="text-4xl sm:text-5xl font-light font-mono text-white tracking-tight">
                {metrics.overall360Score}
              </div>
              <span className="text-[10px] text-amber-300 uppercase tracking-widest font-mono font-bold mt-1">
                Tương Hợp 360°
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Thang điểm 100</span>
            </div>
          </div>
        </div>

        {/* 6 Radar Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          {[
            { label: 'Tầm Nhìn Chiến Lược', score: metrics.strategicVisionScore, color: 'text-amber-400', border: 'border-amber-500/30' },
            { label: 'Quản Trị Dòng Tiền', score: metrics.wealthStewardshipScore, color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: 'Bổ Khuyết Thực Thi', score: metrics.executionComplementScore, color: 'text-cyan-400', border: 'border-cyan-500/30' },
            { label: 'Minh Bạch Pháp Lý', score: metrics.trustGovernanceScore, color: 'text-blue-400', border: 'border-blue-500/30' },
            { label: 'Thấu Cảm Tâm Hồn', score: metrics.emotionalResonanceScore, color: 'text-rose-400', border: 'border-rose-500/30' },
            { label: 'Sức Bền Biến Cố', score: metrics.crisisResilienceScore, color: 'text-purple-400', border: 'border-purple-500/30' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl bg-black/40 border ${item.border} flex flex-col justify-between`}
            >
              <span className="text-[11px] text-slate-400 leading-tight">
                {item.label}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-xl font-mono font-bold ${item.color}`}>
                  {item.score}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BI-DIRECTIONAL ELEMENTAL DEFICIT & DAY MASTER COMBINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Elemental Deficit Matching */}
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold font-cinzel text-white uppercase tracking-wider">
              Bổ Khuyết Dụng Thần Bát Tự 2 Chiều
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {elementalDeficit.mutualSupplementSummary}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* User */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
              <span className="text-xs font-bold text-white block">{activeProfile.name}</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span>Vượng:</span>
                <span className="font-bold flex items-center gap-1 text-emerald-300">
                  {getElementIcon(elementalDeficit.userDominantElement)}
                  {ELEMENT_RELATIONS[elementalDeficit.userDominantElement]?.vi}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Khuyết:</span>
                <span className="font-bold text-rose-300">
                  {ELEMENT_RELATIONS[elementalDeficit.userDeficitElement]?.vi}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/10">
                Được trợ lực: <strong className="text-teal-300">{elementalDeficit.userHelpedByPartnerScore}đ</strong>
              </div>
            </div>

            {/* Partner */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
              <span className="text-xs font-bold text-white block">{partnerProfile.name}</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span>Vượng:</span>
                <span className="font-bold flex items-center gap-1 text-emerald-300">
                  {getElementIcon(elementalDeficit.partnerDominantElement)}
                  {ELEMENT_RELATIONS[elementalDeficit.partnerDominantElement]?.vi}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Khuyết:</span>
                <span className="font-bold text-rose-300">
                  {ELEMENT_RELATIONS[elementalDeficit.partnerDeficitElement]?.vi}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/10">
                Được trợ lực: <strong className="text-teal-300">{elementalDeficit.partnerHelpedByUserScore}đ</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Day Master Synergy Dynamic */}
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-semibold font-cinzel text-white uppercase tracking-wider">
                  Tương Quan Thiên Can Nhật Chủ
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                elementalDeficit.dayMasterRelationship.dynamicType === 'TƯƠNG_HỢP' || elementalDeficit.dayMasterRelationship.dynamicType === 'TƯƠNG_SINH'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {elementalDeficit.dayMasterRelationship.dynamicType}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {elementalDeficit.dayMasterRelationship.description}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Nhật Chủ {activeProfile.name}</span>
              <span className="text-sm font-bold font-cinzel text-white">
                {elementalDeficit.dayMasterRelationship.userDayMasterVi} ({calculation.bazi.dayMasterElement})
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Nhật Chủ {partnerProfile.name}</span>
              <span className="text-sm font-bold font-cinzel text-white">
                {elementalDeficit.dayMasterRelationship.partnerDayMasterVi} ({partnerCalc.bazi.dayMasterElement})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CROSS-CHART FLYING SI HUA TRANSFORMATIONS (TỨ HÓA PHI TINH CHÉO CUNG) */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-base font-bold font-cinzel text-white">
                Tứ Hóa Phi Tinh Chéo Cung (Cross-Chart Si Hua Synastry)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cơ chế phóng Tứ Hóa từ Cung Mệnh của người này sang các Cung chức năng trên lá số người kia.
            </p>
          </div>
          <span className="text-[11px] font-mono text-purple-300">
            {crossFlyingStars.length} liên kết phi tinh phát hiện
          </span>
        </div>

        {crossFlyingStars.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Không tìm thấy liên kết Tứ Hóa trực diện giữa 2 bản mệnh.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {crossFlyingStars.map((link, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  link.transformationType === 'Lộc'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : link.transformationType === 'Quyền'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : link.transformationType === 'Khoa'
                    ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>{link.sourcePerson}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{link.targetPerson}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/40 border border-white/20">
                    Hóa {link.transformationType} • Sao {link.starName}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 mb-2 font-mono">
                  Chiếu vào: <strong className="text-white">Cung {link.targetPalaceNameVi}</strong>
                </div>

                <p className="text-xs leading-relaxed text-slate-200/90 font-light">
                  {link.significance}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. MODE-SPECIFIC STRATEGIC DEEP-DIVES */}
      {mode === 'B2B_BOARDROOM' && boardroomAllocation && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-black/60 to-white/[0.02] border border-amber-500/30 space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-bold font-cinzel text-white">
                Bản Phân Bổ Chức Danh &amp; Kiểm Soát Vốn Cổ Đông
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-300 uppercase px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
              Boardroom Protocol
            </span>
          </div>

          {/* 3 Executive Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Chủ Tịch HĐQT</span>
              <div className="text-sm font-bold font-cinzel text-white">{boardroomAllocation.chairperson.name}</div>
              <p className="text-xs text-slate-300 leading-snug">{boardroomAllocation.chairperson.rationale}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-teal-500/30 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">Tổng Giám Đốc (CEO)</span>
              <div className="text-sm font-bold font-cinzel text-white">{boardroomAllocation.managingPartner.name}</div>
              <p className="text-xs text-slate-300 leading-snug">{boardroomAllocation.managingPartner.rationale}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/30 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">Giám Đốc Tài Chính (CFO)</span>
              <div className="text-sm font-bold font-cinzel text-white">{boardroomAllocation.cfoTreasurer.name}</div>
              <p className="text-xs text-slate-300 leading-snug">{boardroomAllocation.cfoTreasurer.rationale}</p>
            </div>
          </div>

          {/* Governance & Capital Risk Checkpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Chỉ Số Rủi Ro Thất Thoát Dòng Vốn
                </span>
                <span className={`text-xs font-mono font-bold ${
                  boardroomAllocation.capitalLeakageRiskIndex > 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {boardroomAllocation.capitalLeakageRiskIndex}% Rủi ro
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                {boardroomAllocation.riskCheckpoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                Quy Trình Hóa Giải Bế Tắc (Deadlock Protocol)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {boardroomAllocation.deadlockResolutionProtocol}
              </p>
              <div className="text-[11px] font-mono text-amber-300/80 pt-2 border-t border-white/10">
                {boardroomAllocation.votingRule}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'SOULMATE_LIFE_COMPANION' && soulmateGuidance && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-500/10 via-black/60 to-white/[0.02] border border-rose-500/30 space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <h4 className="text-lg font-bold font-cinzel text-white">
                Chỉ Dẫn Hóa Giải Ngũ Hành &amp; Nuôi Dưỡng Nhân Duyên
              </h4>
            </div>
            <span className="text-[10px] font-mono text-rose-300 uppercase px-2.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
              Soulmate Guidance
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
            {soulmateGuidance.spousePalaceResonance}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <span className="text-xs font-mono uppercase text-emerald-300 font-bold block">Điểm Tựa Tâm Hồn Đồng Điệu</span>
              <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-emerald-400">
                {soulmateGuidance.harmonyStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <span className="text-xs font-mono uppercase text-rose-300 font-bold block">Điểm Cần Lắng Nghe &amp; Thấu Hiểu</span>
              <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-rose-400">
                {soulmateGuidance.potentialFrictionPoints.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feng Shui Living Space Advice */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
            <span className="text-xs font-mono uppercase text-amber-300 font-bold block">
              Phong Thủy Không Gian Chung &amp; Giao Tiếp Tỉnh Thức
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
              <div>
                <strong className="text-white block mb-0.5">Màu Sắc Phòng Chung:</strong>
                <span>{soulmateGuidance.fengShuiHarmonization.sharedSpacePalette}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Góc Sinh Khí Gia Đạo:</strong>
                <span>{soulmateGuidance.fengShuiHarmonization.vitalityCornerDirection}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Nguyên Tắc Giao Tiếp:</strong>
                <span>{soulmateGuidance.fengShuiHarmonization.mindfulCommunicationRule}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
