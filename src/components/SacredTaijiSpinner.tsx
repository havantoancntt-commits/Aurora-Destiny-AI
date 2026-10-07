// ==========================================================
// SACRED TAIJI SPINNER — VÒNG QUAY ÂM DƯƠNG THÁI CỰC HOÀNG KIM
// Thiết kế đồ hình Âm Dương Bát Quái chuẩn mực dịch học phương Đông
// Đẳng cấp, siêu mượt mà 60FPS, tinh xảo và chuyên nghiệp nhất
// ==========================================================

import React from 'react';

interface Props {
  size?: number;
  className?: string;
  speed?: number; // seconds per revolution
}

export const SacredTaijiSpinner: React.FC<Props> = ({
  size = 26,
  className = '',
  speed = 6
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Thái Cực Âm Dương — Khởi Sinh Vạn Vật & Vận Mệnh Cát Tường"
    >
      {/* Outer Golden Aura Glow Halo */}
      <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-xs pointer-events-none animate-pulse" />

      {/* Outer 8-Trigram Decorative Ring (Xoay ngược chiều tinh tế) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          animation: `spin ${speed * 2.5}s linear infinite reverse`
        }}
        fill="none"
      >
        {/* Outer Fine Bezel Ring */}
        <circle cx="50" cy="50" r="47" stroke="#ca8a04" strokeWidth="2" strokeDasharray="3,3" opacity="0.85" />
        <circle cx="50" cy="50" r="44" stroke="#78350f" strokeWidth="1" opacity="0.6" />

        {/* 8 Cardinal Trigram Ticks */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + Math.cos(angle) * 44;
          const y1 = 50 + Math.sin(angle) * 44;
          const x2 = 50 + Math.cos(angle) * 48;
          const y2 = 50 + Math.sin(angle) * 48;
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Main Rotating Taiji (Âm Dương Song Ngư) Disk */}
      <svg
        viewBox="0 0 100 100"
        className="w-[84%] h-[84%] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        style={{
          animation: `spin ${speed}s linear infinite`,
          transformOrigin: '50% 50%'
        }}
      >
        <defs>
          {/* Yang Side Metallic Pearl White Gradient */}
          <linearGradient id="yangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>

          {/* Yin Side Deep Obsidian Obsidian Gradient */}
          <linearGradient id="yinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="50%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Gold Rim Ring */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Outer Circular Boundary Clip */}
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>

        <g clipPath="url(#circleClip)">
          {/* Full Base Disc: Yang (Light/Gold/White) */}
          <circle cx="50" cy="50" r="46" fill="url(#yangGrad)" />

          {/* Yin (Black/Obsidian) Half + S-Curve Shape */}
          {/* Path starts at top center (50, 4), arcs down right to (50, 96), then S-curves back */}
          <path
            d="
              M 50,4
              A 46,46 0 0,1 50,96
              A 23,23 0 0,1 50,50
              A 23,23 0 0,0 50,4
              Z
            "
            fill="url(#yinGrad)"
          />

          {/* Yang Eye in Yin Region (White/Gold Dot at Top Center: cx=50, cy=27) */}
          <circle cx="50" cy="27" r="7" fill="url(#yangGrad)" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="50" cy="27" r="2.5" fill="#ffffff" />

          {/* Yin Eye in Yang Region (Dark Dot at Bottom Center: cx=50, cy=73) */}
          <circle cx="50" cy="73" r="7" fill="url(#yinGrad)" stroke="#fef08a" strokeWidth="1" />
          <circle cx="50" cy="73" r="2.5" fill="#44403c" />
        </g>

        {/* Fine Polished Golden Bezel Outline */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#goldRim)" strokeWidth="2.5" />
      </svg>
    </div>
  );
};
