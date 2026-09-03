// ==========================================
// REAL-TIME PULSE PILL (DYNAMIC CELESTIAL HUD)
// Ultra-luxury top-bar interactive live destiny status widget
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  Clock,
  Radio,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { calculateRealtimeSnapshot, RealtimeDestinySnapshot } from '../engine/realtimeEngine';
import { soundEngine } from '../services/soundEffects';

interface Props {
  calculation: CalculationResult | null;
  onOpenAlertCenter: () => void;
}

export const RealTimePulsePill: React.FC<Props> = ({ calculation, onOpenAlertCenter }) => {
  const [snapshot, setSnapshot] = useState<RealtimeDestinySnapshot>(() =>
    calculateRealtimeSnapshot(calculation, new Date())
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  // Update snapshot every second for precision live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(calculateRealtimeSnapshot(calculation, new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, [calculation]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
    if (!nextState) {
      soundEngine.playHarmonicChime(528, 0.8);
    }
  };

  const isGolden = snapshot.alertLevel === 'GOLDEN_WINDOW';
  const isClash = snapshot.alertLevel === 'CLASH_ANOMALY';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center"
    >
      <button
        id="btn-open-realtime-alert-radar"
        onClick={() => {
          soundEngine.playRadarTick();
          onOpenAlertCenter();
        }}
        className={`group relative flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full backdrop-blur-2xl transition-all duration-300 cursor-pointer border ${
          isGolden
            ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-black/80 border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            : isClash
            ? 'bg-gradient-to-r from-rose-950/80 via-amber-950/70 to-black/80 border-rose-500/50 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-pulse'
            : 'bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-black/80 border-purple-500/35 hover:border-teal-400 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
        }`}
        title="Nhấn để mở Trung Tâm Cảnh Báo Thiên Thời Vận Khắc Thời Gian Thực"
      >
        {/* Live Pulse Radio Radar Dot */}
        <div className="relative flex items-center justify-center shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              isGolden ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isClash ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]' : 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]'
            }`}
          />
          <span
            className={`absolute w-3.5 h-3.5 rounded-full animate-ping opacity-60 ${
              isGolden ? 'bg-emerald-400' : isClash ? 'bg-rose-400' : 'bg-teal-400'
            }`}
          />
        </div>

        {/* Current Stem & Branch and Clock */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-mono text-[11px] sm:text-xs text-white font-semibold tracking-wide whitespace-nowrap">
            {snapshot.currentHourPillar.stem} {snapshot.currentHourPillar.branch}
          </span>
          <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
            ({snapshot.currentSlot.zodiacStarName})
          </span>
        </div>

        {/* Divider */}
        <span className="h-3 w-[1px] bg-white/15 hidden sm:block" />

        {/* Live Resonance Energy Badge */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {isGolden ? (
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '4s' }} />
          ) : isClash ? (
            <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 animate-bounce" />
          ) : (
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-300" />
          )}

          <span
            className={`text-[10px] sm:text-xs font-mono font-bold ${
              isGolden ? 'text-emerald-300' : isClash ? 'text-rose-300' : 'text-teal-300'
            }`}
          >
            {snapshot.resonanceScore}%
          </span>
        </div>

        {/* Countdown Badge */}
        <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-[9px] font-mono text-slate-300">
          <Clock className="w-2.5 h-2.5 text-slate-400" />
          <span>{snapshot.timeRemainingFormatted}</span>
        </div>

        {/* Radar Trigger Icon (hidden on extra small mobile to save space) */}
        <div className="hidden xs:block p-0.5 sm:p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 group-hover:text-teal-300 transition-colors">
          <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
        </div>
      </button>

      {/* Quick Sound Mute Toggle */}
      <button
        onClick={toggleSound}
        className="ml-0.5 sm:ml-1 p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-teal-300 bg-white/5 hover:bg-white/10 transition-all cursor-pointer shrink-0"
        title={isMuted ? 'Bật âm thanh tần số Solfeggio 528Hz' : 'Tắt âm thanh thông báo'}
      >
        {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400" />}
      </button>
    </motion.div>
  );
};
