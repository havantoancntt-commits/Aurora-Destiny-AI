// ==========================================
// 3D LUXURY TOP TAB NAVIGATION BAR
// Ultra-luxury animated 3D Tab Bar
// ==========================================

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Radar,
  TrendingUp,
  HeartHandshake,
  Sparkles,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TabKey } from './BottomNav';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';

interface Props {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  language: LanguageCode;
  consistencyScore?: number;
}

interface TabDef {
  key: TabKey;
  labelKey: string;
  enLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge?: string;
}

export const Top3DTabBar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  language,
  consistencyScore
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: TabDef[] = [
    {
      key: 'dashboard',
      labelKey: 'myDestiny',
      enLabel: 'Bản Mệnh Cốt Lõi',
      icon: Compass,
      accentColor: 'from-purple-500 to-indigo-500',
      badge: '4 Trụ & 12 Cung'
    },
    {
      key: 'radar',
      labelKey: 'lifeRadar',
      enLabel: 'Radar Đa Chiều',
      icon: Radar,
      accentColor: 'from-teal-500 to-emerald-500',
      badge: '7 Multi-Agents'
    },
    {
      key: 'timeline',
      labelKey: 'timeline',
      enLabel: 'Dòng Thời Gian 100 Năm',
      icon: TrendingUp,
      accentColor: 'from-cyan-500 to-blue-500',
      badge: 'Phi Tinh & 100 Năm'
    },
    {
      key: 'compatibility',
      labelKey: 'compatibility',
      enLabel: 'Tương Hợp & Đối Tác',
      icon: HeartHandshake,
      accentColor: 'from-rose-500 to-pink-500',
      badge: 'Doanh Chủ & Nhân Duyên'
    },
    {
      key: 'remedies',
      labelKey: 'remedies',
      enLabel: 'Cải Mệnh & Phong Thủy',
      icon: Sparkles,
      accentColor: 'from-emerald-500 to-teal-500',
      badge: 'Dụng Thần Cải Vận'
    },
    {
      key: 'daily',
      labelKey: 'dailyDestiny',
      enLabel: 'Khí Tiết Hôm Nay',
      icon: Sun,
      accentColor: 'from-yellow-400 to-amber-500',
      badge: 'Chỉ Dẫn & Hoàng Đạo'
    }
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full mb-5">
      {/* 3D Glass Container Framing */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0e101c]/90 via-[#0a0b14]/85 to-[#06070c]/95 p-1.5 sm:p-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl">
        {/* Top Specular Light Beam */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent pointer-events-none" />

        {/* Scroll Controls for Desktop / Tablets */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-xl bg-black/70 border border-white/15 items-center justify-center text-slate-300 hover:text-white hover:border-teal-400/50 hover:bg-teal-950/40 transition-all shadow-md cursor-pointer"
          title="Cuộn Trái"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-xl bg-black/70 border border-white/15 items-center justify-center text-slate-300 hover:text-white hover:border-teal-400/50 hover:bg-teal-950/40 transition-all shadow-md cursor-pointer"
          title="Cuộn Phải"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Tabs Scroll List */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 sm:px-6 scroll-smooth"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`group relative flex-shrink-0 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-left transition-all duration-300 transform-gpu cursor-pointer select-none ${
                  isActive
                    ? 'text-white font-medium -translate-y-0.5'
                    : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '800px'
                }}
              >
                {/* Smooth Animated Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTopNavPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 via-white/10 to-white/5 border border-teal-400/50 shadow-[0_10px_25px_-5px_rgba(45,212,191,0.28),inset_0_1px_2px_rgba(255,255,255,0.3)] pointer-events-none"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* 3D Icon Badge */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.accentColor} text-white shadow-[0_0_15px_rgba(45,212,191,0.5)] scale-105`
                      : 'bg-white/5 text-slate-400 group-hover:text-slate-200 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#2dd4bf] animate-ping" />
                  )}
                </div>

                {/* Labels & Micro-Meta */}
                <div className="relative z-10 flex flex-col min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-semibold tracking-wide truncate ${
                        isActive ? 'text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {t(tab.labelKey, language)}
                    </span>
                    {isActive && (
                      <Sparkles className="w-3 h-3 text-teal-300 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 truncate group-hover:text-slate-400">
                      {tab.enLabel}
                    </span>
                    {tab.badge && (
                      <span
                        className={`hidden lg:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                          isActive
                            ? 'bg-teal-950/70 border-teal-500/40 text-teal-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Underline 3D Beam */}
                {isActive && (
                  <motion.div
                    layoutId="activeTopNavBeam"
                    className="absolute -bottom-1.5 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full shadow-[0_0_8px_#2dd4bf]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
