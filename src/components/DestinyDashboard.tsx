// ==========================================
// CORE DESTINY DASHBOARD COMPONENT
// International Top-Tier Authentic Destiny Dashboard
// Chuẩn xác Tử Vi Đẩu Số 12 Cung & Tứ Trụ Bát Tự
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  BookOpen,
  Share2,
  Grid3X3,
  LayoutGrid,
  Eye,
  Sliders,
  Crown,
  Sun,
  HeartHandshake,
  ArrowRight,
  Volume2,
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { CalculationResult, ZiWeiPalace, PalaceKey, FiveElement, EarthlyBranch } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { STEMS, BRANCHES, BRANCH_KEYS, ELEMENT_RELATIONS } from '../engine/canchi';
import { PALACE_DEFS, getAspectingInfluences, AspectingInfluence } from '../engine/ziwei';
import { t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';
import { BaGuaCompassWidget } from './BaGuaCompassWidget';
import { RealTimeLuckRadarBar } from './RealTimeLuckRadarBar';
import { AgentInfluenceChart } from './AgentInfluenceChart';
import { PersonalEnergy12MonthsChart } from './PersonalEnergy12MonthsChart';
import { PersonalEnergyAlertBanner } from './PersonalEnergyAlertBanner';
import { compute12MonthsEnergyTrajectory, detectEnergyShifts } from '../engine/personalEnergyEngine';
import { sacredVoice } from '../services/sacredVoiceService';
import { sacredSound } from '../services/soundService';
import { SacredSealBadge } from './SacredSealBadge';
import { DailyGoldenCompassCard } from './DailyGoldenCompassCard';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  language: LanguageCode;
  onRecalculate?: () => void;
  onNavigateTab?: (tab: any) => void;
  onOpenReportModal?: () => void;
  onOpenShareCardModal?: () => void;
  onOpenOracleModal?: () => void;
  onOpenSponsorshipModal?: () => void;
  onOpenAlertCenter?: () => void;
  onOpenTalismanModal?: () => void;
  onOpenSeniorGuide?: () => void;
  onOpenPwaProfileManager?: () => void;
}

// 4x4 Classical Celestial Grid Coordinate Definition (12 Earthly Branches clockwise perimeter)
interface BoardCellDef {
  branch: EarthlyBranch;
  colStart: string;
  rowStart: string;
  quadrantName: string;
}

const CELESTIAL_BOARD_CELLS: BoardCellDef[] = [
  // Row 1 (Top edge: Tỵ -> Ngọ -> Mùi -> Thân)
  { branch: 'Si', colStart: 'col-start-1', rowStart: 'row-start-1', quadrantName: 'Đông Nam' },
  { branch: 'Wu_B', colStart: 'col-start-2', rowStart: 'row-start-1', quadrantName: 'Chính Nam' },
  { branch: 'Wei', colStart: 'col-start-3', rowStart: 'row-start-1', quadrantName: 'Tây Nam' },
  { branch: 'Shen', colStart: 'col-start-4', rowStart: 'row-start-1', quadrantName: 'Tây Nam' },

  // Row 2 (Right edge: Dậu) and (Left edge: Thìn)
  { branch: 'Chen', colStart: 'col-start-1', rowStart: 'row-start-2', quadrantName: 'Đông Nam' },
  { branch: 'You', colStart: 'col-start-4', rowStart: 'row-start-2', quadrantName: 'Chính Tây' },

  // Row 3 (Right edge: Tuất) and (Left edge: Mão)
  { branch: 'Mao', colStart: 'col-start-1', rowStart: 'row-start-3', quadrantName: 'Chính Đông' },
  { branch: 'Xu', colStart: 'col-start-4', rowStart: 'row-start-3', quadrantName: 'Tây Bắc' },

  // Row 4 (Bottom edge: Dần <- Sửu <- Tý <- Hợi)
  { branch: 'Yin_B', colStart: 'col-start-1', rowStart: 'row-start-4', quadrantName: 'Đông Bắc' },
  { branch: 'Chou', colStart: 'col-start-2', rowStart: 'row-start-4', quadrantName: 'Đông Bắc' },
  { branch: 'Zi', colStart: 'col-start-3', rowStart: 'row-start-4', quadrantName: 'Chính Bắc' },
  { branch: 'Hai', colStart: 'col-start-4', rowStart: 'row-start-4', quadrantName: 'Tây Bắc' },
];

export const DestinyDashboard: React.FC<Props> = ({
  profile,
  calculation,
  ensemble,
  language,
  onRecalculate,
  onNavigateTab,
  onOpenReportModal,
  onOpenShareCardModal,
  onOpenOracleModal = () => {},
  onOpenSponsorshipModal = () => {},
  onOpenAlertCenter = () => {},
  onOpenTalismanModal,
  onOpenSeniorGuide,
  onOpenPwaProfileManager
}) => {
  const [selectedPalaceKey, setSelectedPalaceKey] = useState<PalaceKey>('life');
  const [ziweiViewMode, setZiweiViewMode] = useState<'board4x4' | 'cardList'>('board4x4');
  const [analysisTab, setAnalysisTab] = useState<'essence' | 'body' | 'sanfang' | 'transit'>('essence');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [voiceState, setVoiceState] = useState(sacredVoice.getState());
  const [selectedEnergyMonth, setSelectedEnergyMonth] = useState<{ year: number; month: number } | null>(null);

  useEffect(() => {
    const unsub = sacredVoice.subscribe(setVoiceState);
    return () => unsub();
  }, []);

  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const selectedPalace = ziwei.palaces[selectedPalaceKey] || ziwei.palaces.life;

  // Compute 12-month energy forecast & detect sudden drops/surges for gentle notifications
  const energyData = useMemo(() => {
    return compute12MonthsEnergyTrajectory(calculation);
  }, [calculation]);

  const energyAlerts = useMemo(() => {
    return detectEnergyShifts(energyData, {
      favorableElements: bazi.favorableElements,
      unfavorableElements: bazi.unfavorableElements
    });
  }, [energyData, bazi.favorableElements, bazi.unfavorableElements]);

  // Map each Earthly Branch to its assigned Zi Wei Palace
  const palaceByBranch = useMemo(() => {
    const map: Record<string, ZiWeiPalace> = {};
    (Object.values(ziwei.palaces) as ZiWeiPalace[]).forEach((p) => {
      map[p.branch] = p;
    });
    return map;
  }, [ziwei.palaces]);

  // Calculate Tam Phuong Tu Chinh for the selected palace
  const sanFangTuChinh = useMemo(() => {
    if (!selectedPalace) return { opposite: null, trine1: null, trine2: null };
    const selIdx = BRANCH_KEYS.indexOf(selectedPalace.branch);
    const oppIdx = (selIdx + 6) % 12;
    const trine1Idx = (selIdx + 4) % 12;
    const trine2Idx = (selIdx + 8) % 12;

    const oppBranch = BRANCH_KEYS[oppIdx];
    const trine1Branch = BRANCH_KEYS[trine1Idx];
    const trine2Branch = BRANCH_KEYS[trine2Idx];

    return {
      oppositeBranch: oppBranch,
      trine1Branch,
      trine2Branch,
      oppositePalace: palaceByBranch[oppBranch],
      trine1Palace: palaceByBranch[trine1Branch],
      trine2Palace: palaceByBranch[trine2Branch]
    };
  }, [selectedPalace, palaceByBranch]);

  // Xác định các cung hội chiếu (Xung Chiếu & Tam Hợp) có sao xấu / sát tinh vào cung đang chọn
  const aspectingInfluences = useMemo(() => {
    return getAspectingInfluences(selectedPalace, palaceByBranch);
  }, [selectedPalace, palaceByBranch]);

  // Tra cứu nhanh các chi có sao xấu hội chiếu
  const badStarAspectingBranchMap = useMemo(() => {
    const map: Record<string, AspectingInfluence> = {};
    aspectingInfluences.forEach((inf) => {
      if (inf.hasChallengingStars) {
        map[inf.palace.branch] = inf;
      }
    });
    return map;
  }, [aspectingInfluences]);

  const totalAspectingChallengingStars = useMemo(() => {
    return aspectingInfluences.reduce((acc, curr) => acc + curr.challengingStars.length, 0);
  }, [aspectingInfluences]);

  const currentYear = calculation.analysisYear || new Date().getFullYear();
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
    highlightSummary: 'Vận trình năm hiện tại hội tụ năng lượng phát triển',
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
      case 'Wood': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Fire': return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'Earth': return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Metal': return 'bg-slate-300/15 text-slate-200 border-slate-400/40';
      case 'Water': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getBrightnessColor = (b: 'M' | 'V' | 'D' | 'B' | 'H') => {
    switch (b) {
      case 'M': return 'text-amber-400 font-bold'; // Miếu Địa
      case 'V': return 'text-emerald-400 font-bold'; // Vượng Địa
      case 'D': return 'text-cyan-300 font-semibold'; // Đắc Địa
      case 'B': return 'text-slate-300'; // Bình Hòa
      case 'H': return 'text-rose-400 font-medium'; // Hãm Địa
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 0. LIVE REAL-TIME LUCK & FORTUNE RADAR MONITOR */}
      <RealTimeLuckRadarBar
        calculation={calculation}
        onOpenFullRadar={onOpenAlertCenter}
      />

      {/* 0.5. NHẬT THỜI KHANG NINH: LA BÀN HOÀNG KIM 24 GIỜ & PHONG BAO MINH TRIẾT */}
      <DailyGoldenCompassCard
        profile={profile}
        calculation={calculation}
        onOpenSponsorshipModal={onOpenSponsorshipModal}
        onNavigateToDailyTab={() => onNavigateTab && onNavigateTab('daily')}
        onOpenShareCardModal={onOpenShareCardModal}
      />

      {/* 1. EXECUTIVE DOSSIER HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-black/40 border border-white/10 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            {/* Academic Credential & Bureau Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono tracking-wide">
                Huyền Phong Phật Đạo
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                {bazi.structureType}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-300">
                {ziwei.elementBureau}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-300">
                {ziwei.yinYangGenderHarmony?.yinYangNature || (profile.birthData.gender === 'Male' ? 'Nam Mệnh' : 'Nữ Mệnh')}
              </span>
            </div>

            {/* Native Name Header */}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white uppercase font-sans">
                {profile.name}
              </h2>
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>

            {/* Astronomical Birth Coordinates */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Dương lịch: {profile.birthData.solarDay}/{profile.birthData.solarMonth}/{profile.birthData.solarYear}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Giờ: {profile.birthData.solarHour.toString().padStart(2, '0')}:{profile.birthData.solarMinute.toString().padStart(2, '0')} ({profile.birthData.timezoneName})
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.birthData.birthCity || 'Hà Nội'}, {profile.birthData.birthCountry || 'Việt Nam'}
              </span>
            </div>
          </div>

          {/* Right Action & Confidence Rating */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex flex-col items-end p-3.5 rounded-2xl bg-black/50 border border-white/10 shadow-lg backdrop-blur-xl">
              <div className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>Độ Xác Thực Lá Số</span>
                <Shield className="w-3 h-3 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-light text-white font-mono">
                  {ensemble.overallConsistencyScore}
                </span>
                <span className="text-xs opacity-50 text-slate-400">/ 100</span>
              </div>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div
                  style={{ width: `${ensemble.overallConsistencyScore}%` }}
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-300"
                />
              </div>
            </div>

            {onOpenPwaProfileManager && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenPwaProfileManager}
                className="p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Quản lý kho hồ sơ lá số & sao lưu PWA ngoại tuyến"
              >
                <HardDrive className="w-5 h-5 text-teal-400" />
                <span className="hidden xl:inline text-xs font-semibold">Kho Lá Số PWA</span>
              </motion.button>
            )}

            {onRecalculate && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRecalculating}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all shadow-md cursor-pointer"
                title="Tính toán lại theo dữ liệu mới"
              >
                <RefreshCw className={`w-5 h-5 ${isRecalculating ? 'animate-spin text-teal-400' : ''}`} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Master Synthesis Insight */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="p-3.5 bg-white/[0.02] rounded-xl border-l-2 border-purple-400">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 italic">
              "{ensemble.executiveSummary}"
            </p>
          </div>
        </div>

        {/* 7 AI Agents Influence Attribution Interactive Chart */}
        <AgentInfluenceChart
          ensemble={ensemble}
          calculation={calculation}
          profile={profile}
        />

        {/* Executive Dossier Callout Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Sách Bản Mệnh Tinh Hoa • Executive Dossier PDF
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CHÍNH TÔNG
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ấn phẩm cẩm nang mạ vàng tiêu chuẩn in ấn, triện thư bảo chứng từ Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {onOpenTalismanModal && (
              <button
                id="btn-open-talisman-dashboard"
                onClick={onOpenTalismanModal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 via-amber-400 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.3)] hover-sacred-wobble transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Khai mở Thẻ Mệnh Kim Giáp 3D & Bia Vàng Công Đức"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950/30" />
                <span>Thẻ Kim Giáp 3D</span>
              </button>
            )}
            {onOpenShareCardModal && (
              <button
                id="btn-open-share-card"
                onClick={onOpenShareCardModal}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Thẻ Chia Sẻ</span>
              </button>
            )}
            {onOpenReportModal && (
              <button
                id="btn-open-executive-dossier"
                onClick={onOpenReportModal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-md hover-sacred-wobble transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-950" />
                <span>Xuất Bản Sách PDF</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* DÀNH CHO BÁC/CÔ CHÚ: TRỢ LÝ HƯỚNG DẪN LẬP LÁ SỐ TỪNG BƯỚC (A - Z) */}
      {onOpenSeniorGuide && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#191421]/90 to-[#0e1622]/90 border border-amber-500/40 p-4 sm:p-5 shadow-[0_10px_30px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 mt-0.5 sm:mt-0">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  Dành Riêng Cho Người Lớn Tuổi
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Kênh Huyền Phong Phật Đạo</span>
                <SacredSealBadge text="THIÊN CƠ" subtext="KHAI QUANG" size="sm" className="hidden lg:inline-flex" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cinzel mt-1 break-words leading-snug">
                Trợ Lý Hướng Dẫn Điền Thông Tin Xem Lá Số Tử Vi Từ A - Z
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1 break-words">
                Chữ lớn, dễ hiểu, tra cứu 12 con giáp (1930 - 2025), giải mã giờ sinh qua ký ức dân gian xưa (gà gáy, rạng đông, chính trưa...) kèm giọng đọc hướng dẫn tiếng Việt.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* Sacred Voice Listening Button */}
            <button
              type="button"
              onClick={() => {
                if (voiceState.isPlaying && voiceState.currentScriptId === 'welcome_invitation') {
                  sacredVoice.stop();
                } else {
                  sacredVoice.speak('welcome_invitation');
                }
              }}
              className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                voiceState.isPlaying && voiceState.currentScriptId === 'welcome_invitation'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-1 ring-amber-400'
                  : 'bg-black/60 hover:bg-black/80 border-amber-500/30 text-amber-300'
              }`}
              title={voiceState.isPlaying ? 'Dừng đọc' : 'Nghe Lời Thỉnh Mệnh Khai Tâm (Giọng Truyền Cảm)'}
            >
              <Volume2 className={`w-4 h-4 ${voiceState.isPlaying ? 'text-amber-300 animate-pulse' : 'text-amber-400'}`} />
              <span>{voiceState.isPlaying && voiceState.currentScriptId === 'welcome_invitation' ? 'Đang Khai Ngôn...' : 'Nghe Lời Thỉnh Mệnh'}</span>
            </button>

            {/* Launch Guided Assistant */}
            <button
              type="button"
              onClick={() => {
                sacredSound.playSacredTap(528);
                onOpenSeniorGuide();
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>Mở Trợ Lý Hướng Dẫn</span>
              <ArrowRight className="w-4 h-4 text-black shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* PROPRIETARY APPS HIGHLIGHT: LA BÀN ĐỊNH THỜI & MA TRẬN ĐỒNG HÓA 360° */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: La Bàn Định Thời Chiến Lược */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12162a]/90 via-[#0d1020]/90 to-[#070914]/95 border border-amber-500/25 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 group-hover:bg-amber-500/15 transition-all" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Sun className="w-3 h-3 text-amber-400" />
                Độc Quyền • Định Thời Vận
              </span>
              <span className="text-[10px] font-mono text-slate-400">True Solar Time</span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-medium text-white mb-1.5 group-hover:text-amber-200 transition-colors flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              La Bàn Định Thời Chiến Lược
            </h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
              Chân giờ mặt trời theo tọa độ kinh độ thực tế và 4 khung giờ vàng hành động: Ký kết hợp đồng, kích hoạt vốn tài lộc, đàm phán ngoại giao, phòng thủ rủi ro.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab?.('daily')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Khai Mở La Bàn Định Thời</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Card 2: Ma Trận Đồng Hóa & Tương Hợp 360° */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1228]/90 via-[#140c1e]/90 to-[#0a0712]/95 border border-rose-500/25 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 group-hover:bg-rose-500/15 transition-all" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-3 h-3 text-rose-400" />
                Độc Quyền • Tương Hợp 360°
              </span>
              <span className="text-[10px] font-mono text-slate-400">B2B &amp; Soulmate</span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-medium text-white mb-1.5 group-hover:text-rose-200 transition-colors flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              Ma Trận Đồng Hóa &amp; Tương Hợp 360°
            </h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
              Bổ khuyết Dụng Thần Bát Tự 2 chiều và Tứ Hóa Phi Tinh chéo cung Tử Vi: Định vị vai trò HĐQT doanh chủ và hòa hợp gia đạo tâm linh sâu sắc.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab?.('compatibility')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Khai Mở Ma Trận 360°</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* 2. SACRED BAGUA COMPASS & LUCKY DIRECTIONS PORTAL */}
      <BaGuaCompassWidget
        dayMasterElement={bazi.dayMasterElement}
        favorableElements={bazi.favorableElements || ['Fire', 'Earth']}
        onOpenOracleModal={onOpenOracleModal}
        onOpenSponsorshipModal={onOpenSponsorshipModal}
      />

      {/* 3. BAZI FOUR PILLARS (TỨ TRỤ BÁT TỰ) INTERACTIVE GRID */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-4 backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
              Tứ Trụ Bát Tự Nguyên Bản (Bazi Pillars)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Nhật Chủ:</span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold font-mono border ${getElementBadgeColor(bazi.dayMasterElement)}`}>
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
              whileHover={{ y: -2 }}
              className={`relative flex flex-col items-center rounded-xl p-3.5 border text-center transition-all ${
                isDayMaster
                  ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-purple-500/30'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 truncate w-full">
                {label}
              </span>

              {/* Ten God Badge */}
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-teal-300 border border-white/10 truncate max-w-full font-medium">
                {pillar.tenGod}
              </span>

              {/* Stem & Branch Display */}
              <div className="my-2 space-y-0.5">
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {STEMS[pillar.stem]?.nameVi || pillar.stem}
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-300">
                  {BRANCHES[pillar.branch]?.nameVi || pillar.branch}
                </div>
              </div>

              {/* Element Tag */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getElementBadgeColor(pillar.stemElement)}`}>
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
          <div className="md:col-span-2 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold tracking-wide">Cân Bằng Năng Lượng Ngũ Hành</span>
              <span className="text-[10px] text-teal-400 font-mono">Tổng: 100%</span>
            </div>

            {/* Visual stacked percentage bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/5 border border-white/10 shadow-inner">
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
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-1.5">
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
              Ứng dụng phong thủy bổ khuyết theo hành Dụng Thần để dung hòa khí vận.
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. ZI WEI DOU SHU 12 PALACES CELESTIAL MASTER BOARD (THIÊN BÀN 12 CUNG CHÍNH TÔNG) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 sm:p-6 space-y-5 backdrop-blur-md shadow-2xl"
      >
        {/* Section Header with View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-full shadow-[0_0_8px_#2dd4bf]"></span>
              <h3 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
                Tử Vi Đẩu Số — Thiên Bàn 12 Cung Chính Tông
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Toàn đồ tinh bàn chuẩn hóa theo Cục Số, Âm Dương Thuận Nghịch, Vòng Thái Tuế, Tràng Sinh & Tuần Triệt
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setZiweiViewMode('board4x4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                ziweiViewMode === 'board4x4'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Thiên Bàn 4x4</span>
            </button>
            <button
              onClick={() => setZiweiViewMode('cardList')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                ziweiViewMode === 'cardList'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Danh Sách 12 Cung</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: TRADITIONAL 4x4 CELESTIAL SQUARE MATRIX (THIÊN BÀN CHUẨN) */}
        {ziweiViewMode === 'board4x4' ? (
          <div>
            <div className="sm:hidden mb-2 px-3 py-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 flex items-center justify-between">
              <span>Vuốt ngang để xem đủ 12 cung thiên bàn</span>
              <button
                type="button"
                onClick={() => setZiweiViewMode('cardList')}
                className="text-amber-400 font-semibold underline ml-1 cursor-pointer"
              >
                Dạng danh sách
              </button>
            </div>
            <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-thin">
              <div className="min-w-[780px] grid grid-cols-4 gap-2.5" role="region" aria-label="Thiên bàn Tử Vi 12 Cung">
                {/* Render 12 Perimeter Celestial Cells */}
                {CELESTIAL_BOARD_CELLS.map((cell) => {
                  const pal = palaceByBranch[cell.branch];
                  if (!pal) return null;

                  const isSelected = selectedPalaceKey === pal.key;
                  const isOpposite = sanFangTuChinh.oppositeBranch === cell.branch;
                  const isTrine = sanFangTuChinh.trine1Branch === cell.branch || sanFangTuChinh.trine2Branch === cell.branch;
                  const badAspect = badStarAspectingBranchMap[cell.branch];

                  let borderStyle = 'border-white/10 hover:border-white/25 bg-black/40 text-slate-300';
                  let relationshipBadge = null;

                  if (isSelected) {
                    borderStyle = 'border-amber-500/80 bg-purple-950/40 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.25)]';
                    relationshipBadge = (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/50">
                        TỌA THỦ
                      </span>
                    );
                  } else if (badAspect) {
                    // Cung có sao xấu hội chiếu vào cung đang chọn: Hiệu ứng viền sáng cảnh báo
                    borderStyle = 'bg-rose-950/30 text-rose-100 border-rose-500/80 ring-1 ring-rose-500/40';
                    relationshipBadge = (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/60 flex items-center gap-0.5 shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        <span>{badAspect.relationLabel.toUpperCase()} SÁT ({badAspect.challengingStars.length})</span>
                      </span>
                    );
                  } else if (isOpposite) {
                    borderStyle = 'border-sky-500/60 bg-sky-950/20 ring-1 ring-sky-400/30';
                    relationshipBadge = (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                        XUNG CHIẾU
                      </span>
                    );
                  } else if (isTrine) {
                    borderStyle = 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-400/30';
                    relationshipBadge = (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        TAM HỢP
                      </span>
                    );
                  }

                  return (
                    <motion.div
                      key={cell.branch}
                      role="button"
                      tabIndex={0}
                      aria-label={`Cung ${pal.nameVi}, chi ${BRANCHES[cell.branch]?.nameVi || cell.branch}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedPalaceKey(pal.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPalaceKey(pal.key);
                        }
                      }}
                      whileHover={{ scale: 1.015 }}
                      animate={
                        badAspect
                          ? {
                              boxShadow: [
                                '0 0 4px rgba(244, 63, 94, 0.3), inset 0 0 4px rgba(244, 63, 94, 0.15)',
                                '0 0 24px rgba(244, 63, 94, 0.85), inset 0 0 12px rgba(244, 63, 94, 0.4)',
                                '0 0 4px rgba(244, 63, 94, 0.3), inset 0 0 4px rgba(244, 63, 94, 0.15)'
                              ],
                              borderColor: [
                                'rgba(244, 63, 94, 0.6)',
                                'rgba(254, 205, 211, 1)',
                                'rgba(244, 63, 94, 0.6)'
                              ]
                            }
                          : isSelected
                          ? {
                              boxShadow: [
                                '0 0 10px rgba(251, 191, 36, 0.3)',
                                '0 0 25px rgba(251, 191, 36, 0.65)',
                                '0 0 10px rgba(251, 191, 36, 0.3)'
                              ]
                            }
                          : {}
                      }
                      transition={
                        badAspect
                          ? {
                              duration: 1.6,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }
                          : isSelected
                          ? {
                              duration: 2.2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }
                          : undefined
                      }
                      className={`relative ${cell.colStart} ${cell.rowStart} rounded-xl border p-2.5 flex flex-col justify-between min-h-[140px] cursor-pointer transition-all ${borderStyle}`}
                    >
                      {/* Hiệu ứng viền sáng cảnh báo (Glowing Border) bằng framer-motion khi có sao xấu hội chiếu */}
                      {badAspect && (
                        <motion.div
                          aria-hidden="true"
                          className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-rose-500/80 z-0"
                          animate={{
                            opacity: [0.35, 0.95, 0.35],
                            boxShadow: [
                              '0 0 6px rgba(244, 63, 94, 0.35), inset 0 0 4px rgba(244, 63, 94, 0.2)',
                              '0 0 24px rgba(244, 63, 94, 0.9), inset 0 0 12px rgba(244, 63, 94, 0.45)',
                              '0 0 6px rgba(244, 63, 94, 0.35), inset 0 0 4px rgba(244, 63, 94, 0.2)'
                            ]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      )}
                    {/* Top strip: Palace Name & Badges */}
                    <div className="relative z-[1]">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : badAspect ? 'text-rose-200' : 'text-white'}`}>
                            {pal.nameVi}
                          </span>
                          {pal.isBodyPalace && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                              THÂN
                            </span>
                          )}
                          {relationshipBadge}
                        </div>
                        <div className="flex items-center gap-1">
                          {pal.tuanTriet?.map((tt, i) => (
                            <span
                              key={i}
                              className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                                tt === 'Triệt'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {tt}
                            </span>
                          ))}
                          <span className="text-[9px] font-mono text-slate-400 font-semibold">
                            {pal.score}đ
                          </span>
                        </div>
                      </div>

                      {/* Can Chi & Decade Range */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>{pal.stem} {BRANCHES[pal.branch]?.nameVi || pal.branch}</span>
                        <span className="font-mono text-purple-300 font-medium">{pal.decadeRangeStr}t</span>
                      </div>

                      {/* Major Stars (Chính tinh) */}
                      <div className="mt-1.5 space-y-0.5">
                        {pal.majorStars.map((star, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-100 truncate">
                              {star.nameVi}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[9px] ${getBrightnessColor(star.brightness)}`}>
                                ({star.brightness === 'M' ? 'Miếu' : star.brightness === 'V' ? 'Vượng' : star.brightness === 'D' ? 'Đắc' : star.brightness === 'B' ? 'Bình' : 'Hãm'})
                              </span>
                              {star.transformation && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                                  Hóa {star.transformation === 'Lu' ? 'Lộc' : star.transformation === 'Quan' ? 'Quyền' : star.transformation === 'Khoa' ? 'Khoa' : 'Kỵ'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {pal.majorStars.length === 0 && (
                          <div className="text-[10px] text-slate-400 italic">
                            Vô chính diệu
                          </div>
                        )}
                      </div>

                      {/* Challenging aspecting stars preview tag */}
                      {badAspect && badAspect.challengingStars.length > 0 && (
                        <div className="mt-1.5 pt-1 border-t border-rose-500/30 flex flex-wrap gap-1">
                          {badAspect.challengingStars.slice(0, 3).map((st, i) => (
                            <span key={i} className="px-1 py-0.2 rounded text-[8px] bg-rose-500/25 text-rose-200 border border-rose-500/40 font-mono font-semibold truncate" title={`Sát tinh hội chiếu: ${st.nameVi}`}>
                              ⚡ {st.nameVi} {st.transformation === 'Ky' ? '(Kỵ)' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom strip: Minor stars count & Auxiliary rings */}
                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                      <span className="text-teal-400 truncate max-w-[48%]">
                        {pal.thaiTueStar || 'Thái Tuế'}
                      </span>
                      <span className="text-amber-400 truncate max-w-[48%]">
                        {pal.trangSinhStar || 'Tràng Sinh'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* TRUNG CUNG (The Heart of the Celestial Board - 2x2 merged central matrix) */}
              <div className="col-start-2 col-span-2 row-start-2 row-span-2 rounded-2xl bg-gradient-to-b from-black/80 via-purple-950/20 to-black/90 border border-white/15 p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
                {/* Header of Trung Cung */}
                <div className="text-center space-y-1 border-b border-white/10 pb-3">
                  <div className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>THIÊN BÀN TỬ VI ĐẨU SỐ • BẢN MỆNH CHÍNH TÔNG</span>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-wider">
                    {profile.name}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                      {ziwei.yinYangGenderHarmony?.yinYangNature || (profile.birthData.gender === 'Male' ? 'Dương Nam' : 'Âm Nữ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium">
                      {ziwei.elementBureau}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                      Thân cư {ziwei.palaces[ziwei.bodyPalaceKey]?.nameVi}
                    </span>
                  </div>
                </div>

                {/* Core Astrological Natal Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-slate-400">Bản Mệnh Nạp Âm:</div>
                    <div className="font-bold text-teal-300 truncate">
                      {ziwei.elementDestinyBureauHarmony?.birthYearNaYin || bazi.yearPillar.naYin}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-slate-400">Tương Phối Mệnh - Cục:</div>
                    <div className="font-bold text-purple-300 truncate">
                      {ziwei.elementDestinyBureauHarmony?.relation || 'Tỷ Hòa'} ({ziwei.elementDestinyBureauHarmony?.quality || 'Cát Lợi'})
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-slate-400">Âm Dương Lý:</div>
                    <div className="font-bold text-amber-300 truncate">
                      {ziwei.yinYangGenderHarmony?.direction || 'Thuận Lý'} ({ziwei.yinYangGenderHarmony?.decadeDirection || 'Vận Thuận'})
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <div className="text-[10px] text-slate-400">Cách Cục Chính Tông:</div>
                    <div className="font-bold text-slate-200 truncate">
                      {ziwei.majorConfigurations[0] || 'Chính Cách'}
                    </div>
                  </div>
                </div>

                {/* Current Selected Palace Focus Indicator */}
                <div className="pt-2 border-t border-white/10 text-center space-y-1">
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">
                    Tiêu Điểm Cung Vị Đang Chọn:
                  </div>
                  <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                    <span>Cung {selectedPalace.nameVi}</span>
                    <span className="text-slate-400 font-mono">({selectedPalace.stem} {BRANCHES[selectedPalace.branch]?.nameVi})</span>
                    <span className="text-teal-400 font-mono">Đại vận {selectedPalace.decadeRangeStr}t</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Tam Phương: {sanFangTuChinh.trine1Palace?.nameVi || '...'} • {sanFangTuChinh.trine2Palace?.nameVi || '...'} | Đối Chiếu: {sanFangTuChinh.oppositePalace?.nameVi || '...'}
                  </div>
                </div>

                {/* Cryptographic Authenticity Provenance Seal */}
                {calculation.cryptographicSignature && (
                  <div className="mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Shield className="w-2.5 h-2.5 text-emerald-400" />
                      <span>BẢN QUYỀN THUẬT TOÁN ĐÃ KÝ SỐ</span>
                    </div>
                    <span className="truncate max-w-[130px] text-slate-400 opacity-80" title={calculation.cryptographicSignature.signature}>
                      Mã ấn: {calculation.cryptographicSignature.signature.substring(0, 10)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
          /* VIEW 2: MODERN RESPONSIVE CARDS GRID (DANH SÁCH 12 CUNG) */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PALACE_DEFS.map((def) => {
              const pal = ziwei.palaces[def.key];
              const isSelected = selectedPalaceKey === def.key;
              const badAspect = pal ? badStarAspectingBranchMap[pal.branch] : null;

              return (
                <motion.button
                  key={def.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPalaceKey(def.key)}
                  animate={
                    badAspect
                      ? {
                          boxShadow: [
                            '0 0 4px rgba(244, 63, 94, 0.3)',
                            '0 0 20px rgba(244, 63, 94, 0.8), inset 0 0 8px rgba(244, 63, 94, 0.3)',
                            '0 0 4px rgba(244, 63, 94, 0.3)'
                          ],
                          borderColor: [
                            'rgba(244, 63, 94, 0.6)',
                            'rgba(254, 205, 211, 1)',
                            'rgba(244, 63, 94, 0.6)'
                          ]
                        }
                      : isSelected
                      ? {
                          boxShadow: [
                            '0 0 10px rgba(124, 58, 237, 0.3)',
                            '0 0 22px rgba(124, 58, 237, 0.65)'
                          ]
                        }
                      : {}
                  }
                  transition={
                    badAspect
                      ? {
                          duration: 1.6,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      : isSelected
                      ? {
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      : undefined
                  }
                  className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500/60 ring-1 ring-purple-500/40'
                      : badAspect
                      ? 'bg-rose-950/25 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/30'
                      : 'bg-black/40 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  {/* Hiệu ứng viền sáng cảnh báo (Glowing Border) bằng framer-motion khi có sao xấu hội chiếu */}
                  {badAspect && (
                    <motion.div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-rose-500/80 z-0"
                      animate={{
                        opacity: [0.35, 0.95, 0.35],
                        boxShadow: [
                          '0 0 6px rgba(244, 63, 94, 0.35), inset 0 0 4px rgba(244, 63, 94, 0.2)',
                          '0 0 20px rgba(244, 63, 94, 0.9), inset 0 0 10px rgba(244, 63, 94, 0.4)',
                          '0 0 6px rgba(244, 63, 94, 0.35), inset 0 0 4px rgba(244, 63, 94, 0.2)'
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                  <div className="relative z-[1] flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : badAspect ? 'text-rose-200' : 'text-slate-100'}`}>
                        {def.nameVi}
                      </span>
                      {pal?.isBodyPalace && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Thân
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {typeof pal?.score === 'number' ? `${pal.score}đ` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{pal?.stem} {BRANCHES[pal?.branch]?.nameVi}</span>
                    <span className="font-mono text-purple-300 font-medium">{pal?.decadeRangeStr}t</span>
                  </div>

                  {badAspect && (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-rose-300 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                      <span>{badAspect.relationLabel}: {badAspect.challengingStars.length} sát tinh</span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {pal?.majorStars.slice(0, 2).map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-purple-200 border border-white/10 truncate">
                        {s.nameVi} <span className="text-teal-400 text-[8px]">({s.brightness})</span>
                      </span>
                    ))}
                    {pal?.majorStars.length === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-slate-400 italic">
                        Vô chính diệu
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* SELECTED PALACE DETAILED DOSSIER CARD */}
        {selectedPalace && (
          <motion.div
            key={selectedPalaceKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-purple-500/40 space-y-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-white">
                    Cung {selectedPalace.nameVi}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    Can {selectedPalace.stem} • Chi {BRANCHES[selectedPalace.branch]?.nameVi || selectedPalace.branch}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-teal-300">
                    Đại Vận: {selectedPalace.decadeRangeStr} tuổi
                  </span>
                  {selectedPalace.isBodyPalace && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      Cung Thân Tọa Thủ
                    </span>
                  )}
                  {selectedPalace.tuanTriet?.map((tt, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        tt === 'Triệt'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      Ngộ {tt} Không
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedPalace.focalTheme}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-teal-400 uppercase tracking-wider">Năng Lượng Cung</div>
                <div className="text-xl font-light font-mono text-white">
                  {selectedPalace.score}/100
                </div>
              </div>
            </div>

            {/* Warning Banner for Aspecting Challenging Stars */}
            {aspectingInfluences.some(a => a.hasChallengingStars) && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-black/50 to-rose-950/20 border border-rose-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Cảnh Báo Sát Tinh Hội Chiếu ({totalAspectingChallengingStars} sao xung sát)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Viền đỏ sáng nhấp nháy trên Thiên Bàn
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Khi chiếu vào Cung {selectedPalace.nameVi}, các sao xấu từ cung đối chiếu và tam hợp có thể tạo ra nghịch cảnh hoặc hao tổn nếu không biết cách hóa giải:
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {aspectingInfluences.filter(a => a.hasChallengingStars).map((inf, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-black/60 border border-rose-500/30 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <span>Cung {inf.palace.nameVi}</span>
                        <span className="text-[10px] font-mono text-slate-400">({inf.relationLabel})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {inf.challengingStars.map((s, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-200 border border-rose-500/40 font-semibold">
                            {s.nameVi} {s.transformation === 'Ky' ? '(Hóa Kỵ)' : s.brightness === 'H' ? '(Hãm)' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aux Ring Badges for Selected Palace */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Vòng Tràng Sinh:</span>
                <span className="font-semibold text-amber-300">{selectedPalace.trangSinhStar || 'Tràng Sinh'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Vòng Thái Tuế:</span>
                <span className="font-semibold text-teal-300">{selectedPalace.thaiTueStar || 'Thái Tuế'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Vòng Bác Sĩ:</span>
                <span className="font-semibold text-purple-300">{selectedPalace.bacSyStar || 'Bác Sĩ'}</span>
              </div>
            </div>

            {/* Stars List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Major Stars */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Chính Tinh Chủ Quản ({selectedPalace.majorStars.length})</span>
                  <span className="text-[10px] text-slate-400">Miếu • Vượng • Đắc • Bình • Hãm</span>
                </div>
                <div className="space-y-1.5">
                  {selectedPalace.majorStars.map((star, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{star.nameVi}</span>
                        <span className="text-[10px] text-slate-400">
                          ({star.brightness === 'M' ? 'Miếu Địa' : star.brightness === 'V' ? 'Vượng Địa' : star.brightness === 'D' ? 'Đắc Địa' : star.brightness === 'B' ? 'Bình Hòa' : 'Hãm Địa'})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getBrightnessColor(star.brightness)}`}>
                          {star.brightness === 'M' ? 'Miếu' : star.brightness === 'V' ? 'Vượng' : star.brightness === 'D' ? 'Đắc' : star.brightness === 'B' ? 'Bình' : 'Hãm'}
                        </span>
                        {star.transformation && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60 font-bold">
                            Hóa {star.transformation === 'Lu' ? 'Lộc' : star.transformation === 'Quan' ? 'Quyền' : star.transformation === 'Khoa' ? 'Khoa' : 'Kỵ'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedPalace.majorStars.length === 0 && (
                    <div className="p-3 rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-xs text-slate-400 text-center italic">
                      Cung Vô Chính Diệu — Hấp thụ năng lượng và cát hung từ cung chính chiếu ({sanFangTuChinh.oppositePalace?.nameVi || 'Thiên Di'}).
                    </div>
                  )}
                </div>
              </div>

              {/* Minor Stars */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Phụ Tinh & Sát Hung Trợ Tinh ({selectedPalace.minorStars.length})
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedPalace.minorStars.map((star, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <span className={`font-medium ${star.type === 'Lucky' ? 'text-teal-200' : 'text-rose-300'}`}>
                        {star.nameVi}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${star.type === 'Lucky' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                        {star.type === 'Lucky' ? 'Cát Tinh' : 'Sát Tinh'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AUTHENTIC IN-DEPTH PERSONALIZED ZI WEI ANALYSIS (LUẬN GIẢI CHÍNH TÔNG) */}
        {ziwei.authenticAnalysis && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]"></span>
                <h4 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
                  Luận Giải Tử Vi Đẩu Số Chính Tông (Bản Mệnh Cá Nhân)
                </h4>
              </div>

              {/* Analysis Tabs */}
              <div className="flex items-center gap-1 text-xs">
                {[
                  { key: 'essence', label: '1. Bản Thể' },
                  { key: 'body', label: '2. Cung Thân' },
                  { key: 'sanfang', label: '3. Cách Cục' },
                  { key: 'transit', label: '4. Vận Trình' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setAnalysisTab(tab.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      analysisTab === tab.key
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Bản Thể & Tương Phối Mệnh - Cục */}
            {analysisTab === 'essence' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-teal-300">Bản Thể & Tương Phối Mệnh - Cục</span>
                  <span className="font-mono text-slate-400">{ziwei.yinYangGenderHarmony?.direction}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {ziwei.authenticAnalysis.coreEssence}
                </p>
                {ziwei.elementDestinyBureauHarmony && (
                  <div className="p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/20 text-slate-300">
                    <span className="font-bold text-teal-300">{ziwei.elementDestinyBureauHarmony.relation}:</span>{' '}
                    {ziwei.elementDestinyBureauHarmony.explanation}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 2: Cung Thân & Trọng Tâm Hậu Vận */}
            {analysisTab === 'body' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-amber-300">Cung Thân & Trọng Tâm Hậu Vận (Sau 30 Tuổi)</span>
                  <span className="font-mono text-amber-400">Cư {ziwei.palaces[ziwei.bodyPalaceKey]?.nameVi}</span>
                </div>
                {ziwei.bodyPalaceAnalysis ? (
                  <>
                    <p className="text-slate-300 leading-relaxed">
                      {ziwei.bodyPalaceAnalysis.meaning}
                    </p>
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-slate-300">
                      <span className="font-bold text-amber-300">Tác động thực tiễn:</span>{' '}
                      {ziwei.bodyPalaceAnalysis.lifeImpact}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-300 leading-relaxed">
                    {ziwei.authenticAnalysis.relationshipsAndFamily}
                  </p>
                )}
              </motion.div>
            )}

            {/* Tab 3: Tam Phương Tứ Chính & Cách Cục */}
            {analysisTab === 'sanfang' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-indigo-300">Tam Phương Tứ Chính & Cách Cục Định Mệnh</span>
                  <span className="font-mono text-slate-400">Chính Tông</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ziwei.majorConfigurations.map((cfg, i) => (
                    <span key={i} className="px-2.5 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                      {cfg}
                    </span>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {ziwei.authenticAnalysis.careerAndWealthTrajectory}
                </p>
              </motion.div>
            )}

            {/* Tab 4: Vận Trình & Định Hướng Hành Động */}
            {analysisTab === 'transit' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-rose-300">Vận Trình Đại Vận & Lưu Niên</span>
                  {ziwei.currentDecade && (
                    <span className="font-mono text-slate-400">Đại Vận {ziwei.currentDecade.startAge} - {ziwei.currentDecade.endAge} Tuổi</span>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {ziwei.authenticAnalysis.decadeAndCurrentYearGuidance}
                </p>
                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-medium">
                  💡 {ziwei.authenticAnalysis.strategicAdvice}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* 4.5. PERSONAL ENERGY 12-MONTH FORECAST CHART (RECHARTS) & GENTLE ALERT SYSTEM */}
      <div id="personal-energy-forecast-section" className="space-y-4">
        {energyAlerts.length > 0 && (
          <PersonalEnergyAlertBanner
            alerts={energyAlerts}
            onSelectMonth={(target) => {
              setSelectedEnergyMonth(target);
              const el = document.getElementById('personal-energy-chart-container');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            onOpenReportModal={onOpenReportModal}
          />
        )}

        <div id="personal-energy-chart-container">
          <PersonalEnergy12MonthsChart
            calculation={calculation}
            onOpenReportModal={onOpenReportModal}
            selectedMonthTarget={selectedEnergyMonth}
            onSelectMonthTarget={setSelectedEnergyMonth}
            showInlineAlerts={false}
          />
        </div>
      </div>

      {/* 5. CURRENT TRANSIT & STRATEGIC RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transit Energy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf]"></span>
              <h4 className="text-xs uppercase tracking-widest text-slate-200 font-semibold">
                Lưu Niên Năm {currentYear} ({currentTransit.stem} {BRANCHES[currentTransit.branch]?.nameVi || currentTransit.branch})
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 backdrop-blur-md shadow-xl"
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
