// ==========================================================
// AURORA DESTINY AI — LUXURY SCIENTIFIC FOOTER
// Developed & Engineered by Giáo Sư - Prof.TOAN
// Contact: havantoancntt@gmail.com
// ==========================================================

import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Copy,
  Check,
  Award,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
  ArrowUp,
  FileCheck2,
  Atom,
  Binary,
  Heart,
  QrCode,
  Search,
  Crown
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';

interface Props {
  language?: LanguageCode;
  onOpenPrivacyCenter?: () => void;
  onOpenReportModal?: () => void;
  onOpenAdminModal?: () => void;
  onOpenSponsorshipModal?: () => void;
  onOpenInternationalModal?: () => void;
  onOpenSeoKnowledgeModal?: () => void;
  onOpenTalismanModal?: () => void;
  hasFloatingDock?: boolean;
}

export const AppFooter: React.FC<Props> = ({
  language = 'vi',
  onOpenPrivacyCenter,
  onOpenReportModal,
  onOpenAdminModal,
  onOpenSponsorshipModal,
  onOpenInternationalModal,
  onOpenSeoKnowledgeModal,
  onOpenTalismanModal,
  hasFloatingDock = false
}) => {
  const [copied, setCopied] = useState(false);
  const email = 'havantoancntt@gmail.com';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isVi = language === 'vi';

  return (
    <footer id="app-luxury-footer" className="w-full relative z-20 mt-16 sm:mt-20 border-t border-white/[0.08] bg-[#06070d]/95 backdrop-blur-2xl text-slate-300 transition-colors">
      {/* Top Specular Ambient Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 via-amber-400/40 to-transparent pointer-events-none" />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
        hasFloatingDock ? 'pt-10 sm:pt-14 pb-32 sm:pb-36' : 'py-10 sm:py-14'
      }`}>
        {/* Unified Master Academic Signature Card */}
        <div className="relative mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] via-white/[0.015] to-transparent border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Author identity & honorific */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400/40 via-teal-400/30 to-purple-500/30 p-0.5 shadow-lg flex items-center justify-center border border-white/15">
                  <div className="w-full h-full bg-[#0a0c16] rounded-[14px] flex flex-col items-center justify-center">
                    <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-[9px] font-bold text-slate-950 font-mono tracking-wider shadow">
                  PROF
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] sm:text-xs font-mono font-medium tracking-wide flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-300" />
                    {isVi ? 'Chủ Nhiệm Nghiên Cứu' : 'Lead Architect'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-[10px] sm:text-xs font-mono">
                    {isVi ? 'Kênh Huyền Phong Phật Đạo' : 'Huyền Phong Phật Đạo Channel'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-tight">
                  Giáo Sư - Prof.TOAN
                </h3>

                <p className="text-xs sm:text-sm text-slate-300/80 font-light mt-1.5 max-w-2xl leading-relaxed">
                  {isVi ? (
                    <>
                      Ứng dụng chính thức trực thuộc kênh <strong className="text-amber-300/90 font-medium">Huyền Phong Phật Đạo</strong>. Nền tảng hội tụ tinh hoa tri thức Tử Vi Đẩu Số 108 Tinh Bàn, Bát Tự Hà Lạc 24 Tiết Khí thiên văn VSOP87 và hệ thống đa tác tử Multi-Agent AI chuẩn xác, phụng sự cộng đồng phi thương mại.
                    </>
                  ) : (
                    <>
                      Official platform of the <strong className="text-amber-300/90 font-medium">Huyền Phong Phật Đạo</strong> channel, conceived and developed by <strong className="text-white font-medium">Prof.TOAN</strong>. A deterministic convergence of astronomical astrodynamics, solar terms, and multi-agent AI.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {onOpenSponsorshipModal && (
                <button
                  id="btn-footer-support-channel"
                  onClick={onOpenSponsorshipModal}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-teal-500/15 border border-amber-400/40 text-amber-200 hover:text-white hover:border-amber-300 hover:bg-amber-500/25 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  title="Ủng hộ kênh & Mời cà phê Giáo Sư TOAN"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30 group-hover:scale-110 transition-transform" />
                  <span>{isVi ? 'Đồng Hành & Ủng Hộ Kênh' : 'Patronage & Support'}</span>
                </button>
              )}

              <a
                id="btn-footer-mailto"
                href={`mailto:${email}?subject=${encodeURIComponent('Liên hệ Học thuật / Kỹ thuật - Aurora Destiny AI (Prof.TOAN)')}`}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                title="Gửi thư trực tiếp tới Giáo Sư - Prof.TOAN"
              >
                <Mail className="w-4 h-4 text-slate-950" />
                <span>{isVi ? 'Liên Hệ Học Thuật' : 'Contact Research'}</span>
              </a>

              <button
                id="btn-footer-copy-email"
                onClick={handleCopyEmail}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs sm:text-sm font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Sao chép địa chỉ email"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">{isVi ? 'Đã sao chép email' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{email}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: System Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                A
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-white uppercase block">
                  Aurora <span className="text-teal-400">Destiny</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300/80 uppercase tracking-wider">
                  Huyền Phong Phật Đạo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-light leading-relaxed">
              {isVi
                ? 'Nền tảng luận giải Bát Tự & Tử Vi Đẩu Số tiêu chuẩn quốc tế. Tối ưu hóa thuật toán với độ chính xác cao, không thiên kiến, bảo mật cục bộ.'
                : 'International standard destiny intelligence platform. Multi-agent consensus, astronomical accuracy, zero-superstition.'}
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-teal-300/90">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Hệ Thống Phân Tích: Sẵn Sàng</span>
            </div>
          </div>

          {/* Column 2: Astronomical Engine Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-teal-400" />
              {isVi ? 'Cốt Lõi Cổ Học & Thiên Văn' : 'Astronomical Core'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Thuật toán Kinh độ Mặt Trời xác định chuẩn xác 24 Tiết Khí.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Bát Tự Tứ Trụ, Thập Thần, Nạp Âm 60 Hoa Giáp &amp; Dụng Thần.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Tử Vi Đẩu Số 14 Chính Tinh, Lục Cát Tinh, Tứ Sát Tinh 12 Cung.</span>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Architecture & Anti-Hallucination */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              {isVi ? 'Trí Tuệ Nhân Tạo AI' : 'Multi-Agent AI'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Hợp xướng 7 Chuyên Gia AI phân tích đồng thuận đa góc nhìn.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Cơ chế Rào cản Zero-Hallucination: Tuyệt đối theo dữ kiện lá số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Kiểm chứng Backtesting đối chiếu mốc lịch sử thực tế.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Ethical Principles & Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isVi ? 'Quyền Riêng Tư & Bảo Mật' : 'Privacy & Security'}
            </h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              {isVi
                ? 'Tuyệt đối tôn trọng quyền riêng tư. Dữ liệu ngày sinh và phân tích của bạn được lưu trữ mã hóa cục bộ ngay trên thiết bị.'
                : 'Privacy first. All birth data and calculated matrices remain encrypted on your local device.'}
            </p>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <span>Liên hệ:</span>
                <a
                  href={`mailto:${email}`}
                  className="text-teal-300 hover:underline transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Badges Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-white/[0.08] text-slate-400 text-xs font-mono mb-8">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300/80">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Kiến Trúc Chuẩn Prof.TOAN</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-300/80">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Thiên Văn VSOP87 24 Tiết Khí</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-300/80">
              <Binary className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đồng Thuận 7 Multi-Agents</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mã Hóa Cục Bộ 100% Client-Side</span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all text-xs cursor-pointer ml-auto"
            title="Lên đầu trang"
          >
            <span>Đầu trang</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Bar: Copyright & Navigation Shortcuts */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center md:text-left leading-relaxed">
            <p>
              Bản quyền © 2024–2026 <span className="text-white font-medium">Aurora Destiny AI</span> • Kênh <strong className="text-amber-300/90 font-medium">Huyền Phong Phật Đạo</strong> • <strong className="text-white font-medium">Giáo Sư - Prof.TOAN</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {onOpenTalismanModal && (
              <button
                id="btn-footer-talisman-modal"
                onClick={onOpenTalismanModal}
                className="text-amber-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                title="Khai mở Thẻ Mệnh Kim Giáp 3D & Bia Vàng Công Đức"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isVi ? 'Thẻ Kim Giáp & Bia Vàng' : 'Talisman & Patrons'}</span>
              </button>
            )}
            {onOpenSeoKnowledgeModal && (
              <button
                id="btn-footer-seo-center"
                onClick={onOpenSeoKnowledgeModal}
                className="text-amber-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-medium"
                title="Khám phá Trung tâm Tối ưu SEO, Sơ đồ Web và JSON-LD"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>{isVi ? 'Tối Ưu SEO & Sơ Đồ Web' : 'SEO & Sitemaps'}</span>
              </button>
            )}
            {onOpenInternationalModal && (
              <button
                id="btn-footer-international-settings"
                onClick={onOpenInternationalModal}
                className="text-teal-300 hover:underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isVi ? 'Cài Đặt Quốc Tế' : 'Global Settings'}</span>
              </button>
            )}
            {onOpenPrivacyCenter && (
              <button
                onClick={onOpenPrivacyCenter}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isVi ? 'Chính Sách Riêng Tư' : 'Privacy Center'}
              </button>
            )}
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isVi ? 'Xuất Hồ Sơ PDF' : 'Export Dossier'}
              </button>
            )}
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isVi ? 'Quản Trị & Kiểm Thử' : 'Audit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

