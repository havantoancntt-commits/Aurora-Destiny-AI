// ==========================================================
// SACRED ANCIENT TỬ VI CODEX — CUỐN SÁCH TỬ VI CỔ NHIỆM MÀU
// Biểu Tượng 3D Vòng Tròn Thiên Thư Cổ • Hào Quang Khai Quang Linh Thiêng
// Đẳng cấp, uy nghiêm, mỹ thuật đỉnh cao, hoàn toàn không gây khó chịu
// ==========================================================

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, BookOpen, Star, ChevronRight } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';
import { sacredSound } from '../services/soundService';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  onActivate?: () => void;
}

export const SacredCosmicCipher3D: React.FC<Props> = ({ size = 'lg', onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Physics for Sacred Artifact Feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    sacredSound.playTempleGong(108);
    sacredSound.playSacredSuccess();
    if (onActivate) onActivate();
  };

  // 12 Địa Chi & Bát Quái Tinh Túc Khắc Quanh Vòng Tròn
  const zodiacBranches = [
    { label: 'TÝ', symbol: '子', angle: 0 },
    { label: 'SỬU', symbol: '丑', angle: 30 },
    { label: 'DẦN', symbol: '寅', angle: 60 },
    { label: 'MÃO', symbol: '卯', angle: 90 },
    { label: 'THÌN', symbol: '辰', angle: 120 },
    { label: 'TỊ', symbol: '巳', angle: 150 },
    { label: 'NGỌ', symbol: '午', angle: 180 },
    { label: 'MÙI', symbol: '未', angle: 210 },
    { label: 'THÂN', symbol: '申', angle: 240 },
    { label: 'DẬU', symbol: '酉', angle: 270 },
    { label: 'TUẤT', symbol: '戌', angle: 300 },
    { label: 'HỢI', symbol: '亥', angle: 330 },
  ];

  const trigrams = [
    { symbol: '☰', name: 'Càn', angle: 15 },
    { symbol: '☱', name: 'Đoài', angle: 60 },
    { symbol: '☲', name: 'Ly', angle: 105 },
    { symbol: '☳', name: 'Chấn', angle: 150 },
    { symbol: '☴', name: 'Tốn', angle: 195 },
    { symbol: '☵', name: 'Khảm', angle: 240 },
    { symbol: '☶', name: 'Cấn', angle: 285 },
    { symbol: '☷', name: 'Khôn', angle: 330 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center select-none my-1">
      {/* Outer Ethereal Radiant Atmosphere (Dignified warm gold & cinnabar glow) */}
      <div className="absolute -inset-14 sm:-inset-20 pointer-events-none flex items-center justify-center">
        {/* Breathing Sacred Auroral Core */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-500/20 via-red-600/15 to-yellow-400/15 blur-3xl opacity-75" />
        {/* Subtle Celestial Sunburst Flare */}
        <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.18)_0%,_transparent_70%)] blur-2xl" />
      </div>

      {/* Interactive 3D Circle & Ancient Book Container */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          soundEngine.playRadarTick();
        }}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative group cursor-pointer flex flex-col items-center"
        whileTap={{ scale: 0.96 }}
      >
        {/* Radiating Golden Halo Behind the Circle */}
        <div className="absolute -inset-5 sm:-inset-8 rounded-full bg-gradient-to-r from-amber-400/25 via-red-500/20 to-yellow-300/25 blur-xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 -z-10 animate-book-aura" />

        {/* ================= THE SACRED CIRCULAR FRAME (VÒNG TRÒN THIÊN CƠ) ================= */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-[#181113]/98 via-[#0e0a11]/98 to-[#060408] border-2 border-amber-400/60 p-2.5 shadow-[0_0_40px_rgba(245,158,11,0.4),0_0_70px_rgba(220,38,38,0.25),inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_10px_rgba(0,0,0,0.85)] group-hover:border-amber-300 group-hover:shadow-[0_0_65px_rgba(245,158,11,0.7),0_0_90px_rgba(239,68,68,0.45)] transition-all duration-500 flex items-center justify-center overflow-hidden">
          
          {/* Concentric Cinnabar Red & 24K Gold Ring Layers */}
          <div className="absolute inset-1.5 rounded-full border border-red-500/40 pointer-events-none" />
          <div className="absolute inset-2.5 rounded-full border border-amber-400/35 border-dashed pointer-events-none animate-spin" style={{ animationDuration: '65s' }} />
          <div className="absolute inset-3 rounded-full border border-yellow-300/15 pointer-events-none" />

          {/* Starlight Cosmic Background with Nebula Haze */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_rgba(185,28,28,0.1)_45%,_transparent_75%)] pointer-events-none" />

          {/* SVG Rotating Dial: 12 Địa Chi & Bát Quái Rings */}
          <svg
            viewBox="0 0 240 240"
            className="absolute inset-0 w-full h-full text-amber-300 pointer-events-none drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
          >
            <defs>
              <linearGradient id="goldGradientDial2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Rotating 12 Earthly Branches (Thập Nhị Địa Chi) Ring */}
            <g className="animate-spin" style={{ transformOrigin: '120px 120px', animationDuration: '55s' }}>
              <circle cx="120" cy="120" r="108" fill="none" stroke="url(#goldGradientDial2)" strokeWidth="1" strokeDasharray="2 4 8 4" opacity="0.6" />
              {zodiacBranches.map((branch, i) => {
                const rad = (branch.angle * Math.PI) / 180;
                const bx = 120 + 106 * Math.cos(rad);
                const by = 120 + 106 * Math.sin(rad);
                return (
                  <text
                    key={`branch-${i}`}
                    x={bx}
                    y={by}
                    fill="#fde047"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    opacity="0.8"
                    className="font-serif select-none"
                  >
                    {branch.symbol}
                  </text>
                );
              })}
            </g>

            {/* Counter-Rotating Bát Quái Trigrams Ring */}
            <g className="animate-spin" style={{ transformOrigin: '120px 120px', animationDuration: '45s', animationDirection: 'reverse' }}>
              <circle cx="120" cy="120" r="94" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
              {trigrams.map((tg, i) => {
                const rad = (tg.angle * Math.PI) / 180;
                const tx = 120 + 94 * Math.cos(rad);
                const ty = 120 + 94 * Math.sin(rad);
                return (
                  <text
                    key={`tg-${i}`}
                    x={tx}
                    y={ty}
                    fill="#fca5a5"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    opacity="0.7"
                    className="font-mono select-none"
                  >
                    {tg.symbol}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* ================= CUỐN SÁCH TỬ VI CỔ NHIỆM MÀU (3D ANCIENT CODEX) ================= */}
          <div
            className="relative z-10 flex items-center justify-center w-full h-full"
            style={{ transform: 'translateZ(30px)' }}
          >
            {/* Divine Vertical Shafts of Golden Light Bursting from the Book */}
            <div className="absolute -top-8 sm:-top-12 w-28 h-36 sm:w-36 sm:h-48 bg-gradient-to-t from-amber-300/35 via-yellow-200/20 to-transparent blur-md pointer-events-none animate-book-burst flex items-center justify-center">
              <div className="w-8 h-full bg-gradient-to-t from-white/60 via-yellow-300/30 to-transparent blur-xs" />
            </div>

            {/* Floating Golden Mystical Runes Drifting Upward from the Pages */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
              <span className="absolute text-amber-300 text-xs font-serif font-bold animate-[book-rune-float-up_3.4s_infinite_ease-out] left-[32%] top-[45%]">
                ✦
              </span>
              <span className="absolute text-yellow-200 text-[10px] font-mono font-bold animate-[book-rune-float-up_4.0s_infinite_ease-out_1.0s] left-[58%] top-[40%]">
                紫微
              </span>
              <span className="absolute text-amber-400 text-xs font-serif font-bold animate-[book-rune-float-up_4.4s_infinite_ease-out_1.8s] left-[45%] top-[35%]">
                ☯
              </span>
              <span className="absolute text-yellow-100 text-[10px] animate-[book-rune-float-up_3.0s_infinite_ease-out_1.4s] left-[25%] top-[48%]">
                ✧
              </span>
            </div>

            {/* Realistic Detailed SVG of Open Ancient Tử Vi Book */}
            <svg
              viewBox="0 0 200 160"
              className="w-36 h-28 sm:w-44 sm:h-34 drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)] animate-page-breath overflow-visible"
            >
              <defs>
                {/* Ancient Parchment Paper Gradient (Trang Thư Hoàng Bì) */}
                <linearGradient id="parchmentLeft2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="60%" stopColor="#fde68a" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                <linearGradient id="parchmentRight2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="40%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Hardbound Imperial Mahogany Cover Gradient */}
                <linearGradient id="leatherCover2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#450a0a" />
                  <stop offset="50%" stopColor="#7f1d1d" />
                  <stop offset="100%" stopColor="#2a0808" />
                </linearGradient>

                {/* 24K Gold Leaf Corners & Ornaments */}
                <linearGradient id="goldLeaf2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Golden Spine Radiance */}
                <linearGradient id="spineRadiance2" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0.8" />
                </linearGradient>

                {/* Shimmer Filter */}
                <filter id="pageGlow2" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Ancient Hardbound Outer Leather Cover with 3D Depth */}
              <path
                d="M 12 118 L 100 134 L 100 138 L 10 122 Z"
                fill="#1f0707"
                opacity="0.95"
              />
              <path
                d="M 188 118 L 100 134 L 100 138 L 190 122 Z"
                fill="#1f0707"
                opacity="0.95"
              />

              {/* Cover Wings Behind the Pages */}
              <path
                d="M 14 38 Q 55 46 98 48 L 98 132 Q 55 128 12 118 Z"
                fill="url(#leatherCover2)"
                stroke="url(#goldLeaf2)"
                strokeWidth="1.5"
              />
              <path
                d="M 186 38 Q 145 46 102 48 L 102 132 Q 145 128 188 118 Z"
                fill="url(#leatherCover2)"
                stroke="url(#goldLeaf2)"
                strokeWidth="1.5"
              />

              {/* 24K Gold Filigree Corner Brackets */}
              <polygon points="14,38 32,41 28,52 14,38" fill="url(#goldLeaf2)" />
              <polygon points="12,118 28,114 26,102 12,118" fill="url(#goldLeaf2)" />
              <polygon points="186,38 168,41 172,52 186,38" fill="url(#goldLeaf2)" />
              <polygon points="188,118 172,114 174,102 188,118" fill="url(#goldLeaf2)" />

              {/* 2. Stacked Multi-Layered Deckled Paper Edges */}
              <path
                d="M 17 42 Q 56 49 98 51 L 98 130 Q 56 126 15 116 Z"
                fill="#d97706"
                opacity="0.75"
              />
              <path
                d="M 19 40 Q 57 47 99 50 L 99 128 Q 57 124 17 114 Z"
                fill="#fde68a"
                opacity="0.9"
              />
              <path
                d="M 183 42 Q 144 49 102 51 L 102 130 Q 144 126 185 116 Z"
                fill="#d97706"
                opacity="0.75"
              />
              <path
                d="M 181 40 Q 143 47 101 50 L 101 128 Q 143 124 183 114 Z"
                fill="#fde68a"
                opacity="0.9"
              />

              {/* 3. Main Open Illuminated Parchment Pages */}
              <path
                d="M 22 36 Q 60 44 100 48 L 100 126 Q 60 120 20 110 Z"
                fill="url(#parchmentLeft2)"
                stroke="#b45309"
                strokeWidth="0.8"
                filter="url(#pageGlow2)"
              />
              <path
                d="M 178 36 Q 140 44 100 48 L 100 126 Q 140 120 180 110 Z"
                fill="url(#parchmentRight2)"
                stroke="#b45309"
                strokeWidth="0.8"
                filter="url(#pageGlow2)"
              />

              {/* 4. Left Page Content: Tử Vi Đẩu Số 12 Cung Constellation Chart */}
              <text x="58" y="52" fill="#78350f" fontSize="7" fontWeight="bold" fontFamily="serif" textAnchor="middle">
                紫微斗數 • 天機
              </text>
              <line x1="32" y1="56" x2="84" y2="56" stroke="#b45309" strokeWidth="0.6" strokeDasharray="1 2" />

              {/* 12-Palace Constellation Star Web on Left Page */}
              <circle cx="58" cy="84" r="22" fill="none" stroke="#ca8a04" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.7" />
              <polygon
                points="58,64 74,74 74,94 58,104 42,94 42,74"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="0.7"
                opacity="0.8"
              />
              <polygon
                points="58,68 70,84 58,100 46,84"
                fill="#fef08a"
                fillOpacity="0.25"
                stroke="#eab308"
                strokeWidth="0.8"
              />
              
              {/* Glowing Golden Star Nodes */}
              {[
                { cx: 58, cy: 64, r: 2.2 },
                { cx: 74, cy: 74, r: 1.8 },
                { cx: 74, cy: 94, r: 1.8 },
                { cx: 58, cy: 104, r: 2.0 },
                { cx: 42, cy: 94, r: 1.8 },
                { cx: 42, cy: 74, r: 1.8 },
                { cx: 58, cy: 84, r: 2.6 },
              ].map((star, idx) => (
                <g key={`star2-${idx}`}>
                  <circle cx={star.cx} cy={star.cy} r={star.r} fill="#991b1b" stroke="#fef08a" strokeWidth="0.8" />
                </g>
              ))}

              {/* Constellation Rays */}
              <line x1="58" y1="84" x2="58" y2="64" stroke="#fef08a" strokeWidth="0.9" />
              <line x1="58" y1="84" x2="74" y2="74" stroke="#fef08a" strokeWidth="0.9" />
              <line x1="58" y1="84" x2="42" y2="74" stroke="#fef08a" strokeWidth="0.9" />
              <line x1="58" y1="84" x2="58" y2="104" stroke="#fef08a" strokeWidth="0.9" />

              {/* 5. Right Page Content: Tứ Trụ Bát Tự & Cinnabar Seal (Ấn Triện Chu Sa) */}
              <text x="142" y="52" fill="#78350f" fontSize="7" fontWeight="bold" fontFamily="serif" textAnchor="middle">
                乾坤定數 • 命盤
              </text>
              <line x1="116" y1="56" x2="168" y2="56" stroke="#b45309" strokeWidth="0.6" strokeDasharray="1 2" />

              {/* Four Pillars Bát Tự Grid (Năm • Tháng • Ngày • Giờ) */}
              <g opacity="0.85">
                {[118, 130, 142, 154].map((colX, i) => (
                  <g key={`pillar2-${i}`}>
                    <rect x={colX} y="62" width="10" height="26" fill="#fef3c7" stroke="#b45309" strokeWidth="0.5" rx="1" />
                    <text x={colX + 5} y="71" fill="#92400e" fontSize="5" fontWeight="bold" textAnchor="middle">
                      {['Giờ', 'Ngày', 'Tháng', 'Năm'][i]}
                    </text>
                    <text x={colX + 5} y="82" fill="#78350f" fontSize="6.5" fontWeight="extrabold" textAnchor="middle" fontFamily="serif">
                      {['甲', '丙', '戊', '庚'][i]}
                    </text>
                  </g>
                ))}
              </g>

              {/* IMPERIAL CINNABAR SEAL (DẤU ẤN CHU SA HOÀNG GIA) */}
              <g className="animate-cinnabar-seal">
                <rect
                  x="126"
                  y="93"
                  width="32"
                  height="22"
                  fill="#991b1b"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  rx="2"
                  opacity="0.92"
                />
                <rect
                  x="128"
                  y="95"
                  width="28"
                  height="18"
                  fill="none"
                  stroke="#fecaca"
                  strokeWidth="0.6"
                  strokeDasharray="2 1"
                  opacity="0.8"
                />
                <text x="142" y="103" fill="#fff1f2" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.8">
                  敕令 THIÊN CƠ
                </text>
                <text x="142" y="110" fill="#fef08a" fontSize="4.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
                  KHAI QUANG 2026
                </text>
              </g>

              {/* 6. Glowing Golden Central Spine */}
              <line x1="100" y1="46" x2="100" y2="128" stroke="url(#spineRadiance2)" strokeWidth="3.2" filter="url(#pageGlow2)" />
              <line x1="100" y1="48" x2="100" y2="126" stroke="#ffffff" strokeWidth="1" />

              {/* 7. Golden Silk Bookmark Ribbon */}
              <path
                d="M 100 48 Q 98 90 92 136 Q 90 144 94 148 L 98 142 L 102 148 Q 106 144 104 136 Q 102 90 100 48 Z"
                fill="#dc2626"
                stroke="#f59e0b"
                strokeWidth="0.8"
              />
              <circle cx="96" cy="144" r="2.5" fill="#10b981" stroke="#fef08a" strokeWidth="0.8" />
            </svg>

            {/* Central 3D Floating Solfeggio Sparkle Core */}
            <div
              className="absolute z-20 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(42px)' }}
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 via-white to-yellow-200 shadow-[0_0_15px_#f59e0b] flex items-center justify-center">
                <Star className="w-2 h-2 text-amber-900 fill-amber-900" />
              </div>
            </div>
          </div>

          {/* Corner Imperial Dragon Brackets on Circular Frame */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/70 rounded-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500/70 rounded-tr pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500/70 rounded-bl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/70 rounded-br pointer-events-none" />
        </div>

        {/* Clean, Dignified Sacred Call-To-Action Text Under the Circle */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-300/90 font-serif tracking-wide group-hover:text-amber-200 transition-colors">
          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="drop-shadow-xs">Chạm vào Cổ Thư để mở trang vận mệnh</span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </motion.div>
    </div>
  );
};
