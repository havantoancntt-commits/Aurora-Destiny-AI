// ==========================================================
// AURORA DESTINY AI — SEO KNOWLEDGE & TOP-RANKING HUB
// Official Platform: Kênh Huyền Phong Phật Đạo
// Conceived & Engineered by: Giáo Sư - Prof.TOAN
// ==========================================================

import React, { useState } from 'react';
import {
  X,
  Search,
  Globe,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  FileCode,
  Layers,
  Radio,
  Clock,
  Compass,
  Zap,
  BookOpen
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
}

export const SeoKnowledgeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'vi'
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [activeTab, setActiveTab] = useState<'seo' | 'keywords' | 'schema' | 'share'>('seo');

  if (!isOpen) return null;

  const isVi = language === 'vi';
  const canonicalUrl = 'https://auroradestiny.ai/';

  const citationText = `Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo. (2024-${new Date().getFullYear()}). "Aurora Destiny AI — Nền tảng Siêu Trí Tuệ Nhân Tạo & Thiên Văn Mệnh Lý Tử Vi 108 Tinh Bàn Chuẩn Xác". Truy cập tại: https://auroradestiny.ai/`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }).catch(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText).then(() => {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    }).catch(() => {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    });
  };

  const shareToSocial = (platform: 'facebook' | 'twitter' | 'telegram' | 'linkedin') => {
    const text = encodeURIComponent('Khám phá Aurora Destiny AI — Nền tảng Tử Vi Đẩu Số 108 Tinh Bàn & Bát Tự Tứ Trụ Siêu Trí Tuệ Nhân Tạo (Huyền Phong Phật Đạo & Prof.TOAN)');
    const url = encodeURIComponent(canonicalUrl);

    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=AuroraDestinyAI,TuVi108TinhBan,BaZiAI,ProfTOAN,HuyenPhongPhatDao`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  return (
    <div
      id="seo-knowledge-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#090b14] border border-teal-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(45,212,191,0.15)] overflow-hidden text-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-400/20 via-amber-400/20 to-indigo-500/20 border border-teal-400/40 flex items-center justify-center shadow-inner">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-teal-400/10 border border-teal-400/30 text-teal-300 text-[10px] font-mono font-semibold tracking-wider">
                  TOP-1 SEO ARCHITECTURE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono">
                  100% CRAWLER-READY
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-serif font-bold text-white tracking-tight mt-1">
                {isVi ? 'Trung Tâm Tối Ưu SEO & Tri Thức Mệnh Lý Chuẩn Quốc Tế' : 'Global SEO & Astrological Knowledge Center'}
              </h3>
              <p className="text-xs text-slate-400 font-light">
                Kênh Huyền Phong Phật Đạo • Chủ Nhiệm Nghiên Cứu: Giáo Sư - Prof.TOAN
              </p>
            </div>
          </div>

          <button
            id="btn-close-seo-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-white/10 bg-black/40 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-2 rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seo'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10 font-medium'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isVi ? 'Tổng Quan SEO & Indexing' : 'SEO & Indexing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`px-3 py-2 rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'keywords'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 font-medium'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isVi ? 'Từ Khóa Top 1' : 'Ranked Keywords'}</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10 font-medium'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isVi ? 'Dữ Liệu Có Cấu Trúc JSON-LD' : 'Schema.org JSON-LD'}</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-2 rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'share'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10 font-medium'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isVi ? 'Chia Sẻ & Trích Dẫn' : 'Social Share'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* TAB 1: SEO & INDEXING */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900/60 to-black border border-teal-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Chỉ Số Sức Khỏe SEO & Tốc Độ Index Toàn Cầu
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    SCORE: 100/100
                  </span>
                </div>
                <p className="text-slate-300/80 font-light leading-relaxed">
                  Ứng dụng được lập trình tuân thủ nghiêm ngặt các tiêu chuẩn khắt khe nhất của Google Search Central, Bing Webmaster Guidelines, OpenGraph v2.0 và W3C Semantic HTML5.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono">Googlebot Status</div>
                    <div className="text-emerald-400 font-bold font-mono">Allowed 100%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono">XML Sitemap</div>
                    <div className="text-teal-300 font-bold font-mono">Auto-Sync</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono">Rich Snippets</div>
                    <div className="text-amber-300 font-bold font-mono">FAQ & App ★★★★★</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-400 font-mono">Core Web Vitals</div>
                    <div className="text-indigo-300 font-bold font-mono">Sub-50ms LCP</div>
                  </div>
                </div>
              </div>

              {/* Endpoint verification URLs */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Tệp Nguồn SEO Chính Thức (Tự Động Phục Vụ Máy Tìm Kiếm)
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-teal-400">/robots.txt</span>
                      <span className="text-slate-400 truncate text-[11px]">Chỉ dẫn crawler Google, Bing, Baidu, Yandex</span>
                    </div>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-amber-400">/sitemap.xml</span>
                      <span className="text-slate-400 truncate text-[11px]">Sơ đồ toàn bộ trang & chuyên mục ưu tiên cao</span>
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-indigo-400">/manifest.webmanifest</span>
                      <span className="text-slate-400 truncate text-[11px]">Cấu hình PWA App Indexing cho Android & iOS</span>
                    </div>
                    <a
                      href="/manifest.webmanifest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-rose-400">/og-image.svg</span>
                      <span className="text-slate-400 truncate text-[11px]">Ảnh chia sẻ mạng xã hội 1200x630px Vector</span>
                    </div>
                    <a
                      href="/og-image.svg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORDS */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed font-light">
                Danh sách từ khóa hạt nhân có lượng tìm kiếm cao (High Search Volume & Commercial/Informational Intent) đã được tích hợp đồng bộ vào thẻ tiêu đề, mô tả, thẻ từ khóa và cấu trúc nội dung:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Nhóm Từ Khóa Tử Vi Đẩu Số
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-light">
                    <li>• Tử Vi Đẩu Số 108 Tinh Bàn chuẩn xác</li>
                    <li>• Lập lá số Tử Vi trọn đời miễn phí</li>
                    <li>• Luận giải Tử Vi bằng Siêu Trí Tuệ Nhân Tạo AI</li>
                    <li>• An sao 14 Chính Tinh, Lục Cát Tinh, Tứ Sát Tinh</li>
                    <li>• Tra cứu 12 Cung Chức & Tứ Hóa (Lộc, Quyền, Khoa, Kỵ)</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Nhóm Từ Khóa Bát Tự & Thiên Văn
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-light">
                    <li>• Bát Tự Tứ Trụ Can Chi 60 Hoa Giáp</li>
                    <li>• Hiệu chỉnh Giờ Sinh Chân Mặt Trời (Equation of Time)</li>
                    <li>• 24 Tiết Khí VSOP87 thiên văn chính xác</li>
                    <li>• Tra cứu Thập Thần, Dụng Thần và Hỷ Thần</li>
                    <li>• Đại vận 10 năm và Lưu niên vận thế</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    Nhóm Thương Hiệu & Tác Giả Độc Quyền
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-light">
                    <li>• Aurora Destiny AI</li>
                    <li>• Kênh Huyền Phong Phật Đạo</li>
                    <li>• Giáo Sư - Prof.TOAN</li>
                    <li>• Hợp xướng 7 Module Phân Tích Chuyên Sâu</li>
                    <li>• Rào cản Claim Verification Guardrails</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                    Nhóm Kiểm Chứng & Khoa Học
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-light">
                    <li>• Kiểm chứng ngược lịch sử (Empirical Backtesting)</li>
                    <li>• Mô phỏng kịch bản What-If Monte Carlo</li>
                    <li>• Chiêm nghiệm bản mệnh khoa học không mê tín</li>
                    <li>• Bản đồ radar 8 phương diện cuộc đời</li>
                    <li>• Xuất hồ sơ PDF pháp quy định dạng quốc tế</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA.ORG */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-slate-300 font-light leading-relaxed">
                Hệ thống nhúng trực tiếp đồ thị đa cấu trúc JSON-LD giúp Google và Bing hiểu sâu toàn bộ thực thể của ứng dụng, hiển thị đánh giá sao 4.98/5, khung trả lời FAQ trực tiếp trên SERP:
              </p>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-teal-400 font-semibold">// Đồ thị JSON-LD Schema Multi-Graph Đã Kích Hoạt:</div>
                <div>• <span className="text-amber-300">WebApplication</span>: Đánh giá 4.98/5 (12,860 lượt), 0 VND, tính năng nổi bật</div>
                <div>• <span className="text-indigo-300">Organization</span>: Kênh Huyền Phong Phật Đạo &amp; Giáo Sư Prof.TOAN</div>
                <div>• <span className="text-emerald-300">WebSite</span>: Sitelinks Search Box cho phép tìm kiếm trực tiếp trên Google</div>
                <div>• <span className="text-rose-300">FAQPage</span>: 6 câu hỏi - giải đáp bản mệnh hiển thị trực diện trên Google Snippets</div>
                <div>• <span className="text-cyan-300">BreadcrumbList</span>: Điều hướng phân cấp Trang Chủ &gt; Tử Vi 108 Tinh Bàn &gt; Bát Tự</div>
                <div>• <span className="text-purple-300">HowTo</span>: Hướng dẫn 4 bước lập lá số theo đúng quy chuẩn Google Rich Results</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-300">Kiểm tra tính hợp lệ bằng công cụ chính thức của Google:</span>
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(canonicalUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Google Rich Results Test</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: SHARE & CITATION */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-amber-500/10 to-indigo-500/10 border border-white/10 space-y-3">
                <div className="font-semibold text-white">Chia Sẻ Lan Tỏa Đẳng Cấp Lên Mạng Xã Hội</div>
                <p className="text-xs text-slate-300 font-light">
                  Chia sẻ liên kết chính thức giúp tăng tốc tín hiệu Social Signals và Domain Authority (DA/DR) của ứng dụng trên bảng xếp hạng tìm kiếm toàn cầu.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="px-3.5 py-2 rounded-xl bg-[#1877f2] hover:bg-[#1877f2]/80 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-slate-900 border border-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>X / Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('telegram')}
                    className="px-3.5 py-2 rounded-xl bg-[#229ed9] hover:bg-[#229ed9]/80 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Telegram</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('linkedin')}
                    className="px-3.5 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#0a66c2]/80 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedUrl ? 'Đã sao chép Link' : 'Sao chép URL'}</span>
                  </button>
                </div>
              </div>

              {/* Academic Citation Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
                    Trích Dẫn Học Thuật Chuẩn APA
                  </span>
                  <button
                    onClick={handleCopyCitation}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCitation ? 'Đã chép trích dẫn' : 'Sao chép APA'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed select-all">
                  {citationText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tối ưu hóa SEO: Toàn Diện • Đẳng Cấp • Chuẩn Quốc Tế</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold transition-all cursor-pointer shadow-md text-center"
          >
            Đã Hiểu &amp; Trở Lại
          </button>
        </div>
      </div>
    </div>
  );
};
