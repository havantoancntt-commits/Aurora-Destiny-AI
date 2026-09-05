// ==========================================
// DYNAMIC TRANSIT & TIME-TRAVEL FLYING STARS COMPONENT
// Cỗ Máy Du Hành Thời Gian: Phi Tinh Tứ Hóa & Lưu Tinh Động
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Compass,
  ArrowRight,
  Layers,
  Award,
  Radio,
  Sliders
} from 'lucide-react';
import { ZiWeiChart, PalaceKey } from '../types/destiny';
import {
  calculateFlyingStarTransits,
  FlyingStarTransitResult
} from '../engine/transitFlyingStars';
import { soundEngine } from '../services/soundEffects';

interface Props {
  chart: ZiWeiChart;
}

export const DynamicTransitTimeMachine: React.FC<Props> = ({ chart }) => {
  const currentYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [selectedPalaceFilter, setSelectedPalaceFilter] = useState<PalaceKey | 'all'>('all');

  // Tính toán kết quả Phi Tinh Tứ Hóa theo năm đang chọn
  const transitResult: FlyingStarTransitResult = useMemo(() => {
    return calculateFlyingStarTransits(chart, targetYear);
  }, [chart, targetYear]);

  const {
    transitTuHoa,
    luuStars,
    criticalPatterns,
    yearResonanceScore,
    strategicFocus,
    tacticalWarnings,
    goldenOpportunities,
    yearCanChiVi
  } = transitResult;

  const handleYearChange = (newYear: number) => {
    soundEngine.playRadarTick();
    setTargetYear(newYear);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Time-Travel Slider Controller */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/70 border border-purple-500/30 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
        {/* Ambient lighting glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center gap-1.5 shadow-sm">
                <Sliders className="w-3.5 h-3.5 text-purple-300" />
                PHI TINH TỨ HÓA ĐỘNG
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
                Du Hành Thời Gian 1970 - 2070
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-cinzel">
              Biến Cục Thiên Bàn Năm {targetYear} ({yearCanChiVi})
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kéo thanh thời gian để kích hoạt dòng chảy khí quyển: Lưu Lộc, Lưu Quyền, Lưu Khoa, Lưu Kỵ và 9 Lưu Phụ Tinh bay vào 12 cung mệnh bàn.
            </p>
          </div>

          {/* Quick Year Steppers */}
          <div className="flex items-center gap-2 bg-black/50 p-2 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => handleYearChange(targetYear - 1)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Năm trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Lưu Niên</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">{targetYear}</div>
            </div>
            <button
              onClick={() => handleYearChange(targetYear + 1)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Năm sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Range Slider */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>1970 (Quá khứ)</span>
            <span className="text-teal-300 font-bold">Hiện tại: {currentYear}</span>
            <span>2070 (Tương lai)</span>
          </div>

          <input
            type="range"
            min={1970}
            max={2070}
            step={1}
            value={targetYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none border border-white/10"
          />

          {/* Quick Year Milestones */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 5, currentYear + 10].map((yr) => (
              <button
                key={yr}
                onClick={() => handleYearChange(yr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  targetYear === yr
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold border border-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10'
                }`}
              >
                {yr === currentYear ? `★ ${yr} (Nay)` : yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Resonant Energy Gauge & Strategic Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Verdict Card */}
        <div className="rounded-3xl bg-black/40 border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={yearResonanceScore >= 80 ? '#10b981' : yearResonanceScore <= 55 ? '#f43f5e' : '#f59e0b'}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * yearResonanceScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {yearResonanceScore}
                <span className="text-xs text-slate-400 font-normal">%</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                Cộng Hưởng Lưu Niên
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-cinzel border ${
              yearResonanceScore >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : yearResonanceScore <= 55
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}>
              {yearResonanceScore >= 80 ? 'NĂM HOÀNG KIM ĐỘT PHÁ' : yearResonanceScore <= 55 ? 'NĂM PHÒNG THỦ CẨN TRỌNG' : 'NĂM TÍCH LŨY CÂN BẰNG'}
            </span>
            <p className="text-xs text-slate-400 font-mono">
              Niên hiệu Can Chi: {yearCanChiVi}
            </p>
          </div>
        </div>

        {/* Strategic Guidance Box */}
        <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-300 font-bold">
              <Compass className="w-4 h-4 text-teal-400" />
              CHIẾN LƯỢC ĐẠI CỤC NĂM {targetYear}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {strategicFocus}
            </p>
          </div>

          {/* Critical Indicators Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            {criticalPatterns.isSongLoc && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                <div className="text-xs">
                  <strong className="text-emerald-300 block font-bold">Song Lộc Triều Viên</strong>
                  <span className="text-slate-300">Tọa tại cung {criticalPatterns.songLocPalace}: Vận tiền tài cực vượng.</span>
                </div>
              </div>
            )}
            {criticalPatterns.isSongKy && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
                <div className="text-xs">
                  <strong className="text-rose-300 block font-bold">Song Kỵ Trùng Phùng</strong>
                  <span className="text-slate-300">Tụ tại cung {criticalPatterns.songKyPalace}: Cần hoãn mạo hiểm.</span>
                </div>
              </div>
            )}
            {criticalPatterns.isKinhDaHiepKy && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="text-xs">
                  <strong className="text-amber-300 block font-bold">Kình Đà Hiệp Kỵ</strong>
                  <span className="text-slate-300">Rà soát kỹ hợp đồng, tránh tranh chấp pháp lý.</span>
                </div>
              </div>
            )}
            {criticalPatterns.isKhoaQuyenLocHoi && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-300 shrink-0" />
                <div className="text-xs">
                  <strong className="text-purple-300 block font-bold">Tam Hóa Liên Châu</strong>
                  <span className="text-slate-300">Công danh quyền lực thăng tiến rõ nét.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 4 Cột Lưu Tứ Hóa & Vị Trí Cung Bị Kích Hoạt */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-white font-cinzel">
              Tứ Hóa Lưu Động (Flying Transformations) Năm {targetYear}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Can Năm: {transitResult.yearStemVi}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lưu Hóa Lộc */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-black/60 border border-emerald-500/40 space-y-2 relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-cinzel bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                LƯU HÓA LỘC
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">Tài Lộc & Cơ Hội</span>
            </div>
            <div className="text-sm font-bold text-white">
              Sao: <span className="text-emerald-300">{transitTuHoa.luuLoc.starName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>Bay vào cung:</span>
              <strong className="text-emerald-300 font-cinzel">{transitTuHoa.luuLoc.targetPalaceName}</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mở ra dòng tiền mới, may mắn về tài chính, kinh doanh buôn bán đắc lộc.
            </p>
          </div>

          {/* Lưu Hóa Quyền */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 to-black/60 border border-rose-500/40 space-y-2 relative overflow-hidden group hover:border-rose-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-cinzel bg-rose-500/20 text-rose-300 border border-rose-400/40">
                LƯU HÓA QUYỀN
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">Quyền Lực & Uy Lực</span>
            </div>
            <div className="text-sm font-bold text-white">
              Sao: <span className="text-rose-300">{transitTuHoa.luuQuan.starName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>Bay vào cung:</span>
              <strong className="text-rose-300 font-cinzel">{transitTuHoa.luuQuan.targetPalaceName}</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Củng cố quyền hạn, tăng tính tự chủ, thích hợp đưa ra quyết định chỉ huy lớn.
            </p>
          </div>

          {/* Lưu Hóa Khoa */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-black/60 border border-purple-500/40 space-y-2 relative overflow-hidden group hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-cinzel bg-purple-500/20 text-purple-300 border border-purple-400/40">
                LƯU HÓA KHOA
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">Danh Tiếng & Hóa Giải</span>
            </div>
            <div className="text-sm font-bold text-white">
              Sao: <span className="text-purple-300">{transitTuHoa.luuKhoa.starName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>Bay vào cung:</span>
              <strong className="text-purple-300 font-cinzel">{transitTuHoa.luuKhoa.targetPalaceName}</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Được quý nhân phò trợ, nâng cao học vấn, danh tiếng vang xa, giải trừ tai ương.
            </p>
          </div>

          {/* Lưu Hóa Kỵ */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/60 to-black/70 border border-rose-500/40 space-y-2 relative overflow-hidden group hover:border-rose-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-cinzel bg-rose-500/20 text-rose-300 border border-rose-500/40">
                LƯU HÓA KỴ
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">Trở Ngại & Khắc Chế</span>
            </div>
            <div className="text-sm font-bold text-white">
              Sao: <span className="text-rose-300">{transitTuHoa.luuKy.starName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>Bay vào cung:</span>
              <strong className="text-rose-300 font-cinzel">{transitTuHoa.luuKy.targetPalaceName}</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Điểm nghẽn năng lượng cần cẩn trọng; dễ xảy ra tranh chấp hoặc áp lực tâm lý.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tọa Độ 9 Lưu Phụ Tinh Then Chốt */}
      <div className="rounded-3xl bg-black/40 border border-white/10 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Tọa Độ 9 Lưu Tinh Thần Sát (Năm {targetYear})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Can {transitResult.yearStemVi} • Chi {transitResult.yearBranchVi}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Lưu Lộc Tồn</div>
            <div className="text-xs font-bold text-emerald-300">{luuStars.luuLocTon.palaceName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Chi {luuStars.luuLocTon.branchVi}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Lưu Thiên Mã</div>
            <div className="text-xs font-bold text-teal-300">{luuStars.luuThienMa.palaceName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Chi {luuStars.luuThienMa.branchVi}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Lưu Kình Dương</div>
            <div className="text-xs font-bold text-rose-300">{luuStars.luuKinhDuong.palaceName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Chi {luuStars.luuKinhDuong.branchVi}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Lưu Đà La</div>
            <div className="text-xs font-bold text-amber-300">{luuStars.luuDaLa.palaceName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Chi {luuStars.luuDaLa.branchVi}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Lưu Thái Tuế</div>
            <div className="text-xs font-bold text-indigo-300">{luuStars.luuThaiTue.palaceName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Chi {luuStars.luuThaiTue.branchVi}</div>
          </div>
        </div>
      </div>

      {/* 5. Khuyên Hành Động & Cảnh Báo Cụ Thể */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            <TrendingUp className="w-4 h-4" />
            <span>Cơ Hội Vàng Cần Nắm Bắt Trong Năm {targetYear}</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 list-disc list-inside">
            {goldenOpportunities.map((op, idx) => (
              <li key={idx} className="leading-relaxed">{op}</li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Cảnh Báo Thận Trọng & Điểm Cần Phòng Ngự</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 list-disc list-inside">
            {tacticalWarnings.map((warn, idx) => (
              <li key={idx} className="leading-relaxed">{warn}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
