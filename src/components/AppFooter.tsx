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
  Compass,
  ArrowUp,
  FileCheck2,
  Atom,
  Binary,
  Layers,
  Heart,
  CreditCard,
  QrCode,
  Coffee
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';

interface Props {
  language?: LanguageCode;
  onOpenPrivacyCenter?: () => void;
  onOpenReportModal?: () => void;
  onOpenAdminModal?: () => void;
  onOpenSponsorshipModal?: () => void;
  onOpenInternationalModal?: () => void;
  hasFloatingDock?: boolean;
}

export const AppFooter: React.FC<Props> = ({
  language = 'vi',
  onOpenPrivacyCenter,
  onOpenReportModal,
  onOpenAdminModal,
  onOpenSponsorshipModal,
  onOpenInternationalModal,
  hasFloatingDock = false
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const email = 'havantoancntt@gmail.com';
  const accountNumber = '0501000160764';

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

  const handleCopyBank = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(accountNumber).then(() => {
        setCopiedBank(true);
        setTimeout(() => setCopiedBank(false), 2500);
      }).catch(() => {
        setCopiedBank(true);
        setTimeout(() => setCopiedBank(false), 2500);
      });
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isVi = language === 'vi';

  return (
    <footer id="app-luxury-footer" className="w-full relative z-20 mt-12 sm:mt-16 border-t border-white/10 bg-[#05060b]/95 backdrop-blur-2xl text-slate-300 transition-colors">
      {/* Top Specular Ambient Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 via-teal-400/60 via-purple-500/50 to-transparent pointer-events-none" />
      <div className="absolute -top-16 inset-x-0 h-16 bg-gradient-to-b from-transparent to-[#05060b]/70 pointer-events-none" />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
        hasFloatingDock ? 'pt-10 sm:pt-14 pb-32 sm:pb-36' : 'py-10 sm:py-14'
      }`}>
        {/* Top Feature Spotlight: Lead Author & Academic Architect Showcase */}
        <div className="relative mb-10 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/[0.08] via-purple-950/[0.25] to-teal-950/[0.25] border border-amber-400/25 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(251,191,36,0.2)] overflow-hidden group">
          {/* Subtle background ambient radial light */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Author identity & honorific */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              {/* Professor Avatar / Crest */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-teal-400 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.35)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0c0d18] rounded-[14px] flex flex-col items-center justify-center">
                    <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-bold text-black font-mono tracking-wider shadow">
                  PROF
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-300" />
                    {isVi ? 'Tổng Công Trình Sư & Tác Giả Hệ Thống' : 'Lead Architect & Chief Researcher'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-400/15 border border-purple-400/30 text-purple-300 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider">
                    {isVi ? 'Kênh Huyền Phong Phật Đạo' : 'Huyền Phong Phật Đạo Channel'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/30 text-teal-300 text-[10px] sm:text-xs font-mono">
                    AI & Computer Science
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-teal-200 bg-clip-text text-transparent">
                    Giáo Sư - Prof.TOAN
                  </span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300/90 font-light mt-1 max-w-2xl leading-relaxed">
                  {isVi ? (
                    <>
                      Ứng dụng chính thức trực thuộc kênh <strong className="text-amber-300 font-semibold">Huyền Phong Phật Đạo</strong>, được nghiên cứu, kiến tạo và phát triển chuyên sâu bởi <strong className="text-amber-200 font-semibold">Giáo Sư - Prof.TOAN</strong>. Hệ thống là sự kết tinh giữa phương pháp vi tích phân lượng tử, thuật toán thiên văn Tiết Khí chính xác cùng mô hình Multi-Agent AI nhằm mang lại la bàn năng lượng chân thực và giá trị nhất cho người dùng.
                    </>
                  ) : (
                    <>
                      Official platform of the <strong className="text-amber-300 font-semibold">Huyền Phong Phật Đạo</strong> channel, conceived, designed, and engineered by <strong className="text-amber-200 font-semibold">Professor Prof.TOAN</strong>. An elite convergence of astronomical astrodynamics, 24 solar terms, and Multi-Agent AI systems for personal empowerment and strategic foresight.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Interactive Contact Action Center */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {onOpenSponsorshipModal && (
                <button
                  id="btn-footer-support-channel"
                  onClick={onOpenSponsorshipModal}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/25 via-amber-500/25 to-emerald-500/25 border border-amber-400/50 text-amber-200 hover:text-white hover:border-amber-300 hover:bg-amber-500/35 text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_28px_rgba(251,191,36,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  title="Ủng hộ kênh & Mời cà phê Giáo Sư TOAN"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">{isVi ? 'Ủng Hộ Kênh / Dự Án' : 'Support Channel'}</span>
                </button>
              )}

              <a
                id="btn-footer-mailto"
                href={`mailto:${email}?subject=${encodeURIComponent('Liên hệ & Hợp tác Học thuật / Kỹ thuật - Aurora Destiny AI (Prof.TOAN)')}`}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:shadow-[0_0_28px_rgba(45,212,191,0.5)] hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Gửi thư trực tiếp tới Giáo Sư - Prof.TOAN"
              >
                <Mail className="w-4 h-4 text-slate-950" />
                <span className="tracking-wide">{isVi ? 'Gửi Thư Trực Tiếp' : 'Send Direct Mail'}</span>
              </a>

              <button
                id="btn-footer-copy-email"
                onClick={handleCopyEmail}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs sm:text-sm font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                title="Sao chép địa chỉ email vào clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                    <span className="text-emerald-300 font-semibold">{isVi ? 'Đã sao chép email!' : 'Email copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
                    <span className="text-slate-200 font-medium">{email}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Sponsorship & Academic Patronage Showcase (Tế Nhị & Đẳng Cấp) */}
        <div className="relative mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#061e14]/60 via-[#0a1120]/80 to-[#190e24]/60 border border-amber-400/25 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400/40" />
                  {isVi ? 'Góc Đồng Hành & Ủng Hộ Kênh Huyền Phong Phật Đạo' : 'Patronage & Channel Support'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Vietcombank • HA VAN TOAN
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                {isVi ? 'Tiếp Lửa Tri Thức — Đồng Hành Cùng Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN' : 'Support Scientific Open-Access Research'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {isVi ? (
                  <>
                    Mọi đóng góp, mời tách trà ấm hay cà phê từ Quý vị là nguồn động lực to lớn giúp kênh <strong className="text-amber-200 font-medium">Huyền Phong Phật Đạo</strong> duy trì máy chủ điện toán AI và liên tục nâng cấp thuật toán Bát Tự & Tử Vi phụng sự cộng đồng phi thương mại.
                  </>
                ) : (
                  <>
                    Your voluntary support helps cover server infrastructure costs and allows Professor Prof.TOAN and the Huyền Phong Phật Đạo channel to keep expanding this research platform for the global community.
                  </>
                )}
              </p>

              {/* Fast Direct Bank Snapshot */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs font-mono">
                <div className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-emerald-500/30 flex items-center gap-2 text-slate-200">
                  <span className="text-emerald-400 font-bold">VCB:</span>
                  <span className="text-amber-300 font-bold tracking-wider">{accountNumber}</span>
                  <button
                    onClick={handleCopyBank}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/10 text-slate-300">
                  <span className="text-slate-400">Chủ TK:</span> <strong className="text-white">HA VAN TOAN</strong>
                </div>

                {copiedBank && (
                  <span className="text-emerald-400 text-[11px] font-medium animate-in fade-in">
                    ✓ Đã sao chép STK Vietcombank!
                  </span>
                )}
              </div>
            </div>

            {/* Action Trigger for Full Metal Card & VietQR Modal */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {onOpenSponsorshipModal && (
                <button
                  onClick={onOpenSponsorshipModal}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>{isVi ? 'Mở Thẻ Vietcombank & Mã VietQR' : 'View Vietcombank Card & QR'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Core Pillars: 4-Column High-Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: System Identity */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                A
              </div>
              <div>
                <span className="text-sm font-bold tracking-wider text-white uppercase block">
                  Aurora Destiny <span className="text-teal-400">AI</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300/90 uppercase tracking-widest">
                  Kênh Huyền Phong Phật Đạo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-light leading-relaxed">
              {isVi
                ? 'Ứng dụng chính thức trực thuộc kênh Huyền Phong Phật Đạo. Nền tảng Siêu Trí Tuệ Nhân Tạo & Thiên Văn Mệnh Lý kết hợp giữa kho tàng tri thức Bát Tự Hà Lạc, Tử Vi Đẩu Số 108 Tinh Bàn và hệ thống phân tích xác suất đa tác tử chuyên sâu.'
                : 'Official platform of the Huyền Phong Phật Đạo channel. Next-generation personal destiny & life pattern analysis platform combining traditional wisdom, data analytics, backtesting, and multi-agent AI.'}
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-teal-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Engine Status: Online & Deterministic</span>
            </div>
          </div>

          {/* Column 2: Astronomical Engine Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-teal-400" />
              {isVi ? 'Chuẩn Thiên Văn Cổ Học' : 'Astronomical Core'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Thuật toán Kinh độ Mặt Trời xác định chuẩn xác 24 Tiết Khí Lập Xuân.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Bát Tự Tứ Trụ, Thập Thần, Nạp Âm 60 Hoa Giáp & Dụng Thần điều hòa.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span>Tử Vi Đẩu Số 14 Chính Tinh, Lục Cát Tinh, Tứ Sát Tinh & Tinh Bàn 12 Cung.</span>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Architecture & Anti-Hallucination */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              {isVi ? 'Kiến Trúc AI Đa Chuyên Gia' : 'Multi-Agent Intelligence'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Hợp xướng 7 Chuyên Gia AI (Multi-Agent Ensemble) phân tích đồng thuận.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Cơ chế Grounded Truth & Rào cản Zero-Hallucination: Tuyệt đối trích dẫn bằng chứng thực từ lá số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Studio Backtesting kiểm chứng đối chiếu độ khớp các mốc lịch sử đời thực.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Ethical Principles & Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isVi ? 'Đạo Đức Khoa Học & Bảo Mật' : 'Ethics & Security'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isVi
                ? 'Tuyệt đối bài trừ mê tín dị đoan. Hệ thống coi vận trình là sóng năng lượng xác suất nhằm định hướng tư duy chiến lược và tăng cường quyền tự chủ của con người.'
                : 'Strictly rational & anti-superstition. Destiny is viewed as a scientific probability field to empower human agency and disciplined execution.'}
            </p>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <span>Liên hệ Giáo Sư:</span>
                <a
                  href={`mailto:${email}`}
                  className="text-amber-300 hover:underline hover:text-amber-200 transition-colors"
                >
                  {email}
                </a>
              </div>
              <span className="text-slate-500 text-[10px]">Prof.TOAN Computing & Astrodynamics Lab</span>
            </div>
          </div>
        </div>

        {/* Quality Badges Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-white/10 text-slate-400 text-xs font-mono mb-8">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 text-amber-300/90">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Prof.TOAN Certified AI Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-300/90">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
              <span>VSOP87 Astronomical Solar Model</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300/90">
              <Binary className="w-3.5 h-3.5 text-purple-400" />
              <span>7-Agent Consensus Score Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300/90">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side AES Encrypted Storage</span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs cursor-pointer ml-auto"
            title="Lên đầu trang"
          >
            <span>Đầu trang</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Bar: Copyright & Contact Confirmation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center md:text-left leading-relaxed">
            <p>
              Bản quyền © 2024–2026 <span className="text-white font-semibold">Aurora Destiny AI</span> — Ứng dụng chính thức của kênh <strong className="text-amber-300 font-semibold">Huyền Phong Phật Đạo</strong>. 
              Được nghiên cứu & phát triển bởi <strong className="text-amber-300 font-semibold">Giáo Sư - Prof.TOAN</strong>.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hộp thư học thuật & công nghệ: <a href={`mailto:${email}`} className="text-teal-400 hover:underline">{email}</a> • Mọi quyền được bảo lưu trên toàn cầu.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {onOpenInternationalModal && (
              <button
                id="btn-footer-international-settings"
                onClick={onOpenInternationalModal}
                className="text-teal-300 hover:text-teal-200 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isVi ? 'Cài Đặt Quốc Tế & Múi Giờ' : 'Global Settings & Timezone'}</span>
              </button>
            )}
            {onOpenPrivacyCenter && (
              <button
                onClick={onOpenPrivacyCenter}
                className="text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
              >
                {isVi ? 'Chính Sách Riêng Tư' : 'Privacy Center'}
              </button>
            )}
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {isVi ? 'Xuất Hồ Sơ PDF' : 'Export Dossier'}
              </button>
            )}
            {onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                {isVi ? 'Kiểm Thử Thuật Toán' : 'Algorithmic Audit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
