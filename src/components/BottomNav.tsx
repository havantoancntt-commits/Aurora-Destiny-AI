// ==========================================
// 3D FLOATING BOTTOM ERGONOMIC DOCK
// Luxury Motion-enabled dock navigation
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Radar,
  TrendingUp,
  HeartHandshake,
  Sparkles,
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';

export type TabKey = 'dashboard' | 'radar' | 'timeline' | 'compatibility' | 'remedies' | 'daily';

interface Props {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  language: LanguageCode;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onSelectTab, language }) => {
  const tabs: { key: TabKey; labelKey: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { key: 'dashboard', labelKey: 'myDestiny', icon: Compass, color: 'text-purple-400' },
    { key: 'radar', labelKey: 'lifeRadar', icon: Radar, color: 'text-teal-400' },
    { key: 'timeline', labelKey: 'timeline', icon: TrendingUp, color: 'text-cyan-400' },
    { key: 'compatibility', labelKey: 'compatibility', icon: HeartHandshake, color: 'text-rose-400' },
    { key: 'remedies', labelKey: 'remedies', icon: Sparkles, color: 'text-emerald-400' },
    { key: 'daily', labelKey: 'dailyDestiny', icon: Sun, color: 'text-yellow-400' },
  ];

  return (
    <div
      style={{
        bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))'
      }}
      className="fixed left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl pointer-events-none transition-all duration-300"
    >
      <nav aria-label="Bottom Navigation Dock" className="relative pointer-events-auto bg-[#080912]/95 backdrop-blur-2xl border border-white/15 p-1 sm:p-1.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)]">
        {/* Specular Ambient Top Glow */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent pointer-events-none" />

        {/* Tab Items */}
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
          {tabs.map(({ key, labelKey, icon: Icon, color }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onSelectTab(key)}
                className={`group relative flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all duration-200 select-none cursor-pointer transform-gpu touch-manipulation ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavPill"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-teal-400/50 shadow-[0_4px_16px_rgba(45,212,191,0.25)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {isActive && (
                  <span className="absolute -top-0.5 w-3 h-0.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf] z-10" />
                )}
                <Icon
                  className={`relative z-10 w-4 h-4 mb-0.5 sm:mb-1 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]' : color
                  }`}
                />
                <span
                  className={`relative z-10 text-[9px] sm:text-[10px] tracking-tight truncate w-full text-center leading-tight ${
                    isActive ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {t(labelKey, language)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
