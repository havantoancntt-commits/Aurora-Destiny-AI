// ==========================================
// EXECUTIVE DESTINY DOSSIER - 6 PUBLISHING PAGES
// Meets Master Edition Print Standards (A4 210x297mm)
// ==========================================

import React from 'react';
import {
  Sparkles,
  Award,
  Shield,
  Compass,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  BookOpen
} from 'lucide-react';
import { CalculationResult, ZiWeiPalace, PalaceKey, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { PALACE_DEFS } from '../engine/ziwei';
import { generateDestinyRemedies } from '../engine/remedies';
import { DigitalVermilionSeal, ProfToanSignature, AlgorithmicWarrantyBadge } from './ExecutiveCodexSeal';

export type DossierTheme = 'navy' | 'obsidian' | 'jade';

interface PageProps {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  backtest: BacktestResult;
  theme: DossierTheme;
  codexId: string;
}

// Color Theme tokens
const THEME_STYLES = {
  navy: {
    pageBg: 'bg-[#050814]',
    borderPrimary: 'border-amber-500/40',
    borderSecondary: 'border-blue-900/40',
    accentText: 'text-amber-300',
    accentGold: 'text-amber-400',
    headerGradient: 'from-amber-200 via-amber-400 to-amber-200',
    badgeBg: 'bg-blue-950/60 border-amber-500/30 text-amber-200',
    subCard: 'bg-slate-900/70 border-slate-800',
    filigree: '#fbbf24'
  },
  obsidian: {
    pageBg: 'bg-[#060608]',
    borderPrimary: 'border-amber-500/50',
    borderSecondary: 'border-zinc-800',
    accentText: 'text-amber-200',
    accentGold: 'text-amber-300',
    headerGradient: 'from-yellow-200 via-amber-300 to-yellow-100',
    badgeBg: 'bg-zinc-900/80 border-amber-500/40 text-amber-300',
    subCard: 'bg-zinc-950/80 border-zinc-800',
    filigree: '#f59e0b'
  },
  jade: {
    pageBg: 'bg-[#03110d]',
    borderPrimary: 'border-emerald-500/40',
    borderSecondary: 'border-emerald-950/60',
    accentText: 'text-emerald-300',
    accentGold: 'text-amber-300',
    headerGradient: 'from-emerald-200 via-amber-300 to-teal-200',
    badgeBg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200',
    subCard: 'bg-emerald-950/40 border-emerald-900/40',
    filigree: '#34d399'
  }
};

/**
 * PAGE 1: BÌA SÁCH HOÀNG GIA (Gilded Master Cover)
 */
export const DossierPage1Cover: React.FC<PageProps> = ({
  profile,
  calculation,
  ensemble,
  theme,
  codexId
}) => {
  const styles = THEME_STYLES[theme];
  const { bazi, ziwei } = calculation;
  const dm = STEMS[bazi.dayMaster];

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-12 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden`}>
      {/* Gilded Double Border & Decorative Corner Filigrees */}
      <div className="absolute inset-3 border border-amber-500/30 rounded-lg pointer-events-none" />
      <div className="absolute inset-5 border border-amber-400/20 rounded pointer-events-none" />

      {/* 4 Corner Ornaments */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/70" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/70" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/70" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/70" />

      {/* Top Header: Authority & Archival ID */}
      <div className="text-center pt-4 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-[10px] tracking-widest uppercase">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>ẤN BẢN QUỐC TẾ • ĐỘC BẢN LƯU TRỮ VĨNH CỬU</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
        <div className="text-[10px] font-mono text-slate-400 tracking-wider mt-1.5">
          MÃ SỐ BẢO MẬT: <span className="text-amber-300 font-bold">{codexId}</span>
        </div>
      </div>

      {/* Centerpiece: Sacred Astrology Mandala & Title */}
      <div className="flex flex-col items-center text-center my-auto z-10 px-4">
        {/* Celestial Mandala Vector Ring */}
        <div className="relative w-36 h-36 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 1.5" opacity="0.6" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.8" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#fef08a" strokeWidth="0.6" strokeDasharray="4 2" />
            <polygon points="50,14 62,38 86,50 62,62 50,86 38,62 14,50 38,38" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.5" />
            {/* Bagua Cardinal Ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <line
                key={idx}
                x1="50"
                y1="8"
                x2="50"
                y2="13"
                stroke="#fbbf24"
                strokeWidth="1.5"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.6)]">
              <span className="font-serif text-xl font-black">命</span>
            </div>
          </div>
        </div>

        {/* Book Title */}
        <h3 className="text-xs sm:text-sm uppercase tracking-[0.25em] font-mono text-amber-300/90 font-semibold mb-2">
          KÊNH HUYỀN PHONG PHẬT ĐẠO • AURORA DESTINY AI
        </h3>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wider font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-200 drop-shadow-md">
          SÁCH BẢN MỆNH TINH HOA
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-serif italic max-w-lg mt-2 leading-relaxed">
          Cuốn Cẩm Nang Luận Giải Bản Mệnh Trọn Đời, Ma Trận Tứ Trụ Bát Tự &amp; Chiến Lược Vận Thế Đỉnh Cao
        </p>

        {/* Golden Divider */}
        <div className="flex items-center justify-center gap-3 my-5 w-48">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1" />
          <div className="w-2 h-2 rotate-45 bg-amber-400" />
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1" />
        </div>

        {/* Recipient Details */}
        <div className="space-y-1.5 bg-black/40 border border-amber-500/30 rounded-2xl px-8 py-4 backdrop-blur-md">
          <div className="text-[10px] text-amber-300/80 font-mono tracking-widest uppercase">
            CHỦ NHÂN BẢN MỆNH
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-wide font-cinzel">
            {profile.name}
          </div>
          <div className="text-xs text-slate-300 font-mono flex flex-wrap justify-center gap-x-3 gap-y-1 pt-1">
            <span>Sinh: {profile.birthData.solarDay}/{profile.birthData.solarMonth}/{profile.birthData.solarYear}</span>
            <span>•</span>
            <span>{profile.birthData.solarHour.toString().padStart(2, '0')}:{profile.birthData.solarMinute.toString().padStart(2, '0')}</span>
            <span>•</span>
            <span>{profile.birthData.birthCity}</span>
          </div>
          <div className="text-[11px] text-amber-200/90 font-serif pt-1 flex justify-center gap-3">
            <span>Cục Số: <strong>{ziwei.elementBureau}</strong></span>
            <span>•</span>
            <span>Cách Cục: <strong>{bazi.structureType}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Seals, Signatures & Academic Warranty */}
      <div className="z-10 pt-4 border-t border-amber-500/30 flex items-center justify-between">
        {/* Left: Vermilion Seal */}
        <div className="flex items-center gap-3">
          <DigitalVermilionSeal size={74} codexId={codexId} />
          <div className="text-left hidden sm:block">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              BẢO CHỨNG THIÊN ĐỊA
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Chuẩn Định Tứ Trụ &amp; Tử Vi v4.2
            </div>
            <div className="text-[8px] text-amber-400/80 font-mono">
              Độ tin cậy: {ensemble.overallConsistencyScore}/100
            </div>
          </div>
        </div>

        {/* Right: Prof. TOAN Calligraphy Signature */}
        <div className="text-right">
          <ProfToanSignature compact />
        </div>
      </div>
    </div>
  );
};

/**
 * PAGE 2: MA TRẬN TỨ TRỤ BÁT TỰ & KIẾN TRÚC NGŨ HÀNH
 */
export const DossierPage2Bazi: React.FC<PageProps> = ({
  profile,
  calculation,
  ensemble,
  theme
}) => {
  const styles = THEME_STYLES[theme];
  const { bazi } = calculation;
  const dm = STEMS[bazi.dayMaster];

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-10 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden text-xs`}>
      {/* Running Header */}
      <div className="border-b border-amber-500/30 pb-2 flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>SÁCH BẢN MỆNH TINH HOA • PHẦN I</span>
        <span>CỐT CÁCH BẢN MỆNH &amp; MA TRẬN TỨ TRỤ</span>
      </div>

      {/* Chapter Title */}
      <div className="my-2">
        <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">
          CHƯƠNG 1
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-cinzel text-white flex items-center gap-2">
          <span>MA TRẬN TỨ TRỤ BÁT TỰ &amp; ĐỊNH LƯỢNG NGŨ HÀNH</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h2>
        <p className="text-[11px] text-slate-400 italic">
          Phân tích bốn trụ Giờ - Ngày - Tháng - Năm, xác định vị thế Nhật Chủ và cấu trúc sinh khắc ngũ hành nguyên bản.
        </p>
      </div>

      {/* 4 Pillars Table */}
      <div className="grid grid-cols-4 gap-2 text-center my-2">
        {[
          { title: 'TRỤ GIỜ (Thời)', p: bazi.hourPillar, desc: 'Cung Con Cái & Hậu Vận', active: false },
          { title: 'TRỤ NGÀY (Nhật Chủ)', p: bazi.dayPillar, desc: 'Bản Thể & Hôn Nhân', active: true },
          { title: 'TRỤ THÁNG (Nguyệt)', p: bazi.monthPillar, desc: 'Sự Nghiệp & Phụ Mẫu', active: false },
          { title: 'TRỤ NĂM (Niên)', p: bazi.yearPillar, desc: 'Gốc Rễ & Tiền Vận', active: false }
        ].map(({ title, p, desc, active }, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              active
                ? 'bg-amber-950/30 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div>
              <div className={`text-[10px] font-bold ${active ? 'text-amber-300' : 'text-slate-400'}`}>{title}</div>
              <div className="text-[9px] text-slate-500 font-mono truncate">{desc}</div>
            </div>

            {/* Stem & Branch Graphic */}
            <div className="my-2 py-1.5 bg-black/40 rounded-lg border border-white/5">
              <div className="text-base sm:text-lg font-bold font-serif text-white">
                {STEMS[p.stem]?.nameVi || p.stem}
              </div>
              <div className="text-base sm:text-lg font-bold font-serif text-amber-200">
                {BRANCHES[p.branch]?.nameVi || p.branch}
              </div>
            </div>

            <div className="space-y-0.5 text-[10px]">
              <div className="text-cyan-300 font-semibold">{p.tenGod}</div>
              <div className="text-slate-400 font-mono text-[9px] truncate">{p.naYin}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Five Elements Balance Bar & Breakdown */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-amber-200">Tỷ Lệ Định Lượng Ngũ Hành Bản Mệnh</span>
          <span className="text-slate-400 font-mono text-[10px]">Tổng hợp Tứ Trụ 100%</span>
        </div>

        {/* Stacked element bar */}
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden border border-white/10">
          <div style={{ width: `${bazi.elementBalance.Wood}%` }} className="bg-emerald-500" title={`Mộc: ${bazi.elementBalance.Wood}%`} />
          <div style={{ width: `${bazi.elementBalance.Fire}%` }} className="bg-rose-500" title={`Hỏa: ${bazi.elementBalance.Fire}%`} />
          <div style={{ width: `${bazi.elementBalance.Earth}%` }} className="bg-amber-500" title={`Thổ: ${bazi.elementBalance.Earth}%`} />
          <div style={{ width: `${bazi.elementBalance.Metal}%` }} className="bg-slate-300" title={`Kim: ${bazi.elementBalance.Metal}%`} />
          <div style={{ width: `${bazi.elementBalance.Water}%` }} className="bg-cyan-500" title={`Thủy: ${bazi.elementBalance.Water}%`} />
        </div>

        <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
          <span className="text-emerald-400 bg-emerald-950/40 py-0.5 rounded border border-emerald-500/20">Mộc {bazi.elementBalance.Wood}%</span>
          <span className="text-rose-400 bg-rose-950/40 py-0.5 rounded border border-rose-500/20">Hỏa {bazi.elementBalance.Fire}%</span>
          <span className="text-amber-400 bg-amber-950/40 py-0.5 rounded border border-amber-500/20">Thổ {bazi.elementBalance.Earth}%</span>
          <span className="text-slate-300 bg-slate-800/40 py-0.5 rounded border border-slate-500/20">Kim {bazi.elementBalance.Metal}%</span>
          <span className="text-cyan-400 bg-cyan-950/40 py-0.5 rounded border border-cyan-500/20">Thủy {bazi.elementBalance.Water}%</span>
        </div>
      </div>

      {/* Dụng Thần & Kỵ Thần Assessment */}
      <div className="grid grid-cols-2 gap-3 my-1">
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
          <div className="text-cyan-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dụng Thần &amp; Hỷ Thần (Khai Vận)</span>
          </div>
          <p className="text-[11px] text-slate-200">
            Hành cát: <strong className="text-cyan-300">{bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong>
          </p>
          <p className="text-[10px] text-slate-400">
            Bổ trợ trực tiếp cho Nhật Chủ, mở lối cho hanh thông công danh, tài bảo và hóa giải chướng ngại.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
          <div className="text-rose-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Kỵ Thần &amp; Tiết Khí (Cần Hóa Giải)</span>
          </div>
          <p className="text-[11px] text-slate-200">
            Hành kỵ: <strong className="text-rose-300">{bazi.unfavorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong>
          </p>
          <p className="text-[10px] text-slate-400">
            Cần tiết chế qua màu sắc, phương hướng bài trí không gian và quản trị tâm thức để tránh hao tổn năng lượng.
          </p>
        </div>
      </div>

      {/* Core Executive Summary */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-1.5">
        <div className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
          Luận Đoán Cốt Cách &amp; Khí Chất Lãnh Đạo
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
          {ensemble.executiveSummary}
        </p>
      </div>

      {/* Running Footer */}
      <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Bản quyền © Aurora Destiny AI • Thẩm định bởi Prof.TOAN</span>
        <span>Trang 2 / 6</span>
      </div>
    </div>
  );
};

/**
 * PAGE 3: VẬN ĐỒ TRỌN ĐỜI & ĐẠI VẬN 10 NĂM
 */
export const DossierPage3Decades: React.FC<PageProps> = ({
  calculation,
  ensemble,
  backtest,
  theme
}) => {
  const styles = THEME_STYLES[theme];
  const { decades } = calculation;

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-10 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden text-xs`}>
      {/* Running Header */}
      <div className="border-b border-amber-500/30 pb-2 flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>SÁCH BẢN MỆNH TINH HOA • PHẦN II</span>
        <span>VẬN TRÌNH TRỌN ĐỜI &amp; MA TRẬN ĐẠI VẬN</span>
      </div>

      {/* Chapter Title */}
      <div className="my-2">
        <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">
          CHƯƠNG 2
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-cinzel text-white flex items-center gap-2">
          <span>QUỸ ĐẠO ĐẠI VẬN 10 NĂM &amp; THỜI ĐIỂM CHIẾN LƯỢC</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </h2>
        <p className="text-[11px] text-slate-400 italic">
          Bản đồ biến thiên năng lượng qua từng thập kỷ cuộc đời, xác định chu kỳ hưng thịnh và thời điểm vàng đột phá.
        </p>
      </div>

      {/* 10-Year Decades Table */}
      <div className="space-y-1.5 my-1">
        <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider flex items-center justify-between">
          <span>Chu Trình Đại Vận (Thập Kỷ)</span>
          <span className="text-[10px] font-mono text-slate-400">
            Kiểm định hồi quy: {typeof backtest?.destinyConsistencyScore === 'number' ? `${backtest.destinyConsistencyScore}/100` : 'Chưa kiểm định'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {decades.slice(0, 5).map((d, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px] gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 text-center py-1 rounded bg-amber-500/10 border border-amber-500/30 font-mono font-bold text-amber-300 text-[10px]">
                  {d.startAge}-{d.endAge}t
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{STEMS[d.stem]?.nameVi || d.stem} {BRANCHES[d.branch]?.nameVi || d.branch}</span>
                    <span className="text-[10px] text-cyan-300 font-mono">({d.tenGod})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
                    {d.keyThemes?.join(' • ') || 'Chu kỳ xây dựng nội lực và kiến tạo sự nghiệp'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Hòa hợp</div>
                  <div className={`font-mono font-bold ${d.harmonyScore >= 75 ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {d.harmonyScore}/100
                  </div>
                </div>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${d.harmonyScore >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${d.harmonyScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Timing Windows */}
      {ensemble.strategicTimingWindows && ensemble.strategicTimingWindows.length > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
          <div className="text-indigo-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cửa Sổ Thời Cơ Vàng (Strategic Timing Windows)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ensemble.strategicTimingWindows.map((win, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-0.5">
                <div className="font-bold text-amber-300 text-[11px] flex justify-between">
                  <span>{win.timeframe}</span>
                  <span className="text-[10px] text-indigo-300 uppercase font-mono">{win.phaseType}</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  {win.strategicFocus}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind Spot Warnings */}
      {ensemble.potentialBlindspots && ensemble.potentialBlindspots.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1">
          <div className="text-amber-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Điểm Mù Tâm Lý &amp; Cảnh Báo Vận Trình</span>
          </div>
          <ul className="list-disc list-inside text-slate-300 text-[10px] space-y-0.5">
            {ensemble.potentialBlindspots.map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Running Footer */}
      <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Bản quyền © Aurora Destiny AI • Thẩm định bởi Prof.TOAN</span>
        <span>Trang 3 / 6</span>
      </div>
    </div>
  );
};

/**
 * PAGE 4: TINH BÀN TỬ VI ĐẨU SỐ 12 CUNG VỊ
 */
export const DossierPage4ZiWei: React.FC<PageProps> = ({
  calculation,
  theme
}) => {
  const styles = THEME_STYLES[theme];
  const { ziwei } = calculation;

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-10 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden text-xs`}>
      {/* Running Header */}
      <div className="border-b border-amber-500/30 pb-2 flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>SÁCH BẢN MỆNH TINH HOA • PHẦN III</span>
        <span>TỬ VI ĐẨU SỐ • THIÊN BÀN 12 CUNG VỊ</span>
      </div>

      {/* Chapter Title */}
      <div className="my-2">
        <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">
          CHƯƠNG 3
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-cinzel text-white flex items-center gap-2">
          <span>TỔNG HỢP 12 CUNG HOÀNG ĐẠO &amp; CÁC TRỤC TAM HỢP</span>
          <Compass className="w-4 h-4 text-purple-400" />
        </h2>
        <p className="text-[11px] text-slate-400 italic">
          Cục vị: <strong className="text-purple-300">{ziwei.elementBureau}</strong> • Thân cư: <strong className="text-amber-300">{PALACE_DEFS.find(p => p.key === ziwei.bodyPalaceKey)?.nameVi || ziwei.bodyPalaceKey}</strong>
        </p>
      </div>

      {/* 12 Palaces Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 my-1">
        {PALACE_DEFS.map((def) => {
          const pal = ziwei.palaces[def.key];
          const isLife = def.key === 'life';
          const isWealth = def.key === 'wealth';
          const isCareer = def.key === 'career';

          return (
            <div
              key={def.key}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isLife
                  ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                  : isWealth || isCareer
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-[11px] ${isLife ? 'text-purple-300' : isWealth || isCareer ? 'text-amber-300' : 'text-slate-300'}`}>
                  {def.nameVi}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {typeof pal?.score === 'number' ? `${pal.score}đ` : '—'}
                </span>
              </div>

              <div className="text-[10px] text-slate-300 line-clamp-2 my-1">
                {pal?.majorStars?.map(s => s?.nameVi || '').filter(Boolean).join(', ') || 'Chính tinh đắc địa'}
              </div>

              <div className="text-[9px] text-slate-500 font-mono pt-1 border-t border-white/5 truncate">
                {def.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* Focal Axis Analysis: Mệnh - Tài - Quan */}
      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
        <div className="text-purple-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Trục Tam Hợp Cốt Lõi: MỆNH - TÀI BẠCH - QUAN LỘC</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
          Tam giác mệnh vận định hình danh vọng, vị thế xã hội và quy mô tài sản. Sự liên kết giữa Cung Mệnh ({ziwei.palaces.life?.score}đ), Cung Quan Lộc ({ziwei.palaces.career?.score}đ) và Cung Tài Bạch ({ziwei.palaces.wealth?.score}đ) cho thấy tiềm năng bứt phá mạnh mẽ khi biết tập trung chuyên môn sâu, tránh dàn trải nguồn lực.
        </p>
      </div>

      {/* Axis: Phúc - Phối - Di */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
        <div className="text-amber-200 font-bold uppercase tracking-wider text-[11px]">
          Trục Phúc Đức - Phu Thê - Thiên Di
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Cung Phúc Đức chủ về chiều sâu tinh thần và nhân quả tổ tiên. Kết hợp cùng Cung Thiên Di tạo nên thế xuất ngoại, giao thương rộng rãi và nhận được sự hậu thuẫn từ quý nhân xa gần.
        </p>
      </div>

      {/* Running Footer */}
      <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Bản quyền © Aurora Destiny AI • Thẩm định bởi Prof.TOAN</span>
        <span>Trang 4 / 6</span>
      </div>
    </div>
  );
};

/**
 * PAGE 5: CẨM NANG TRA CỨU PHONG THỦY CÁ NHÂN HÓA TRỌN ĐỜI
 */
export const DossierPage5FengShui: React.FC<PageProps> = ({
  profile,
  calculation,
  theme
}) => {
  const styles = THEME_STYLES[theme];
  const remedies = generateDestinyRemedies(profile, calculation);

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-10 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden text-xs`}>
      {/* Running Header */}
      <div className="border-b border-amber-500/30 pb-2 flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>SÁCH BẢN MỆNH TINH HOA • PHẦN IV</span>
        <span>CẨM NANG PHONG THỦY CÁ NHÂN HÓA TRỌN ĐỜI</span>
      </div>

      {/* Chapter Title */}
      <div className="my-2">
        <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">
          CHƯƠNG 4
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-cinzel text-white flex items-center gap-2">
          <span>BẢNG TRA CỨU PHONG THỦY &amp; PHƯƠNG PHÁP KHAI VẬN</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h2>
        <p className="text-[11px] text-slate-400 italic">
          May đo năng lượng sống, màu sắc, phương vị, vật phẩm phong thủy và số học dựa trên Dụng Thần 【{ELEMENT_RELATIONS[remedies.primaryFavorable].vi}】.
        </p>
      </div>

      {/* 1. Lucky Colors & Avoid Colors */}
      <div className="grid grid-cols-2 gap-3 my-1">
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
          <div className="text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
            Màu Sắc Cát Tường (Khai Vận)
          </div>
          <div className="space-y-1 text-[10px]">
            {remedies.recommendedColors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                <span className="font-semibold text-white">{c.nameVi}:</span>
                <span className="text-slate-300 truncate">{c.usage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
          <div className="text-rose-300 font-bold uppercase tracking-wider text-[11px]">
            Màu Sắc Cần Hạn Chế (Tiết Khí)
          </div>
          <div className="space-y-1 text-[10px]">
            {remedies.avoidColors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                <span className="font-semibold text-white">{c.nameVi}:</span>
                <span className="text-slate-300 truncate">{c.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Spatial Directions & Lucky Numbers */}
      <div className="grid grid-cols-3 gap-2 my-1">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-center">
          <div className="text-[10px] text-amber-300 font-bold uppercase">Con Số Cát Tường</div>
          <div className="text-lg font-bold font-mono text-white">
            {remedies.luckyNumbers.join(' • ')}
          </div>
          <div className="text-[9px] text-slate-400">Số may mắn, số tài khoản, tầng nhà</div>
        </div>

        <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-amber-300 font-bold uppercase">Phương Vị Vượng Khí &amp; Bàn Làm Việc</div>
          <div className="text-[11px] text-white">
            {remedies.spatialDirections.map(d => `${d.direction} (${d.title})`).join(' • ')}
          </div>
          <div className="text-[9px] text-slate-400">
            {remedies.spatialDirections[0]?.practicalAction || 'Kê bàn làm việc hoặc hướng đầu giường nhìn về phương vị này.'}
          </div>
        </div>
      </div>

      {/* 3. Recommended Feng Shui Materials & Items */}
      <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1.5">
        <div className="text-amber-300 font-bold uppercase tracking-wider text-[11px]">
          Vật Phẩm Phong Thủy &amp; Không Gian Tương Sinh
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
          {remedies.fengShuiMaterials.map((m, idx) => (
            <div key={idx} className="p-2 rounded bg-slate-900/60 border border-white/5 space-y-0.5">
              <div className="font-bold text-amber-200">{m.material}</div>
              <p className="text-slate-300 text-[9px]">{m.role}</p>
              <div className="text-slate-400 font-mono text-[8px] italic">Vị trí: {m.placement}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Career Sectors & Vitality Wellness */}
      <div className="grid grid-cols-2 gap-2 my-1">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-cyan-300 font-bold uppercase">Ngành Nghề Hợp Mệnh</div>
          <div className="text-[10px] text-slate-300 space-y-0.5">
            {remedies.careerSectors.slice(0, 2).map((cs, i) => (
              <div key={i} className="truncate">
                <strong className="text-white">{cs.title}:</strong> {cs.description}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-emerald-300 font-bold uppercase">Dưỡng Sinh Lục Phủ Ngũ Tạng</div>
          <div className="text-[10px] text-slate-300">
            Cơ quan nhạy cảm: <strong className="text-white">{remedies.organCare.organ}</strong> ({remedies.organCare.sensitivities})
          </div>
          <div className="text-[9px] text-slate-400">
            Giờ sinh học hồi phục: <span className="text-emerald-400 font-mono">{remedies.organCare.goldenHour}</span>
          </div>
        </div>
      </div>

      {/* Running Footer */}
      <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Bản quyền © Aurora Destiny AI • Thẩm định bởi Prof.TOAN</span>
        <span>Trang 5 / 6</span>
      </div>
    </div>
  );
};

/**
 * PAGE 6: LỜI KẾT, BẢO CHỨNG THUẬT TOÁN & DẤU MỘC TỐI CAO
 */
export const DossierPage6Epilogue: React.FC<PageProps> = ({
  profile,
  ensemble,
  backtest,
  theme,
  codexId
}) => {
  const styles = THEME_STYLES[theme];

  return (
    <div className={`a4-page-dossier a4-screen-preview relative flex flex-col justify-between ${styles.pageBg} text-slate-200 p-8 sm:p-12 border-2 ${styles.borderPrimary} rounded-xl shadow-2xl overflow-hidden text-xs`}>
      {/* Running Header */}
      <div className="border-b border-amber-500/30 pb-2 flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>SÁCH BẢN MỆNH TINH HOA • PHẦN CUỐI</span>
        <span>CHỨNG THƯ BẢO CHỨNG HỌC THUẬT &amp; DẤU ẤN BẢN MỆNH</span>
      </div>

      {/* Epilogue Philosophy */}
      <div className="my-auto space-y-4 max-w-xl mx-auto text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
          <BookOpen className="w-5 h-5" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200">
          MINH TRIẾT BẢN MỆNH &amp; LỜI TÂM HUYẾT
        </h2>

        <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2 text-left font-serif leading-relaxed text-[11px] text-slate-300">
          <p className="italic text-amber-200 font-semibold text-center">
            "Mệnh do Thiên định, nhưng Vận do Nhân tạo. Tri Mệnh là để Thuận Thời, Nắm Vận là để Kiến Tạo Tương Lai."
          </p>
          <p>
            Cuốn cẩm nang này không sinh ra để áp đặt định kiến số phận, mà là một bản đồ định hướng thiên văn học thuật soi sáng các quy luật tự nhiên. Khi thấu hiểu tường tận vượng suy của thời thế, người quân tử giữ lòng tĩnh tại trước giông bão, khiêm nhường trước vinh hoa, và luôn biết cách dùng Dụng Thần để cứu nguy chuyển họa thành phúc.
          </p>
          <p>
            Chúc Quý chủ nhân <strong className="text-white font-cinzel">{profile.name}</strong> luôn an định tâm trí, vững bước trên lộ trình hưng thịnh và tạo dựng những di sản trường tồn!
          </p>
        </div>

        {/* Archival Binding Advice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 text-left">
          <strong className="text-amber-300">Khuyến nghị in ấn &amp; đóng tập:</strong> Bản ấn phẩm này đạt tiêu chuẩn in ấn A4 mỹ thuật cao cấp (giấy Ivory/Couché định lượng 250 - 300 gsm). Thích hợp đóng bìa cứng nhung mạ vàng (Hardcover Leatherette) làm kỷ vật cuộc đời hoặc quà tặng ngoại giao thượng lưu ý nghĩa.
        </div>
      </div>

      {/* Algorithmic Warranty Badge */}
      <div className="my-2">
        <AlgorithmicWarrantyBadge codexId={codexId} consistencyScore={ensemble.overallConsistencyScore} />
      </div>

      {/* Official Signatures & Vermilion Grand Seal */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 flex items-center justify-between">
        {/* Left: Digital Vermilion Seal */}
        <div className="flex items-center gap-3">
          <DigitalVermilionSeal size={84} codexId={codexId} />
          <div className="text-left">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-widest font-serif">
              BẢN MỆNH BẢO CHỨNG
            </div>
            <div className="text-[9px] text-amber-300 font-mono">
              THIÊN ĐỊA TINH HOA SỐ HÓA
            </div>
            <div className="text-[8px] text-amber-300/90 font-mono mt-0.5">
              Kênh Huyền Phong Phật Đạo • Aurora Destiny AI v4.2
            </div>
          </div>
        </div>

        {/* Right: Signature of Prof. TOAN */}
        <div className="text-right">
          <ProfToanSignature />
        </div>
      </div>

      {/* Running Footer */}
      <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>Bản quyền © Aurora Destiny AI • Kênh Huyền Phong Phật Đạo • Thẩm định bởi Prof.TOAN</span>
        <span>Trang 6 / 6 • HOÀN TẤT ẤN BẢN</span>
      </div>
    </div>
  );
};
