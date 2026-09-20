// ==========================================================
// AURORA DESTINY AI — CỔNG KẾT NỐI MẠNG XÃ HỘI & CỘNG ĐỒNG CHÍNH THỨC
// Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN
// Strict compliance: All icons from lucide-react, WCAG AA, safe external links
// ==========================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Users,
  Youtube,
  Facebook,
  Music2,
  Mail,
  Heart,
  Share2,
  Radio,
  Video
} from 'lucide-react';
import { OFFICIAL_SOCIAL_CHANNELS, SOCIAL_HUB_META } from '../constants/socials';
import { LanguageCode } from '../types/destiny';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
  onOpenSponsorshipModal?: () => void;
}

export const CommunitySocialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'vi',
  onOpenSponsorshipModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (url: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      }).catch(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const isVi = language === 'vi';

  return (
    <div
      id="modal-community-social-hub"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#090b14] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Ambient Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-red-500 to-blue-500 pointer-events-none rounded-t-3xl" />

        {/* Modal Header */}
        <div className="p-5 sm:p-7 border-b border-white/10 flex items-start justify-between gap-4 sticky top-0 bg-[#090b14]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-teal-400/20 to-purple-500/20 border border-white/15 flex items-center justify-center p-2.5 shrink-0 shadow-lg">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  {isVi ? 'Kênh Truyền Thông Chính Thức' : 'Official Channels'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {SOCIAL_HUB_META.founder}
                </span>
              </div>
              <h2
                id="social-modal-title"
                className="text-lg sm:text-2xl font-serif font-medium text-white tracking-tight"
              >
                {isVi ? 'Mạng Xã Hội Kênh Huyền Phong Phật Đạo' : 'Huyền Phong Phật Đạo Social Network'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Mission & Purpose Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-teal-300">
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  <span>Sứ Mệnh Học Thuật &amp; Phụng Sự</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {SOCIAL_HUB_META.mission}
                </p>
                <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                  ✨ Khẩu Quyết: &ldquo;{SOCIAL_HUB_META.slogan}&rdquo;
                </div>
              </div>

              {onOpenSponsorshipModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSponsorshipModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                  <span>Ủng Hộ Kênh</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Detailed Social Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3 Nền Tảng Trực Tuyến Được Xác Nhận</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Tất cả liên kết an toàn 100%</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {OFFICIAL_SOCIAL_CHANNELS.map((channel) => {
                const isCopied = copiedId === channel.id;
                return (
                  <div
                    key={channel.id}
                    className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
                  >
                    {/* Left: Brand Icon & Text */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/15 flex items-center justify-center shrink-0 p-3 group-hover:scale-105 transition-transform">
                        {channel.id === 'youtube' && <Youtube className="w-7 h-7 text-red-500" />}
                        {channel.id === 'facebook' && <Facebook className="w-7 h-7 text-blue-400" />}
                        {channel.id === 'tiktok' && <Music2 className="w-7 h-7 text-cyan-400" />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-white tracking-tight">
                            {channel.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full ${channel.colorClass.badgeBg} border ${channel.colorClass.badgeBorder} ${channel.colorClass.badgeText} text-[10px] font-mono font-medium flex items-center gap-1`}>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{channel.handle}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          {channel.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                          {channel.highlights.map((h, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <span className="text-amber-400">•</span>
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                      <button
                        onClick={() => handleCopy(channel.url, channel.id)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-mono"
                        title="Sao chép liên kết"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300 text-xs">Đã chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-400" />
                            <span className="hidden sm:inline text-xs">Sao chép</span>
                          </>
                        )}
                      </button>

                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${channel.colorClass.buttonBg} ${channel.colorClass.buttonHover}`}
                      >
                        <span>{channel.actionText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email & Academic Verification Footer Banner */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Liên hệ Thư Tịch / Kỹ Thuật:</span>
              <a
                href={`mailto:${SOCIAL_HUB_META.founderContact}`}
                className="text-teal-300 hover:underline"
              >
                {SOCIAL_HUB_META.founderContact}
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Chứng thực bản quyền © 2024–{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
