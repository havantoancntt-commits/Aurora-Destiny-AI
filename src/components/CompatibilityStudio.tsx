// ==========================================
// COMPATIBILITY STUDIO (TƯƠNG HỢP & NHÂN DUYÊN)
// Scientific Can-Chi, Na-Yin, Bat-Trach & Synastry
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Heart,
  Briefcase,
  MessageCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import {
  CalculationResult,
  LanguageCode,
  Gender
} from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  analyzeCompatibility,
  CompatibilityPartnerInput,
  CompatibilityAnalysis
} from '../engine/compatibility';
import { ExecutiveSynastryStudio } from './ExecutiveSynastryStudio';
import { soundEngine } from '../services/soundEffects';

interface Props {
  activeProfile: UserProfile;
  calculation: CalculationResult;
  allProfiles: UserProfile[];
  language: LanguageCode;
}

export const CompatibilityStudio: React.FC<Props> = ({
  activeProfile,
  calculation,
  allProfiles,
  language
}) => {
  const [studioType, setStudioType] = useState<'personal' | 'executive'>('executive');

  // Other profiles excluding activeProfile
  const otherProfiles = useMemo(
    () => allProfiles.filter(p => p.id !== activeProfile.id),
    [allProfiles, activeProfile.id]
  );

  // Mode: 'select-saved' or 'custom-input'
  const [partnerMode, setPartnerMode] = useState<'saved' | 'custom'>(
    otherProfiles.length > 0 ? 'saved' : 'custom'
  );
  const [selectedSavedId, setSelectedSavedId] = useState<string>(
    otherProfiles[0]?.id || ''
  );

  // Custom Partner Input State
  const [customPartner, setCustomPartner] = useState<CompatibilityPartnerInput>({
    name: 'Đối tác / Bạn đời',
    gender: activeProfile.birthData.gender === 'Male' ? 'Female' : 'Male',
    solarYear: 1993,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 10,
    relationType: 'Business'
  });

  // Partner Profile Object for Executive Synastry
  const partnerProfileObj: UserProfile = useMemo(() => {
    if (partnerMode === 'saved' && selectedSavedId) {
      const saved = otherProfiles.find(p => p.id === selectedSavedId);
      if (saved) return saved;
    }
    return {
      id: 'custom_partner',
      name: customPartner.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      birthData: {
        solarYear: customPartner.solarYear,
        solarMonth: customPartner.solarMonth,
        solarDay: customPartner.solarDay,
        solarHour: customPartner.solarHour ?? 12,
        solarMinute: 0,
        hasExactHour: true,
        birthCity: 'Hà Nội',
        birthCountry: 'Việt Nam',
        timezoneOffset: 7,
        timezoneName: 'Asia/Ho_Chi_Minh',
        gender: customPartner.gender,
        calendarSystem: 'solar'
      },
      settings: {
        theme: 'luxury',
        language: 'vi',
        soundEffects: true,
        autoAnalyze: true
      }
    };
  }, [partnerMode, selectedSavedId, otherProfiles, customPartner]);

  // Active Partner Data for analysis
  const currentPartnerData: CompatibilityPartnerInput = useMemo(() => {
    if (partnerMode === 'saved' && selectedSavedId) {
      const saved = otherProfiles.find(p => p.id === selectedSavedId);
      if (saved) {
        return {
          name: saved.name,
          gender: saved.birthData.gender,
          solarYear: saved.birthData.solarYear,
          solarMonth: saved.birthData.solarMonth,
          solarDay: saved.birthData.solarDay,
          solarHour: saved.birthData.solarHour ?? 12,
          relationType: 'Spouse'
        };
      }
    }
    return customPartner;
  }, [partnerMode, selectedSavedId, otherProfiles, customPartner]);

  // Run Synastry Analysis
  const analysis: CompatibilityAnalysis = useMemo(() => {
    return analyzeCompatibility(
      {
        name: activeProfile.name,
        gender: activeProfile.birthData.gender,
        profile: activeProfile,
        calculation,
        birthData: {
          solarYear: activeProfile.birthData.solarYear,
          solarMonth: activeProfile.birthData.solarMonth,
          solarDay: activeProfile.birthData.solarDay,
          solarHour: activeProfile.birthData.solarHour ?? 12
        }
      },
      currentPartnerData
    );
  }, [activeProfile, calculation, currentPartnerData]);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 88) return 'from-emerald-400 to-teal-300';
    if (score >= 75) return 'from-cyan-400 to-blue-400';
    if (score >= 65) return 'from-amber-400 to-orange-400';
    return 'from-rose-400 to-red-400';
  };

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 0. Studio Type Selector (Executive vs Personal) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              soundEngine.playRadarTick();
              setStudioType('executive');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium font-mono flex items-center gap-2 transition-all cursor-pointer ${
              studioType === 'executive'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Thẩm Định Doanh Chủ & Đối Tác HĐQT (Executive Synastry)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playRadarTick();
              setStudioType('personal');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium font-mono flex items-center gap-2 transition-all cursor-pointer ${
              studioType === 'personal'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Tương Hợp Nhân Duyên & Gia Đạo (Personal Synastry)</span>
          </button>
        </div>
      </div>

      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#120f24] via-[#0d1127] to-[#070a18] p-6 border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Đối Soát Nhân Duyên & Hợp Tác Toàn Diện</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-white flex items-center gap-2">
              Tương Hợp Bản Mệnh
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Phân tích đa chiều dựa trên Can Chi Tứ Trụ, Ngũ Hành Nạp Âm 60 Hoa Giáp, Cung Phi Bát Trạch và Dụng Thần tương trợ. Đồng thời cung cấp phương pháp hóa giải ngũ hành để kiến tạo hòa hợp bền vững.
            </p>
          </div>

          {/* Relation Type Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            {(['Spouse', 'Business', 'Friend', 'Family'] as const).map(type => {
              const labels = {
                Spouse: 'Hôn Nhân / Tình Duyên',
                Business: 'Hợp Tác Làm Ăn',
                Friend: 'Tri Kỷ / Bạn Bè',
                Family: 'Gia Đạo / Con Cái'
              };
              const isSelected = customPartner.relationType === type;
              return (
                <button
                  key={type}
                  onClick={() => setCustomPartner(prev => ({ ...prev, relationType: type }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Partner Selector Controls */}
      <div className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">Đối tượng đối soát:</span>
          </div>

          <div className="flex items-center gap-2">
            {otherProfiles.length > 0 && (
              <button
                onClick={() => setPartnerMode('saved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  partnerMode === 'saved'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-white/5'
                }`}
              >
                Chọn từ hồ sơ đã lưu ({otherProfiles.length})
              </button>
            )}
            <button
              onClick={() => setPartnerMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                partnerMode === 'custom'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-white/5'
              }`}
            >
              Nhập ngày sinh người đồng hành mới
            </button>
          </div>
        </div>

        {partnerMode === 'saved' && otherProfiles.length > 0 ? (
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs text-slate-400">Chọn người so sánh:</span>
            <select
              value={selectedSavedId}
              onChange={e => setSelectedSavedId(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
            >
              {otherProfiles.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} ({p.birthData.gender === 'Male' ? 'Nam' : 'Nữ'}, Sinh {p.birthData.solarDay}/{p.birthData.solarMonth}/{p.birthData.solarYear})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Họ & Tên</label>
              <input
                type="text"
                value={customPartner.name}
                onChange={e => setCustomPartner(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                placeholder="Nhập tên đối tác"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Giới tính</label>
              <select
                value={customPartner.gender}
                onChange={e => setCustomPartner(prev => ({ ...prev, gender: e.target.value as Gender }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="Female" className="bg-slate-900">Nữ</option>
                <option value="Male" className="bg-slate-900">Nam</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Năm sinh (Dương lịch)</label>
              <input
                type="number"
                min={1920}
                max={2030}
                value={customPartner.solarYear}
                onChange={e => setCustomPartner(prev => ({ ...prev, solarYear: parseInt(e.target.value) || 1993 }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tháng & Ngày sinh</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customPartner.solarMonth}
                  onChange={e => setCustomPartner(prev => ({ ...prev, solarMonth: parseInt(e.target.value) || 1 }))}
                  className="w-1/2 bg-black/60 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  placeholder="Tháng"
                />
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={customPartner.solarDay}
                  onChange={e => setCustomPartner(prev => ({ ...prev, solarDay: parseInt(e.target.value) || 1 }))}
                  className="w-1/2 bg-black/60 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  placeholder="Ngày"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Giờ sinh (0 - 23h)</label>
              <input
                type="number"
                min={0}
                max={23}
                value={customPartner.solarHour}
                onChange={e => setCustomPartner(prev => ({ ...prev, solarHour: parseInt(e.target.value) || 12 }))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
        )}
      </div>

      {studioType === 'executive' ? (
        <motion.div
          key="executive-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExecutiveSynastryStudio
            userProfile={activeProfile}
            userCalc={calculation}
            partnerProfile={partnerProfileObj}
          />
        </motion.div>
      ) : (
        <motion.div
          key="personal-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* 3. Overall Compatibility Score Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big Score Dial Card */}
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-b from-[#141226]/90 via-[#0d0f1f]/90 to-[#070913]/95 border border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-rose-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Versus Header */}
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-slate-400">
            <span className="text-white font-semibold truncate max-w-[100px]">{activeProfile.name}</span>
            <span className="text-rose-400 font-bold">&</span>
            <span className="text-white font-semibold truncate max-w-[100px]">{currentPartnerData.name}</span>
          </div>

          {/* Circular Score Display */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#compatScoreGrad)"
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * analysis.overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="compatScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-serif font-bold text-white tracking-tight">
                {analysis.overallScore}
              </span>
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Điểm Tương Hợp
              </span>
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-rose-300 mb-2">
            {analysis.ratingBand}
          </div>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {analysis.synthesisAdvice}
          </p>
        </div>

        {/* Right: 4 Dimension Pillars */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                4 Trụ Cột Tương Phối Năng Lượng
              </h3>
            </div>
            <span className="text-xs text-slate-400">Thang điểm 100</span>
          </div>

          <div className="space-y-4">
            {/* Dimension 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Tình Cảm, Tâm Linh & Thấu Hiểu Cảm Xúc
                </span>
                <span className="font-mono font-semibold text-rose-300">
                  {analysis.dimensions.emotional}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.dimensions.emotional}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full"
                />
              </div>
            </div>

            {/* Dimension 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  Tài Chính, Công Danh & Hợp Tác Làm Ăn
                </span>
                <span className="font-mono font-semibold text-amber-300">
                  {analysis.dimensions.business}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.dimensions.business}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                />
              </div>
            </div>

            {/* Dimension 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Giao Tiếp, Ngôn Ngữ & Giải Quyết Bất Đồng
                </span>
                <span className="font-mono font-semibold text-cyan-300">
                  {analysis.dimensions.communication}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.dimensions.communication}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                />
              </div>
            </div>

            {/* Dimension 4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Độ Bền Vững, Đồng Hành & Hậu Vận Dài Lâu
                </span>
                <span className="font-mono font-semibold text-indigo-300">
                  {analysis.dimensions.longevity}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.dimensions.longevity}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Quick tips summary */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-xs text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Nhận xét chuyên gia:</strong> Hai bên có chỉ số tương thích cao nhất ở khía cạnh{' '}
              <strong className="text-teal-300">
                {analysis.dimensions.business > analysis.dimensions.emotional ? 'Tài chính & Sự nghiệp' : 'Tình cảm & Thấu hiểu'}
              </strong>. Việc tôn trọng tự do và phong cách làm việc của nhau sẽ giúp duy trì vận khí hưng thịnh dài lâu.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Detailed Compatibility Breakdown Factors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            Chi Tiết 5 Yếu Tố Đối Sánh Bản Mệnh
          </h3>
          <span className="text-xs text-slate-400">Can Chi • Nạp Âm • Bát Trạch • Dụng Thần</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.factors.map((factor, idx) => {
            const isGood = factor.grade === 'Đại Cát' || factor.grade === 'Cát';
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0e1122]/85 border border-white/10 p-4 shadow-lg hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {factor.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{factor.title}</h4>
                  </div>
                  <div
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isGood
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : factor.grade === 'Bình Hòa'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {factor.grade} ({factor.score}đ)
                  </div>
                </div>

                {/* Person A vs Person B comparison values */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-2.5 border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block truncate">{activeProfile.name}</span>
                    <span className="font-semibold text-teal-300">{factor.personAVal}</span>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <span className="text-[10px] text-slate-400 block truncate">{currentPartnerData.name}</span>
                    <span className="font-semibold text-pink-300">{factor.personBVal}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {factor.description}
                </p>

                {factor.remedy && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Phương pháp hóa giải:</strong> {factor.remedy}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bridging Element & Holistic Harmony Advice */}
      {analysis.bridgingElement && (
        <div className="rounded-2xl bg-gradient-to-br from-[#181329] via-[#0d1024] to-[#080a18] border border-teal-500/30 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              Ngũ Hành Cầu Nối Hòa Giải (Bridging Energy)
            </h4>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.bridgingElement.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {analysis.bridgingElement.recommendations.map((rec, i) => (
              <div key={i} className="bg-black/40 rounded-xl p-3 border border-white/5 text-xs text-slate-300">
                <span className="text-teal-400 font-bold mr-1.5 font-mono">0{i + 1}.</span>
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Strategic Golden Rules for Long-Term Success */}
      <div className="rounded-2xl bg-[#0b0e1b]/90 border border-white/10 p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-rose-400" />
          3 Nguyên Tắc Vàng Giữ Gìn Hòa Khí & Hợp Tác Bền Lâu
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.partnershipTips.map((tip, idx) => (
            <div key={idx} className="bg-black/30 rounded-xl p-3 border border-white/5 text-xs text-slate-300 leading-relaxed">
              <span className="text-rose-400 font-bold mr-1">✦</span> {tip}
            </div>
          ))}
        </div>
      </div>
      </motion.div>
      )}
    </div>
  );
};
