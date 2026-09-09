// ==========================================
// SACRED COSMIC CIPHER 3D EMBLEM
// Biểu Tượng 3D Mật Mã Tâm Linh Tối Thượng - Trận Đồ Thiên Cơ
// ==========================================

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, Eye, Compass, Shield } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  onActivate?: () => void;
}

export const SacredCosmicCipher3D: React.FC<Props> = ({ size = 'lg', onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);

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
    soundEngine.playHarmonicChime(528, 2.0);
    if (onActivate) onActivate();
  };

  // I Ching 8 Trigrams (Bát Quái Cửu Cung)
  const trigrams = [
    { symbol: '☰', name: 'Càn (Trời)', angle: 0 },
    { symbol: '☱', name: 'Đoài (Hồ)', angle: 45 },
    { symbol: '☲', name: 'Ly (Lửa)', angle: 90 },
    { symbol: '☳', name: 'Chấn (Sấm)', angle: 135 },
    { symbol: '☴', name: 'Tốn (Gió)', angle: 180 },
    { symbol: '☵', name: 'Khảm (Nước)', angle: 225 },
    { symbol: '☶', name: 'Cấn (Núi)', angle: 270 },
    { symbol: '☷', name: 'Khôn (Đất)', angle: 315 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center select-none my-1">
      {/* Outer Ethereal Radial Glow Atmosphere */}
      <div className="absolute -inset-12 sm:-inset-20 pointer-events-none flex items-center justify-center">
        {/* Multilayer Pulsing Cosmic Aura */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-purple-600/25 via-teal-500/20 to-amber-500/15 blur-3xl animate-pulse opacity-75" />
        <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-teal-400/20 blur-2xl animate-spin" style={{ animationDuration: '28s' }} />
        <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* Interactive 3D Card Container with Gentle Breathing Float */}
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
          y: [0, -6, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative group cursor-pointer flex flex-col items-center"
        whileTap={{ scale: 0.96 }}
      >
        {/* Floating Sacred Aura Ring */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/20 via-teal-400/35 to-purple-500/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

        {/* Outer 3D Beveled Ring Frame */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[28px] bg-gradient-to-br from-[#131428]/95 via-[#0b0c18]/98 to-[#06070e] border border-teal-400/40 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(45,212,191,0.25),inset_0_1px_2px_rgba(255,255,255,0.25)] group-hover:border-teal-300 group-hover:shadow-[0_25px_60px_rgba(45,212,191,0.4),0_0_50px_rgba(168,85,247,0.35)] transition-all duration-500 flex items-center justify-center overflow-hidden">
          {/* Subtle Starlight Canvas Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-transparent pointer-events-none" />

          {/* SVG Vector Sacred Geometry Matrix */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-teal-400/80 overflow-visible drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
            >
              <defs>
                {/* Gold & Teal Gradients */}
                <linearGradient id="sacredGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>

                <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <filter id="celestialGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Layer 1: Outermost Constellation Ring (Rotates Clockwise) */}
              <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '48s' }}>
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="url(#sacredGold)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6 12 6"
                  opacity="0.6"
                />
                {/* 12 Coordinate Tick Marks (Thập Nhị Địa Chi) */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 100 + 86 * Math.cos(angle);
                  const y1 = 100 + 86 * Math.sin(angle);
                  const x2 = 100 + 94 * Math.cos(angle);
                  const y2 = 100 + 94 * Math.sin(angle);
                  return (
                    <line
                      key={`tick-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i % 3 === 0 ? '#38bdf8' : '#e2e8f0'}
                      strokeWidth={i % 3 === 0 ? '2' : '1'}
                      opacity={i % 3 === 0 ? '0.9' : '0.4'}
                    />
                  );
                })}
              </g>

              {/* Layer 2: Bát Quái Sacred Trigrams Ring (Rotates Counter-Clockwise) */}
              <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '36s', animationDirection: 'reverse' }}>
                <circle
                  cx="100"
                  cy="100"
                  r="74"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                  opacity="0.5"
                />
                {trigrams.map((tg, idx) => {
                  const rad = (tg.angle * Math.PI) / 180;
                  const tx = 100 + 74 * Math.cos(rad);
                  const ty = 100 + 74 * Math.sin(rad);
                  return (
                    <text
                      key={`trigram-${idx}`}
                      x={tx}
                      y={ty}
                      fill="#5eead4"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      opacity="0.85"
                      className="font-mono select-none"
                    >
                      {tg.symbol}
                    </text>
                  );
                })}
              </g>

              {/* Layer 3: Sacred Merkaba / Octagram Star of Destiny (Rotates Slowly) */}
              <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '24s' }}>
                {/* Square 1 */}
                <rect
                  x="62"
                  y="62"
                  width="76"
                  height="76"
                  fill="none"
                  stroke="url(#sacredGold)"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                {/* Square 2 (Rotated 45 deg) */}
                <rect
                  x="62"
                  y="62"
                  width="76"
                  height="76"
                  transform="rotate(45 100 100)"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                {/* Sacred Intersection Nodes */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
                  const rad = (ang * Math.PI) / 180;
                  const px = 100 + 53.7 * Math.cos(rad);
                  const py = 100 + 53.7 * Math.sin(rad);
                  return (
                    <circle
                      key={`node-${i}`}
                      cx={px}
                      cy={py}
                      r="2"
                      fill="#fef08a"
                      opacity="0.9"
                    />
                  );
                })}
              </g>

              {/* Layer 4: Central Golden Ratio Taiji & Singularity Core */}
              <g style={{ transformOrigin: '100px 100px' }}>
                {/* Inner Glow Aura Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="30"
                  fill="url(#coreGlow)"
                  opacity="0.25"
                  filter="url(#celestialGlow)"
                  className="animate-pulse"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="24"
                  fill="#090d16"
                  stroke="url(#sacredGold)"
                  strokeWidth="1.5"
                />

                {/* Yin-Yang Taiji Dynamic Curvature Paths */}
                <g className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '16s' }}>
                  {/* Yin Dark Side */}
                  <path
                    d="M 100 76 A 12 12 0 0 1 100 100 A 12 12 0 0 0 100 124 A 24 24 0 0 1 100 76 Z"
                    fill="#1e1b4b"
                    opacity="0.85"
                  />
                  {/* Yang Bright Side */}
                  <path
                    d="M 100 76 A 12 12 0 0 1 100 100 A 12 12 0 0 0 100 124 A 24 24 0 0 0 100 76 Z"
                    fill="#2dd4bf"
                    opacity="0.95"
                  />
                  {/* Yin Eye Dot (Teal/Light) */}
                  <circle cx="100" cy="88" r="3" fill="#ffffff" />
                  {/* Yang Eye Dot (Dark/Purple) */}
                  <circle cx="100" cy="112" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                </g>

                {/* Central Diamond Sparkle (Lõi Thiên Cơ Khai Mở) */}
                <polygon
                  points="100,70 105,100 100,130 95,100"
                  fill="url(#sacredGold)"
                  opacity="0.4"
                  className="animate-pulse"
                />
                <polygon
                  points="70,100 100,105 130,100 100,95"
                  fill="url(#sacredGold)"
                  opacity="0.4"
                  className="animate-pulse"
                />
              </g>
            </svg>
          </div>

          {/* Central 3D Floating Prism Spark */}
          <div
            className="absolute z-20 flex items-center justify-center pointer-events-none"
            style={{ transform: 'translateZ(45px)' }}
          >
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-teal-400/40 blur-sm animate-ping" style={{ animationDuration: '3s' }} />
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-teal-300 via-white to-amber-200 shadow-[0_0_15px_#2dd4bf] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-900 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Corner Quantum Brackets */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-teal-400/60 rounded-tl pointer-events-none" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-400/60 rounded-tr pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-400/60 rounded-bl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-teal-400/60 rounded-br pointer-events-none" />
        </div>

        {/* Live Status Pill Under Emblem */}
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-xs font-mono tracking-wider text-slate-300 shadow-sm group-hover:border-teal-400/50 group-hover:text-white transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-medium uppercase tracking-widest text-slate-300 group-hover:text-teal-200">
              Bát Quái Thiên Đồ • Quantum Matrix
            </span>
            <Sparkles className="w-3 h-3 text-amber-400/80" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
