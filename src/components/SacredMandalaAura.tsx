// ==========================================================
// SACRED MANDALA AURA — HUYỀN PHONG PHẬT ĐẠO
// Hào Quang Phật Quang Bát Nhã • Kim Sắc Thanh Tịnh 8 Cánh
// Thiết kế êm dịu, trang nghiêm, không gây chóng mặt hay rối mắt
// ==========================================================

import React from 'react';
import { motion } from 'motion/react';

interface Props {
  className?: string;
  size?: number;
  opacity?: number;
  pulse?: boolean;
}

export const SacredMandalaAura: React.FC<Props> = ({
  className = '',
  size = 320,
  opacity = 0.45,
  pulse = true
}) => {
  return (
    <div
      className={`pointer-events-none select-none relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      {/* 1. Core Golden Radiant Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-teal-400/5 blur-2xl" />

      {/* 2. Soft Breathing Ambient Halo */}
      <motion.div
        animate={pulse ? { scale: [0.97, 1.03, 0.97], opacity: [0.75, 1, 0.75] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full text-amber-400/50 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        >
          {/* Outer Fine Ring */}
          <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          
          {/* Middle Lotus Geometric Perimeter */}
          <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
          
          {/* 8-Point Sacred Octagram / Star of Wisdom */}
          <polygon
            points="100,28 119,76 172,76 130,106 146,156 100,126 54,156 70,106 28,76 81,76"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.45"
          />

          {/* Symmetrical Dual Square (8-Fold Bagua Alignment) */}
          <rect x="46" y="46" width="108" height="108" rx="8" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
          <rect
            x="46"
            y="46"
            width="108"
            height="108"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            transform="rotate(45 100 100)"
            opacity="0.35"
          />

          {/* Inner Sacred Sun Halo */}
          <circle cx="100" cy="100" r="38" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
          <circle cx="100" cy="100" r="22" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.7" />

          {/* 8 Lotus Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <line
              key={idx}
              x1="100"
              y1="40"
              x2="100"
              y2="58"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
              opacity="0.75"
            />
          ))}

          {/* Center Taiji Yin-Yang Outline */}
          <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
};
