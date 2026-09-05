// ==========================================
// DIGITAL VERMILION SEAL & PROF. TOAN SIGNATURE
// Vector-sharp 300 DPI Traditional Seal Script & Algorithmic Warranty
// ==========================================

import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface SealProps {
  size?: number;
  codexId?: string;
  theme?: 'navy' | 'obsidian' | 'jade';
}

/**
 * Traditional Chinese Seal Script (Triện Thư) Vermilion Stamp
 * "Bản Mệnh Bảo Chứng - Thiên Địa Tinh Hoa"
 */
export const DigitalVermilionSeal: React.FC<SealProps> = ({ size = 96, codexId }) => {
  return (
    <div 
      className="relative flex flex-col items-center justify-center shrink-0 group select-none"
      style={{ width: size, height: size }}
      title="Dấu Mộc Triện Thư Phong Thủy Số Hóa - Chứng Nhận Bảo Khắc Hoàng Gia"
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
      >
        {/* Outer Weathered Square Border */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="10"
          fill="#991b1b"
          stroke="#ef4444"
          strokeWidth="3.5"
        />
        {/* Inner Filigree Inset Border */}
        <rect
          x="13"
          y="13"
          width="94"
          height="94"
          rx="6"
          fill="#7f1d1d"
          stroke="#fca5a5"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.85"
        />
        {/* Corner Ornaments */}
        <circle cx="17" cy="17" r="2.5" fill="#fef08a" />
        <circle cx="103" cy="17" r="2.5" fill="#fef08a" />
        <circle cx="17" cy="103" r="2.5" fill="#fef08a" />
        <circle cx="103" cy="103" r="2.5" fill="#fef08a" />

        {/* Central Seal Grid (4 Quadrants of Ancient Seal Script) */}
        <line x1="60" y1="16" x2="60" y2="104" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="16" y1="60" x2="104" y2="60" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 2" />

        {/* Top-Right Quadrant: 天 (Thiên) */}
        <text
          x="82"
          y="42"
          fill="#fef08a"
          fontSize="22"
          fontFamily="serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          天
        </text>
        {/* Top-Left Quadrant: 地 (Địa) */}
        <text
          x="38"
          y="42"
          fill="#fef08a"
          fontSize="22"
          fontFamily="serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          地
        </text>
        {/* Bottom-Right Quadrant: 精 (Tinh) */}
        <text
          x="82"
          y="82"
          fill="#fef08a"
          fontSize="22"
          fontFamily="serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          精
        </text>
        {/* Bottom-Left Quadrant: 華 (Hoa) */}
        <text
          x="38"
          y="82"
          fill="#fef08a"
          fontSize="22"
          fontFamily="serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          華
        </text>

        {/* Center Golden Core Emblem */}
        <circle cx="60" cy="60" r="7" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="3" fill="#fef08a" />
      </svg>
    </div>
  );
};

/**
 * Official Vector Calligraphy Signature of Prof. TOAN
 * (Founder & Chief Architect of Aurora Destiny AI)
 */
export const ProfToanSignature: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative ${compact ? 'w-44 h-16' : 'w-56 h-20'}`}>
        <svg viewBox="0 0 240 90" className="w-full h-full overflow-visible">
          {/* Subtle gold halo glow */}
          <path
            d="M20,60 Q60,10 110,40 T200,35"
            fill="none"
            stroke="rgba(251,191,36,0.15)"
            strokeWidth="8"
          />
          {/* Dynamic cursive flourish signature */}
          <path
            d="M30,55 C45,20 65,15 75,35 C82,50 60,70 95,65 C120,60 145,25 155,30 C165,35 150,70 175,60 C195,50 205,35 215,25"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Characteristic crossbars and loops of Prof. TOAN */}
          <path
            d="M50,38 L110,36 M130,48 L170,42"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Flourish ending stroke */}
          <path
            d="M175,60 Q195,78 225,72"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Personal pen ink dots */}
          <circle cx="108" cy="22" r="2.2" fill="#fbbf24" />
          <circle cx="218" cy="22" r="2.5" fill="#f59e0b" />
        </svg>
      </div>
      <div className="text-center -mt-1">
        <div className="text-sm font-bold font-serif text-amber-200 tracking-wider">
          Giáo Sư - Prof.TOAN
        </div>
        <div className="text-[10px] text-amber-400/80 font-mono tracking-widest uppercase">
          Viện Trưởng & Kiến Trúc Sư Trưởng
        </div>
        <div className="text-[9px] text-slate-400 font-mono">
          havantoancntt@gmail.com
        </div>
      </div>
    </div>
  );
};

/**
 * Algorithmic Hologram & Codex Authenticity Ribbon
 */
export const AlgorithmicWarrantyBadge: React.FC<{ codexId: string; consistencyScore: number }> = ({
  codexId,
  consistencyScore
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-amber-950/30 border border-amber-500/30 text-xs">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
        <Award className="w-6 h-6 text-slate-950" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
            Bảo Chứng Thuật Toán AI Ensembling
          </span>
          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/40">
            {consistencyScore}/100 ĐỘ TIN CẬY
          </span>
        </div>
        <p className="text-[10px] text-slate-300 truncate mt-0.5">
          Mã số bảo mật ấn phẩm: <strong className="font-mono text-amber-300">{codexId}</strong>
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>ĐÃ XÁC THỰC</span>
      </div>
    </div>
  );
};
