// ==========================================================
// SACRED BAGUA COMPASS & LUCKY DIRECTIONS WIDGET
// Bát Quái Trận Đồ Xoay Huyền Diệu & Kim Chỉ Nam Khai Khí
// ==========================================================

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, Volume2, Flame, Heart, BookOpen, ShieldCheck } from 'lucide-react';
import { FiveElement } from '../types/destiny';
import { sacredSound } from '../services/soundService';

interface Props {
  dayMasterElement: FiveElement;
  favorableElements: FiveElement[];
  onOpenOracleModal: () => void;
  onOpenSponsorshipModal: () => void;
}

export const BaGuaCompassWidget: React.FC<Props> = ({
  dayMasterElement,
  favorableElements,
  onOpenOracleModal,
  onOpenSponsorshipModal
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  // 8 Trigrams mapping
  const TRIGRAMS = [
    { name: 'Càn', symbol: '☰', direction: 'Tây Bắc', nature: 'Trời', element: 'Kim', qi: 'Sinh Khí' },
    { name: 'Khảm', symbol: '☵', direction: 'Chính Bắc', nature: 'Nước', element: 'Thủy', qi: 'Phục Vị' },
    { name: 'Cấn', symbol: '☶', direction: 'Đông Bắc', nature: 'Núi', element: 'Thổ', qi: 'Thiên Y' },
    { name: 'Chấn', symbol: '☳', direction: 'Chính Đông', nature: 'Sấm', element: 'Mộc', qi: 'Diên Niên' },
    { name: 'Tốn', symbol: '☴', direction: 'Đông Nam', nature: 'Gió', element: 'Mộc', qi: 'Sinh Khí' },
    { name: 'Ly', symbol: '☲', direction: 'Chính Nam', nature: 'Lửa', element: 'Hỏa', qi: 'Diên Niên' },
    { name: 'Khôn', symbol: '☷', direction: 'Tây Nam', nature: 'Đất', element: 'Thổ', qi: 'Phục Vị' },
    { name: 'Đoài', symbol: '☱', direction: 'Chính Tây', nature: 'Đầm', element: 'Kim', qi: 'Thiên Y' },
  ];

  const handleInteractCompass = () => {
    setIsSpinning(true);
    sacredSound.playTibetanBowl(432);
    setTimeout(() => setIsSpinning(false), 2400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#141226]/90 via-[#0e0c1c]/95 to-[#080712]/95 border border-amber-500/30 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-4"
    >
      {/* Specular Light & Ambient Ring */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-cinzel flex items-center gap-2">
              <span>Đài Quán Chiếu Bát Quái • Khai Khí Phương Vị</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Trận đồ xoay huyền cơ theo Dụng Thần ({favorableElements.join(', ')}) &amp; Bản Mệnh ({dayMasterElement})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenOracleModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 font-cinzel"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-950" />
            <span>Gieo Quẻ Khai Vận</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rotating Sacred Wheel & Lucky Directions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Sacred Rotating Wheel Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 relative">
          <div
            onClick={handleInteractCompass}
            title="Chạm vào tâm Thái Cực để thỉnh chuông Bát Nhã ngân vang"
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-amber-500/30 flex items-center justify-center cursor-pointer group select-none shadow-[0_0_35px_rgba(245,158,11,0.2)]"
          >
            {/* Outer Concentric Trigram Rings */}
            <div
              className={`absolute inset-0 rounded-full border border-amber-400/30 transition-transform duration-1000 ${
                isSpinning ? 'animate-[spin_2s_cubic-bezier(0.16,1,0.3,1)]' : 'animate-[spin_40s_linear_infinite]'
              }`}
            >
              {TRIGRAMS.map((tri, i) => {
                const angle = (i * 360) / 8;
                return (
                  <div
                    key={tri.name}
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -100px) rotate(-${angle}deg)`
                    }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm font-bold text-amber-300">{tri.symbol}</span>
                      <span className="text-[9px] font-mono text-slate-300 font-semibold">{tri.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inner Middle Ring */}
            <div className="absolute inset-8 rounded-full border border-teal-500/30 animate-[spin_28s_linear_infinite_reverse]" />
            <div className="absolute inset-16 rounded-full border border-purple-500/20" />

            {/* Center Taiji (Âm Dương Thái Cực) */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-black via-slate-900 to-amber-950/80 border-2 border-amber-400/70 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform">
              <span className="text-xl text-amber-300 font-serif animate-pulse">☯</span>
              <span className="text-[8px] font-mono uppercase text-amber-200 mt-0.5 tracking-tighter">
                {isSpinning ? 'NGÂN VANG' : 'THÁI CỰC'}
              </span>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono mt-2.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Chạm tâm Thái Cực để tụ khí chuông Bát Nhã
          </span>
        </div>

        {/* Right: 4 Auspicious Directions & Spiritual Merit Box */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { title: 'Sinh Khí (Tài Lộc)', dir: 'Đông Nam / Tây Bắc', desc: 'Vượng công danh & quý nhân', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
              { title: 'Diên Niên (Gia Đạo)', dir: 'Chính Nam / Chính Đông', desc: 'Hòa khí & bền vững', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
              { title: 'Thiên Y (Sức Khỏe)', dir: 'Đông Bắc / Chính Tây', desc: 'Tiêu trừ chướng khí', color: 'border-teal-500/40 bg-teal-950/20 text-teal-300' },
              { title: 'Phục Vị (Tâm Thức)', dir: 'Chính Bắc / Tây Nam', desc: 'Khai minh tuệ giác', color: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
            ].map((d, idx) => (
              <div key={idx} className={`p-3 rounded-2xl border ${d.color} space-y-1 shadow-sm`}>
                <span className="text-[10px] uppercase font-mono font-bold block">{d.title}</span>
                <div className="text-xs font-semibold text-white font-serif">{d.dir}</div>
                <p className="text-[10px] text-slate-400 leading-tight">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* SPONSORSHIP ENLIGHTENMENT BANNER (Tăng tỷ lệ ủng hộ tự nhiên & sâu sắc) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-teal-500/15 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-amber-200 uppercase font-cinzel">
                  Tùy Hỷ Gieo Duyên • Bảo Trợ Công Trình
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Mỗi đóng góp tùy tâm là một đóa sen gửi đến <span className="text-amber-300 font-semibold">Giáo Sư - Prof.TOAN</span>, thắp sáng kho tàng huyền học tử vi số hóa cho muôn người.
              </p>
            </div>

            <button
              onClick={onOpenSponsorshipModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer font-cinzel"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Thỉnh Lộc &amp; Ủng Hộ</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
