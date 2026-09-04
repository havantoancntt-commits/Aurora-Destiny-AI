// ==========================================
// AURORA DESTINY AI — INTERNATIONALIZATION & GLOBALIZATION STUDIO
// World-class astronomy standards, True Solar Time (EoT),
// Timezones, Astrological Glossaries, Currencies & Formats
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Clock,
  Compass,
  Calendar,
  DollarSign,
  Check,
  RotateCcw,
  Sparkles,
  X,
  MapPin,
  HelpCircle,
  Sun,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';
import {
  GlobalSettings,
  WORLD_LOCATIONS,
  WorldLocation,
  AstrologyTerminologyMode,
  LateRatRule,
  ChronologySystem,
  SupportedCurrency,
  DateFormatPattern,
  TimeFormatPattern,
  DEFAULT_GLOBAL_SETTINGS,
  loadGlobalSettings,
  saveGlobalSettings,
  calculateTrueSolarTime,
  TEN_GODS_GLOSSARY,
  STEM_GLOSSARY,
  formatTerm,
  formatCurrencyAmount
} from '../services/internationalization';

interface Props {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onClose: () => void;
  onSettingsApplied?: (settings: GlobalSettings) => void;
}

type TabType = 'language' | 'solartime' | 'chronology' | 'formats';

export const InternationalizationModal: React.FC<Props> = ({
  language,
  onLanguageChange,
  onClose,
  onSettingsApplied
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('language');
  const [settings, setSettings] = useState<GlobalSettings>(() => loadGlobalSettings());
  const [customLongitude, setCustomLongitude] = useState<string>(
    settings.location.longitude.toString()
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time ticking clock for comparison
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live solar time for active location
  const solarTimeResult = calculateTrueSolarTime(
    currentTime.getFullYear(),
    currentTime.getMonth() + 1,
    currentTime.getDate(),
    currentTime.getHours(),
    currentTime.getMinutes(),
    settings.location.longitude,
    settings.location.utcOffset
  );

  const handleSelectLocation = (loc: WorldLocation) => {
    setSettings((prev) => ({
      ...prev,
      location: loc
    }));
    setCustomLongitude(loc.longitude.toString());
  };

  const handleSave = () => {
    saveGlobalSettings(settings);
    if (settings.language !== language) {
      onLanguageChange(settings.language);
    }
    if (onSettingsApplied) {
      onSettingsApplied(settings);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setSettings(DEFAULT_GLOBAL_SETTINGS);
    setCustomLongitude(DEFAULT_GLOBAL_SETTINGS.location.longitude.toString());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#0f111c] via-[#0b0d14] to-[#07080d] border border-teal-500/40 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(45,212,191,0.2)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Metallic Header */}
        <div className="relative px-5 sm:px-8 py-5 border-b border-white/10 bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-amber-500/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-500/20 border border-teal-400/40 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.25)]">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide">
                  Trung Tâm Cài Đặt Quốc Tế & Thiên Văn Toàn Cầu
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 border border-teal-400/40 text-teal-300">
                  Global Standard ISO/IAU
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Chuẩn hóa 15 ngôn ngữ, múi giờ IANA, kinh độ & hiệu chỉnh Giờ Mặt Trời Thật (True Solar Time).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill Strip */}
        <div className="px-5 sm:px-8 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="text-sm">{settings.location.flag}</span>
            <span className="font-semibold text-white">{settings.location.nameVi} ({settings.location.countryVi})</span>
            <span className="text-slate-500">•</span>
            <span className="text-teal-300">UTC{settings.location.utcOffset >= 0 ? `+${settings.location.utcOffset}` : settings.location.utcOffset}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-bold">{settings.location.longitude.toFixed(2)}°E</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Giờ Mặt Trời Thật:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              settings.enableTrueSolarTime
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {settings.enableTrueSolarTime ? 'ĐANG BẬT (Hiệu chỉnh tự động)' : 'TẮT (Giờ dân sự)'}
            </span>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-white/10 px-5 sm:px-8 bg-white/[0.01] overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'language'
                ? 'text-teal-300 border-teal-400 bg-teal-500/[0.06]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Ngôn Ngữ & Thuật Ngữ</span>
          </button>

          <button
            onClick={() => setActiveTab('solartime')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'solartime'
                ? 'text-teal-300 border-teal-400 bg-teal-500/[0.06]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Kinh Độ & Giờ Mặt Trời Thật</span>
          </button>

          <button
            onClick={() => setActiveTab('chronology')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'chronology'
                ? 'text-teal-300 border-teal-400 bg-teal-500/[0.06]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Quy Chuẩn Lịch & Giờ Tý</span>
          </button>

          <button
            onClick={() => setActiveTab('formats')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'formats'
                ? 'text-teal-300 border-teal-400 bg-teal-500/[0.06]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Tiền Tệ, Đơn Vị & Định Dạng</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: NGÔN NGỮ & THUẬT NGỮ */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              {/* Language Selection Grid */}
              <div>
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>1. Chọn Ngôn Ngữ Giao Diện Hệ Thống (15 Ngôn Ngữ Quốc Tế)</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Hệ thống tự động đồng bộ từ điển đa ngữ học thuật, giao diện bảng tính và các gợi ý phân tích AI.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = settings.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSettings({ ...settings, language: lang.code })}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/20 border-teal-400 text-white shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{lang.nativeName}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">{lang.code}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Astrology Terminology Mode */}
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>2. Chế Độ Hiển Thị Thuật Ngữ Cổ Học (Bát Tự / Tử Vi / Ngũ Hành)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Lựa chọn cách hiển thị các thuật ngữ cốt lõi như Thập Thần, Can Chi, Cung Tử Vi và Sao Bản Mệnh:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'vietnamese' as AstrologyTerminologyMode,
                      title: 'Hán - Việt Cổ Điển',
                      desc: 'Giáp, Ất, Bính / Chính Quan, Thất Sát, Tử Vi, Thiên Di',
                      badge: 'Chuẩn Nghiên Cứu'
                    },
                    {
                      id: 'international' as AstrologyTerminologyMode,
                      title: 'Quốc Tế (English Only)',
                      desc: 'Yang Wood, Direct Officer, Seven Killings, Travel Palace',
                      badge: 'Toàn Cầu Hóa'
                    },
                    {
                      id: 'bilingual' as AstrologyTerminologyMode,
                      title: 'Song Ngữ Đồng Thời (Bilingual)',
                      desc: 'Chính Quan (Direct Officer), Giáp (Yang Wood)',
                      badge: 'Khuyên Dùng Học Thuật'
                    }
                  ].map((mode) => {
                    const isSelected = settings.terminologyMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, terminologyMode: mode.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{mode.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{mode.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Terminology Live Preview */}
                <div className="mt-3 p-3 rounded-2xl bg-black/60 border border-white/10 text-xs flex flex-wrap items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">Minh Họa Hiển Thị:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-950/70 border border-teal-500/30 text-teal-300 font-bold">
                    {formatTerm('Chính Quan', 'Direct Officer', settings.terminologyMode)}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/30 text-purple-300 font-bold">
                    {formatTerm('Thiên Di', 'Travel Palace', settings.terminologyMode)}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-300 font-bold">
                    {formatTerm('Giáp Mộc', 'Yang Wood', settings.terminologyMode)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KINH ĐỘ & GIỜ MẶT TRỜI THẬT (TRUE SOLAR TIME) */}
          {activeTab === 'solartime' && (
            <div className="space-y-6">
              {/* Explanation Card */}
              <div className="p-4.5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-teal-500/10 border border-amber-400/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Nguyên Lý Thiên Văn: Giờ Mặt Trời Thật (True Solar Time / Equation of Time)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trong cổ học Bát Tự và Tử Vi, trụ Giờ sinh được tính theo <strong className="text-white">vị trí thực tế của Mặt Trời trên bầu trời nơi sinh (Thiên Đỉnh / Solar Noon 12:00)</strong>, không phải giờ đồng hồ cơ học quy ước theo múi giờ quốc gia. Do Trái Đất có quỹ đạo hình elip và trục nghiêng 23.5°, cần áp dụng <strong className="text-amber-200">Phương Trình Thời Gian (Equation of Time - EoT)</strong> kết hợp chênh lệch kinh độ (4 phút / 1 độ) để có giờ sinh chuẩn mực tuyệt đối.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/10">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Tự Động Hiệu Chỉnh Giờ Mặt Trời Thật</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Chuẩn Cố Vấn Cao Cấp
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Hệ thống sẽ tự động cộng/trừ số phút sai lệch thiên văn trước khi đối chiếu 12 Can Chi Giờ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, enableTrueSolarTime: !settings.enableTrueSolarTime })
                  }
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    settings.enableTrueSolarTime ? 'bg-teal-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              {/* Location Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Chọn Nhanh Địa Điểm Sinh / Định Vị Thiên Văn</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Hiện có {WORLD_LOCATIONS.length} trung tâm tọa độ quốc tế
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {WORLD_LOCATIONS.map((loc) => {
                    const isSelected = settings.location.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/20 border-teal-400 text-white shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{loc.flag}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            UTC{loc.utcOffset >= 0 ? `+${loc.utcOffset}` : loc.utcOffset}
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-1 truncate">{loc.nameVi}</div>
                        <div className="text-[10px] text-teal-300 font-mono mt-0.5">{loc.longitude.toFixed(2)}° Kinh Đông</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Solar Clock Comparison */}
              <div className="p-4 rounded-3xl bg-black/60 border border-teal-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Giờ Dân Dụng Chuẩn (Civil Clock)</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {currentTime.toLocaleTimeString('vi-VN')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Theo múi giờ: {settings.location.timezone} (UTC{settings.location.utcOffset >= 0 ? `+${settings.location.utcOffset}` : settings.location.utcOffset})
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 to-teal-500/15 border border-amber-400/40">
                  <div className="text-[11px] text-amber-300 uppercase font-mono flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giờ Mặt Trời Thật (True Solar Clock)</span>
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-200">
                    {String(solarTimeResult.trueHour).padStart(2, '0')}:
                    {String(solarTimeResult.trueMinute).padStart(2, '0')}:
                    {String(currentTime.getSeconds()).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-amber-300/90 font-mono">
                    {solarTimeResult.offsetMinutes >= 0 ? '+' : ''}
                    {solarTimeResult.offsetMinutes.toFixed(1)} phút so với giờ dân sự
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                💡 <strong>Ghi chú:</strong> {solarTimeResult.explanation}
              </div>
            </div>
          )}

          {/* TAB 3: QUY CHUẨN LỊCH & GIỜ TÝ */}
          {activeTab === 'chronology' && (
            <div className="space-y-6">
              {/* Chronology System */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>1. Hệ Lịch Bát Tự Quốc Tế (Solar Terms Chronology)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, chronologySystem: 'solar_terms' })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      settings.chronologySystem === 'solar_terms'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Lịch Tiết Khí 360° (Khuyên Dùng)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-mono">
                        Chuẩn Tử Bình
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Phân chia 12 tháng dựa chính xác vào 24 Tiết Khí thiên văn học và góc kinh độ Hoàng Đạo Mặt Trời. Năm mới bắt đầu từ thời khắc Lập Xuân (315°), không phụ thuộc vào mùng 1 Tết Nguyên Đán.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, chronologySystem: 'lunar_civil' })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      settings.chronologySystem === 'lunar_civil'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Lịch Âm Dân Dụng (Lunisolar)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        Dân Gian
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Tính tháng theo chu kỳ Trăng tròn - Trăng khuyết (ngày Sóc - Vọng) và chuyển năm mới đúng vào mùng 1 Tết Âm Lịch truyền thống.
                    </p>
                  </button>
                </div>
              </div>

              {/* Late Rat Rule (Dạ Tý) */}
              <div className="space-y-3 p-4 rounded-3xl bg-white/[0.02] border border-white/10">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>2. Quy Chuẩn Giờ Tý (Khung Giờ 23:00 - 24:00 đêm)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Thời khắc giao thoa giữa ngày cũ và ngày mới trong cổ học:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, lateRatRule: 'late_rat_next_day' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      settings.lateRatRule === 'late_rat_next_day'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-sm'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Dạ Tý Sang Ngày Mới (Cổ Điển)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                        Đại Tông Phái
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Từ 23:00 đã chuyển sang giờ Tý của ngày tiếp theo (theo Trụ Ngày và Can Giờ của ngày mới).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, lateRatRule: 'early_rat_same_day' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      settings.lateRatRule === 'early_rat_same_day'
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-sm'
                        : 'bg-black/40 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Chính Tý 00:00 (Hiện Đại)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Quy Ước
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Giữ nguyên Can Ngày cũ cho đến đúng nửa đêm 00:00 (chia Dạ Tý 23:00-24:00 và Sớm Tý 00:00-01:00).
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIỀN TỆ, ĐƠN VỊ & ĐỊNH DẠNG */}
          {activeTab === 'formats' && (
            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>1. Tiền Tệ Quy Chiếu Tài Vận & Đầu Tư</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { code: 'VND', label: 'Việt Nam Đồng (₫)', country: 'Việt Nam' },
                      { code: 'USD', label: 'US Dollar ($)', country: 'Hoa Kỳ' },
                      { code: 'EUR', label: 'Euro (€)', country: 'Châu Âu' },
                      { code: 'JPY', label: 'Yen Nhật (¥)', country: 'Nhật Bản' },
                      { code: 'GBP', label: 'Bảng Anh (£)', country: 'Vương Quốc Anh' },
                      { code: 'AUD', label: 'Đô La Úc (A$)', country: 'Úc' },
                      { code: 'SGD', label: 'Đô La Singapore (S$)', country: 'Singapore' },
                      { code: 'CAD', label: 'Đô La Canada (C$)', country: 'Canada' }
                    ] as { code: SupportedCurrency; label: string; country: string }[]
                  ).map((curr) => {
                    const isSelected = settings.currency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setSettings({ ...settings, currency: curr.code })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-bold">{curr.code}</div>
                        <div className="text-[11px] text-emerald-300 font-mono">{curr.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{curr.country}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-slate-400 font-mono">
                  Ví dụ minh họa: <strong className="text-emerald-300">{formatCurrencyAmount(50000000, settings.currency, settings.language)}</strong>
                </div>
              </div>

              {/* Date & Time Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/10">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Định Dạng Ngày Tháng
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { pattern: 'DD/MM/YYYY' as DateFormatPattern, example: '25/08/1990 (Chuẩn Việt Nam & Châu Âu)' },
                      { pattern: 'YYYY-MM-DD' as DateFormatPattern, example: '1990-08-25 (Chuẩn Quốc Tế ISO 8601)' },
                      { pattern: 'MM/DD/YYYY' as DateFormatPattern, example: '08/25/1990 (Chuẩn Hoa Kỳ)' }
                    ].map((fmt) => (
                      <button
                        key={fmt.pattern}
                        type="button"
                        onClick={() => setSettings({ ...settings, dateFormat: fmt.pattern })}
                        className={`w-full px-3 py-2 rounded-xl text-xs text-left border flex items-center justify-between cursor-pointer ${
                          settings.dateFormat === fmt.pattern
                            ? 'bg-teal-500/20 border-teal-400 text-white'
                            : 'bg-black/30 border-white/10 text-slate-400'
                        }`}
                      >
                        <span>{fmt.example}</span>
                        {settings.dateFormat === fmt.pattern && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Định Dạng Giờ & Đo Lường
                  </label>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, timeFormat: '24h' })}
                      className={`w-full px-3 py-2 rounded-xl text-xs text-left border flex items-center justify-between cursor-pointer ${
                        settings.timeFormat === '24h'
                          ? 'bg-teal-500/20 border-teal-400 text-white'
                          : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      <span>24 Giờ Quân Sự / Khoa Học (14:30)</span>
                      {settings.timeFormat === '24h' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, timeFormat: '12h' })}
                      className={`w-full px-3 py-2 rounded-xl text-xs text-left border flex items-center justify-between cursor-pointer ${
                        settings.timeFormat === '12h'
                          ? 'bg-teal-500/20 border-teal-400 text-white'
                          : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      <span>12 Giờ Dân Dụng (02:30 PM)</span>
                      {settings.timeFormat === '12h' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">Thước Đo Phong Thủy:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, measurementSystem: 'metric' })}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs border font-medium cursor-pointer ${
                          settings.measurementSystem === 'metric'
                            ? 'bg-teal-500/20 border-teal-400 text-white'
                            : 'bg-black/30 border-white/10 text-slate-400'
                        }`}
                      >
                        Hệ Mét / Lỗ Ban (cm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, measurementSystem: 'imperial' })}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs border font-medium cursor-pointer ${
                          settings.measurementSystem === 'imperial'
                            ? 'bg-teal-500/20 border-teal-400 text-white'
                            : 'bg-black/30 border-white/10 text-slate-400'
                        }`}
                      >
                        Hệ Imperial (Inches)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 sm:px-8 py-4 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi Phục Chuẩn Mặc Định</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Đã Áp Dụng Toàn Cầu!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lưu & Áp Dụng Cài Đặt Quốc Tế</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
