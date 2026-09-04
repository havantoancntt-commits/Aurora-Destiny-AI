// ==========================================
// NAVIGATION HEADER & PROFILE SWITCHER
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
  Heart
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { LanguageCode, CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { RealTimePulsePill } from './RealTimePulsePill';

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
  onOpenSponsorshipModal
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowLangMenu(false);
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
      {(showProfileMenu || showLangMenu) && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] transition-opacity animate-in fade-in cursor-pointer"
          onClick={() => {
            setShowProfileMenu(false);
            setShowLangMenu(false);
          }}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-40 w-full bg-[#050508]/90 backdrop-blur-xl border-b border-white/10 px-2.5 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)] shrink-0">
              <span className="text-white font-bold text-base sm:text-lg tracking-wider">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-light tracking-[0.15em] sm:tracking-[0.2em] text-white uppercase">
                  Aurora Destiny <span className="font-bold opacity-70 text-teal-400">AI</span>
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-purple-950/60 border border-purple-500/30 text-purple-300">
                  PRO 4.2
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-teal-400/80 font-medium">
                Universal Analysis Engine
              </p>
            </div>
          </div>

          {/* Action Controls & System Status */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Real-time Dynamic Island Pulse Pill */}
            <RealTimePulsePill
              calculation={calculation}
              onOpenAlertCenter={onOpenAlertCenter}
            />

            {/* Profile Switcher & Info Entry Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowLangMenu(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-black/90 to-teal-950/80 border transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)] group cursor-pointer ${
                  showProfileMenu ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-teal-500/35 hover:border-teal-400'
                }`}
                title="Quản lý hồ sơ & lập lá số mới"
              >
                <div className="relative shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                    {currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full ring-2 ring-[#0c0d14] animate-pulse" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[8px] sm:text-[9px] text-teal-300 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-teal-400 hidden sm:inline" />
                    <span>Lá Số</span>
                  </span>
                  <span className="max-w-[55px] sm:max-w-[120px] truncate text-slate-100 font-bold text-[10px] sm:text-xs">
                    {currentProfile?.name || (
                      <>
                        <span className="sm:hidden">Hồ Sơ</span>
                        <span className="hidden sm:inline">Điền Thông Tin</span>
                      </>
                    )}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-teal-300 transition-transform duration-200 ml-0.5 ${
                  showProfileMenu ? 'rotate-180 text-teal-300' : ''
                }`} />
              </button>

              {/* Profile Management Floating Window */}
              {showProfileMenu && (
                <div className="fixed sm:absolute top-[64px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-[#0c0d14]/98 backdrop-blur-2xl border border-teal-500/40 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(45,212,191,0.25)] p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {/* Header of dropdown */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider font-cinzel">
                        Quản Lý Lá Số & Hồ Sơ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-teal-300 bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-500/30">
                        {profiles.length} hồ sơ
                      </span>
                      <button
                        onClick={() => setShowProfileMenu(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Đóng cửa sổ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button: Open Input Form */}
                  <div className="py-3">
                    <button
                      onClick={() => {
                        onOpenNewProfileModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] active:scale-[0.98] cursor-pointer"
                    >
                      <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      <span className="font-semibold tracking-wide whitespace-nowrap">Nhập Thông Tin / Lập Lá Số Mới</span>
                    </button>
                  </div>

                  {/* List of Existing Profiles */}
                  <div className="space-y-1.5">
                    <div className="px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Chuyển nhanh hồ sơ đã lưu:</span>
                      <span className="text-[9px] text-slate-500">chọn để xem</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {profiles.map((prof) => {
                        const isCurrent = prof.id === activeProfileId;
                        return (
                          <button
                            key={prof.id}
                            onClick={() => {
                              onSelectProfile(prof.id);
                              setShowProfileMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-gradient-to-r from-purple-950/70 to-teal-950/70 border border-teal-500/50 text-teal-200 font-semibold shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCurrent ? 'bg-teal-500/30 text-teal-300 border border-teal-400/50' : 'bg-white/10 text-slate-300'
                              }`}>
                                {prof.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left truncate">
                                <div className="truncate font-semibold text-white">{prof.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {prof.birthData.solarDay}/{prof.birthData.solarMonth}/{prof.birthData.solarYear} • {prof.birthData.birthCity}
                                </div>
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-teal-400 text-black font-bold shrink-0 ml-1">
                                Đang Xem
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Chạm vùng ngoài để đóng</span>
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="text-teal-400 hover:underline cursor-pointer font-medium"
                    >
                      Đóng Lại
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowProfileMenu(false);
                }}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-white/5 border hover:bg-white/10 text-xs text-slate-200 transition-all shadow-sm ${
                  showLangMenu ? 'border-teal-400' : 'border-white/10'
                }`}
                title="Chọn Ngôn Ngữ"
              >
                <span className="text-sm">{currentLangMeta.flag}</span>
                <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider">{currentLangMeta.code}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showLangMenu ? 'rotate-180 text-teal-300' : ''}`} />
              </button>

              {showLangMenu && (
                <div className="fixed sm:absolute top-[64px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 sm:w-56 bg-[#0c0d14]/98 backdrop-blur-2xl border border-teal-500/30 rounded-2xl shadow-2xl p-2.5 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-white/10 mb-1">
                    <span>Ngôn Ngữ ({SUPPORTED_LANGUAGES.length})</span>
                    <button
                      onClick={() => setShowLangMenu(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 my-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                          lang.code === language
                            ? 'bg-purple-950/60 border border-teal-500/40 text-teal-300 font-medium'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {lang.code === language && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sponsorship / Support Channel Trigger */}
            {onOpenSponsorshipModal && (
              <button
                id="btn-nav-support-channel"
                onClick={onOpenSponsorshipModal}
                className="p-1 sm:p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-400/40 text-amber-200 hover:text-white hover:border-amber-300 hover:bg-amber-500/25 text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(251,191,36,0.15)] shrink-0 cursor-pointer group"
                title="Ủng hộ kênh & Mời cà phê Giáo Sư TOAN"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/35 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium tracking-wide">Ủng Hộ Kênh</span>
              </button>
            )}

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenReportModal}
              className="p-1 sm:p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Xuất Báo Cáo"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('executiveReport', language)}</span>
            </button>

            <button
              onClick={onOpenPrivacyCenter}
              className="p-1 sm:p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Quyền Riêng Tư & Bảo Mật"
            >
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline">{t('privacyCenter', language)}</span>
            </button>

            <button
              onClick={onOpenAdminModal}
              className="p-1 sm:p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-teal-300 hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              title="Quản Trị Hệ Thống & Giám Sát"
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xl:inline">{t('adminDashboard', language)}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
