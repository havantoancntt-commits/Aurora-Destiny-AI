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
  History,
  GitBranch,
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';

export type TabKey = 'dashboard' | 'radar' | 'timeline' | 'backtest' | 'scenarios' | 'daily';

interface Props {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  language: LanguageCode;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onSelectTab, language }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const tabs: { key: TabKey; labelKey: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { key: 'dashboard', labelKey: 'myDestiny', icon: Compass, color: 'text-purple-400' },
    { key: 'radar', labelKey: 'lifeRadar', icon: Radar, color: 'text-teal-400' },
    { key: 'timeline', labelKey: 'timeline', icon: TrendingUp, color: 'text-cyan-400' },
    { key: 'backtest', labelKey: 'backtest', icon: History, color: 'text-amber-400' },
    { key: 'scenarios', labelKey: 'scenarios', icon: GitBranch, color: 'text-pink-400' },
    { key: 'daily', labelKey: 'dailyDestiny', icon: Sun, color: 'text-yellow-400' },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-2xl pointer-events-none transition-all duration-300">
      <nav className="relative pointer-events-auto bg-[#070811]/92 backdrop-blur-2xl border border-white/15 p-1.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        {/* Specular Ambient Top Glow */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent pointer-events-none" />

        {/* Header Strip with Minimize Toggle */}
        <div className="flex items-center justify-between px-2 pb-1 border-b border-white/[0.06] mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">3D Navigation Dock</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            title={isMinimized ? 'Mở rộng thanh điều hướng' : 'Thu nhỏ thanh điều hướng'}
          >
            <span>{isMinimized ? 'Hiện Menu' : 'Ẩn'}</span>
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Tab Items */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-6 gap-1"
            >
              {tabs.map(({ key, labelKey, icon: Icon, color }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSelectTab(key)}
                    className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 select-none cursor-pointer transform-gpu ${
                      isActive
                        ? 'text-white font-medium'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBottomNavPill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-teal-400/50 shadow-[0_4px_20px_rgba(45,212,191,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <span className="absolute -top-1 w-4 h-1 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] z-10" />
                    )}
                    <Icon
                      className={`relative z-10 w-4 h-4 mb-1 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]' : color
                      }`}
                    />
                    <span
                      className={`relative z-10 text-[10px] tracking-tight truncate w-full text-center leading-tight ${
                        isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {t(labelKey, language)}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};
