// ==========================================
// SENIOR DESTINY GUIDE MODAL — HUYỀN PHONG PHẬT ĐẠO
// Trợ Lý Hướng Dẫn Điền Thông Tin Lập Lá Số Tử Vi Siêu Thông Minh Dành Cho Người Lớn Tuổi
// Kiến trúc 3 khối (Header cố định - Body cuộn mượt mà - Footer cố định), triệt tiêu 100% lỗi chồng lấn text
// ==========================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sun,
  Moon,
  Compass,
  MapPin,
  Heart,
  Shield,
  HelpCircle,
  X,
  User,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { BirthData, BehavioralContext, Gender, EarthlyBranch } from '../types/destiny';
import { STEMS, BRANCHES, getNaYin } from '../engine/canchi';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from '../engine/bazi';
import { convertSolarToLunar, convertLunarToSolar } from '../engine/lunarSolar';
import { locationProvider } from '../services/locationProvider';
import { sacredSound } from '../services/soundService';
import { SacredParticles } from './SacredParticles';
import { SacredMandalaAura } from './SacredMandalaAura';
import { SacredSealBadge } from './SacredSealBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (name: string, birthData: BirthData, behavioral: BehavioralContext) => Promise<void>;
}

// 12 Con Giáp tương ứng với Chi
const ZODIAC_ANIMALS = [
  { branch: 'Zi' as EarthlyBranch, animalVi: 'Tý (Chuột)', icon: '🐭', baseYears: [1936, 1948, 1960, 1972, 1984, 1996] },
  { branch: 'Chou' as EarthlyBranch, animalVi: 'Sửu (Trâu)', icon: '🐂', baseYears: [1937, 1949, 1961, 1973, 1985, 1997] },
  { branch: 'Yin_B' as EarthlyBranch, animalVi: 'Dần (Hổ)', icon: '🐯', baseYears: [1938, 1950, 1962, 1974, 1986, 1998] },
  { branch: 'Mao' as EarthlyBranch, animalVi: 'Mão (Mèo)', icon: '🐱', baseYears: [1939, 1951, 1963, 1975, 1987, 1999] },
  { branch: 'Chen' as EarthlyBranch, animalVi: 'Thìn (Rồng)', icon: '🐲', baseYears: [1940, 1952, 1964, 1976, 1988, 2000] },
  { branch: 'Si' as EarthlyBranch, animalVi: 'Tỵ (Rắn)', icon: '🐍', baseYears: [1941, 1953, 1965, 1977, 1989, 2001] },
  { branch: 'Wu_B' as EarthlyBranch, animalVi: 'Ngọ (Ngựa)', icon: '🐴', baseYears: [1942, 1954, 1966, 1978, 1990, 2002] },
  { branch: 'Wei' as EarthlyBranch, animalVi: 'Mùi (Dê)', icon: '🐐', baseYears: [1943, 1955, 1967, 1979, 1991, 2003] },
  { branch: 'Shen' as EarthlyBranch, animalVi: 'Thân (Khỉ)', icon: '🐵', baseYears: [1944, 1956, 1968, 1980, 1992, 2004] },
  { branch: 'You' as EarthlyBranch, animalVi: 'Dậu (Gà)', icon: '🐔', baseYears: [1945, 1957, 1969, 1981, 1993, 2005] },
  { branch: 'Xu' as EarthlyBranch, animalVi: 'Tuất (Chó)', icon: '🐶', baseYears: [1946, 1958, 1970, 1982, 1994, 2006] },
  { branch: 'Hai' as EarthlyBranch, animalVi: 'Hợi (Lợn)', icon: '🐷', baseYears: [1947, 1959, 1971, 1983, 1995, 2007] }
];

// 12 Ký ức Giờ Sinh Dân Gian Xưa
const FOLK_BIRTH_HOURS = [
  {
    id: 'ty_midnight',
    branch: 'Zi' as EarthlyBranch,
    titleVi: 'Nửa đêm canh ba (Giờ Tý)',
    timeRange: '23:00 - 00:59',
    folkMemory: 'Lúc nửa đêm tĩnh mịch, trời lạnh buốt, tiếng chuông chùa điểm canh ba, giao hòa giữa hai ngày.',
    hour: 0,
    minute: 30
  },
  {
    id: 'chou_first_cock',
    branch: 'Chou' as EarthlyBranch,
    titleVi: 'Gà gáy đầu tiên (Giờ Sửu)',
    timeRange: '01:00 - 02:59',
    folkMemory: 'Tiếng gà trống gáy te te lần thứ nhất, trời đất còn tối đen mịt mùng, mọi người còn đang say giấc.',
    hour: 2,
    minute: 0
  },
  {
    id: 'yin_dawn',
    branch: 'Yin_B' as EarthlyBranch,
    titleVi: 'Rạng đông hé sáng (Giờ Dần)',
    timeRange: '03:00 - 04:59',
    folkMemory: 'Trời chớm hửng sáng ở chân trời, gà gáy dồn dập, mẹ và bà trở dậy nhóm lửa nấu nước, chuẩn bị quang gánh.',
    hour: 4,
    minute: 0
  },
  {
    id: 'mao_sunrise',
    branch: 'Mao' as EarthlyBranch,
    titleVi: 'Mặt trời nhô ngọn tre (Giờ Mão)',
    timeRange: '05:00 - 06:59',
    folkMemory: 'Mặt trời vừa ló rạng khỏi ngọn tre làng, sương mai tan dần, chim hót ríu rít, không khí trong lành.',
    hour: 6,
    minute: 0
  },
  {
    id: 'chen_breakfast',
    branch: 'Chen' as EarthlyBranch,
    titleVi: 'Ăn bữa điểm tâm sáng (Giờ Thìn)',
    timeRange: '07:00 - 08:59',
    folkMemory: 'Cả nhà ăn cữ cơm sáng, dắt trâu bò ra đồng làm việc, trẻ con cắp sách tới trường làng.',
    hour: 8,
    minute: 0
  },
  {
    id: 'si_market',
    branch: 'Si' as EarthlyBranch,
    titleVi: 'Nắng lên cao, tan chợ (Giờ Tỵ)',
    timeRange: '09:00 - 10:59',
    folkMemory: 'Nắng đã rọi ấm khắp sân, người làng đi chợ phiên về, bắt đầu rửa rau thổi cơm trưa.',
    hour: 10,
    minute: 0
  },
  {
    id: 'wu_noon',
    branch: 'Wu_B' as EarthlyBranch,
    titleVi: 'Chính trưa đứng bóng (Giờ Ngọ)',
    timeRange: '11:00 - 12:59',
    folkMemory: 'Mặt trời đứng bóng ngay đỉnh đầu, bóng người tròn xoe dưới chân, cả nhà ngồi quây quần ăn bữa cơm trưa.',
    hour: 12,
    minute: 0
  },
  {
    id: 'wei_after_noon',
    branch: 'Wei' as EarthlyBranch,
    titleVi: 'Đầu giờ chiều (Giờ Mùi)',
    timeRange: '13:00 - 14:59',
    folkMemory: 'Vừa chợp mắt nghỉ trưa dậy, uống bát nước chè tươi rồi chuẩn bị tiếp tục công việc buổi chiều.',
    hour: 14,
    minute: 0
  },
  {
    id: 'shen_slant_sun',
    branch: 'Shen' as EarthlyBranch,
    titleVi: 'Xế chiều nghiêng bóng (Giờ Thân)',
    timeRange: '15:00 - 16:59',
    folkMemory: 'Nắng chiều đã bớt gay gắt, bóng cây ngả dài về hướng đông, tiếng trẻ con nô đùa đầu làng.',
    hour: 16,
    minute: 0
  },
  {
    id: 'you_sunset',
    branch: 'You' as EarthlyBranch,
    titleVi: 'Chập tối, gà lên chuồng (Giờ Dậu)',
    timeRange: '17:00 - 18:59',
    folkMemory: 'Mặt trời lặn sau rặng tre, lùa trâu về chuồng, gà nhảy lên chuồng, khói bếp rơm bay nghi ngút.',
    hour: 18,
    minute: 0
  },
  {
    id: 'xu_dinner',
    branch: 'Xu' as EarthlyBranch,
    titleVi: 'Ăn cơm tối, lên đèn dầu (Giờ Tuất)',
    timeRange: '19:00 - 20:59',
    folkMemory: 'Trời tối hẳn, thắp ngọn đèn dầu ăn bữa cơm tối quây quần, các cụ ngồi nhai trầu uống nước trà đàm đạo.',
    hour: 20,
    minute: 0
  },
  {
    id: 'hai_night',
    branch: 'Hai' as EarthlyBranch,
    titleVi: 'Đêm khuya thanh vắng (Giờ Hợi)',
    timeRange: '21:00 - 22:59',
    folkMemory: 'Cả xóm làng đã tắt đèn đi ngủ, không gian tĩnh mịch, chỉ còn tiếng côn trùng rỉ rả đêm sâu.',
    hour: 22,
    minute: 0
  }
];

// Danh sách các Tỉnh/Thành phổ biến xưa và nay
const POPULAR_VIETNAM_PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh (Sài Gòn)', 'Nam Định', 'Thái Bình', 'Hải Phòng',
  'Huế (Thừa Thiên)', 'Đà Nẵng', 'Nghệ An', 'Thanh Hóa', 'Quảng Ninh',
  'Hà Nam', 'Bắc Ninh', 'Bắc Giang', 'Phú Thọ', 'Vĩnh Phúc', 'Hưng Yên',
  'Hải Dương', 'Ninh Bình', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định',
  'Khánh Hòa (Nha Trang)', 'Cần Thơ', 'An Giang', 'Tiền Giang', 'Bến Tre',
  'Đồng Nai', 'Bình Dương', 'Lâm Đồng (Đà Lạt)', 'Đắk Lắk'
];

export const SeniorDestinyGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // Current Step: 0: Giới Thiệu, 1: Họ Tên, 2: Giới Tính, 3: Năm Sinh & Con Giáp, 4: Ngày & Tháng, 5: Giờ Sinh Dân Gian, 6: Nơi Sinh & Nguyện Ước, 7: Hoàn Tất Xem Trước
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Element Refs for Intelligent Cursor Navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Senior Accessibility Settings
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);

  // Form States
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<Gender>('Male');

  // Year Selection Mode
  const [selectedZodiacIndex, setSelectedZodiacIndex] = useState<number>(4); // Default Thìn (Rồng)
  const [solarYear, setSolarYear] = useState<number>(1964); // Giáp Thìn

  // Calendar Type
  const [calendarType, setCalendarType] = useState<'lunar' | 'solar'>('lunar');
  const [selectedDay, setSelectedDay] = useState<number>(15); // Rằm
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // Giêng
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);

  // Birth Hour Mode
  const [hourMode, setHourMode] = useState<'folk' | 'exact' | 'unknown'>('folk');
  const [selectedFolkHourId, setSelectedFolkHourId] = useState<string>('wu_noon');
  const [exactHour, setExactHour] = useState<number>(12);
  const [exactMinute, setExactMinute] = useState<number>(0);

  // Location & Aspirations
  const [birthCity, setBirthCity] = useState<string>('Hà Nội');
  const [topPriority, setTopPriority] = useState<string>('Sức Khỏe, Trường Thọ & Bình An');

  // Text-to-Speech Voice Assistant with Sacred Chime
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      // Chime prelude for sacred peaceful resonance
      sacredSound.playTibetanBowl(432);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.90; // Tốc độ chuẩn mực, thư thái cho người lớn tuổi
      utterance.pitch = 0.96; // Giọng trầm ấm, từ bi, trang trọng
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => (v.lang === 'vi-VN' || v.lang.startsWith('vi')) && (v.name.includes('Natural') || v.name.includes('Google')))
        || voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback silent
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Convert Date and Pre-compute BaZi Pillars
  const calculatedData = useMemo(() => {
    try {
      let finalSolarYear = solarYear;
      let finalSolarMonth = selectedMonth;
      let finalSolarDay = selectedDay;

      // Nếu người dùng nhập ngày Âm Lịch, chuyển đổi chuẩn xác sang Dương Lịch
      if (calendarType === 'lunar') {
        const converted = convertLunarToSolar(solarYear, selectedMonth, selectedDay, isLeapMonth, 7);
        if (converted) {
          finalSolarYear = converted.solarYear;
          finalSolarMonth = converted.solarMonth;
          finalSolarDay = converted.solarDay;
        }
      }

      // Giờ sinh
      let finalHour = 12;
      let finalMinute = 0;
      let hasExactHour = true;

      if (hourMode === 'folk') {
        const folk = FOLK_BIRTH_HOURS.find(f => f.id === selectedFolkHourId) || FOLK_BIRTH_HOURS[6];
        finalHour = folk.hour;
        finalMinute = folk.minute;
      } else if (hourMode === 'exact') {
        finalHour = exactHour;
        finalMinute = exactMinute;
      } else {
        finalHour = 12;
        finalMinute = 0;
        hasExactHour = false;
      }

      const yearP = calculateYearPillar(finalSolarYear, finalSolarMonth, finalSolarDay, 7, finalHour, finalMinute);
      const monthP = calculateMonthPillar(yearP.stem, finalSolarYear, finalSolarMonth, finalSolarDay, 7, finalHour, finalMinute);
      const dayP = calculateDayPillar(finalSolarYear, finalSolarMonth, finalSolarDay, 7, false, finalHour);
      const hourP = calculateHourPillar(dayP.stem, finalHour, finalMinute, false);
      const naYin = getNaYin(yearP.stem, yearP.branch);
      const lunar = convertSolarToLunar(finalSolarYear, finalSolarMonth, finalSolarDay, 7, false, finalHour);

      const currentYear = new Date().getFullYear();
      const ageMu = currentYear - solarYear + 1;

      return {
        solarYear: finalSolarYear,
        solarMonth: finalSolarMonth,
        solarDay: finalSolarDay,
        finalHour,
        finalMinute,
        hasExactHour,
        lunarYear: lunar.lunarYear,
        lunarMonth: lunar.lunarMonth,
        lunarDay: lunar.lunarDay,
        isLeapMonth: lunar.isLeapMonth,
        solarTerm: lunar.solarTerm,
        yearPillarStr: `${STEMS[yearP.stem].nameVi} ${BRANCHES[yearP.branch].nameVi}`,
        monthPillarStr: `${STEMS[monthP.stem].nameVi} ${BRANCHES[monthP.branch].nameVi}`,
        dayPillarStr: `${STEMS[dayP.stem].nameVi} ${BRANCHES[dayP.branch].nameVi}`,
        hourPillarStr: hasExactHour ? `${STEMS[hourP.stem].nameVi} ${BRANCHES[hourP.branch].nameVi}` : 'Giờ Ngọ (Định Thiên Văn)',
        naYin,
        ageMu
      };
    } catch {
      return {
        solarYear: 1964,
        solarMonth: 2,
        solarDay: 10,
        finalHour: 12,
        finalMinute: 0,
        hasExactHour: true,
        lunarYear: 1964,
        lunarMonth: 1,
        lunarDay: 1,
        isLeapMonth: false,
        solarTerm: 'Lập Xuân',
        yearPillarStr: 'Giáp Thìn',
        monthPillarStr: 'Bính Dần',
        dayPillarStr: 'Ất Tỵ',
        hourPillarStr: 'Nhâm Ngọ',
        naYin: 'Phúc Đăng Hỏa (Lửa đèn dầu)',
        ageMu: 61
      };
    }
  }, [solarYear, selectedMonth, selectedDay, isLeapMonth, calendarType, hourMode, selectedFolkHourId, exactHour, exactMinute]);

  // Voice speech triggers on step changes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      return;
    }

    const stepAudios: Record<number, string> = {
      0: 'Kính chào Quý Bác, Quý Cô Chú! Cháu là Trợ lý AI của Huyền Phong Phật Đạo. Cháu xin phép hướng dẫn Quý Vị từng bước để lập lá số Tử Vi chuẩn xác nhất.',
      1: 'Bước một: Kính mời Quý Bác nhập đầy đủ Họ và Tên để hệ thống khắc ghi vào bản đồ vận mệnh.',
      2: 'Bước hai: Kính mời Quý Bác chọn Giới tính Nam hoặc Nữ. Điều này rất quan trọng để an sao Tử Vi và tính vòng Đại Vận mười năm.',
      3: 'Bước ba: Kính mời Quý Bác chọn Năm sinh hoặc Tuổi con giáp của mình. Hệ thống đã chuẩn bị sẵn tuổi mụ và can chi tương ứng.',
      4: 'Bước bốn: Kính mời Quý Bác chọn Ngày và Tháng sinh. Nếu nhớ ngày Âm lịch, xin hãy chọn tab Lịch Ta, hệ thống sẽ tự động tính toán thiên văn.',
      5: 'Bước năm: Đây là phần quan trọng nhất. Nếu Quý Bác không nhớ chính xác giờ phút, xin hãy chọn theo ký ức dân gian xưa như lúc gà gáy, lúc rạng đông hay lúc chính trưa.',
      6: 'Bước sáu: Kính mời Quý Bác chọn Tỉnh thành nơi mình sinh ra và Mối quan tâm lớn nhất như Sức Khỏe, Gia Đạo hay Phúc Đức.',
      7: 'Bước cuối cùng: Bản mệnh của Quý Bác đã sẵn sàng. Kính mời Quý Bác kiểm tra lại một lần nữa rồi bấm nút Khai Mở Lá Số.'
    };

    if (voiceEnabled && stepAudios[currentStep]) {
      speakText(stepAudios[currentStep]);
    }
  }, [currentStep, isOpen, voiceEnabled]);

  // Font size classes generator
  const getScaleClasses = () => {
    switch (fontSizeScale) {
      case 'xlarge':
        return {
          base: 'text-base sm:text-lg',
          title: 'text-xl sm:text-2xl',
          sub: 'text-sm sm:text-base',
          label: 'text-base font-bold'
        };
      case 'large':
        return {
          base: 'text-sm sm:text-base',
          title: 'text-lg sm:text-xl',
          sub: 'text-xs sm:text-sm',
          label: 'text-sm font-semibold'
        };
      default:
        return {
          base: 'text-xs sm:text-sm',
          title: 'text-base sm:text-lg',
          sub: 'text-xs',
          label: 'text-xs font-semibold'
        };
    }
  };

  const scale = getScaleClasses();

  // Final Action: Complete and Open Destiny
  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Kính mong Quý Bác nhập Họ và Tên trước khi hoàn tất.');
      setCurrentStep(1);
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
      return;
    }

    if (!birthCity.trim()) {
      setErrorMessage('Kính mong Quý Bác nhập hoặc chọn Nơi Sinh trước khi hoàn tất.');
      setCurrentStep(6);
      setTimeout(() => {
        cityInputRef.current?.focus();
        cityInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    stopSpeaking();

    try {
      const birthData: BirthData = {
        solarYear: calculatedData.solarYear,
        solarMonth: calculatedData.solarMonth,
        solarDay: calculatedData.solarDay,
        solarHour: calculatedData.finalHour,
        solarMinute: calculatedData.finalMinute,
        hasExactHour: calculatedData.hasExactHour,
        birthCity,
        birthCountry: 'Việt Nam',
        timezoneOffset: 7,
        timezoneName: 'Asia/Ho_Chi_Minh',
        gender,
        calendarSystem: calendarType,
        isLateRat: false,
        timeConvention: 'civil',
        ziweiYearConvention: 'solarLapXuan',
        ziweiLeapMonthConvention: 'midMonthSplit',
        longitude: locationProvider.resolveLocation(birthCity, 'Việt Nam')?.longitude ?? 105.85,
        latitude: locationProvider.resolveLocation(birthCity, 'Việt Nam')?.latitude ?? 21.02
      };

      const behavioral: BehavioralContext = {
        careerField: 'Đời Sống, Sức Khỏe & Gia Đạo',
        employmentStatus: 'Nghỉ Hưu / Tự Do / An Dưỡng',
        financialGoal: 'Bình An, Giữ Gìn Di Sản & Phúc Đức Cho Hậu Thế',
        relationshipStatus: 'Hòa Hợp Gia Đình, Con Cháu Đầy Đủ',
        topPriority,
        personalNotes: 'Lập qua Trợ lý thông minh hướng dẫn dành cho Người Lớn Tuổi.'
      };

      await onComplete(name.trim(), birthData, behavioral);
      onClose();
    } catch {
      setErrorMessage('Có lỗi xảy ra trong quá trình thiết lập. Kính mong Quý Bác thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-3xl bg-[#0e0f18] border-2 border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-slate-100 flex flex-col overflow-hidden relative"
      >
        {/* SACRED PARTICLES & MANDALA AURA */}
        <SacredParticles density="subtle" className="opacity-30" />
        <SacredMandalaAura size={400} className="-top-12 -right-16" opacity={0.14} />

        {/* Top Gold Horizon Accent */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90 blur-xs pointer-events-none" />

        {/* ================= KHỐI 1: HEADER CỐ ĐỊNH (SHRINK-0) ================= */}
        <header className="shrink-0 p-4 sm:p-5 border-b border-white/10 bg-[#0e0f18]/95 space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title & Icon */}
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md shrink-0 mt-0.5 sm:mt-0">
                <Compass className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel break-words leading-snug tracking-wide">
                    Trợ Lý Hướng Dẫn Từng Bước A - Z
                  </h2>
                  <SacredSealBadge text="THIÊN CƠ" subtext="KHAI QUANG" size="sm" className="hidden sm:inline-flex" />
                </div>
                <p className="text-xs text-slate-300 break-words leading-normal mt-0.5">
                  Dành riêng cho Quý Bác, Quý Cô Chú • Huyền Phong Phật Đạo
                </p>
              </div>
            </div>

            {/* Accessibility Controls: Font Size, Voice, Close */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
              {/* Voice toggle */}
              <button
                type="button"
                onClick={() => {
                  if (voiceEnabled) {
                    stopSpeaking();
                    setVoiceEnabled(false);
                  } else {
                    setVoiceEnabled(true);
                  }
                }}
                className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  voiceEnabled
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
                }`}
                title={voiceEnabled ? 'Tắt giọng đọc' : 'Bật giọng đọc tiếng Việt'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-amber-300 animate-pulse shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
                <span className="hidden sm:inline">{voiceEnabled ? 'Đang Bật' : 'Giọng Đọc'}</span>
              </button>

              {/* Font Size Adjuster */}
              <div className="flex items-center rounded-xl bg-black/60 p-0.5 border border-white/15 text-xs">
                <button
                  type="button"
                  onClick={() => setFontSizeScale('normal')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fontSizeScale === 'normal' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cỡ chữ vừa"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeScale('large')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fontSizeScale === 'large' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cỡ chữ lớn"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeScale('xlarge')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    fontSizeScale === 'xlarge' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cỡ chữ rất lớn"
                >
                  A++
                </button>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Đóng trợ lý"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP PROGRESS BAR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-amber-300/90 font-medium gap-2">
              <span className="min-w-0 break-words leading-tight">
                {currentStep === 0 && 'Lời Chào Khởi Đầu'}
                {currentStep === 1 && 'Bước 1: Họ và Tên'}
                {currentStep === 2 && 'Bước 2: Giới Tính Sinh Học'}
                {currentStep === 3 && 'Bước 3: Năm Sinh & Con Giáp'}
                {currentStep === 4 && 'Bước 4: Ngày & Tháng Sinh'}
                {currentStep === 5 && 'Bước 5: Giờ Sinh Dân Gian'}
                {currentStep === 6 && 'Bước 6: Nơi Sinh & Nguyện Ước'}
                {currentStep === 7 && 'Bước 7: Khai Mở Bản Mệnh'}
              </span>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                {Math.round((currentStep / 7) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 7) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </div>
        </header>

        {/* ERROR NOTIFICATION BANNER */}
        {errorMessage && (
          <div className="shrink-0 mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center gap-2.5 text-rose-200 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= KHỐI 2: CONTENT BODY (FLEX-1, OVERFLOW-Y-AUTO) ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0">
          <AnimatePresence mode="wait">
            {/* ================= STEP 0: LỜI CHÀO & TỔNG QUAN ================= */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-xl mx-auto text-center py-2"
              >
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-yellow-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md">
                  <Sparkles className="w-8 h-8 text-amber-300" />
                </div>

                <div className="space-y-2">
                  <h3 className={`${scale.title} font-bold text-amber-200 font-cinzel`}>
                    Kính Chào Quý Bác, Quý Cô Chú!
                  </h3>
                  <p className={`${scale.base} text-slate-200 leading-relaxed text-left sm:text-center`}>
                    Cháu xin phép được đồng hành cùng Quý Vị từng bước để lập lá số Tử Vi chuẩn xác nhất. 
                    Quý Vị không cần phải thao tác phức tạp, chỉ cần làm theo từng câu hỏi đơn giản, 
                    hệ thống AI sẽ tự động quy đổi Âm - Dương lịch và lập bản đồ vận mệnh.
                  </p>
                </div>

                {/* 3 Cam kết trang trọng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-2">
                  <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cực Kỳ Dễ Hiểu</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">Chữ lớn, biểu tượng rõ ràng, có sẵn gợi ý tuổi con giáp và giờ sinh.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs sm:text-sm">
                      <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Bảo Mật Tuyệt Đối</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">Thông tin ngày sinh được mã hóa bảo mật, an toàn 100%.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs sm:text-sm">
                      <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Chuẩn Xác Thiên Văn</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">Quy đổi Lịch Vạn Niên 100 năm chuẩn theo thuật toán cổ bản.</p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto mx-auto min-h-[50px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-black font-bold text-sm sm:text-base shadow-lg hover:shadow-xl cursor-pointer transition-all"
                  >
                    <span>Bắt Đầu Từng Bước (A - Z)</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 1: HỌ VÀ TÊN ================= */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 1 / 6 • Thông Tin Cá Nhân
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Kính Mời Quý Bác Nhập Họ Và Tên
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Họ và tên mang ý nghĩa phúc đức dòng tộc và trường năng lượng âm thanh gắn liền suốt cuộc đời.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <label className={`${scale.label} text-slate-200 block`}>
                    Họ và Tên Của Quý Bác <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      autoFocus
                      required
                      placeholder="Ví dụ: Nguyễn Văn Phúc..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/80 border-2 border-white/20 text-white ${scale.base} font-medium focus:border-amber-400 focus:outline-none transition-all placeholder:text-slate-500`}
                    />
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    Gợi ý: Quý Bác có thể nhập chữ có dấu hoặc không dấu, hệ thống đều nhận diện chính xác.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-snug">
                    Nếu Quý Bác đang xem giúp cho con cái hoặc người thân trong gia đình, hãy nhập Họ và Tên của chính người đó nhé.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: GIỚI TÍNH SINH HỌC ================= */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 2 / 6 • Giới Tính Bản Mệnh
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Kính Mời Quý Bác Chọn Giới Tính
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Trong Tử Vi Đẩu Số, giới tính Nam (Dương Nam / Âm Nam) hay Nữ (Dương Nữ / Âm Nữ) 
                    sẽ quyết định chiều an sao Vận Hạn đi theo chiều kim đồng hồ hay ngược lại.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* NAM */}
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] ${
                      gender === 'Male'
                        ? 'bg-gradient-to-b from-cyan-950 to-blue-950 border-cyan-400 text-white shadow-lg ring-2 ring-cyan-500/50'
                        : 'bg-black/60 border-white/15 text-slate-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span className="text-3xl">👨</span>
                    <div className="space-y-0.5">
                      <div className="text-lg font-bold text-cyan-300">NAM MẠNG</div>
                      <div className="text-xs text-slate-300">Dương Nam / Âm Nam</div>
                    </div>
                    {gender === 'Male' && (
                      <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Đã Chọn
                      </span>
                    )}
                  </button>

                  {/* NỮ */}
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] ${
                      gender === 'Female'
                        ? 'bg-gradient-to-b from-rose-950 to-pink-950 border-rose-400 text-white shadow-lg ring-2 ring-rose-500/50'
                        : 'bg-black/60 border-white/15 text-slate-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span className="text-3xl">👩</span>
                    <div className="space-y-0.5">
                      <div className="text-lg font-bold text-rose-300">NỮ MẠNG</div>
                      <div className="text-xs text-slate-300">Dương Nữ / Âm Nữ</div>
                    </div>
                    {gender === 'Female' && (
                      <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-rose-400" /> Đã Chọn
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: NĂM SINH & CON GIÁP CỔ TRUYỀN ================= */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-2xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 3 / 6 • Tuổi Con Giáp & Năm Sinh
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Quý Bác Thuộc Tuổi Con Giáp Nào?
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Người lớn tuổi thường quen nhớ năm sinh theo 12 con giáp. Xin hãy bấm vào con giáp của Quý Bác dưới đây:
                  </p>
                </div>

                {/* 12 CON GIÁP LƯỚI TO BẢN */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {ZODIAC_ANIMALS.map((za, idx) => {
                    const isSelected = selectedZodiacIndex === idx;
                    return (
                      <button
                        key={za.branch}
                        type="button"
                        onClick={() => {
                          setSelectedZodiacIndex(idx);
                          if (!za.baseYears.includes(solarYear)) {
                            setSolarYear(za.baseYears[2] || za.baseYears[0]);
                          }
                        }}
                        className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center min-h-[72px] ${
                          isSelected
                            ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 shadow-md'
                            : 'bg-black/50 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">{za.icon}</span>
                        <span className="text-xs font-bold break-words text-center leading-tight">{za.animalVi}</span>
                      </button>
                    );
                  })}
                </div>

                {/* CÁC NĂM CỤ THỂ THUỘC CON GIÁP ĐÃ CHỌN */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold text-amber-300">
                    <span className="break-words">Năm Sinh Tuổi {ZODIAC_ANIMALS[selectedZodiacIndex].animalVi}:</span>
                    <span className="text-slate-200 break-words">Đang chọn: <strong className="text-amber-300">Năm {solarYear} ({calculatedData.yearPillarStr} - {calculatedData.ageMu} tuổi mụ)</strong></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ZODIAC_ANIMALS[selectedZodiacIndex].baseYears.map((yr) => {
                      const currentYear = new Date().getFullYear();
                      const age = currentYear - yr + 1;
                      const isCurrentYear = solarYear === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setSolarYear(yr)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-[52px] ${
                            isCurrentYear
                              ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md'
                              : 'bg-black/60 border-white/15 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-left min-w-0">
                            <div className="text-sm font-bold font-mono">Năm {yr}</div>
                            <div className="text-xs opacity-80">{age} tuổi mụ</div>
                          </div>
                          {isCurrentYear && <CheckCircle2 className="w-4 h-4 text-black shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hoặc tự chọn năm khác nếu muốn */}
                  <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">Hoặc chọn năm sinh chính xác:</span>
                    <select
                      value={solarYear}
                      onChange={(e) => {
                        const yr = Number(e.target.value);
                        setSolarYear(yr);
                        // Cập nhật con giáp tương ứng (1924 = Tý)
                        const branchIdx = (yr - 4) % 12;
                        const matchZodiac = ZODIAC_ANIMALS.findIndex((_, i) => i === (branchIdx >= 0 ? branchIdx : branchIdx + 12));
                        if (matchZodiac !== -1) setSelectedZodiacIndex(matchZodiac);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {Array.from({ length: 90 }, (_, i) => 2024 - i).map((y) => (
                        <option key={y} value={y}>
                          Năm {y} ({new Date().getFullYear() - y + 1} tuổi mụ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nạp Âm Ngũ Hành Preview */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-amber-200/90 pt-2 border-t border-amber-500/20">
                    <div className="break-words">Bản Mệnh Nạp Âm: <strong className="text-amber-300 font-bold">{calculatedData.naYin}</strong></div>
                    <div className="break-words">Trụ Năm: <strong className="text-amber-300 font-mono">{calculatedData.yearPillarStr}</strong></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 4: NGÀY & THÁNG SINH ================= */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-2xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 4 / 6 • Ngày & Tháng Sinh
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Quý Bác Nhớ Ngày Sinh Âm Lịch Hay Dương Lịch?
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Các cụ ngày xưa thường nhớ ngày Âm lịch (ngày giỗ, ngày rằm). Hệ thống AI sẽ tự động quy đổi thiên văn chuẩn 100%.
                  </p>
                </div>

                {/* Chọn Lịch Ta (Âm) / Lịch Tây (Dương) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCalendarType('lunar')}
                    className={`py-3 px-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 text-center min-h-[48px] ${
                      calendarType === 'lunar'
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 shadow-md'
                        : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="break-words">Lịch Ta (Âm Lịch) - Khuyên Dùng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalendarType('solar')}
                    className={`py-3 px-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 text-center min-h-[48px] ${
                      calendarType === 'solar'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 shadow-md'
                        : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="break-words">Lịch Tây (Dương Lịch - Trên CCCD)</span>
                  </button>
                </div>

                {/* THÁNG SINH LƯỚI TO */}
                <div className="space-y-1.5">
                  <label className={`${scale.label} text-slate-200 block`}>
                    1. Chọn Tháng Sinh ({calendarType === 'lunar' ? 'Tháng Âm Lịch' : 'Tháng Dương Lịch'}):
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                      const isSelected = selectedMonth === m;
                      const monthNameVi = m === 1 ? 'Giêng' : (m === 12 ? 'Chạp' : `${m}`);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMonth(m)}
                          className={`py-2 px-1 rounded-xl text-center border font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] flex items-center justify-center leading-tight break-words ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md font-extrabold'
                              : 'bg-black/50 border-white/15 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          Tháng {monthNameVi}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* NGÀY SINH LƯỚI TO (31 ngày chuẩn) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`${scale.label} text-slate-200 block`}>
                      2. Bấm Vào Ngày Sinh ({selectedDay}):
                    </label>
                    {calendarType === 'lunar' && (
                      <span className="text-xs text-purple-300 font-medium">
                        (Mùng 1: Đầu tháng • Ngày 15: Ngày Rằm)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-2 bg-black/40 rounded-2xl border border-white/10">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const isSelected = selectedDay === d;
                      const isSpecial = d === 1 || d === 15;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          className={`py-2 rounded-xl text-center border font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md font-extrabold'
                              : isSpecial
                                ? 'bg-purple-950/50 border-purple-500/40 text-purple-200 hover:bg-purple-900/50'
                                : 'bg-black/60 border-white/10 text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          {d < 10 ? `0${d}` : d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ĐỐI CHIẾU SONG SONG ÂM - DƯƠNG */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2.5">
                  <div className="flex items-center gap-2 text-slate-300 min-w-0">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="break-words">Lịch Dương: <strong className="text-white font-mono">{calculatedData.solarDay}/{calculatedData.solarMonth}/{calculatedData.solarYear}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 min-w-0">
                    <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="break-words">Lịch Âm: <strong className="text-purple-300 font-mono">Ngày {calculatedData.lunarDay} Tháng {calculatedData.lunarMonth} Năm {calculatedData.yearPillarStr}</strong></span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 5: GIỜ SINH DÂN GIAN ================= */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-2xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 5 / 6 • Giờ Sinh Dân Gian Xưa
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Giải Mã Ký Ức Giờ Sinh Cổ Truyền
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Nếu Quý Bác không nhớ đồng hồ, chỉ nhớ cha mẹ dặn lúc sinh ra (gà gáy, rạng đông, chính trưa, lên đèn ăn cơm...), hãy chọn mục tương ứng bên dưới:
                  </p>
                </div>

                {/* 3 Tab chế độ chọn giờ (Lưới đều, chống chồng lấn text 100%) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 rounded-2xl bg-black/60 p-1.5 border border-white/15 text-xs">
                  <button
                    type="button"
                    onClick={() => setHourMode('folk')}
                    className={`py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer min-h-[46px] flex items-center justify-center text-center leading-tight break-words ${
                      hourMode === 'folk'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Theo Ký Ức Dân Gian (Khuyên Dùng)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHourMode('exact')}
                    className={`py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer min-h-[46px] flex items-center justify-center text-center leading-tight break-words ${
                      hourMode === 'exact'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2. Nhớ Giờ & Phút Cụ Thể
                  </button>
                  <button
                    type="button"
                    onClick={() => setHourMode('unknown')}
                    className={`py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer min-h-[46px] flex items-center justify-center text-center leading-tight break-words ${
                      hourMode === 'unknown'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3. Hoàn Toàn Không Nhớ
                  </button>
                </div>

                {/* CHẾ ĐỘ 1: KÝ ỨC DÂN GIAN XƯA */}
                {hourMode === 'folk' && (
                  <div className="space-y-2.5">
                    {FOLK_BIRTH_HOURS.map((fh) => {
                      const isSelected = selectedFolkHourId === fh.id;
                      return (
                        <button
                          key={fh.id}
                          type="button"
                          onClick={() => setSelectedFolkHourId(fh.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-950 to-orange-950 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 shadow-lg'
                              : 'bg-black/50 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm sm:text-base text-white break-words">{fh.titleVi}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-amber-300 shrink-0">
                                {fh.timeRange}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic break-words">
                              "{fh.folkMemory}"
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* CHẾ ĐỘ 2: GIỜ & PHÚT CỤ THỂ */}
                {hourMode === 'exact' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-black/60 border border-white/15">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-200">Giờ (0 - 23 Giờ)</label>
                      <select
                        value={exactHour}
                        onChange={(e) => setExactHour(Number(e.target.value))}
                        className="w-full px-3.5 py-3 rounded-xl bg-black border border-white/20 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option key={h} value={h}>
                            {h < 10 ? `0${h}` : h} Giờ {h >= 12 ? '(Chiều/Tối)' : '(Sáng/Đêm)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-200">Phút (0 - 55 Phút)</label>
                      <select
                        value={exactMinute}
                        onChange={(e) => setExactMinute(Number(e.target.value))}
                        className="w-full px-3.5 py-3 rounded-xl bg-black border border-white/20 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
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

                {/* CHẾ ĐỘ 3: HOÀN TOÀN KHÔNG NHỚ */}
                {hourMode === 'unknown' && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>Phương Pháp An Giờ Chính Ngọ (12:00)</span>
                    </div>
                    <p className="break-words">
                      Kính thưa Quý Bác, nếu hoàn toàn không có ai nhớ giờ sinh, thuật số Tử Vi cổ truyền cho phép lấy <strong>Giờ Chính Ngọ (12:00 trưa)</strong> làm tâm định thiên văn.
                    </p>
                    <p className="text-xs text-slate-300 break-words">
                      Phương pháp này đảm bảo toàn vẹn: Trụ Năm, Trụ Tháng, Trụ Ngày, Bản Mệnh Nạp Âm và các chu kỳ Vận Hạn 10 năm của Quý Bác vẫn được tính toán chuẩn xác mà không bị sai lệch.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= STEP 6: NƠI SINH & NGUYỆN ƯỚC ================= */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-xl mx-auto w-full"
              >
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Bước 6 / 6 • Nơi Sinh & Nguyện Ước
                  </span>
                  <h3 className={`${scale.title} font-bold text-white`}>
                    Nơi Sinh & Điều Quý Bác Quan Tâm Nhất
                  </h3>
                  <p className={`${scale.sub} text-slate-300 leading-relaxed`}>
                    Kinh độ nơi sinh giúp AI điều chỉnh Giờ Mặt Trời Chân Thực. Nguyện ước sẽ giúp bài luận giải tập trung sâu đúng tâm nguyện của Quý Bác.
                  </p>
                </div>

                {/* Nơi Sinh */}
                <div className="space-y-2">
                  <label className={`${scale.label} text-slate-200 block flex items-center gap-1.5`}>
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tỉnh / Thành Phố Nơi Sinh Ra:</span>
                  </label>
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    placeholder="Nhập tỉnh thành nơi sinh (VD: Hà Nội, Nam Định...)"
                    className="w-full px-4 py-3 rounded-2xl bg-black/80 border border-white/20 text-white font-medium focus:border-amber-400 focus:outline-none"
                  />
                  {/* Quick Cities chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_VIETNAM_PROVINCES.slice(0, 10).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setBirthCity(city)}
                        className={`px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer min-h-[32px] break-words ${
                          birthCity === city
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nguyện Ước Trọng Tâm */}
                <div className="space-y-2 pt-1">
                  <label className={`${scale.label} text-slate-200 block flex items-center gap-1.5`}>
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Mối Bận Tâm Lớn Nhất Của Quý Bác:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { title: 'Sức Khỏe, Trường Thọ & Bình An', icon: '🌿' },
                      { title: 'Gia Đạo, Phúc Đức Cho Con Cháu', icon: '🏡' },
                      { title: 'Tài Sản & Di Sản Để Lại', icon: '🪙' },
                      { title: 'Tu Tâm Dưỡng Tính, An Yên Tuổi Già', icon: '🪷' }
                    ].map((item) => {
                      const isSelected = topPriority === item.title;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => setTopPriority(item.title)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 min-h-[58px] ${
                            isSelected
                              ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold shadow-md'
                              : 'bg-black/50 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-xl shrink-0">{item.icon}</span>
                          <span className="text-xs sm:text-sm min-w-0 flex-1 break-words leading-snug">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 7: HOÀN TẤT & XEM TRƯỚC ================= */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-xl mx-auto w-full"
              >
                <div className="text-center space-y-1">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Hoàn Tất Thiết Lập • Sẵn Sàng Khai Mở
                  </span>
                  <h3 className={`${scale.title} font-bold text-amber-200 font-cinzel`}>
                    Bản Mệnh Tử Vi & Tứ Trụ Của Quý Bác
                  </h3>
                  <p className={`${scale.sub} text-slate-300`}>
                    Kính mời Quý Bác rà soát lại thông tin trước khi AI bắt đầu phân tích chi tiết:
                  </p>
                </div>

                {/* THẺ TỔNG HỢP TRANG TRỌNG */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-black/80 to-purple-950/40 border-2 border-amber-500/50 shadow-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-400">Họ và Tên</div>
                      <div className="text-lg sm:text-xl font-bold text-white font-cinzel break-words mt-0.5 leading-snug">
                        {name || 'Chưa nhập họ tên'}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-xs text-slate-400">Giới Tính & Tuổi Mụ</div>
                      <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5 break-words">
                        {gender === 'Male' ? 'Nam Mạng' : 'Nữ Mạng'} • {calculatedData.ageMu} Tuổi
                      </div>
                    </div>
                  </div>

                  {/* 4 Trụ Can Chi (Chống tràn chữ, hỗ trợ xuống dòng chuẩn) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-center min-h-[64px]">
                      <div className="text-[11px] text-slate-400">Trụ Năm</div>
                      <div className="text-xs sm:text-sm font-bold text-amber-300 font-mono mt-0.5 break-words leading-tight">{calculatedData.yearPillarStr}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-center min-h-[64px]">
                      <div className="text-[11px] text-slate-400">Trụ Tháng</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono mt-0.5 break-words leading-tight">{calculatedData.monthPillarStr}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-center min-h-[64px]">
                      <div className="text-[11px] text-slate-400">Trụ Ngày (Mệnh)</div>
                      <div className="text-xs sm:text-sm font-bold text-cyan-300 font-mono mt-0.5 break-words leading-tight">{calculatedData.dayPillarStr}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-center min-h-[64px]">
                      <div className="text-[11px] text-slate-400">Trụ Giờ</div>
                      <div className="text-xs sm:text-sm font-bold text-purple-300 font-mono mt-0.5 break-words leading-tight">{calculatedData.hourPillarStr}</div>
                    </div>
                  </div>

                  {/* Chi tiết bản mệnh (Định dạng hàng ngang/dọc linh hoạt, không bao giờ chồng lấn text) */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5">
                      <span className="text-slate-400 shrink-0">Bản Mệnh Nạp Âm:</span>
                      <strong className="text-amber-300 font-bold text-left sm:text-right break-words">{calculatedData.naYin}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5">
                      <span className="text-slate-400 shrink-0">Ngày Dương Lịch:</span>
                      <strong className="text-white font-mono text-left sm:text-right break-words">{calculatedData.solarDay}/{calculatedData.solarMonth}/{calculatedData.solarYear} ({calculatedData.solarTerm})</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5">
                      <span className="text-slate-400 shrink-0">Ngày Âm Lịch:</span>
                      <strong className="text-purple-300 font-mono text-left sm:text-right break-words">Ngày {calculatedData.lunarDay} Tháng {calculatedData.lunarMonth} Năm {calculatedData.yearPillarStr}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5">
                      <span className="text-slate-400 shrink-0">Nơi Sinh:</span>
                      <strong className="text-teal-300 text-left sm:text-right break-words">{birthCity}</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                      <span className="text-slate-400 shrink-0">Mối Bận Tâm Lớn Nhất:</span>
                      <strong className="text-rose-300 text-left sm:text-right break-words">{topPriority}</strong>
                    </div>
                  </div>
                </div>

                {/* NÚT LẬP LÁ SỐ */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="w-full min-h-[56px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-black text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer leading-normal break-words"
                  >
                    <Sparkles className="w-5 h-5 text-black shrink-0" />
                    <span>{isSubmitting ? 'Đang Khai Mở & Lập Lá Số...' : 'Khai Mở & Xem Luận Giải Lá Số Ngay'}</span>
                    <ArrowRight className="w-5 h-5 text-black shrink-0" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ================= KHỐI 3: FOOTER CỐ ĐỊNH (SHRINK-0) ================= */}
        <footer className="shrink-0 p-3.5 sm:p-5 border-t border-white/10 bg-[#0e0f18]/95 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setCurrentStep(prev => Math.max(0, prev - 1));
              }}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !name.trim()) {
                  setErrorMessage('Kính mong Quý Bác nhập Họ và Tên trước khi tiếp tục.');
                  nameInputRef.current?.focus();
                  return;
                }
                if (currentStep === 6 && !birthCity.trim()) {
                  setErrorMessage('Kính mong Quý Bác nhập hoặc chọn Nơi Sinh trước khi tiếp tục.');
                  cityInputRef.current?.focus();
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(prev => Math.min(7, prev + 1));
              }}
              className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer ml-auto"
            >
              <span>Tiếp Theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </footer>
      </motion.div>
    </div>
  );
};
