// ==========================================================
// SACRED MANDALA & BÁT QUÁI ROTATING AURA — HUYỀN PHONG PHẬT ĐẠO
// Hào Quang Sen Vàng Kim Sắc & Đồ Hình Trận Pháp Bát Quái
// ==========================================================

import React from 'react';

interface Props {
  className?: string;
  size?: number;
  opacity?: number;
  pulse?: boolean;
}

export const SacredMandalaAura: React.FC<Props> = ({
  className = '',
  size = 320,
  opacity = 0.25,
  pulse = true
}) => {
  return (
    <div
      className={`absolute pointer-events-none flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      {/* Golden Aura Glow Radial */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 blur-3xl"
        style={{
          animation: pulse ? 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined
        }}
      />

      {/* Rotating Sacred Mandala SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full text-amber-400/40"
        style={{
          animation: 'spin 60s linear infinite',
          transformOrigin: 'center'
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      >
        {/* Outer Circle Ring */}
        <circle cx="100" cy="100" r="92" strokeDasharray="3,3" />
        <circle cx="100" cy="100" r="86" strokeWidth="0.5" />

        {/* 12 Auspicious Rays (12 Địa Chi / 12 Cung) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 100 + Math.cos(angle) * 72;
          const y1 = 100 + Math.sin(angle) * 72;
          const x2 = 100 + Math.cos(angle) * 86;
          const y2 = 100 + Math.sin(angle) * 86;
          return <line key={`ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" />;
        })}

        {/* 8 Bagua Lotus Petals (Bát Quái Sen Vàng) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const cx = 100 + Math.cos(angle) * 48;
          const cy = 100 + Math.sin(angle) * 48;
          return (
            <ellipse
              key={`petal-${i}`}
              cx={cx}
              cy={cy}
              rx="18"
              ry="8"
              transform={`rotate(${i * 45} ${cx} ${cy})`}
              stroke="rgba(251, 191, 36, 0.4)"
              strokeWidth="0.75"
              fill="rgba(245, 158, 11, 0.02)"
            />
          );
        })}

        {/* Middle Sacred Ring */}
        <circle cx="100" cy="100" r="48" strokeWidth="0.6" strokeDasharray="2,2" />
        <circle cx="100" cy="100" r="32" strokeWidth="0.75" stroke="rgba(245, 158, 11, 0.6)" />

        {/* Center Taiji (Âm Dương Thái Cực) Ring */}
        <circle cx="100" cy="100" r="18" strokeWidth="1" stroke="rgba(251, 191, 36, 0.8)" />
        <path
          d="M 100,82 A 9,9 0 0,1 100,100 A 9,9 0 0,0 100,118 A 18,18 0 0,1 100,82 Z"
          fill="rgba(245, 158, 11, 0.25)"
          stroke="none"
        />
        <circle cx="100" cy="91" r="2.5" fill="rgba(251, 191, 36, 0.9)" />
        <circle cx="100" cy="109" r="2.5" fill="rgba(20, 20, 30, 0.9)" />
      </svg>
    </div>
  );
};
