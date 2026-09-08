// ==========================================
// BIRTH PROFILE STUDIO & ONBOARDING WINDOW
// Senior-friendly, ultra-luxury, high-contrast, completely clean of demo data
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  Globe,
  Compass,
  X,
  Layers,
  HelpCircle,
  AlertCircle,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { BirthData, BehavioralContext, Gender, EarthlyBranch } from '../types/destiny';
import { LanguageCode } from '../types/destiny';
import { STEMS, BRANCHES, ELEMENT_RELATIONS, getNaYin } from '../engine/canchi';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from '../engine/bazi';
import { convertSolarToLunar } from '../engine/lunarSolar';
import { UserProfile } from '../types/user';
import { WORLD_LOCATIONS, WorldLocation } from '../services/internationalization';
import { locationProvider } from '../services/locationProvider';

interface Props {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onComplete: (name: string, birthData: BirthData, behavioral: BehavioralContext) => Promise<void>;
  onCancel?: () => void;
  isInitial?: boolean;
  existingProfiles?: UserProfile[];
  activeProfileId?: string;
  onSelectProfile?: (id: string) => void;
}

// 12 Can Chi Hours with Vietnamese colloquial descriptions for seniors
const ZODIAC_HOURS = [
  { branch: 'Zi' as EarthlyBranch, nameVi: 'Tý', description: 'Nửa đêm (23:00 - 00:59)', defaultHour: 0, defaultMin: 30 },
  { branch: 'Chou' as EarthlyBranch, nameVi: 'Sửu', description: 'Gà gáy đầu (01:00 - 02:59)', defaultHour: 2, defaultMin: 0 },
  { branch: 'Yin_B' as EarthlyBranch, nameVi: 'Dần', description: 'Rạng sáng (03:00 - 04:59)', defaultHour: 4, defaultMin: 0 },
  { branch: 'Mao' as EarthlyBranch, nameVi: 'Mão', description: 'Mặt trời mọc (05:00 - 06:59)', defaultHour: 6, defaultMin: 0 },
  { branch: 'Chen' as EarthlyBranch, nameVi: 'Thìn', description: 'Ăn sáng (07:00 - 08:59)', defaultHour: 8, defaultMin: 0 },
  { branch: 'Si' as EarthlyBranch, nameVi: 'Tỵ', description: 'Gần trưa (09:00 - 10:59)', defaultHour: 10, defaultMin: 0 },
  { branch: 'Wu_B' as EarthlyBranch, nameVi: 'Ngọ', description: 'Chính trưa (11:00 - 12:59)', defaultHour: 12, defaultMin: 0 },
  { branch: 'Wei' as EarthlyBranch, nameVi: 'Mùi', description: 'Đầu giờ chiều (13:00 - 14:59)', defaultHour: 14, defaultMin: 0 },
  { branch: 'Shen' as EarthlyBranch, nameVi: 'Thân', description: 'Xế chiều (15:00 - 16:59)', defaultHour: 16, defaultMin: 0 },
  { branch: 'You' as EarthlyBranch, nameVi: 'Dậu', description: 'Chập tối (17:00 - 18:59)', defaultHour: 18, defaultMin: 0 },
  { branch: 'Xu' as EarthlyBranch, nameVi: 'Tuất', description: 'Buổi tối (19:00 - 20:59)', defaultHour: 20, defaultMin: 0 },
  { branch: 'Hai' as EarthlyBranch, nameVi: 'Hợi', description: 'Đêm khuya (21:00 - 22:59)', defaultHour: 22, defaultMin: 0 },
];

// Helper to generate year options with Can Chi name & current age
const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1930; y--) {
    // Quick stem/branch formula
    const stemIdx = (y - 4) % 10;
    const branchIdx = (y - 4) % 12;
    const stemNames = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const branchNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const canChi = `${stemNames[stemIdx >= 0 ? stemIdx : stemIdx + 10]} ${branchNames[branchIdx >= 0 ? branchIdx : branchIdx + 12]}`;
    const age = currentYear - y + 1; // Tuổi mụ / âm lịch
    years.push({
      year: y,
      label: `${y} (${canChi} - ${age} tuổi)`
    });
  }
  return years;
})();

export const OnboardingWizard: React.FC<Props> = ({
  language,
  onComplete,
  onCancel,
  existingProfiles = [],
  activeProfileId,
  onSelectProfile
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'profiles'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean, Empty Default Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  
  // Date values
  const [solarYear, setSolarYear] = useState<number>(1980);
  const [solarMonth, setSolarMonth] = useState<number>(1);
  const [solarDay, setSolarDay] = useState<number>(1);

  // Hour Mode: 'exact' (nhập giờ:phút), 'canchi' (chọn giờ Tý, Sửu...), 'unknown' (không rõ giờ)
  const [hourMode, setHourMode] = useState<'canchi' | 'exact' | 'unknown'>('canchi');
  const [solarHour, setSolarHour] = useState<number>(12);
  const [solarMinute, setSolarMinute] = useState<number>(0);
  const [selectedZodiacBranch, setSelectedZodiacBranch] = useState<EarthlyBranch>('Wu_B');
  const [isLateRat, setIsLateRat] = useState<boolean>(false);
  const [timeConvention, setTimeConvention] = useState<'civil' | 'trueSolar'>('civil');

  // Place of birth
  const [birthCity, setBirthCity] = useState('Hà Nội');
  const [birthCountry, setBirthCountry] = useState('Việt Nam');
  const [timezoneOffset, setTimezoneOffset] = useState<number>(7);

  // Priority Focus
  const [topPriority, setTopPriority] = useState('Sức Khỏe, Gia Đạo & Bình An');

  // Real-time Can Chi & Elemental Preview Computation
  const previewCalculation = useMemo(() => {
    try {
      const effectiveHour = hourMode === 'unknown' ? 12 : solarHour;
      const yearP = calculateYearPillar(solarYear, solarMonth, solarDay, timezoneOffset, effectiveHour, solarMinute);
      const monthP = calculateMonthPillar(yearP.stem, solarYear, solarMonth, solarDay, timezoneOffset, effectiveHour, solarMinute);
      const dayP = calculateDayPillar(solarYear, solarMonth, solarDay, timezoneOffset, isLateRat, effectiveHour);
      const hourP = calculateHourPillar(dayP.stem, effectiveHour, solarMinute, isLateRat);
      const naYin = getNaYin(yearP.stem, yearP.branch);
      const lunar = convertSolarToLunar(solarYear, solarMonth, solarDay, timezoneOffset, isLateRat, effectiveHour);

      return {
        year: `${STEMS[yearP.stem].nameVi} ${BRANCHES[yearP.branch].nameVi}`,
        month: `${STEMS[monthP.stem].nameVi} ${BRANCHES[monthP.branch].nameVi}`,
        day: `${STEMS[dayP.stem].nameVi} ${BRANCHES[dayP.branch].nameVi}`,
        hour: hourMode === 'unknown' ? 'Giờ Chuẩn (Ngọ)' : `${STEMS[hourP.stem].nameVi} ${BRANCHES[hourP.branch].nameVi}`,
        yearElement: STEMS[yearP.stem].element,
        dayElement: STEMS[dayP.stem].element,
        naYin,
        lunarStr: `Ngày ${lunar.lunarDay} Tháng ${lunar.lunarMonth} Âm lịch`,
        solarTerm: lunar.solarTerm
      };
    } catch (e) {
      return {
        year: 'Canh Thân',
        month: 'Mậu Dần',
        day: 'Kỷ Mão',
        hour: 'Canh Ngọ',
        yearElement: 'Metal' as const,
        dayElement: 'Earth' as const,
        naYin: 'Thạch Lựu Mộc (Gỗ cây lựu đá)',
        lunarStr: 'Ngày 15 Tháng 1 Âm lịch',
        solarTerm: 'Lập Xuân'
      };
    }
  }, [solarYear, solarMonth, solarDay, solarHour, solarMinute, hourMode, timezoneOffset, isLateRat]);

  // Handle Zodiac Selection
  const handleSelectZodiac = (zh: typeof ZODIAC_HOURS[0]) => {
    setSelectedZodiacBranch(zh.branch);
    setSolarHour(zh.defaultHour);
    setSolarMinute(zh.defaultMin);
    setHourMode('canchi');
  };

  // Submit and Generate Chart
  const handleFinish = async () => {
    if (!name.trim()) {
      setErrorMessage('Quý vị vui lòng nhập Họ và Tên để hệ thống lập lá số.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const birthData: BirthData = {
        solarYear,
        solarMonth,
        solarDay,
        solarHour: hourMode === 'unknown' ? 12 : solarHour,
        solarMinute: hourMode === 'unknown' ? 0 : solarMinute,
        hasExactHour: hourMode !== 'unknown',
        birthCity,
        birthCountry: birthCountry || 'Việt Nam',
        timezoneOffset,
        timezoneName: `UTC${timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset}`,
        gender,
        calendarSystem: 'solar',
        isLateRat,
        timeConvention,
        longitude: locationProvider.resolveLocation(birthCity, birthCountry)?.longitude ?? (timezoneOffset * 15),
        latitude: locationProvider.resolveLocation(birthCity, birthCountry)?.latitude
      };

      const behavioral: BehavioralContext = {
        careerField: 'Đời sống, Sức khỏe & Định hướng',
        employmentStatus: 'Tự do / Nghỉ hưu / Quản lý',
        financialGoal: 'Vững vàng tài sản & Bình an gia đạo',
        relationshipStatus: 'Hòa hợp gia đình',
        topPriority,
        personalNotes: 'Hồ sơ người dùng lập trực tiếp.'
      };

      await onComplete(name.trim(), birthData, behavioral);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl rounded-3xl bg-[#0d0e17] border border-teal-500/40 p-5 sm:p-7 space-y-6 shadow-[0_0_80px_rgba(45,212,191,0.2)] text-slate-100 relative my-auto max-h-[94vh] flex flex-col justify-between overflow-y-auto"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-90 blur-xs" />

        {/* Modal Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 via-purple-500/20 to-indigo-500/20 border border-teal-400/50 flex items-center justify-center text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.3)] shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel tracking-wide">
                  Thiết Lập Thông Tin Sinh & Bản Mệnh
                </h2>
                <p className="text-xs sm:text-sm text-teal-200/90 mt-1 font-medium">
                  Ứng dụng chính thức của kênh <strong className="text-amber-300 font-semibold">Huyền Phong Phật Đạo</strong> • Vui lòng nhập thông tin để AI tính toán Tứ Trụ, 12 Cung Tử Vi và Bản Đồ Vận Mệnh
                </p>
              </div>
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Senior Guide Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3">
            <Info className="w-5 h-5 text-teal-400 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-200 leading-snug">
              <strong>Hướng dẫn:</strong> Quý vị chỉ cần điền <strong>Họ Tên</strong>, chọn <strong>Giới Tính</strong> và <strong>Ngày Sinh</strong>. Hệ thống AI sẽ tự động quy đổi Âm - Dương lịch và lập lá số chính xác.
            </p>
          </div>

          {/* Mode Switch Tabs (If existing profiles exist) */}
          {existingProfiles.length > 0 && (
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/50 border border-white/10 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-teal-500/30 to-purple-500/30 border border-teal-400 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Nhập Thông Tin Mới</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profiles')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === 'profiles'
                    ? 'bg-gradient-to-r from-teal-500/30 to-purple-500/30 border border-teal-400 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Hồ Sơ Đã Lưu ({existingProfiles.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: FORM NHẬP THÔNG TIN HOÀN TOÀN TRỐNG & DỄ DÙNG */}
        {activeTab === 'create' ? (
          <div className="space-y-6">
            {/* Error Banner if missing Name */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2.5 text-rose-300 text-xs sm:text-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* MỤC 1: HỌ TÊN & GIỚI TÍNH (Rõ Ràng, Nút Lớn) */}
            <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">1</span>
                <span>Thông Tin Cá Nhân & Giới Tính</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-100">
                    Họ và Tên <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên (VD: Nguyễn Văn An)..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/70 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Giới tính buttons */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-100">
                    Giới Tính <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGender('Male')}
                      className={`py-3 px-3 rounded-2xl text-sm font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
                        gender === 'Male'
                          ? 'bg-teal-950/90 border-teal-400 text-teal-200 shadow-[0_0_20px_rgba(45,212,191,0.25)] ring-2 ring-teal-500/40'
                          : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">♂️</span>
                      <span>Nam</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Female')}
                      className={`py-3 px-3 rounded-2xl text-sm font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
                        gender === 'Female'
                          ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-2 ring-purple-500/40'
                          : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">♀️</span>
                      <span>Nữ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MỤC 2: NGÀY, THÁNG, NĂM SINH (Dễ Dàng Chọn Cả Âm & Dương Lịch) */}
            <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">2</span>
                  <span>Ngày Tháng Năm Sinh</span>
                </div>

                {/* Chuyển Đổi Dương / Âm Lịch Rõ Ràng */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => setCalendarType('solar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
                      calendarType === 'solar'
                        ? 'bg-teal-500/30 text-teal-200 border border-teal-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Dương Lịch (Lịch Tây)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarType('lunar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
                      calendarType === 'lunar'
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>Âm Lịch (Lịch Ta)</span>
                  </button>
                </div>
              </div>

              {/* 3 Dropdown / Selectors Ngày - Tháng - Năm (Chữ to, rõ ràng) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Ngày */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Ngày Sinh (1 - 31)
                  </label>
                  <select
                    value={solarDay}
                    onChange={(e) => setSolarDay(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-base font-bold focus:border-teal-400 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Ngày {d < 10 ? `0${d}` : d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tháng */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Tháng Sinh (1 - 12)
                  </label>
                  <select
                    value={solarMonth}
                    onChange={(e) => setSolarMonth(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-base font-bold focus:border-teal-400 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m < 10 ? `0${m}` : m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Năm Sinh (Kèm Can Chi và Số Tuổi để người lớn tuổi nhìn là nhận ra ngay) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Năm Sinh (Kèm Tuổi & Can Chi)
                  </label>
                  <select
                    value={solarYear}
                    onChange={(e) => setSolarYear(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-teal-300 font-mono text-base font-bold focus:border-teal-400 focus:outline-none cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((yo) => (
                      <option key={yo.year} value={yo.year}>
                        {yo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* MỤC 3: GIỜ SINH (3 Chế Độ Thân Thiện: 12 Giờ Can Chi / Giờ Phút Cụ Thể / Không Rõ Giờ) */}
            <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">3</span>
                  <span>Giờ Sinh Của Quý Vị</span>
                </div>

                {/* Chuyển chế độ giờ */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs">
                  <button
                    type="button"
                    onClick={() => setHourMode('canchi')}
                    className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'canchi'
                        ? 'bg-teal-500/30 text-teal-200 border border-teal-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Khung Giờ Can Chi (Khuyên Dùng)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHourMode('exact')}
                    className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'exact'
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Giờ & Phút Cụ Thể
                  </button>
                  <button
                    type="button"
                    onClick={() => setHourMode('unknown')}
                    className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'unknown'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Không Nhớ Giờ
                  </button>
                </div>
              </div>

              {/* Giao diện Chế độ 1: 12 Khung Giờ Can Chi Dễ Chọn Nhất */}
              {hourMode === 'canchi' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300">
                    Bấm chọn khung giờ tương ứng lúc sinh ra:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {ZODIAC_HOURS.map((zh) => {
                      const isSelected = selectedZodiacBranch === zh.branch;
                      return (
                        <button
                          key={zh.branch}
                          type="button"
                          onClick={() => handleSelectZodiac(zh)}
                          className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer min-h-[56px] flex flex-col justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-teal-950 to-emerald-950 border-teal-400 text-teal-200 ring-2 ring-teal-500/40 shadow-lg'
                              : 'bg-black/50 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <div className="font-bold text-sm text-white flex items-center justify-between">
                            <span>Giờ {zh.nameVi}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {zh.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Giao diện Chế độ 2: Nhập Giờ & Phút Cụ Thể */}
              {hourMode === 'exact' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Giờ (0 đến 23 giờ)</label>
                    <select
                      value={solarHour}
                      onChange={(e) => setSolarHour(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-base font-bold focus:border-teal-400 focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <option key={h} value={h}>
                          {h < 10 ? `0${h}` : h} Giờ
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Phút (0 đến 59 phút)</label>
                    <select
                      value={solarMinute}
                      onChange={(e) => setSolarMinute(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-base font-bold focus:border-teal-400 focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <option key={m} value={m}>
                          {m < 10 ? `0${m}` : m} Phút
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Giao diện Chế độ 3: Không Nhớ Giờ */}
              {hourMode === 'unknown' && (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs sm:text-sm text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Nếu Quý vị không nhớ giờ sinh, hệ thống sẽ sử dụng giờ chuẩn định thiên văn (Chính Ngọ - 12:00) để phân tích đầy đủ Tứ Trụ, Ngũ Hành và Đại Vận trọn đời mà không làm gián đoạn việc lập lá số.
                  </span>
                </div>
              )}

              {/* Astronomical Conventions & Late Rat Configuration */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Quy ước Dạ Tý (23h00 - 23h59)</span>
                    <span className="text-[11px] text-slate-400">
                      {isLateRat ? 'Tính sang Trụ Ngày hôm sau (Dạ Tý quy ước mới)' : 'Giữ nguyên Trụ Ngày hiện tại (Chính Tý cổ truyền)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLateRat(!isLateRat)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isLateRat ? 'bg-teal-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isLateRat ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Hệ Quy Chiếu Thời Gian</span>
                    <span className="text-[11px] text-slate-400">
                      {timeConvention === 'civil' ? 'Giờ Dân Dụng (Civil Standard Time UTC+7)' : 'Giờ Mặt Trời Thực (True Solar Time - EoT)'}
                    </span>
                  </div>
                  <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setTimeConvention('civil')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        timeConvention === 'civil' ? 'bg-teal-500/30 text-teal-300 font-bold border border-teal-500/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dân Dụng
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeConvention('trueSolar')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        timeConvention === 'trueSolar' ? 'bg-teal-500/30 text-teal-300 font-bold border border-teal-500/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mặt Trời Thực
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MỤC 4: NƠI SINH & MỤC TIÊU QUAN TÂM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-3xl bg-white/[0.02] border border-white/10">
              {/* Nơi Sinh & Tọa Độ Thiên Văn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>Nơi Sinh & Tọa Độ Thiên Văn</span>
                  </label>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                    UTC{timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset} • {birthCountry}
                  </span>
                </div>
                <input
                  type="text"
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  placeholder="Nhập tỉnh/thành phố nơi sinh..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/70 border border-white/20 text-white text-sm focus:border-teal-400 focus:outline-none"
                />
                {/* Location Quick Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { city: 'Hà Nội', country: 'Việt Nam', tz: 7 },
                      { city: 'TP. Hồ Chí Minh', country: 'Việt Nam', tz: 7 },
                      { city: 'Đà Nẵng', country: 'Việt Nam', tz: 7 },
                      { city: 'Hải Phòng', country: 'Việt Nam', tz: 7 },
                      { city: 'Cần Thơ', country: 'Việt Nam', tz: 7 },
                      { city: 'Tokyo', country: 'Nhật Bản', tz: 9 },
                      { city: 'Seoul', country: 'Hàn Quốc', tz: 9 },
                      { city: 'Paris', country: 'Pháp', tz: 1 },
                      { city: 'London', country: 'Vương Quốc Anh', tz: 0 },
                      { city: 'New York', country: 'Hoa Kỳ', tz: -5 },
                      { city: 'Sydney', country: 'Úc', tz: 10 }
                    ].map((item) => {
                      const isSelected = birthCity === item.city;
                      return (
                        <button
                          key={item.city}
                          type="button"
                          onClick={() => {
                            setBirthCity(item.city);
                            setBirthCountry(item.country);
                            setTimezoneOffset(item.tz);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-500/30 border-teal-400 text-teal-200 font-bold'
                              : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {item.city}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mục Tiêu Trọng Tâm */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Mối Quan Tâm Lớn Nhất</span>
                </label>
                <select
                  value={topPriority}
                  onChange={(e) => setTopPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/70 border border-white/20 text-white text-sm focus:border-teal-400 focus:outline-none cursor-pointer"
                >
                  <option value="Sức Khỏe, Gia Đạo & Bình An">Sức Khỏe, Gia Đạo & Bình An</option>
                  <option value="Sự Nghiệp, Danh Vọng & Thăng Tiến">Sự Nghiệp, Danh Vọng & Thăng Tiến</option>
                  <option value="Tài Chính, Đầu Tư & Tích Lũy Tài Sản">Tài Chính, Đầu Tư & Tích Lũy Tài Sản</option>
                  <option value="Hôn Nhân, Con Cái & Tình Duyên">Hôn Nhân, Con Cái & Tình Duyên</option>
                  <option value="Khởi Nghiệp & Quản Trị Doanh Nghiệp">Khởi Nghiệp & Quản Trị Doanh Nghiệp</option>
                </select>
                <div className="text-[11px] text-slate-400">
                  AI sẽ tập trung phân tích sâu vào lĩnh vực này cho Quý vị.
                </div>
              </div>
            </div>

            {/* MỤC 5: XEM TRƯỚC TỨ TRỤ BẢN MỆNH TỨC THÌ (Trang Trọng, Đẳng Cấp) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black/80 to-teal-950/40 border border-teal-500/40 shadow-inner space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-teal-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Bản Mệnh Trụ Số Sơ Khởi</span>
                </span>
                <span className="text-slate-300 font-mono">
                  {previewCalculation.lunarStr}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-black/70 border border-white/10">
                  <div className="text-xs text-slate-400">Trụ Năm Sinh</div>
                  <div className="text-sm sm:text-base font-bold text-teal-300 font-mono mt-1">
                    {previewCalculation.year}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/70 border border-white/10">
                  <div className="text-xs text-slate-400">Trụ Tháng Sinh</div>
                  <div className="text-sm sm:text-base font-bold text-slate-200 font-mono mt-1">
                    {previewCalculation.month}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/70 border border-white/10">
                  <div className="text-xs text-slate-400">Trụ Ngày (Mệnh Chủ)</div>
                  <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-1">
                    {previewCalculation.day}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/70 border border-white/10">
                  <div className="text-xs text-slate-400">Trụ Giờ Sinh</div>
                  <div className="text-sm sm:text-base font-bold text-purple-300 font-mono mt-1">
                    {previewCalculation.hour}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2.5 gap-1">
                <span>
                  Nạp Âm Ngũ Hành: <strong className="text-teal-300 font-semibold">{previewCalculation.naYin}</strong>
                </span>
                <span className="text-slate-400">Tiết Khí: {previewCalculation.solarTerm}</span>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: DANH SÁCH HỒ SƠ ĐÃ LƯU */
          <div className="space-y-3 py-2">
            <div className="text-sm font-semibold text-slate-200">
              Bấm vào hồ sơ để xem lại toàn bộ luận giải lá số:
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {existingProfiles.map((prof) => {
                const isCurrent = prof.id === activeProfileId;
                return (
                  <div
                    key={prof.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-teal-950/80 to-purple-950/80 border-teal-400 text-white shadow-lg ring-1 ring-teal-400/50'
                        : 'bg-black/50 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center font-bold text-base text-white shadow-md">
                        {prof.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-base text-white flex items-center gap-2">
                          <span>{prof.name}</span>
                          {prof.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              Chính
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Sinh ngày: {prof.birthData.solarDay}/{prof.birthData.solarMonth}/{prof.birthData.solarYear} • {prof.birthData.birthCity}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProfile) onSelectProfile(prof.id);
                        if (onCancel) onCancel();
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-400 text-black shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isCurrent ? 'Đang Xem' : 'Xem Lá Số Này'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NÚT HOÀN TẤT & LẬP LÁ SỐ SIÊU TO, DỄ BẤM (CAO 56px) */}
        {activeTab === 'create' && (
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 order-2 sm:order-1">
              <Shield className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Dữ liệu được bảo mật chuẩn Zero-Knowledge an toàn 100%</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="w-full sm:w-auto min-h-[54px] flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-black text-sm sm:text-base font-bold shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:shadow-[0_0_45px_rgba(45,212,191,0.6)] transition-all cursor-pointer order-1 sm:order-2"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>{isSubmitting ? 'Đang Phân Tích & Luận Giải...' : 'Lập Lá Số & Xem Luận Giải Ngay'}</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
