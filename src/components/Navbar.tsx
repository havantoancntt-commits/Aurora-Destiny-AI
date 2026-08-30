// ==========================================
// NAVIGATION HEADER & PROFILE SWITCHER
// ==========================================

import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';
import { UserProfile } from '../types/user';

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
  onRunTestAudit
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050508]/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)] shrink-0">
            <span className="text-white font-bold text-lg tracking-wider">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-light tracking-[0.2em] text-white uppercase">
                Aurora Destiny <span className="font-bold opacity-60 text-teal-400">AI</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-purple-950/60 border border-purple-500/30 text-purple-300">
                PRO 4.2
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-teal-400/80 font-medium">
              Universal Analysis Engine v4.2
            </p>
          </div>
        </div>

        {/* Action Controls & System Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex flex-col items-end pr-2 border-r border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 opacity-60">Trạng Thái Hệ Thống</span>
            <span className="text-[11px] font-mono text-teal-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_#2dd4bf]"></span>
              ĐỒNG BỘ 100%
            </span>
          </div>

          {/* Profile Switcher & Info Entry Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowLangMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-black/80 to-teal-950/70 border border-teal-500/35 hover:border-teal-400 text-xs text-slate-100 font-medium transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)] group cursor-pointer"
              title="Điền thông tin sinh / Quản lý lá số"
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                  {currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-teal-400 rounded-full ring-2 ring-[#0c0d14] animate-pulse" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-teal-300 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                  <span>Lá Số</span>
                </span>
                <span className="max-w-[75px] sm:max-w-[120px] truncate text-slate-100 font-bold text-[11px] sm:text-xs">
                  {currentProfile?.name || 'Điền Thông Tin'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 transition-transform duration-200 group-hover:translate-y-0.5 ml-0.5" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c0d14]/95 backdrop-blur-2xl border border-teal-500/30 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.8)] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header of dropdown */}
                <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10 text-xs">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest font-cinzel flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quản Lý Lá Số & Hồ Sơ</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {profiles.length} hồ sơ
                  </span>
                </div>

                {/* Primary Action Button: Open Input Form */}
                <div className="py-2.5">
                  <button
                    onClick={() => {
                      onOpenNewProfileModal();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(45,212,191,0.35)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Điền Thông Tin / Lập Lá Số Mới</span>
                  </button>
                </div>

                {/* List of Existing Profiles */}
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Chuyển nhanh hồ sơ đã lưu:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {profiles.map((prof) => {
                      const isCurrent = prof.id === activeProfileId;
                      return (
                        <button
                          key={prof.id}
                          onClick={() => {
                            onSelectProfile(prof.id);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-gradient-to-r from-purple-950/60 to-teal-950/60 border border-teal-500/40 text-teal-200 font-semibold shadow-sm'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-teal-300 font-bold shrink-0">
                              {prof.name.charAt(0)}
                            </div>
                            <div className="text-left truncate">
                              <div className="truncate font-medium">{prof.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {prof.birthData.solarDay}/{prof.birthData.solarMonth}/{prof.birthData.solarYear} • {prof.birthData.birthCity}
                              </div>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-teal-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-200 transition-all shadow-sm"
              title="Chọn Ngôn Ngữ"
            >
              <span className="text-sm">{currentLangMeta.flag}</span>
              <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider">{currentLangMeta.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Ngôn Ngữ ({SUPPORTED_LANGUAGES.length})
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
                          ? 'bg-purple-950/50 border border-purple-500/30 text-teal-300 font-medium'
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

          {/* Quick Action Buttons */}
          <button
            onClick={onOpenReportModal}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Xuất Báo Cáo"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('executiveReport', language)}</span>
          </button>

          <button
            onClick={onOpenPrivacyCenter}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Quyền Riêng Tư & Bảo Mật"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">{t('privacyCenter', language)}</span>
          </button>

          <button
            onClick={onOpenAdminModal}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-teal-300 hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Quản Trị Hệ Thống & Giám Sát"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden xl:inline">{t('adminDashboard', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
