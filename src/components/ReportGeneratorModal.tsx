// ==========================================
// EXECUTIVE DESTINY DOSSIER & REPORT MODAL
// "Sách Bản Mệnh Tinh Hoa" - Master Publishing Edition
// ==========================================

import React, { useState, useRef, useMemo } from 'react';
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
  Copy,
  Check,
  Palette,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
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
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [copiedCodexId, setCopiedCodexId] = useState(false);

  // Generate deterministic Unique Codex ID
  const codexId = useMemo(() => {
    const rawHash = (profile.name + profile.birthData.solarYear + profile.id)
      .split('')
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7919);
    const hex = Math.abs(rawHash).toString(16).toUpperCase().padStart(5, '0');
    return `CODEX-AURA-${profile.birthData.solarYear}-${hex}`;
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCodexId = () => {
    navigator.clipboard.writeText(codexId);
    setCopiedCodexId(true);
    setTimeout(() => setCopiedCodexId(false), 2200);
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
        
        {/* TOP TOOLBAR & CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950/90 border-b border-white/10 z-20">
          {/* Title & Format Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-cinzel tracking-wide">
                  {formatMode === 'book' ? 'Sách Bản Mệnh Tinh Hoa' : 'Hồ Sơ Tóm Tắt Chiến Lược'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Executive Dossier
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>Mã số:</span>
                <button
                  onClick={handleCopyCodexId}
                  className="text-amber-300 hover:text-amber-200 underline font-bold flex items-center gap-1 cursor-pointer"
                  title="Bấm để sao chép mã số hồ sơ"
                >
                  <span>{codexId}</span>
                  {copiedCodexId ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFormatMode('book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                formatMode === 'book'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sách Bản Mệnh (6 Trang A4)</span>
            </button>
            <button
              onClick={() => setFormatMode('brief')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                formatMode === 'brief'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Báo Cáo Tóm Tắt</span>
            </button>
          </div>

          {/* Right Controls: Theme Selector, Print & Close */}
          <div className="flex items-center gap-2">
            {formatMode === 'book' && (
              <>
                {/* Theme Selector */}
                <div className="hidden md:flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 px-2 font-mono">Bìa:</span>
                  {[
                    { id: 'navy' as DossierTheme, label: 'Lam Dạ', dot: 'bg-blue-600' },
                    { id: 'obsidian' as DossierTheme, label: 'Huyền Ngọc', dot: 'bg-zinc-800' },
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
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle: Single vs All */}
                <div className="hidden sm:flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-[11px]">
                  <button
                    onClick={() => setViewMode('single')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'single' ? 'bg-white/15 text-amber-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Từng Trang
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'all' ? 'bg-white/15 text-amber-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Cuộn Toàn Bộ
                  </button>
                </div>
              </>
            )}

            {/* Print / Export Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
              title="In ra giấy A4 hoặc Lưu dưới dạng PDF chuẩn in ấn"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>In Sách / Lưu PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECONDARY BOOK CONTROL STRIP (When in Book Mode & Single View) */}
        {formatMode === 'book' && viewMode === 'single' && (
          <div className="px-4 sm:px-6 py-2 bg-black/60 border-b border-white/5 flex items-center justify-between text-xs z-10">
            {/* Prev Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trang Trước</span>
            </button>

            {/* Page Navigator Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[1, 2, 3, 4, 5, 6].map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentPage === pNum
                      ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{pNum}.</span>
                  <span className="hidden md:inline">{pageNames[pNum - 1]}</span>
                </button>
              ))}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(6, p + 1))}
              disabled={currentPage === 6}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer text-[11px]"
            >
              <span className="hidden sm:inline">Trang Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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

      </div>
    </div>
  );
};
