// ==========================================
// AURORA DESTINY AI — CELESTIAL ZI WEI IMPERIAL LOGO
// Biểu Tượng Đế Tinh Tử Vi & Thái Cực Càn Khôn Huyền Diệu
// Sacred Metaphysical Geometry: 12 Palaces Ring · 8 Trigrams Octagram · Imperial Star · Taiji Core
// Designed for Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN
// ==========================================

import React from 'react';
import { motion } from 'motion/react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withAura?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const CelestialZiWeiLogo: React.FC<Props> = ({
  size = 'md',
  className = '',
  withAura = true,
  interactive = true,
  onClick
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  const dim = sizeMap[size];

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.06, rotate: 2 } : undefined}
      whileTap={interactive ? { scale: 0.94 } : undefined}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      title="Biểu Tượng Đế Tinh Tử Vi & Thái Cực Càn Khôn — Aurora Destiny AI"
    >
      {/* 1. Ambient Cosmic Spiritual Glow (Tử Khí Đông Lai & Kim Quang) */}
      {withAura && (
        <>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-amber-500/30 to-teal-400/40 blur-md pointer-events-none animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-lg pointer-events-none opacity-70" />
        </>
      )}

      {/* 2. Main Shield / Vessel Frame */}
      <div
        className={`relative ${dim} rounded-xl sm:rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-300 via-amber-500/80 via-purple-600/60 to-teal-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.35)] flex items-center justify-center overflow-hidden`}
      >
        {/* Specular Inner Dark Celestial Mirror */}
        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-[#120e26] via-[#090b16] to-[#04050b] p-1 flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Cosmic Nebula in background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.35),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.25),transparent_60%)] pointer-events-none" />

          {/* 3. Sacred Metaphysical SVG Geometry */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full relative z-10 drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Imperial Gold Gradient */}
              <linearGradient id="imperialGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF7D6" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>

              {/* Celestial Purple-Teal Radiant Gradient */}
              <linearGradient id="celestialRay" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.9" />
              </linearGradient>

              {/* Core Star Radial Shimmer */}
              <radialGradient id="starCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#FDE68A" />
                <stop offset="80%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </radialGradient>

              {/* Filter for sacred star glow */}
              <filter id="sacredGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* A. Outer 12 Palaces Celestial Dial (12 Cung Tử Vi Chu Thiên) */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#imperialGold)"
              strokeWidth="1.2"
              strokeDasharray="2 4.5"
              className="opacity-75"
            />
            <circle
              cx="50"
              cy="50"
              r="41"
              stroke="url(#imperialGold)"
              strokeWidth="0.6"
              className="opacity-50"
            />

            {/* 12 Cardinal Astrological Coordinate Dots */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 44 * Math.cos(rad);
              const y = 50 + 44 * Math.sin(rad);
              const isCardinal = idx % 3 === 0; // Tý, Ngọ, Mão, Dậu
              return (
                <circle
                  key={angle}
                  cx={x}
                  cy={y}
                  r={isCardinal ? 1.8 : 1.1}
                  fill={isCardinal ? '#FDE68A' : '#F59E0B'}
                  className={isCardinal ? 'animate-pulse' : ''}
                />
              );
            })}

            {/* B. Middle Ring: 8 Trigrams Octagram (Bát Quái Càn Khôn Huyền Vi) */}
            {/* Square 1 */}
            <rect
              x="26"
              y="26"
              width="48"
              height="48"
              stroke="url(#imperialGold)"
              strokeWidth="0.8"
              fill="none"
              className="opacity-45"
            />
            {/* Square 2 (Rotated 45 degrees for 8-direction diamond) */}
            <rect
              x="26"
              y="26"
              width="48"
              height="48"
              transform="rotate(45 50 50)"
              stroke="url(#imperialGold)"
              strokeWidth="0.8"
              fill="none"
              className="opacity-45"
            />

            {/* C. The Imperial Zi Wei Star (Sao Tử Vi — Cực Tinh Bắc Thần) */}
            {/* 4 Primary Cardinal Ray Spikes (Bắc, Nam, Đông, Tây) */}
            <path
              d="M 50 12 L 53.5 44 L 88 50 L 53.5 56 L 50 88 L 46.5 56 L 12 50 L 46.5 44 Z"
              fill="url(#imperialGold)"
              filter="url(#sacredGlow)"
              className="drop-shadow-sm"
            />

            {/* 4 Intercardinal Ray Spikes (Đông Bắc, Đông Nam, Tây Bắc, Tây Nam) */}
            <path
              d="M 50 22 L 52.5 45.5 L 78 50 L 52.5 54.5 L 50 78 L 47.5 54.5 L 22 50 L 47.5 45.5 Z"
              transform="rotate(45 50 50)"
              fill="url(#celestialRay)"
              className="opacity-90"
            />

            {/* Inner Sacred Star Halo Ring */}
            <circle
              cx="50"
              cy="50"
              r="17"
              stroke="url(#imperialGold)"
              strokeWidth="1"
              strokeDasharray="1.5 2"
              className="opacity-80"
            />

            {/* D. Center Core: Taiji Yin-Yang / Pearl of Universal Wisdom (Thái Cực Đồ & Ngọc Minh Châu) */}
            <g transform="translate(50, 50) scale(0.24) translate(-50, -50)">
              {/* Outer boundary of Taiji */}
              <circle cx="50" cy="50" r="48" fill="#0c0e1a" stroke="url(#imperialGold)" strokeWidth="4" />
              {/* Yang (Light / Gold half) */}
              <path
                d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2 Z"
                fill="url(#imperialGold)"
              />
              {/* Yin (Dark / Indigo half) */}
              <path
                d="M 50 98 A 48 48 0 0 1 50 2 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 98 Z"
                fill="#11162d"
              />
              {/* Yin Eye in Yang side */}
              <circle cx="50" cy="26" r="7" fill="#11162d" stroke="#FBBF24" strokeWidth="2" />
              {/* Yang Eye in Yin side */}
              <circle cx="50" cy="74" r="7" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
            </g>

            {/* Center Supernal Light Sparkle Pinpoint */}
            <circle cx="50" cy="50" r="2.2" fill="#FFFFFF" className="animate-ping opacity-80" />
            <circle cx="50" cy="50" r="1.5" fill="#FFFBEB" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
