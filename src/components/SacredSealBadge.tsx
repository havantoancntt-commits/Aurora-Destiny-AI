// ==========================================================
// SACRED IMPERIAL SEAL BADGE — ẤN TRIỆN CHU SA
// Dấu Ấn Khai Quang Thiên Cơ • Huyền Phong Phật Đạo
// Tăng Cường Tính Thiêng Liêng, Uy Quyền & Sự Tin Tưởng Tuyệt Đối
// ==========================================================

import React from 'react';

interface Props {
  text?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SacredSealBadge: React.FC<Props> = ({
  text = 'THIÊN CƠ',
  subtext = 'KHAI QUANG',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-[9px]',
    md: 'w-14 h-14 text-[10px]',
    lg: 'w-18 h-18 text-xs'
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none group ${className}`}
      title="Dấu Ấn Khai Quang Thiên Cơ — Bảo Mật & Chứng Giám Phúc Khí"
    >
      {/* Outer subtle vermilion aura */}
      <div className="absolute -inset-1 rounded-xl bg-red-600/20 blur-sm pointer-events-none group-hover:bg-red-600/35 transition-all" />

      {/* Traditional Cinnabar Seal Frame */}
      <div
        className={`${sizeClasses} rounded-xl border-2 border-red-400/80 bg-gradient-to-br from-[#8a1313] via-[#700f0f] to-[#4a0808] text-amber-200 font-serif font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.6),0_2px_10px_rgba(185,28,28,0.4)] flex flex-col items-center justify-center p-1 leading-tight tracking-wider border-double transition-transform group-hover:scale-105`}
        style={{
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5), 0 0 12px rgba(220,38,38,0.3)'
        }}
      >
        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-300 font-mono opacity-90">
          敕令
        </span>
        <span className="font-extrabold text-amber-100 text-center uppercase tracking-tighter scale-95 font-cinzel">
          {text}
        </span>
        <span className="text-[8px] uppercase tracking-widest text-amber-300/80 font-mono">
          {subtext}
        </span>
      </div>
    </div>
  );
};
