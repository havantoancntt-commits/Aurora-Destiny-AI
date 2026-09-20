// ==========================================================
// AURORA DESTINY AI — OFFICIAL SOCIAL MEDIA CHANNELS SHOWCASE
// Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN
// Strict compliance: All icons from lucide-react, WCAG AA, safe external links
// ==========================================================

import React, { useState } from 'react';
import {
  Youtube,
  Facebook,
  Music2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Share2,
  Users,
  Video,
  Flame,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { OFFICIAL_SOCIAL_CHANNELS, SocialChannelConfig, SOCIAL_HUB_META } from '../constants/socials';

interface Props {
  variant?: 'grid' | 'compact' | 'horizontal';
  className?: string;
  onOpenCommunityModal?: () => void;
  showTitle?: boolean;
}

export const OfficialSocialChannels: React.FC<Props> = ({
  variant = 'grid',
  className = '',
  onOpenCommunityModal,
  showTitle = true
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const getPlatformIcon = (id: 'tiktok' | 'youtube' | 'facebook', size = 'w-5 h-5') => {
    switch (id) {
      case 'youtube':
        return <Youtube className={`${size} text-red-500`} />;
      case 'facebook':
        return <Facebook className={`${size} text-blue-400`} />;
      case 'tiktok':
        return <Music2 className={`${size} text-cyan-400`} />;
      default:
        return <Share2 className={`${size} text-amber-400`} />;
    }
  };

  const getChannelBadgeIcon = (id: 'tiktok' | 'youtube' | 'facebook') => {
    switch (id) {
      case 'youtube':
        return <Radio className="w-3 h-3 text-red-400" />;
      case 'facebook':
        return <Users className="w-3 h-3 text-blue-400" />;
      case 'tiktok':
        return <Video className="w-3 h-3 text-cyan-400" />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Mạng Xã Hội Chính Thức
            </span>
            <span className="text-[10px] font-mono text-slate-400">@huyenphongphatdao</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {OFFICIAL_SOCIAL_CHANNELS.map((channel) => (
            <div
              key={channel.id}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getPlatformIcon(channel.id, 'w-4 h-4')}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white tracking-tight">{channel.platform}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{channel.handle}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleCopy(channel.url, `compact-${channel.id}`, e)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={`Sao chép liên kết ${channel.platform}`}
                  aria-label={`Sao chép ${channel.platform}`}
                >
                  {copiedId === `compact-${channel.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${channel.colorClass.buttonBg} ${channel.colorClass.buttonHover}`}
              >
                <span>Mở {channel.platform}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default rich grid view
  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                Kênh Truyền Thông Xác Thực
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Chính Chủ • Giáo Sư - Prof.TOAN
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
              <span>Hệ Thống Mạng Xã Hội Kênh</span>
              <span className="text-amber-300 font-semibold">Huyền Phong Phật Đạo</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCommunityModal && (
              <button
                onClick={onOpenCommunityModal}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-teal-300" />
                <span>Chi Tiết Cộng Đồng</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3 Interactive Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {OFFICIAL_SOCIAL_CHANNELS.map((channel) => {
          const isCopied = copiedId === channel.id;
          return (
            <div
              key={channel.id}
              className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between group overflow-hidden"
            >
              {/* Subtle ambient gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${channel.colorClass.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500`}
              />

              <div className="relative z-10 space-y-4">
                {/* Header Row: Platform Icon, Name, Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center p-2.5 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {getPlatformIcon(channel.id, 'w-6 h-6')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-semibold text-white tracking-tight">
                          {channel.platform}
                        </h4>
                        <span title="Tài khoản chính thức được chứng thực">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                        </span>
                      </div>
                      <span className="text-xs font-mono text-amber-300/90 font-medium block">
                        {channel.handle}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full ${channel.colorClass.badgeBg} border ${channel.colorClass.badgeBorder} ${channel.colorClass.badgeText} text-[10px] font-mono flex items-center gap-1 shrink-0`}>
                    {getChannelBadgeIcon(channel.id)}
                    <span>{channel.badge}</span>
                  </span>
                </div>

                {/* Tagline & Purpose */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold text-slate-200 leading-snug">
                    {channel.tagline}
                  </h5>
                  <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">
                    {channel.description}
                  </p>
                </div>

                {/* Content Highlights List */}
                <ul className="space-y-1.5 pt-1 border-t border-white/[0.06] text-[11px] text-slate-300">
                  {channel.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${channel.colorClass.badgeBg} border ${channel.colorClass.badgeBorder}`} />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons Row */}
              <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex items-center gap-2">
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`btn-social-open-${channel.id}`}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${channel.colorClass.buttonBg} ${channel.colorClass.buttonHover}`}
                  title={`Mở trang ${channel.platform} chính thức trong tab mới`}
                >
                  <span>{channel.actionText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={(e) => handleCopy(channel.url, channel.id, e)}
                  id={`btn-social-copy-${channel.id}`}
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                  title="Sao chép đường dẫn trực tiếp"
                  aria-label={`Sao chép liên kết ${channel.platform}`}
                >
                  {isCopied ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
