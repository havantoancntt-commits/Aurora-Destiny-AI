// ==========================================
// EXECUTIVE DESTINY DOSSIER & REPORT MODAL
// "Sách Bản Mệnh Tinh Hoa" - Master Publishing Edition
// ==========================================

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Printer,
  X,
  Sparkles,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Palette,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Info,
  Share2,
  ExternalLink,
  FileCode,
  Loader2,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { PALACE_DEFS } from '../engine/ziwei';
import { LanguageCode } from '../types/destiny';
import {
  DossierTheme,
  DossierPage1Cover,
  DossierPage2Bazi,
  DossierPage3Decades,
  DossierPage4ZiWei,
  DossierPage5FengShui,
  DossierPage6Epilogue
} from './ExecutiveDossierPages';
import {
  exportDossierToPDF,
  exportOfflineHtmlBook,
  openInDedicatedPrintWindow,
  shareOrCopyDossier,
  sanitizeFileName,
  isMobileDevice,
  ExportProgress
} from '../utils/pdfExport';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  backtest: BacktestResult;
  language: LanguageCode;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<Props> = ({
  profile,
  calculation,
  ensemble,
  backtest,
  language,
  onClose
}) => {
  // Modal format mode: 'book' (Sách Bản Mệnh 6 Trang) or 'brief' (Báo Cáo Tóm Tắt)
  const [formatMode, setFormatMode] = useState<'book' | 'brief'>('book');

  // Book luxury theme
  const [theme, setTheme] = useState<DossierTheme>('navy');

  // Page view mode: 'single' (lật trang) or 'all' (cuộn liên tục)
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedCodexId, setCopiedCodexId] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showPrintTips, setShowPrintTips] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // PDF Export Engine States
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [lastExportedBlob, setLastExportedBlob] = useState<Blob | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const pdfRenderRef = useRef<HTMLDivElement>(null);
  const isMobile = useMemo(() => isMobileDevice(), []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Generate deterministic Unique Codex ID
  const codexId = useMemo(() => {
    const rawHash = (profile.name + profile.birthData.solarYear + profile.id)
      .split('')
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7919);
    const hex = Math.abs(rawHash).toString(16).toUpperCase().padStart(5, '0');
    return `CODEX-AURA-${profile.birthData.solarYear}-${hex}`;
  }, [profile]);

  const handlePrint = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  /**
   * 1. Direct PDF Download Handler (Smart Mobile & Desktop)
   */
  const handleDirectDownloadPDF = async () => {
    setIsExportMenuOpen(false);
    if (!pdfRenderRef.current) {
      setExportError('Không thể khởi tạo vùng xuất bản PDF.');
      return;
    }
    setIsExportingPDF(true);
    setExportError(null);
    setExportProgress({
      currentPage: 1,
      totalPages: 6,
      statusText: 'Đang chuẩn bị trang 1/6 (Bìa Hoàng Gia)...',
      percent: 10
    });

    const cleanName = sanitizeFileName(profile.name || 'Ban_Menh');
    const fileName = `Sach_Ban_Menh_${cleanName}_${codexId}.pdf`;

    const result = await exportDossierToPDF(pdfRenderRef.current, fileName, (p) => {
      setExportProgress(p);
    });

    setIsExportingPDF(false);
    if (result.success && result.blob) {
      setLastExportedBlob(result.blob);
      setExportSuccessMessage(`Đã tải thành công file ${fileName} về máy!`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } else {
      setExportError(
        result.error ||
          'Có lỗi khi tạo file PDF. Bạn có thể chọn "Tải Sách Offline (.HTML)" hoặc "Mở Tab Mới Để In".'
      );
    }
  };

  /**
   * 2. Standalone Offline HTML E-Book Handler
   */
  const handleDownloadHtmlBook = () => {
    setIsExportMenuOpen(false);
    if (!pdfRenderRef.current) return;
    const cleanName = sanitizeFileName(profile.name || 'Ban_Menh');
    const fileName = `Sach_Ban_Menh_${cleanName}_${codexId}.html`;
    const ok = exportOfflineHtmlBook(
      pdfRenderRef.current,
      `Sách Bản Mệnh — ${profile.name}`,
      fileName
    );
    if (ok) {
      setExportSuccessMessage(
        `Đã tải file Sách Offline (${fileName}) về máy! Mở xem mọi lúc không cần mạng.`
      );
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } else {
      setExportError('Không thể tạo file HTML offline.');
    }
  };

  /**
   * 3. Dedicated Tab Print Window (Bypasses Iframe Sandbox)
   */
  const handleOpenDedicatedPrint = () => {
    setIsExportMenuOpen(false);
    if (!pdfRenderRef.current) return;
    const ok = openInDedicatedPrintWindow(
      pdfRenderRef.current,
      `Sách Bản Mệnh — ${profile.name}`
    );
    if (!ok) {
      setExportError(
        'Trình duyệt đang chặn mở tab mới (Pop-up). Hãy cho phép Pop-up hoặc bấm "Tải File PDF Về Máy".'
      );
    }
  };

  /**
   * 4. Web Share API & Summary
   */
  const handleShareDossier = async () => {
    setIsExportMenuOpen(false);
    const favorableStr = calculation.bazi.favorableElements
      .map((e) => ELEMENT_RELATIONS[e]?.vi || e)
      .join(', ');

    const summary = `📜 SÁCH BẢN MỆNH TINH HOA — AURORA DESTINY AI
Hồ Sơ: ${profile.name} (Sinh: ${profile.birthData.solarDay}/${profile.birthData.solarMonth}/${profile.birthData.solarYear})
Mã Hồ Sơ Codex: ${codexId}
Cách Cục: ${calculation.bazi.structureType}
Dụng Thần: ${favorableStr}
Điểm Nhất Quán: ${ensemble.overallConsistencyScore}/100

"Hiểu quy luật chu kỳ để kiến tạo tương lai tự chủ."
Bản quyền nghiên cứu: Aurora Destiny AI & GS.TOAN`;

    const cleanName = sanitizeFileName(profile.name || 'Ban_Menh');
    const fileName = `Sach_Ban_Menh_${cleanName}_${codexId}.pdf`;

    const result = await shareOrCopyDossier(
      `Sách Bản Mệnh — ${profile.name}`,
      summary,
      lastExportedBlob || undefined,
      fileName
    );

    if (result.shared) {
      setExportSuccessMessage('Đã chia sẻ thành công!');
      setTimeout(() => setExportSuccessMessage(null), 3000);
    } else if (result.copied) {
      setCopiedSummary(true);
      setExportSuccessMessage('Đã sao chép nội dung luận giải vào bộ nhớ tạm!');
      setTimeout(() => {
        setCopiedSummary(false);
        setExportSuccessMessage(null);
      }, 3000);
    }
  };

  const handleCopyCodexId = () => {
    navigator.clipboard.writeText(codexId);
    setCopiedCodexId(true);
    setTimeout(() => setCopiedCodexId(false), 2200);
  };

  const handleCopySummary = () => {
    const favorableStr = calculation.bazi.favorableElements
      .map(e => ELEMENT_RELATIONS[e]?.vi || e)
      .join(', ');

    const text = `📜 SÁCH BẢN MỆNH TINH HOA — AURORA DESTINY AI
Hồ Sơ: ${profile.name} (Sinh: ${profile.birthData.solarDay}/${profile.birthData.solarMonth}/${profile.birthData.solarYear} lúc ${profile.birthData.solarHour}:${profile.birthData.solarMinute})
Mã Hồ Sơ Codex: ${codexId}
Cách Cục Bát Tự: ${calculation.bazi.structureType} (Nhật Chủ: ${calculation.bazi.dayMaster} - ${calculation.bazi.dayMasterStrength})
Tử Vi Cục: ${calculation.ziwei.elementBureau}
Điểm Nhất Quán Đa Mô Hình: ${ensemble.overallConsistencyScore}/100

1. TỔNG QUAN CHIẾN LƯỢC VẬN TRÌNH:
${ensemble.executiveSummary}

2. DỤNG THẦN CÂN BẰNG NĂNG LƯỢNG:
Hành Bổ Khuyết: ${favorableStr}

3. THẾ MẠNH BẢN MỆNH NỔI BẬT:
${ensemble.coreStrengths.map(s => `• ${s}`).join('\n')}

"Hiểu quy luật chu kỳ để kiến tạo tương lai tự chủ."
Bản quyền nghiên cứu: Aurora Destiny AI & GS.TOAN`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
    setIsExportMenuOpen(false);
  };

  const pageNames = [
    'Bìa Sách Hoàng Gia',
    'Tứ Trụ & Ngũ Hành',
    'Vận Trình Đại Vận',
    'Tử Vi 12 Cung Vị',
    'Cẩm Nang Phong Thủy',
    'Lời Kết & Dấu Mộc'
  ];

  const pageProps = {
    profile,
    calculation,
    ensemble,
    backtest,
    theme,
    codexId
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in overflow-hidden">
      <div className="w-full max-w-6xl max-h-[96vh] flex flex-col rounded-3xl bg-[#080911] border border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* TIER 1: PRIMARY HEADER BAR (Strict 1-Row Responsive Layout, Fixed Close Button) */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-white/10 z-30">
          {/* Left: Luxury Branding & Codex Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-cinzel tracking-wide truncate">
                  {formatMode === 'book' ? 'Sách Bản Mệnh Tinh Hoa' : 'Hồ Sơ Tóm Tắt Chiến Lược'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
                  Executive Codex
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 truncate">
                <span className="text-slate-400">Mã số:</span>
                <button
                  onClick={handleCopyCodexId}
                  className="text-amber-300 hover:text-amber-200 underline font-bold flex items-center gap-1 cursor-pointer truncate"
                  title="Bấm để sao chép mã số hồ sơ"
                >
                  <span className="truncate">{codexId}</span>
                  {copiedCodexId ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  )}
                </button>
                <span className="text-slate-600 hidden md:inline">•</span>
                <span className="text-slate-400 hidden md:inline">Khổ A4 Chuẩn In Ấn</span>
              </div>
            </div>
          </div>

          {/* Right: Smart Publishing Center & Fixed Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Direct PDF Download Button for Mobile Devices */}
            <button
              id="btn-quick-download-mobile"
              onClick={handleDirectDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all cursor-pointer disabled:opacity-50 select-none"
              title="Tải trực tiếp file PDF về điện thoại"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>Tải PDF</span>
            </button>

            {/* Smart Publishing & Print Hub Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                id="btn-smart-export-hub"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all cursor-pointer select-none"
                title="Mở bảng điều khiển In ấn & Xuất file PDF thông minh"
              >
                <Printer className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Xuất Sách &amp; Lưu PDF</span>
                <span className="sm:hidden">Tùy Chọn</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Smart Dropdown Panel */}
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-950/98 border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-2.5 space-y-1.5 backdrop-blur-2xl z-50 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Trung Tâm Xuất Bản A4 Thông Minh
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Mobile &amp; Desktop
                    </span>
                  </div>

                  {/* Option 1: Direct High-Res PDF Download (PRIMARY FOR MOBILE & DESKTOP) */}
                  <button
                    onClick={handleDirectDownloadPDF}
                    disabled={isExportingPDF}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent hover:from-amber-500/25 border border-amber-500/40 text-slate-200 hover:text-white transition-all text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {isExportingPDF ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 flex-wrap">
                        <span>Tải File PDF Về Máy (A4)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-200 font-medium">Khuyên dùng</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                        Tải trực tiếp file .PDF 6 trang hoàn chỉnh vào bộ nhớ máy / mục Tệp điện thoại
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Standalone Offline HTML E-Book (INSTANT & 100% RELIABLE) */}
                  <button
                    onClick={handleDownloadHtmlBook}
                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Tải Sách Offline (.HTML)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-normal">Cực nhanh 1s</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Đọc toàn bộ 6 trang ngoại tuyến trên điện thoại không cần mạng, có sẵn nút in
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Dedicated Browser Tab (Bypasses Iframe Sandbox) */}
                  <button
                    onClick={handleOpenDedicatedPrint}
                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Mở Bản In Trong Tab Mới</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Tránh lỗi chặn iFrame, kích hoạt lệnh Lưu PDF hệ thống của điện thoại / máy tính
                      </p>
                    </div>
                  </button>

                  {/* Option 4: Direct System Print */}
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>In Trực Tiếp (A4 Máy Tính / Wi-Fi)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Khởi chạy lệnh in tiêu chuẩn khi kết nối máy in văn phòng
                      </p>
                    </div>
                  </button>

                  {/* Option 5: Web Share API & Copy Summary */}
                  <button
                    onClick={handleShareDossier}
                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Chia Sẻ / Sao Chép Tóm Tắt</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Gửi qua Zalo, Tin nhắn, Drive hoặc chép văn bản luận giải
                      </p>
                    </div>
                  </button>

                  {/* Option 6: Print & PDF Preservation Tips */}
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      setShowPrintTips(true);
                    }}
                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.08] text-slate-200 hover:text-white transition-all text-left cursor-pointer group border-t border-white/10 pt-2"
                  >
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors shrink-0 mt-0.5">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">
                        Hướng Dẫn Lưu PDF Đẹp Nhất
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Mẹo bật 'Đồ họa nền' để giữ trọn màu vàng kim hoàng gia
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Fixed Close Button - Permanently at Top-Right Corner */}
            <button
              id="btn-close-report-modal"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION BANNERS */}
        {exportSuccessMessage && (
          <div className="px-4 py-2 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in slide-in-from-top-1 z-30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {exportError && (
          <div className="px-4 py-2 bg-rose-950/90 border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-in slide-in-from-top-1 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{exportError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadHtmlBook}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 text-[10px] font-bold underline cursor-pointer"
              >
                Tải Sách Offline
              </button>
              <button
                onClick={() => setExportError(null)}
                className="text-rose-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* FULLSCREEN PROGRESS OVERLAY FOR HIGH-RES PDF GENERATION */}
        {isExportingPDF && exportProgress && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-[#0a0c16] border border-amber-500/50 p-6 shadow-[0_0_50px_rgba(251,191,36,0.25)] space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-cinzel">
                  Đang Xuất Bản Sách PDF
                </h4>
                <p className="text-xs text-amber-300 font-medium">
                  {exportProgress.statusText}
                </p>
              </div>

              {/* High-End Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Trang {exportProgress.currentPage} / {exportProgress.totalPages}</span>
                <span className="text-amber-300 font-bold">{exportProgress.percent}%</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hệ thống đang kết xuất đồ họa vector và tự động tải file .pdf về máy điện thoại / máy tính của bạn...
              </p>
            </div>
          </div>
        )}

        {/* TIER 2: FORMAT SWITCHER & READING CONTROLS STRIP */}
        <div className="px-4 sm:px-6 py-2 bg-black/60 border-b border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 z-20">
          {/* Format Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => setFormatMode('book')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formatMode === 'book'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sách Bản Mệnh (6 Trang A4)</span>
            </button>
            <button
              onClick={() => setFormatMode('brief')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formatMode === 'brief'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Báo Cáo Tóm Tắt</span>
            </button>
          </div>

          {/* Book Mode Customization (Themes, View Mode, Print Tips) */}
          {formatMode === 'book' && (
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto text-xs">
              {/* Luxury Theme Selector */}
              <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Bìa:</span>
                {[
                  { id: 'navy' as DossierTheme, label: 'Lam Dạ', dot: 'bg-blue-600' },
                  { id: 'obsidian' as DossierTheme, label: 'Huyền Ngọc', dot: 'bg-zinc-700' },
                  { id: 'jade' as DossierTheme, label: 'Ngọc Bích', dot: 'bg-emerald-600' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
                      theme === t.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Tông màu ${t.label}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* View Mode Toggle: Single Page vs All */}
              <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-[11px]">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'single' ? 'bg-white/15 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Từng Trang
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'all' ? 'bg-white/15 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cuộn 6 Trang
                </button>
              </div>

              {/* Quick Print Tip Button */}
              <button
                onClick={() => setShowPrintTips(true)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                title="Xem hướng dẫn in & xuất PDF đẹp chuẩn ấn bản"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Mẹo In</span>
              </button>
            </div>
          )}
        </div>

        {/* TIER 3: COMPACT ERGONOMIC PAGE NAVIGATOR (When in Book Mode & Single View) */}
        {formatMode === 'book' && viewMode === 'single' && (
          <div className="px-4 sm:px-6 py-2 bg-black/75 border-b border-white/5 flex items-center justify-between text-xs z-10">
            {/* Prev Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trang Trước</span>
            </button>

            {/* Current Page Label & Interactive Mini Number Pills */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-amber-300 font-cinzel">
                Trang {currentPage}/6: <span className="text-white font-sans font-normal">{pageNames[currentPage - 1]}</span>
              </span>
              <div className="hidden sm:flex items-center gap-1 ml-2">
                {[1, 2, 3, 4, 5, 6].map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-5 h-5 rounded-full text-[10px] font-mono transition-all cursor-pointer flex items-center justify-center ${
                      currentPage === pNum
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={pageNames[pNum - 1]}
                  >
                    {pNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(6, p + 1))}
              disabled={currentPage === 6}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
            >
              <span className="hidden sm:inline">Trang Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PRINT & PDF PRESERVATION TIPS MODAL */}
        {showPrintTips && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl bg-neutral-950 border border-amber-500/40 p-6 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-cinzel">
                    Mẹo In &amp; Lưu PDF Chuẩn Hoàng Gia
                  </h4>
                </div>
                <button
                  onClick={() => setShowPrintTips(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <span className="font-bold text-amber-300 block">✨ Bước Quan Trọng Nhất:</span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Trong cửa sổ Print của trình duyệt, hãy tích chọn <strong className="text-amber-300">"Đồ họa nền" (Background graphics)</strong> để hiển thị đầy đủ hoa văn viền vàng, phong cách hoàng gia và màu sắc cung vị.
                  </p>
                </div>

                <ul className="space-y-2 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong>Máy in (Destination):</strong> Chọn <em>"Lưu dưới dạng PDF" (Save as PDF)</em>.</li>
                  <li><strong>Khổ giấy (Paper size):</strong> Chọn <em>A4 (210 x 297 mm)</em>.</li>
                  <li><strong>Lề (Margins):</strong> Chọn <em>Mặc định (Default)</em> hoặc <em>Không có (None)</em>.</li>
                  <li><strong>Bố cục (Layout):</strong> Chọn <em>Dọc (Portrait)</em>.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowPrintTips(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowPrintTips(false);
                    handlePrint();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Đã hiểu &amp; In Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN VIEWER CANVAS */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#04050a] flex flex-col items-center scrollbar-thin">
          
          {/* FORMAT 1: SÁCH BẢN MỆNH TINH HOA (A4 PUBLISHING PAGES) */}
          {formatMode === 'book' ? (
            <div className="w-full max-w-4xl space-y-8 flex flex-col items-center py-2">
              
              {/* If Single View: Render Current Page */}
              {viewMode === 'single' ? (
                <div className="transition-all duration-300 transform scale-100 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
                  {currentPage === 1 && <DossierPage1Cover {...pageProps} />}
                  {currentPage === 2 && <DossierPage2Bazi {...pageProps} />}
                  {currentPage === 3 && <DossierPage3Decades {...pageProps} />}
                  {currentPage === 4 && <DossierPage4ZiWei {...pageProps} />}
                  {currentPage === 5 && <DossierPage5FengShui {...pageProps} />}
                  {currentPage === 6 && <DossierPage6Epilogue {...pageProps} />}
                </div>
              ) : (
                /* If Continuous View: Render All 6 Pages Sequentially */
                <div className="space-y-8 w-full flex flex-col items-center">
                  <DossierPage1Cover {...pageProps} />
                  <DossierPage2Bazi {...pageProps} />
                  <DossierPage3Decades {...pageProps} />
                  <DossierPage4ZiWei {...pageProps} />
                  <DossierPage5FengShui {...pageProps} />
                  <DossierPage6Epilogue {...pageProps} />
                </div>
              )}

            </div>
          ) : (
            /* FORMAT 2: BÁO CÁO TÓM TẮT CHIẾN LƯỢC (EXECUTIVE BRIEF) */
            <div className="w-full max-w-4xl p-6 space-y-6 bg-slate-950 text-slate-200 text-xs rounded-2xl border border-slate-800 shadow-2xl">
              {/* Cover Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                      HỒ SƠ BẢN MỆNH BẢO MẬT CAO CẤP
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white font-cinzel">
                      {profile.name}
                    </h1>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Độ Nhất Quán Mô Hình</div>
                    <div className="text-lg font-bold font-mono text-cyan-400">
                      {ensemble.overallConsistencyScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
                  <span>Sinh: {profile.birthData.solarDay}/{profile.birthData.solarMonth}/{profile.birthData.solarYear} ({profile.birthData.solarHour}:{profile.birthData.solarMinute})</span>
                  <span>Nơi sinh: {profile.birthData.birthCity}</span>
                  <span>Bản Mệnh: {calculation.bazi.structureType}</span>
                  <span>Cục: {calculation.ziwei.elementBureau}</span>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-cinzel">
                  1. TỔNG QUAN CHIẾN LƯỢC & QUY LUẬT VẬN TRÌNH
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  {ensemble.executiveSummary}
                </p>
              </div>

              {/* 2. Four Pillars Matrix */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-cinzel">
                  2. MA TRẬN TỨ TRỤ BÁT TỰ
                </h2>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  {[
                    { title: 'Trụ Giờ', p: calculation.bazi.hourPillar },
                    { title: 'Trụ Ngày (Nhật Chủ)', p: calculation.bazi.dayPillar, active: true },
                    { title: 'Trụ Tháng', p: calculation.bazi.monthPillar },
                    { title: 'Trụ Năm', p: calculation.bazi.yearPillar },
                  ].map(({ title, p, active }, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border ${active ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="text-[10px] text-slate-400">{title}</div>
                      <div className="text-sm font-bold text-white my-1 font-serif">
                        {STEMS[p.stem]?.nameVi || p.stem} {BRANCHES[p.branch]?.nameVi || p.branch}
                      </div>
                      <div className="text-[10px] text-cyan-300">{p.tenGod}</div>
                      <div className="text-[9px] text-slate-500 truncate">{p.naYin}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Five Elements & Favorable */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-300">Cân Bằng Ngũ Hành</span>
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                    <span className="text-emerald-400">Mộc {calculation.bazi.elementBalance.Wood}%</span>
                    <span className="text-rose-400">Hỏa {calculation.bazi.elementBalance.Fire}%</span>
                    <span className="text-amber-400">Thổ {calculation.bazi.elementBalance.Earth}%</span>
                    <span className="text-slate-300">Kim {calculation.bazi.elementBalance.Metal}%</span>
                    <span className="text-cyan-400">Thủy {calculation.bazi.elementBalance.Water}%</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                  <div>Dụng Thần: <strong className="text-cyan-300">{calculation.bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong></div>
                  <div>Kỵ Thần: <strong className="text-rose-300">{calculation.bazi.unfavorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong></div>
                </div>
              </div>

              {/* 4. Zi Wei 12 Palaces Overview */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-cinzel">
                  3. TỔNG HỢP 12 CUNG VỊ TỬ VI ĐẨU SỐ
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {PALACE_DEFS.map((def) => {
                    const pal = calculation.ziwei.palaces[def.key];
                    return (
                      <div key={def.key} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{def.nameVi}</span>
                          <span className="font-mono text-slate-400">{pal?.score}đ</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {pal?.majorStars?.map(s => s?.nameVi || '').filter(Boolean).join(', ') || 'Chính tinh đắc địa'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Backtesting Empirical Proof */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-cinzel">
                  4. KIỂM CHỨNG LỊCH SỬ (BACKTESTING SCORE: {backtest?.destinyConsistencyScore ?? 75}/100)
                </h2>
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/40 text-xs space-y-1.5">
                  <div>Độ tin cậy: <strong className="text-emerald-300">{backtest?.confidenceBand || 'Khả quan'}</strong> ({backtest?.totalEventsAnalyzed || 0} sự kiện đã kiểm chứng)</div>
                  {backtest?.strengthsSummary && backtest.strengthsSummary.length > 0 && (
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                      {backtest.strengthsSummary.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Legal Disclaimer & Seal */}
              <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-400 text-center space-y-1">
                <p className="italic">{ensemble?.responsibleDisclaimer || 'Báo cáo được khởi tạo trên nền tảng phân tích học thuật đa mô hình Aurora Destiny AI.'}</p>
                <p className="font-mono text-slate-400 text-[10px]">
                  Hệ thống được nghiên cứu & phát triển bởi <strong className="text-amber-300">Giáo Sư - Prof.TOAN</strong> (Liên hệ: <span className="text-teal-400">havantoancntt@gmail.com</span>) • Aurora Destiny AI Core v4.2
                </p>
              </div>
            </div>
          )}

        </div>

        {/* HIDDEN PRINT-ONLY CONTAINER FOR PERFECT A4 PRINTING
            Ensures all 6 publishing pages are sent to printer regardless of screen view mode */}
        <div className="print-dossier-root hidden print:block">
          <DossierPage1Cover {...pageProps} />
          <DossierPage2Bazi {...pageProps} />
          <DossierPage3Decades {...pageProps} />
          <DossierPage4ZiWei {...pageProps} />
          <DossierPage5FengShui {...pageProps} />
          <DossierPage6Epilogue {...pageProps} />
        </div>

        {/* OFFSCREEN A4 PUBLISHING SHELF FOR DIRECT HIGH-DPI PDF & OFFLINE HTML EXPORT
            Fixed at 794px width (standard 210mm A4) to prevent mobile screens from squishing layout */}
        <div
          ref={pdfRenderRef}
          id="pdf-offscreen-render-shelf"
          aria-hidden="true"
        >
          <DossierPage1Cover {...pageProps} />
          <DossierPage2Bazi {...pageProps} />
          <DossierPage3Decades {...pageProps} />
          <DossierPage4ZiWei {...pageProps} />
          <DossierPage5FengShui {...pageProps} />
          <DossierPage6Epilogue {...pageProps} />
        </div>

      </div>
    </div>
  );
};
