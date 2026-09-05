// ==========================================
// CORE DESTINY DASHBOARD COMPONENT
// Ultra-luxury animated Destiny Dashboard
// ==========================================

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Shield,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Compass,
  Zap,
  Info,
  Calendar,
  MapPin,
  CheckCircle2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { CalculationResult, ZiWeiPalace, PalaceKey, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { PALACE_DEFS } from '../engine/ziwei';
import { t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  language: LanguageCode;
  onRecalculate?: () => void;
  onNavigateTab?: (tab: any) => void;
  onOpenReportModal?: () => void;
}

export const DestinyDashboard: React.FC<Props> = ({
  profile,
  calculation,
  ensemble,
  language,
  onRecalculate,
  onNavigateTab,
  onOpenReportModal
}) => {
  const [selectedPalaceKey, setSelectedPalaceKey] = useState<PalaceKey>('life');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const selectedPalace = ziwei.palaces[selectedPalaceKey] || ziwei.palaces.life;

  const currentYear = new Date().getFullYear();
  const currentTransit = calculation.annualTransits?.find((t) => t.year === currentYear) || calculation.annualTransits?.[0] || {
    year: currentYear,
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

  const handleRefresh = async () => {
    if (onRecalculate) {
      setIsRecalculating(true);
      await onRecalculate();
      setTimeout(() => setIsRecalculating(false), 600);
    }
  };

  const getElementBadgeColor = (el: FiveElement) => {
    switch (el) {
      case 'Wood': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Fire': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Earth': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Metal': return 'bg-slate-300/20 text-slate-200 border-slate-400/40';
      case 'Water': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO EXECUTIVE SUMMARY CARD WITH DYNAMIC LIGHTING */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-white/[0.01] border border-white/15 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]"
      >
        {/* Specular Ambient Glow Rings */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/40 text-purple-300 font-mono tracking-wider shadow-sm">
                {bazi.structureType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 border border-teal-500/40 text-teal-300 shadow-sm">
                {ziwei.elementBureau}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#2dd4bf]"></span>
                <span>Chuẩn Định Thuật Toán v4.2</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white uppercase font-sans flex items-center gap-2">
              <span>{profile.name}</span>
              <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                {profile.birthData.solarDay}/{profile.birthData.solarMonth}/{profile.birthData.solarYear} (Dương lịch)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {profile.birthData.solarHour.toString().padStart(2, '0')}:{profile.birthData.solarMinute.toString().padStart(2, '0')} ({profile.birthData.timezoneName})
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.birthData.birthCity || 'Hà Nội'}, {profile.birthData.birthCountry || 'Việt Nam'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex flex-col items-end p-4 rounded-2xl bg-black/60 border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl"
            >
              <div className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>Độ Tin Cậy Phân Tích</span>
                <Shield className="w-3 h-3 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-light text-white tracking-tighter">
                  {ensemble.overallConsistencyScore}
                </span>
                <span className="text-xs opacity-60 text-slate-400">/ 100</span>
              </div>
              <div className="w-28 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${ensemble.overallConsistencyScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-teal-400 to-cyan-300 shadow-[0_0_8px_#2dd4bf]"
                />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRecalculating}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 transition-all shadow-md cursor-pointer"
              title="Tính toán lại lá số"
            >
              <RefreshCw className={`w-5 h-5 ${isRecalculating ? 'animate-spin text-teal-400' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Master Intelligence Quote Box */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="p-4 bg-purple-500/10 rounded-2xl border-l-3 border-purple-500 shadow-inner">
            <p className="text-xs sm:text-sm italic leading-relaxed text-slate-200">
              "{ensemble.executiveSummary}"
            </p>
          </div>
        </div>

        {/* Executive Dossier Callout Banner */}
        {onOpenReportModal && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0a0d1c] to-amber-950/40 border border-amber-500/40 shadow-[0_4px_25px_rgba(251,191,36,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] shrink-0">
                <BookOpen className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wide font-cinzel">
                    Sách Bản Mệnh Tinh Hoa • Executive Dossier PDF
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    6 TRANG A4
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ấn phẩm cẩm nang bìa mạ vàng tiêu chuẩn in ấn, tích hợp dấu mộc triện thư, chữ ký bảo chứng của Giáo Sư - Prof.TOAN &amp; cẩm nang phong thủy cá nhân trọn đời.
                </p>
              </div>
            </div>

            <button
              id="btn-open-executive-dossier"
              onClick={onOpenReportModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>Xem &amp; Xuất Bản Sách</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* 2. BAZI FOUR PILLARS (TỨ TRỤ BÁT TỰ) INTERACTIVE GRID */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
              Tứ Trụ Bát Tự Nguyên Bản
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Nhật Chủ:</span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold font-mono border ${getElementBadgeColor(bazi.dayMasterElement)} shadow-sm`}>
              {dm.nameVi} ({dm.yinYang} {ELEMENT_RELATIONS[bazi.dayMasterElement]?.vi || bazi.dayMasterElement}) — {bazi.dayMasterStrength}
            </span>
          </div>
        </div>

        {/* 4 Pillars Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Trụ Giờ', pillar: bazi.hourPillar, note: 'Hậu vận & Con cái' },
            { label: 'Trụ Ngày (Nhật Chủ)', pillar: bazi.dayPillar, note: 'Bản thân & Hôn nhân', isDayMaster: true },
            { label: 'Trụ Tháng', pillar: bazi.monthPillar, note: 'Sự nghiệp & Cha mẹ' },
            { label: 'Trụ Năm', pillar: bazi.yearPillar, note: 'Gia thế & Tổ tiên' },
          ].map(({ label, pillar, note, isDayMaster }, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`relative flex flex-col items-center rounded-2xl p-3.5 border text-center transition-all ${
                isDayMaster
                  ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_25px_rgba(124,58,237,0.2)] ring-1 ring-purple-500/30'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 truncate w-full">
                {label}
              </span>

              {/* Ten God Badge */}
              <span className="mt-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 text-teal-300 border border-white/10 truncate max-w-full font-semibold">
                {pillar.tenGod}
              </span>

              {/* Stem & Branch Display */}
              <div className="my-2.5 space-y-0.5">
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {STEMS[pillar.stem]?.nameVi || pillar.stem}
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-300">
                  {BRANCHES[pillar.branch]?.nameVi || pillar.branch}
                </div>
              </div>

              {/* Element Tag */}
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium border ${getElementBadgeColor(pillar.stemElement)}`}>
                {ELEMENT_RELATIONS[pillar.stemElement]?.vi || pillar.stemElement}
              </span>

              {/* Na Yin & Hidden Stems */}
              <div className="mt-2.5 pt-2 border-t border-white/10 w-full space-y-1 text-[10px] text-slate-400">
                <div className="font-mono truncate" title={pillar.naYin}>
                  {pillar.naYin}
                </div>
                <div className="text-slate-500 truncate" title={`Tàng can: ${pillar.hiddenStems.map(s => `${STEMS[s.stem]?.nameVi || s.stem} (${s.tenGod})`).join(', ')}`}>
                  Tàng: {pillar.hiddenStems.map((s) => (STEMS[s.stem]?.nameVi || s.stem).charAt(0)).join('/')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Five Elements Balance Bar & Dụng Thần Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Elements Bar */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold tracking-wide">Cân Bằng Năng Lượng Ngũ Hành</span>
              <span className="text-[10px] text-teal-400 font-mono">100%</span>
            </div>

            {/* Visual stacked percentage bar with gradient */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-white/5 border border-white/10 shadow-inner">
              <div style={{ width: `${bazi.elementBalance.Wood}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Mộc: ${bazi.elementBalance.Wood}%`} />
              <div style={{ width: `${bazi.elementBalance.Fire}%` }} className="bg-rose-500 h-full transition-all duration-500" title={`Hỏa: ${bazi.elementBalance.Fire}%`} />
              <div style={{ width: `${bazi.elementBalance.Earth}%` }} className="bg-amber-500 h-full transition-all duration-500" title={`Thổ: ${bazi.elementBalance.Earth}%`} />
              <div style={{ width: `${bazi.elementBalance.Metal}%` }} className="bg-slate-300 h-full transition-all duration-500" title={`Kim: ${bazi.elementBalance.Metal}%`} />
              <div style={{ width: `${bazi.elementBalance.Water}%` }} className="bg-cyan-400 h-full transition-all duration-500" title={`Thủy: ${bazi.elementBalance.Water}%`} />
            </div>

            <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-mono pt-0.5">
              <span className="text-emerald-400">Mộc {bazi.elementBalance.Wood}%</span>
              <span className="text-rose-400">Hỏa {bazi.elementBalance.Fire}%</span>
              <span className="text-amber-400">Thổ {bazi.elementBalance.Earth}%</span>
              <span className="text-slate-300">Kim {bazi.elementBalance.Metal}%</span>
              <span className="text-cyan-400">Thủy {bazi.elementBalance.Water}%</span>
            </div>
          </div>

          {/* Dụng Thần & Hỷ Thần */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {t('favorableElements', language)}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dụng Thần:</span>
                <span className="font-bold text-teal-400">
                  {bazi.favorableElements.map((e) => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kỵ Thần:</span>
                <span className="font-bold text-rose-400">
                  {bazi.unfavorableElements.map((e) => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-white/10 pt-1.5 opacity-70">
              Khuyến nghị tăng cường yếu tố mang hành Dụng Thần để cân bằng khí lực.
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. ZI WEI DOU SHU 12 PALACES INTERACTIVE MATRIX */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-full shadow-[0_0_8px_#2dd4bf]"></span>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
              Tử Vi Đẩu Số — 12 Cung Vị Bản Mệnh
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Chọn cung vị để xem chi tiết sao & Tứ Hóa
          </span>
        </div>

        {/* 12 Palaces Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {PALACE_DEFS.map((def) => {
            const pal = ziwei.palaces[def.key];
            const isSelected = selectedPalaceKey === def.key;
            return (
              <motion.button
                key={def.key}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPalaceKey(def.key)}
                className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/60 shadow-[0_0_20px_rgba(124,58,237,0.3)] ring-1 ring-purple-500/40'
                    : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                    {def.nameVi}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {pal?.score || 70}đ
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  Cung {def.nameVi}
                </span>

                {/* Stars Mini Pills */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {pal?.majorStars.slice(0, 1).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-purple-300 border border-white/10 truncate">
                      {s.nameVi}
                    </span>
                  ))}
                  {pal?.transformations && pal.transformations.length > 0 && (
                    <span className="px-1 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                      {pal.transformations[0]}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Palace Detailed Breakdown */}
        {selectedPalace && (
          <motion.div
            key={selectedPalaceKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-purple-500/40 space-y-3.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium text-white">
                    Cung {selectedPalace.nameVi}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    Chi {selectedPalace.branch} / Can {selectedPalace.stem}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPalace.focalTheme}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-teal-400 uppercase tracking-wider">Năng Lượng Cung</div>
                  <div className="text-xl font-light font-mono text-white">
                    {selectedPalace.score}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Stars List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Major Stars */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Chính Tinh Chủ Quản</div>
                <div className="space-y-1.5">
                  {selectedPalace.majorStars.map((star, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{star.nameVi}</span>
                        <span className="text-[10px] text-slate-400">({star.brightness === 'M' ? 'Miếu Địa' : star.brightness === 'V' ? 'Vượng Địa' : star.brightness === 'D' ? 'Đắc Địa' : star.brightness === 'B' ? 'Bình Hòa' : 'Hãm Địa'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60">
                          {star.brightness === 'M' ? 'Miếu' : star.brightness === 'V' ? 'Vượng' : star.brightness === 'D' ? 'Đắc' : star.brightness === 'B' ? 'Bình' : 'Hãm'}
                        </span>
                        {star.transformation && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60 font-bold">
                            Hóa {star.transformation}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minor Stars */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Phụ Tinh & Trợ Tinh Cát Lợi</div>
                <div className="space-y-1.5">
                  {selectedPalace.minorStars.map((star, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <span className="font-medium text-slate-200">{star.nameVi}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-teal-300 border border-white/5">
                        {star.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 4. CURRENT TRANSIT & STRATEGIC RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transit Energy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]"></span>
              <h4 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
                Lưu Niên Năm {currentYear} ({currentTransit.stem} {currentTransit.branch})
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400">
              {currentTransit.overallScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{currentTransit.highlightSummary}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[9px] text-teal-400 uppercase font-semibold">Sóng Cơ Hội</div>
              <div className="text-lg font-light font-mono text-white">{currentTransit.opportunityWave}%</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[9px] text-purple-400 uppercase font-semibold">Sóng Thận Trọng</div>
              <div className="text-lg font-light font-mono text-white">{currentTransit.cautionWave}%</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-white/10 pt-2.5 flex items-center justify-between">
            <span>Trọng tâm khuyến nghị:</span>
            <span className="font-semibold text-slate-200">{currentTransit.recommendedFocus}</span>
          </div>
        </motion.div>

        {/* Strategic Timing Windows */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            <h4 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
              Cửa Sổ Thời Điểm Chiến Lược
            </h4>
          </div>

          <div className="space-y-2">
            {ensemble.strategicTimingWindows.map((win, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300">{win.timeframe}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                    {win.phaseType}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{win.strategicFocus}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
