// ==============================================================================
// AURORA DESTINY AI — FLOATING CELESTIAL ALERT TOAST HUD
// Ultra-luxury real-time in-app notification banner for major astrological events
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  AlertTriangle,
  Crown,
  Coins,
  Compass,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  ShieldAlert
} from 'lucide-react';
import { MajorDestinyEvent } from '../engine/destinyAlertWatchdog';
import { sacredSound } from '../services/soundService';

interface Props {
  onOpenAlertCenter: () => void;
}

export const CelestialAlertToast: React.FC<Props> = ({ onOpenAlertCenter }) => {
  const [activeAlert, setActiveAlert] = useState<MajorDestinyEvent | null>(null);

  useEffect(() => {
    const handleAlertEvent = (e: Event) => {
      const customEvent = e as CustomEvent<MajorDestinyEvent>;
      if (customEvent.detail) {
        setActiveAlert(customEvent.detail);
      }
    };

    window.addEventListener('aurora:celestial-alert', handleAlertEvent);
    return () => {
      window.removeEventListener('aurora:celestial-alert', handleAlertEvent);
    };
  }, []);

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  if (!activeAlert) return null;

  const isPositive =
    activeAlert.severity === 'CRITICAL_POSITIVE' ||
    activeAlert.severity === 'HIGH_POSITIVE' ||
    activeAlert.eventType === 'THIEN_AT_QUY_NHAN' ||
    activeAlert.eventType === 'LOC_THAN_TAI_BACH' ||
    activeAlert.eventType === 'TAM_HOP_CAT_KHANH';

  const isDanger =
    activeAlert.severity === 'HIGH_DANGER' ||
    activeAlert.eventType === 'THIEN_KHAC_DIA_XUNG';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full shadow-2xl"
      >
        <div
          className={`relative overflow-hidden rounded-2xl border backdrop-blur-2xl p-4 sm:p-5 transition-all duration-300 ${
            isPositive
              ? 'bg-gradient-to-br from-amber-950/90 via-slate-950/95 to-emerald-950/90 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
              : isDanger
              ? 'bg-gradient-to-br from-rose-950/95 via-slate-950/95 to-red-950/90 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
              : 'bg-gradient-to-br from-amber-950/90 via-slate-950/95 to-slate-900/90 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
          }`}
        >
          {/* Subtle Ambient Light Beam */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              isPositive
                ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400'
                : isDanger
                ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400'
            } animate-pulse`}
          />

          <div className="flex items-start gap-3.5">
            {/* Glowing Icon Bubble */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
                isPositive
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : isDanger
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              }`}
            >
              {activeAlert.eventType === 'THIEN_AT_QUY_NHAN' ? (
                <Crown className="w-6 h-6 animate-pulse" />
              ) : activeAlert.eventType === 'LOC_THAN_TAI_BACH' ? (
                <Coins className="w-6 h-6 animate-pulse" />
              ) : isDanger ? (
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              ) : (
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    isPositive
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      : isDanger
                      ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  }`}
                >
                  {activeAlert.relationshipTag || 'Bản mệnh'} • {activeAlert.profileName}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeAlert.targetTime}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1">
                {activeAlert.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {activeAlert.summary}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    sacredSound.playCelestialChime(768);
                    onOpenAlertCenter();
                    setActiveAlert(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isPositive
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold'
                      : isDanger
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  <span>Xem Chi Tiết Mệnh Bàn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveAlert(null)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveAlert(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng cảnh báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
