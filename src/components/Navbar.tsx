// ==========================================
// NAVIGATION HEADER & PROFILE SWITCHER
// Ultra-luxury, uncluttered, international standard
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  Globe,
  User,
  Shield,
  FileText,
  Activity,
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  X,
  UserPlus,
  Heart,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  Menu,
  MoreHorizontal,
  Crown,
  Users,
  Download,
  Sun,
  HeartHandshake
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { LanguageCode, CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { RealTimePulsePill } from './RealTimePulsePill';
import { sacredSound } from '../services/soundService';
import { PWAInstallButton } from './PWAInstallButton';
import { PWAInstallModal } from './PWAInstallModal';

interface Props {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenNewProfileModal: () => void;
  onOpenPrivacyCenter: () => void;
  onOpenAdminModal: () => void;
  onOpenReportModal: () => void;
  onRunTestAudit: () => void;
  calculation?: CalculationResult | null;
  onOpenAlertCenter?: () => void;
  onOpenSponsorshipModal?: () => void;
  onOpenInternationalModal?: () => void;
  onOpenOracleModal?: () => void;
  onOpenTalismanModal?: () => void;
  onOpenCommunityModal?: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'radar' | 'timeline' | 'compatibility' | 'remedies' | 'daily') => void;
  onOpenSeniorGuide?: () => void;
}

export const Navbar: React.FC<Props> = ({
  language,
  onLanguageChange,
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenNewProfileModal,
  onOpenPrivacyCenter,
  onOpenAdminModal,
  onOpenReportModal,
  onRunTestAudit,
  calculation = null,
  onOpenAlertCenter = () => {},
  onOpenSponsorshipModal,
  onOpenInternationalModal,
  onOpenOracleModal,
  onOpenTalismanModal,
  onOpenCommunityModal,
  onNavigateTab,
  onOpenSeniorGuide
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sacredSound.getIsMuted());

  const handleToggleAudio = () => {
    const muted = sacredSound.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowLangMenu(false);
        setShowMoreMenu(false);
        setShowPWAModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Backdrop overlay for closing dropdowns when clicking outside */}
      {(showProfileMenu || showLangMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in cursor-pointer"
          onClick={() => {
            setShowProfileMenu(false);
            setShowLangMenu(false);
            setShowMoreMenu(false);
          }}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-40 w-full bg-[#07080f]/90 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-teal-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.25)] shrink-0 border border-white/10">
              <span className="text-white font-bold text-sm sm:text-base font-serif tracking-wider">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] text-white uppercase">
                  Aurora <span className="text-teal-400 font-light">Destiny</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-amber-500/10 border border-amber-500/25 text-amber-300/90 hidden sm:inline-block">
                  Huyền Phong Phật Đạo
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono hidden md:block">
                Astrodynamics &amp; Multi-Agent AI
              </p>
            </div>
          </div>

          {/* Action Controls & System Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Real-time Dynamic Island Pulse Pill (Only when calculation exists) */}
            {calculation && (
              <div className="hidden lg:block">
                <RealTimePulsePill
                  calculation={calculation}
                  onOpenAlertCenter={onOpenAlertCenter}
                />
              </div>
            )}

            {/* Profile Switcher & Info Entry Trigger */}
            <div className="relative">
              <button
                id="btn-nav-profile-switcher"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowLangMenu(false);
                  setShowMoreMenu(false);
                }}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border transition-all cursor-pointer ${
                  showProfileMenu
                    ? 'border-teal-400 ring-1 ring-teal-400/30 bg-white/[0.08]'
                    : 'border-white/10 hover:border-teal-400/40'
                }`}
                title="Quản lý hồ sơ & lập lá số mới"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : '+'}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="max-w-[70px] sm:max-w-[110px] truncate text-slate-200 font-medium text-xs">
                    {currentProfile?.name || 'Lập Lá Số'}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180 text-teal-300' : ''
                }`} />
              </button>

              {/* Profile Management Floating Window */}
              {showProfileMenu && (
                <div className="fixed sm:absolute top-[56px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-[#0d0f1a]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header of dropdown */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                    <span className="text-[11px] font-semibold text-white uppercase tracking-wider font-mono">
                      Hồ Sơ Bản Mệnh ({profiles.length})
                    </span>
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Đóng cửa sổ"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Action Button: Open Input Form */}
                  <div className="py-2.5">
                    <button
                      onClick={() => {
                        onOpenNewProfileModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition-all shadow-sm active:scale-[0.98] hover-sacred-wobble cursor-pointer"
                    >
                      <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      <span className="tracking-wide">Nhập Thông Tin / Lập Lá Số Mới</span>
                    </button>

                    {onOpenSeniorGuide && (
                      <button
                        onClick={() => {
                          onOpenSeniorGuide();
                          setShowProfileMenu(false);
                        }}
                        className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>Trợ Lý Cho Người Lớn Tuổi (A - Z)</span>
                      </button>
                    )}
                  </div>

                  {/* List of Existing Profiles */}
                  {profiles.length > 0 && (
                    <div className="space-y-1 mt-1 max-h-48 overflow-y-auto pr-1">
                      {profiles.map((prof) => {
                        const isCurrent = prof.id === activeProfileId;
                        return (
                          <button
                            key={prof.id}
                            onClick={() => {
                              onSelectProfile(prof.id);
                              setShowProfileMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-white/10 border border-teal-400/40 text-teal-200 font-medium'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCurrent ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-slate-400'
                              }`}>
                                {prof.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left truncate">
                                <div className="truncate font-medium text-white">{prof.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {prof.birthData.solarDay}/{prof.birthData.solarMonth}/{prof.birthData.solarYear}
                                </div>
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-teal-400/20 text-teal-300 font-bold shrink-0 ml-1">
                                Đang Xem
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Direct Action: Thẻ Kim Giáp Khai Mệnh */}
            {onOpenTalismanModal && (
              <button
                id="btn-nav-talisman-card"
                onClick={onOpenTalismanModal}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/50 text-amber-200 hover:text-white hover:border-amber-300 text-xs hover-sacred-wobble transition-all cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.2)] font-semibold"
                title="Khai Mở Thẻ Mệnh Kim Giáp 3D & Bia Vàng Công Đức"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span>Thẻ Kim Giáp</span>
              </button>
            )}

            {/* PWA In-App Install Quick Button */}
            <PWAInstallButton variant="compact" />

            {/* Desktop Direct Action: Đồng Hành & Mời Cà Phê Kênh */}
            {onOpenSponsorshipModal && (
              <button
                id="btn-nav-support-channel"
                onClick={onOpenSponsorshipModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-purple-500/15 border border-rose-400/40 text-rose-200 hover:text-white hover:border-rose-300 text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.2)] font-semibold"
                title="Đồng Hành & Mời Cà Phê Giáo Sư - Prof.TOAN"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                <span>Ủng Hộ Kênh</span>
              </button>
            )}

            {/* Desktop Direct Action: Kênh Mạng Xã Hội Chính Thức */}
            {onOpenCommunityModal && (
              <button
                id="btn-nav-community-channels"
                onClick={onOpenCommunityModal}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 hover:text-white text-xs transition-all cursor-pointer font-medium"
                title="Mạng Xã Hội Chính Thức: TikTok • YouTube • Facebook"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mạng Xã Hội</span>
              </button>
            )}

            {/* Desktop Direct Action: Gieo Quẻ Kinh Dịch */}
            {onOpenOracleModal && (
              <button
                id="btn-nav-mystic-oracle"
                onClick={onOpenOracleModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 hover:text-white hover:bg-amber-500/20 text-xs transition-all cursor-pointer"
                title="Gieo Quẻ Kinh Dịch Khai Vận Hôm Nay"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">Gieo Quẻ</span>
              </button>
            )}

            {/* Desktop Direct Action: Sách Bản Mệnh Dossier */}
            {calculation && onOpenReportModal && (
              <button
                id="btn-nav-executive-dossier"
                onClick={onOpenReportModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-slate-200 hover:text-white text-xs transition-all cursor-pointer"
                title="Xuất Bản Sách Bản Mệnh Tinh Hoa (PDF)"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Sách Bản Mệnh</span>
              </button>
            )}

            {/* Desktop Audio Controller */}
            <button
              id="btn-nav-sacred-sound"
              onClick={handleToggleAudio}
              className={`hidden sm:flex items-center justify-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                isMuted
                  ? 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  : 'bg-teal-500/15 border-teal-400/40 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.2)]'
              }`}
              title={isMuted ? 'Bật sóng thiền 432Hz' : 'Tắt sóng thiền 432Hz'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowProfileMenu(false);
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
                title="Chọn Ngôn Ngữ"
              >
                <span className="text-xs">{currentLangMeta.flag}</span>
                <span className="font-mono text-[10px] uppercase">{currentLangMeta.code}</span>
              </button>

              {showLangMenu && (
                <div className="fixed sm:absolute top-[56px] sm:top-full right-3 sm:right-0 sm:mt-2 w-48 bg-[#0d0f1a]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          lang.code === language
                            ? 'bg-teal-500/15 text-teal-300 font-medium'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {lang.code === language && <Check className="w-3 h-3 text-teal-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unified More / Utility Menu (Dropdown on Desktop, Full Drawer on Mobile) */}
            <div className="relative">
              <button
                id="btn-nav-more-menu"
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  setShowProfileMenu(false);
                  setShowLangMenu(false);
                }}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  showMoreMenu
                    ? 'bg-white/10 border-teal-400 text-teal-300'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Tiện ích & Thiết lập"
                aria-label="Thực đơn tiện ích"
              >
                <MoreHorizontal className="w-4 h-4 hidden sm:block" />
                <Menu className="w-4 h-4 sm:hidden" />
              </button>

              {showMoreMenu && (
                <div className="fixed sm:absolute top-[56px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-64 bg-[#0d0f1a]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-1.5 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    <span>Tiện Ích Hệ Thống</span>
                    <button onClick={() => setShowMoreMenu(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    {/* Exclusive Proprietary Apps Direct Nav */}
                    {onNavigateTab && (
                      <>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            onNavigateTab('daily');
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/25 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-medium">La Bàn Định Thời Chiến Lược</span>
                          </div>
                          <span className="text-[9px] font-mono uppercase bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200">Độc Quyền</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            onNavigateTab('compatibility');
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/25 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="font-medium">Ma Trận Tương Hợp 360°</span>
                          </div>
                          <span className="text-[9px] font-mono uppercase bg-rose-400/20 px-1.5 py-0.5 rounded text-rose-200">360°</span>
                        </button>

                        {onOpenSeniorGuide && (
                          <button
                            onClick={() => {
                              setShowMoreMenu(false);
                              onOpenSeniorGuide();
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 transition-colors text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-semibold text-xs">Trợ Lý Lập Lá Số Người Lớn Tuổi</span>
                            </div>
                            <span className="text-[9px] font-mono uppercase bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200">A-Z</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Mobile-only tools in this drawer */}
                    {onOpenTalismanModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenTalismanModal();
                        }}
                        className="md:hidden w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors text-left cursor-pointer font-medium"
                      >
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Thẻ Kim Giáp Khai Mệnh</span>
                      </button>
                    )}

                    {onOpenOracleModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenOracleModal();
                        }}
                        className="md:hidden w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Gieo Quẻ Kinh Dịch</span>
                      </button>
                    )}

                    {calculation && onOpenReportModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenReportModal();
                        }}
                        className="md:hidden w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Xuất Sách Bản Mệnh (PDF)</span>
                      </button>
                    )}

                    {/* Mobile audio toggle */}
                    <button
                      onClick={handleToggleAudio}
                      className="sm:hidden w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
                        <span>Thiên Âm 432Hz</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{isMuted ? 'Tắt' : 'Bật'}</span>
                    </button>

                    {/* Global Settings */}
                    {onOpenInternationalModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenInternationalModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Cài Đặt Quốc Tế &amp; Múi Giờ</span>
                      </button>
                    )}

                    {/* Sponsorship / Support */}
                    {onOpenSponsorshipModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenSponsorshipModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-rose-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Đồng Hành &amp; Mời Cà Phê Kênh</span>
                      </button>
                    )}

                    {/* Official Social Media Channels */}
                    {onOpenCommunityModal && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenCommunityModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-cyan-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Mạng Xã Hội (TikTok, YT, FB)</span>
                      </button>
                    )}

                    {/* PWA Install Entry in Menu */}
                    <button
                      id="btn-menu-pwa-install"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowPWAModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors text-left cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cài Đặt Ứng Dụng (PWA)</span>
                    </button>

                    {/* Privacy */}
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onOpenPrivacyCenter();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Chính Sách Riêng Tư</span>
                    </button>

                    {/* Admin - Only visible in admin debug mode via ?admin URL parameter */}
                    {typeof window !== 'undefined' && window.location.search.includes('admin') && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onOpenAdminModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Quản Trị &amp; Kiểm Thử</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PWA Install Guided Modal (Available when triggered from menu or actions) */}
      <PWAInstallModal
        isOpen={showPWAModal}
        onClose={() => setShowPWAModal(false)}
      />
    </>
  );
};

