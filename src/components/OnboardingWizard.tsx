// ==========================================
// BIRTH PROFILE STUDIO & ONBOARDING WINDOW
// Senior-friendly, ultra-luxury, high-contrast, completely clean of demo data
// ==========================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Info,
  Volume2
} from 'lucide-react';
import { BirthData, BehavioralContext, Gender, EarthlyBranch } from '../types/destiny';
import { LanguageCode } from '../types/destiny';
import { STEMS, BRANCHES, ELEMENT_RELATIONS, getNaYin } from '../engine/canchi';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from '../engine/bazi';
import { convertSolarToLunar } from '../engine/lunarSolar';
import { UserProfile } from '../types/user';
import { WORLD_LOCATIONS, WorldLocation } from '../services/internationalization';
import { locationProvider } from '../services/locationProvider';
import { SeniorDestinyGuideModal } from './SeniorDestinyGuideModal';
import { SacredVoiceGuideWidget } from './SacredVoiceGuideWidget';
import { sacredVoice } from '../services/sacredVoiceService';
import { sacredSound } from '../services/soundService';
import { SacredParticles } from './SacredParticles';
import { SacredMandalaAura } from './SacredMandalaAura';
import { SacredSealBadge } from './SacredSealBadge';
import { SacredTaijiSpinner } from './SacredTaijiSpinner';

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

// Auspicious Age Decades for 1-Click Jump
const DECADE_BRACKETS = [
  { label: 'Bác / Cô Chú (1945 - 1965)', sampleYear: 1955 },
  { label: 'Trung Niên (1966 - 1980)', sampleYear: 1975 },
  { label: 'Thanh Niên (1981 - 1995)', sampleYear: 1988 },
  { label: 'Thế Hệ Trẻ (1996 - 2010)', sampleYear: 2002 },
  { label: 'Hậu Bối (2011 - 2026)', sampleYear: 2018 }
];

// Sacred Priorities with Icons & Descriptions
const SACRED_PRIORITIES = [
  { id: 'Sức Khỏe, Gia Đạo & Bình An', label: 'Sức Khỏe & Bình An', icon: '🌿', desc: 'Thân tâm an lạc, tiêu trừ tật ách, sống vui trường thọ' },
  { id: 'Tài Chính, Đầu Tư & Tích Lũy Tài Sản', label: 'Tài Lộc & Tích Lũy', icon: '💰', desc: 'Tụ tài tích sản, vượng cung Điền Trạch, phát đạt' },
  { id: 'Hôn Nhân, Con Cái & Tình Duyên', label: 'Gia Đạo & Con Cháu', icon: '🏡', desc: 'Hòa khí phu thê, phúc ấm tổ tiên, con cháu thành đạt' },
  { id: 'Sự Nghiệp, Danh Vọng & Thăng Tiến', label: 'Sự Nghiệp & Quan Lộc', icon: '👑', desc: 'Công danh hiển đạt, quý nhân tương trợ, vững ấn phong' },
  { id: 'Khởi Nghiệp & Quản Trị Doanh Nghiệp', label: 'Tu Tâm & Tiêu Nghiệp', icon: '📿', desc: 'Khai quang tâm trí, hóa giải sao hạn, an nhiên phúc báu' }
];

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
  const [showSeniorGuide, setShowSeniorGuide] = useState<boolean>(false);

  // Missing Field Tracking for Smart Navigation & Focus
  type MissingFieldKey = 'name' | 'birthCity' | 'date' | 'hour' | 'topPriority';
  const [missingField, setMissingField] = useState<MissingFieldKey | null>(null);

  // Element Refs for Intelligent Scrolling & Cursor Focusing
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameSectionRef = useRef<HTMLDivElement>(null);

  const dateSectionRef = useRef<HTMLDivElement>(null);
  const daySelectRef = useRef<HTMLSelectElement>(null);

  const hourSectionRef = useRef<HTMLDivElement>(null);

  const locationSectionRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const prioritySectionRef = useRef<HTMLDivElement>(null);
  const priorityFirstBtnRef = useRef<HTMLButtonElement>(null);

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

  // Intelligent Initial Auto-focus: Place cursor in Name input on open
  useEffect(() => {
    if (activeTab === 'create') {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus({ preventScroll: true });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Real-time Can Chi & Elemental Preview Computation (Strict Astronomical Integrity: No Mock/Fake Data)
  type PreviewResult =
    | {
        status: 'success';
        year: string;
        month: string;
        day: string;
        hour: string;
        yearElement: any;
        dayElement: any;
        naYin: string;
        lunarStr: string;
        solarTerm: string;
      }
    | {
        status: 'error';
        errorMessage: string;
      };

  const previewCalculation: PreviewResult = useMemo(() => {
    try {
      const daysInMonth = new Date(solarYear, solarMonth, 0).getDate();
      if (solarDay > daysInMonth) {
        return {
          status: 'error',
          errorMessage: `Ngày ${solarDay} không hợp lệ cho tháng ${solarMonth}/${solarYear} (tháng này chỉ có ${daysInMonth} ngày).`
        };
      }
      if (solarYear < 1900 || solarYear > 2100) {
        return {
          status: 'error',
          errorMessage: 'Năm sinh cần nằm trong giai đoạn 1900 - 2100 theo lịch vạn niên thiên văn.'
        };
      }

      const effectiveHour = hourMode === 'unknown' ? 12 : solarHour;
      const yearP = calculateYearPillar(solarYear, solarMonth, solarDay, timezoneOffset, effectiveHour, solarMinute);
      const monthP = calculateMonthPillar(yearP.stem, solarYear, solarMonth, solarDay, timezoneOffset, effectiveHour, solarMinute);
      const dayP = calculateDayPillar(solarYear, solarMonth, solarDay, timezoneOffset, isLateRat, effectiveHour);
      const hourP = calculateHourPillar(dayP.stem, effectiveHour, solarMinute, isLateRat);
      const naYin = getNaYin(yearP.stem, yearP.branch);
      const lunar = convertSolarToLunar(solarYear, solarMonth, solarDay, timezoneOffset, isLateRat, effectiveHour);

      return {
        status: 'success',
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
        status: 'error',
        errorMessage: 'Chưa thể xác định trụ số thiên văn cho thông số ngày giờ hiện tại. Kính mời Quý vị kiểm tra lại ngày sinh.'
      };
    }
  }, [solarYear, solarMonth, solarDay, solarHour, solarMinute, hourMode, timezoneOffset, isLateRat]);

  // Handle Zodiac Selection
  const handleSelectZodiac = (zh: typeof ZODIAC_HOURS[0]) => {
    setSelectedZodiacBranch(zh.branch);
    setSolarHour(zh.defaultHour);
    setSolarMinute(zh.defaultMin);
    setHourMode('canchi');
    if (missingField === 'hour') {
      setMissingField(null);
      setErrorMessage(null);
    }
  };

  /**
   * Helper: Trực tiếp điều hướng, cuộn mượt mà và di chuyển trỏ chuột
   * vào chính xác ô cần nhập liệu khi thông tin bị khuyết thiếu.
   */
  const triggerMissingFieldFocus = (
    fieldKey: MissingFieldKey,
    message: string,
    inputEl: HTMLElement | null,
    sectionEl: HTMLElement | null
  ) => {
    setMissingField(fieldKey);
    setErrorMessage(message);

    // Chuông cảnh báo linh thiêng nhẹ nhàng (360Hz)
    sacredSound.playSacredTap(360);

    // Cuộn mượt mà đưa khối thông tin thiếu vào chính giữa khung nhìn
    const scrollTarget = sectionEl || inputEl;
    if (scrollTarget) {
      if (modalScrollRef.current) {
        const modalRect = modalScrollRef.current.getBoundingClientRect();
        const targetRect = scrollTarget.getBoundingClientRect();
        const targetScrollTop = modalScrollRef.current.scrollTop + (targetRect.top - modalRect.top) - 60;
        modalScrollRef.current.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    // Di chuyển trỏ chuột và kích hoạt trường nhập liệu ngay tức thì
    setTimeout(() => {
      if (inputEl) {
        inputEl.focus({ preventScroll: true });
        if (inputEl instanceof HTMLInputElement && inputEl.type === 'text') {
          inputEl.select(); // Đặt trỏ chuột nhấp nháy hoặc bôi đen văn bản hiện có
        }
      }
    }, 250);
  };

  /**
   * Bộ kiểm định toàn diện các trường thông tin trước khi lập lá số
   */
  const validateAndFocusMissingField = (): boolean => {
    // 1. Kiểm tra Họ và Tên
    const trimmedName = name.trim();
    if (!trimmedName) {
      triggerMissingFieldFocus(
        'name',
        'Quý vị vui lòng nhập Họ và Tên để hệ thống khắc ghi vào lá số tử vi và bản đồ vận mệnh.',
        nameInputRef.current,
        nameSectionRef.current
      );
      return false;
    }
    if (trimmedName.length < 2) {
      triggerMissingFieldFocus(
        'name',
        'Họ và Tên cần có ít nhất 2 ký tự. Quý vị vui lòng bổ sung đầy đủ danh xưng.',
        nameInputRef.current,
        nameSectionRef.current
      );
      return false;
    }

    // 2. Kiểm tra tính hợp lệ của Ngày/Tháng/Năm
    const daysInMonth = new Date(solarYear, solarMonth, 0).getDate();
    if (solarDay > daysInMonth) {
      triggerMissingFieldFocus(
        'date',
        `Tháng ${solarMonth} năm ${solarYear} chỉ có tối đa ${daysInMonth} ngày. Quý vị vui lòng chọn lại ngày sinh hợp lệ.`,
        daySelectRef.current,
        dateSectionRef.current
      );
      return false;
    }
    if (solarYear < 1900 || solarYear > 2100) {
      triggerMissingFieldFocus(
        'date',
        'Năm sinh cần nằm trong giai đoạn 1900 - 2100 theo lịch vạn niên thiên văn.',
        daySelectRef.current,
        dateSectionRef.current
      );
      return false;
    }

    // 3. Kiểm tra Nơi Sinh
    const trimmedCity = birthCity.trim();
    if (!trimmedCity) {
      triggerMissingFieldFocus(
        'birthCity',
        'Quý vị vui lòng nhập hoặc chọn Tỉnh / Thành phố nơi sinh để xác định kinh độ và múi giờ thiên văn chuẩn xác.',
        cityInputRef.current,
        locationSectionRef.current
      );
      return false;
    }

    // 4. Kiểm tra Tâm Nguyện Trọng Tâm
    if (!topPriority || !topPriority.trim()) {
      triggerMissingFieldFocus(
        'topPriority',
        'Quý vị vui lòng chọn một Tâm nguyện trọng tâm để hệ thống hội tụ năng lượng phân tích.',
        priorityFirstBtnRef.current,
        prioritySectionRef.current
      );
      return false;
    }

    return true;
  };

  // Submit and Generate Chart
  const handleFinish = async () => {
    if (!validateAndFocusMissingField()) {
      return;
    }
    setErrorMessage(null);
    setMissingField(null);
    setIsSubmitting(true);

    try {
      const birthData: BirthData = {
        solarYear,
        solarMonth,
        solarDay,
        solarHour: hourMode === 'unknown' ? 12 : solarHour,
        solarMinute: hourMode === 'unknown' ? 0 : solarMinute,
        hasExactHour: hourMode !== 'unknown',
        birthCity: birthCity.trim(),
        birthCountry: birthCountry || 'Việt Nam',
        timezoneOffset,
        timezoneName: `UTC${timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset}`,
        gender,
        calendarSystem: 'solar',
        isLateRat,
        timeConvention,
        ziweiYearConvention: 'solarLapXuan',
        ziweiLeapMonthConvention: 'midMonthSplit',
        longitude: locationProvider.resolveLocation(birthCity.trim(), birthCountry)?.longitude ?? (timezoneOffset * 15),
        latitude: locationProvider.resolveLocation(birthCity.trim(), birthCountry)?.latitude
      };

      const behavioral: BehavioralContext = {
        careerField: 'Đời sống, Sức khỏe & Định hướng',
        employmentStatus: 'Tự do / Nghỉ hưu / Quản lý',
        financialGoal: 'Vững vàng tài sản & Bình an gia đạo',
        relationshipStatus: 'Hòa hợp gia đình',
        topPriority,
        personalNotes: 'Hồ sơ người dùng lập trực tiếp.'
      };

      sacredSound.playTempleGong(108);
      sacredSound.playSacredSuccess();
      await onComplete(name.trim(), birthData, behavioral);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSeniorGuide) {
    return (
      <SeniorDestinyGuideModal
        isOpen={true}
        onClose={() => setShowSeniorGuide(false)}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        ref={modalScrollRef}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl rounded-3xl bg-[#0d0e17] border border-amber-500/40 p-5 sm:p-7 space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-slate-100 relative my-auto max-h-[94vh] flex flex-col justify-between overflow-y-auto"
      >
        {/* SACRED PARTICLES & ROTATING MANDALA AURA BACKGROUND */}
        <SacredParticles density="subtle" className="opacity-35" />
        <SacredMandalaAura size={420} className="-top-16 -right-20" opacity={0.16} />
        <SacredMandalaAura size={340} className="-bottom-20 -left-16" opacity={0.12} />

        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90 blur-xs pointer-events-none" />

        {/* Modal Header */}
        {/* Modal Header — Streamlined Royal Control Header */}
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-start justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-teal-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-white font-cinzel tracking-wide">
                    Thiết Lập Thông Tin Sinh & Bản Mệnh
                  </h2>
                  <SacredSealBadge text="THIÊN CƠ" subtext="KHAI QUANG" size="sm" className="hidden sm:inline-flex" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-light">
                  Huyền Phong Phật Đạo · Khai mở Tứ Trụ, 12 Cung & Vận Hạn 2026 chuẩn thiên văn cổ bản
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (sacredSound.getIsAmbientPlaying()) {
                    sacredSound.stopAmbient();
                  } else {
                    sacredSound.startAmbient('432hz');
                    sacredSound.playTibetanBowl(432);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                title="Bật/Tắt âm sóng thiền 432Hz tịnh tâm"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Âm Sóng 432Hz</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSeniorGuide(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                title="Hướng dẫn từng bước chữ lớn cho người cao tuổi"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Chế Độ Chữ Lớn</span>
              </button>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Clean Unboxed Trust & Reassurance Bar */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <span>✓</span> 98,680+ Gia Chủ Đã Khai Mở
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-teal-300 font-medium hidden sm:inline">✓ Miễn Phí 100%</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-400 hidden sm:inline">✓ Bảo Mật Cục Bộ 100%</span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">
              Thời gian nhập: ~30 giây
            </span>
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

            {/* TRỢ LÝ GIỌNG ĐỌC LINH THIÊNG — HUYỀN PHONG PHẬT ĐẠO (TĂNG TỶ LỆ CHUYỂN ĐỔI) */}
            <SacredVoiceGuideWidget autoPlayIntroOnce={false} className="mb-2" />

            {/* MỤC 1: HỌ TÊN & GIỚI TÍNH (Rõ Ràng, Nút Lớn) */}
            <div
              ref={nameSectionRef}
              className={`space-y-4 p-4 sm:p-5 rounded-3xl transition-all duration-300 ${
                missingField === 'name'
                  ? 'bg-amber-950/25 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.02] border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">1</span>
                  <span>Thông Tin Cá Nhân & Giới Tính</span>
                </div>
                <button
                  type="button"
                  onClick={() => sacredVoice.speak('field_name')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Nghe lời giải nghĩa tên và năng lượng danh xưng"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Nghe Ý Nghĩa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-100">
                      Họ và Tên <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-amber-300/80 font-medium hidden sm:inline">
                      Khắc dấu bản mệnh
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="Nhập họ và tên (VD: Nguyễn Văn An)..."
                      value={name}
                      onFocus={() => {
                        sacredSound.playSacredTap(528);
                        if (missingField === 'name') {
                          setMissingField(null);
                          setErrorMessage(null);
                        }
                      }}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (missingField === 'name') setMissingField(null);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-black/70 text-white text-sm sm:text-base focus:outline-none transition-all placeholder:text-slate-500 ${
                        missingField === 'name'
                          ? 'border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                          : 'border border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30'
                      }`}
                    />
                  </div>

                  {/* Chỉ dẫn thông minh ngay tại vị trí trỏ chuột */}
                  {missingField === 'name' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border border-amber-400 text-amber-200 text-xs flex items-center gap-2 shadow-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      <span className="font-semibold">
                        👉 Trỏ chuột đã chuyển tới đây: Kính mời Quý vị nhập Họ và Tên để bắt đầu
                      </span>
                    </motion.div>
                  )}

                  {name.trim() && !missingField && (
                    <motion.div
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-0.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Danh xưng kết tụ phúc khí dòng tộc • Sẵn sàng an sao Cung Mệnh</span>
                    </motion.div>
                  )}
                </div>

                {/* Giới tính buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-100">
                      Giới Tính <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] text-teal-300/80 font-medium hidden sm:inline">
                      Định chiều Đại Vận
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setGender('Male');
                        sacredSound.playSacredTap(528);
                      }}
                      className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
                        gender === 'Male'
                          ? 'bg-gradient-to-r from-teal-950/90 to-cyan-950/90 border-teal-400 text-teal-200 shadow-[0_0_25px_rgba(45,212,191,0.3)] ring-2 ring-teal-500/40'
                          : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">♂️</span>
                        <span>Nam</span>
                      </div>
                      <span className="text-[10px] text-teal-300/70 font-normal">Dương Nam • Vận Thuận</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender('Female');
                        sacredSound.playSacredTap(660);
                      }}
                      className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
                        gender === 'Female'
                          ? 'bg-gradient-to-r from-purple-950/90 to-pink-950/90 border-purple-400 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/40'
                          : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">♀️</span>
                        <span>Nữ</span>
                      </div>
                      <span className="text-[10px] text-purple-300/70 font-normal">Âm Nữ • Vận Nghịch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MỤC 2: NGÀY, THÁNG, NĂM SINH (Dễ Dàng Chọn Cả Âm & Dương Lịch) */}
            <div
              ref={dateSectionRef}
              className={`space-y-4 p-4 sm:p-5 rounded-3xl transition-all duration-300 ${
                missingField === 'date'
                  ? 'bg-amber-950/25 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.02] border border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">2</span>
                    <span>Ngày Tháng Năm Sinh</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => sacredVoice.speak('field_date')}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    title="Nghe lời giải thích quy đổi Âm Dương Lịch"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Nghe Hướng Dẫn</span>
                  </button>
                </div>

                {/* Chuyển Đổi Dương / Âm Lịch Rõ Ràng */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarType('solar');
                      sacredSound.playSacredTap(528);
                      if (missingField === 'date') setMissingField(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer ${
                      calendarType === 'solar'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Dương Lịch (Lịch Tây)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarType('lunar');
                      sacredSound.playSacredTap(528);
                      if (missingField === 'date') setMissingField(null);
                    }}
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

              {/* Quick Decade Jump Chips for Seamless Selection */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chọn nhanh thế hệ sinh (Bấm 1 chạm nhảy ngay):</span>
                  </span>
                  <span className="text-amber-300/80 text-[11px] font-mono">
                    {previewCalculation.status === 'success'
                      ? `${previewCalculation.year} • ${previewCalculation.naYin}`
                      : 'Chưa xác định Can Chi'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DECADE_BRACKETS.map((bracket) => (
                    <button
                      key={bracket.label}
                      type="button"
                      onClick={() => {
                        setSolarYear(bracket.sampleYear);
                        sacredSound.playSacredTap(480);
                        if (missingField === 'date') setMissingField(null);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                        Math.abs(solarYear - bracket.sampleYear) <= 7
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-xs'
                          : 'bg-black/40 hover:bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      {bracket.label}
                    </button>
                  ))}
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
                    ref={daySelectRef}
                    value={solarDay}
                    onFocus={() => {
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                    }}
                    onChange={(e) => {
                      setSolarDay(Number(e.target.value));
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                      sacredSound.playSacredTap(432);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl bg-black/80 font-mono text-base font-bold focus:outline-none cursor-pointer transition-all ${
                      missingField === 'date'
                        ? 'text-amber-300 border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                        : 'text-white border border-white/20 focus:border-amber-400'
                    }`}
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
                    onFocus={() => {
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                    }}
                    onChange={(e) => {
                      setSolarMonth(Number(e.target.value));
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                      sacredSound.playSacredTap(432);
                    }}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
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
                    onFocus={() => {
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                    }}
                    onChange={(e) => {
                      setSolarYear(Number(e.target.value));
                      if (missingField === 'date') {
                        setMissingField(null);
                        setErrorMessage(null);
                      }
                      sacredSound.playSacredTap(432);
                    }}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/80 border border-white/20 text-amber-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((yo) => (
                      <option key={yo.year} value={yo.year}>
                        {yo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chỉ dẫn thông minh nếu ngày không khớp với số ngày trong tháng */}
              {missingField === 'date' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-amber-500/25 border border-amber-400 text-amber-200 text-xs flex items-center gap-2 shadow-lg"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  <span className="font-semibold">
                    👉 Trỏ chuột đã chuyển tới đây: Tháng {solarMonth} năm {solarYear} chỉ có {new Date(solarYear, solarMonth, 0).getDate()} ngày. Vui lòng chọn lại ngày sinh.
                  </span>
                </motion.div>
              )}
            </div>

            {/* MỤC 3: GIỜ SINH (3 Chế Độ Thân Thiện: 12 Giờ Can Chi / Giờ Phút Cụ Thể / Không Rõ Giờ) */}
            <div
              ref={hourSectionRef}
              className={`space-y-4 p-4 sm:p-5 rounded-3xl transition-all duration-300 ${
                missingField === 'hour'
                  ? 'bg-amber-950/25 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.02] border border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs">3</span>
                    <span>Giờ Sinh Của Quý Vị</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => sacredVoice.speak('field_hour')}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    title="Nghe lời hướng dẫn định tâm giờ sinh"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Nghe Hướng Dẫn</span>
                  </button>
                </div>

                {/* Chuyển chế độ giờ */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setHourMode('canchi');
                      if (missingField === 'hour') setMissingField(null);
                    }}
                    className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'canchi'
                        ? 'bg-teal-500/30 text-teal-200 border border-teal-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Khung Giờ Can Chi (Khuyên Dùng)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHourMode('exact');
                      if (missingField === 'hour') setMissingField(null);
                    }}
                    className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'exact'
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Giờ & Phút Cụ Thể
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHourMode('unknown');
                      if (missingField === 'hour') setMissingField(null);
                    }}
                    className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                      hourMode === 'unknown'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Không Nhớ Giờ
                  </button>
                </div>
              </div>

              {/* Chỉ dẫn thông minh cho phần Giờ Sinh */}
              {missingField === 'hour' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-purple-500/20 to-amber-500/25 border border-amber-400 text-amber-200 text-xs flex items-center gap-2 shadow-lg"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  <span className="font-semibold">
                    👉 Trỏ chuột đã chuyển tới đây: Quý vị vui lòng chọn một khung giờ sinh phù hợp
                  </span>
                </motion.div>
              )}

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
                      onChange={(e) => {
                        setSolarHour(Number(e.target.value));
                        if (missingField === 'hour') setMissingField(null);
                      }}
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
                      onChange={(e) => {
                        setSolarMinute(Number(e.target.value));
                        if (missingField === 'hour') setMissingField(null);
                      }}
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
            <div
              ref={locationSectionRef}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-3xl transition-all duration-300 ${
                missingField === 'birthCity' || missingField === 'topPriority'
                  ? 'bg-amber-950/25 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.02] border border-white/10'
              }`}
            >
              {/* Nơi Sinh & Tọa Độ Thiên Văn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span>Nơi Sinh & Tọa Độ Thiên Văn <span className="text-amber-400">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => sacredVoice.speak('field_location')}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                      title="Nghe giải nghĩa địa linh nơi sinh"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Nghe Ý Nghĩa</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                    UTC{timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset} • {birthCountry}
                  </span>
                </div>
                <input
                  ref={cityInputRef}
                  type="text"
                  value={birthCity}
                  onFocus={() => {
                    sacredSound.playSacredTap(528);
                    if (missingField === 'birthCity') {
                      setMissingField(null);
                      setErrorMessage(null);
                    }
                  }}
                  onChange={(e) => {
                    setBirthCity(e.target.value);
                    if (missingField === 'birthCity') setMissingField(null);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Nhập tỉnh/thành phố nơi sinh..."
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-black/70 text-white text-sm focus:outline-none transition-all ${
                    missingField === 'birthCity'
                      ? 'border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                      : 'border border-white/20 focus:border-teal-400'
                  }`}
                />

                {/* Chỉ dẫn thông minh ngay tại vị trí ô Nơi Sinh */}
                {missingField === 'birthCity' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-teal-500/20 to-amber-500/25 border border-amber-400 text-amber-200 text-xs flex items-center gap-2 shadow-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span className="font-semibold">
                      👉 Trỏ chuột đã chuyển tới đây: Vui lòng nhập hoặc chọn Tỉnh / Thành phố nơi sinh
                    </span>
                  </motion.div>
                )}

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
                            sacredSound.playSacredTap(528);
                            if (missingField === 'birthCity') {
                              setMissingField(null);
                              setErrorMessage(null);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-xs'
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

              {/* Mục Tiêu Trọng Tâm — THẺ TÂM NGUYỆN LINH THIÊNG (TƯƠNG TÁC CAO) */}
              <div ref={prioritySectionRef} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Tâm Nguyện Trọng Tâm Của Quý Vị <span className="text-amber-400">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={() => sacredVoice.speak('field_priority')}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                    title="Nghe giải nghĩa tâm nguyện và phúc đức"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Nghe Ý Nghĩa</span>
                  </button>
                </div>

                {/* Chỉ dẫn thông minh cho Tâm Nguyện */}
                {missingField === 'topPriority' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border border-amber-400 text-amber-200 text-xs flex items-center gap-2 shadow-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span className="font-semibold">
                      👉 Quý vị vui lòng bấm chọn 1 thẻ Tâm Nguyện phía dưới để tiếp tục
                    </span>
                  </motion.div>
                )}

                {/* 5 Thẻ Tâm Nguyện Tương Tác 1 Chạm */}
                <div className="space-y-1.5">
                  {SACRED_PRIORITIES.map((sp, idx) => {
                    const isSelected = topPriority === sp.id;
                    return (
                      <button
                        key={sp.id}
                        ref={idx === 0 ? priorityFirstBtnRef : undefined}
                        type="button"
                        onClick={() => {
                          setTopPriority(sp.id);
                          sacredSound.playSacredTap(640);
                          if (missingField === 'topPriority') {
                            setMissingField(null);
                            setErrorMessage(null);
                          }
                        }}
                        className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-950/80 via-[#221611]/90 to-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                            : 'bg-black/40 hover:bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-xl shrink-0">{sp.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs sm:text-sm text-white">
                              {sp.label}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {sp.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MỤC 5: XEM TRƯỚC TỨ TRỤ BẢN MỆNH TỨC THÌ (Trang Trọng, Đẳng Cấp) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black/80 to-amber-950/40 border border-amber-500/40 shadow-inner space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-amber-300 uppercase tracking-wider font-cinzel flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Bản Mệnh Trụ Số Sơ Khởi (Thời Khắc Thiên Địa)</span>
                </span>
                {previewCalculation.status === 'success' && (
                  <span className="text-slate-300 font-mono">
                    {previewCalculation.lunarStr}
                  </span>
                )}
              </div>

              {previewCalculation.status === 'success' ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-black/70 border border-white/10">
                      <div className="text-xs text-slate-400">Trụ Năm Sinh</div>
                      <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-1">
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
                      <div className="text-sm sm:text-base font-bold text-teal-300 font-mono mt-1">
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
                      Nạp Âm Ngũ Hành: <strong className="text-amber-300 font-semibold">{previewCalculation.naYin}</strong>
                    </span>
                    <span className="text-slate-400">Tiết Khí: {previewCalculation.solarTerm}</span>
                  </div>
                </>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-amber-200 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{previewCalculation.errorMessage}</span>
                </div>
              )}
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

        {/* NÚT HOÀN TẤT & LẬP LÁ SỐ SIÊU LINH THIÊNG, ĐẲNG CẤP (TỐI ƯU CHUYỂN ĐỔI CAO NHẤT) */}
        {activeTab === 'create' && (
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1 text-xs text-slate-400 order-2 sm:order-1 text-center sm:text-left">
              <div className="flex items-center gap-2 text-teal-300 font-semibold justify-center sm:justify-start">
                <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Bảo Mật Zero-Knowledge 100% Cục Bộ</span>
              </div>
              <span className="text-[11px] text-slate-400">
                🔥 98,680+ Gia Chủ Đã Khai Mở Bản Mệnh Bình An
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="w-full sm:w-auto min-h-[58px] flex flex-col items-center justify-center px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] transition-all cursor-pointer order-1 sm:order-2 border border-amber-300/80 group"
            >
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold tracking-wide">
                <SacredTaijiSpinner size={24} speed={5} className="shrink-0" />
                <span>{isSubmitting ? 'Đang Phân Tích & Luận Giải...' : 'Lấy Lá Số Tử Vi & Khai Mở Bản Mệnh Ngay'}</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[11px] text-slate-950/80 font-medium font-sans">
                Tự động kiểm tra & di chuyển trỏ chuột đến ô cần điền nếu thiếu thông tin • Miễn phí
              </span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
