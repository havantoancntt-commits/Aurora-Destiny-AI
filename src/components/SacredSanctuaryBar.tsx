// ==========================================================
// SACRED SANCTUARY BAR — HUYỀN PHONG PHẬT ĐẠO
// Không Gian Tâm Linh • Pháp Bảo Kim Giáp & Âm Thanh Thiền 432Hz
// Tích hợp trực tiếp Bát Nhã Chuông Ngân, Đại Hồng Chung & Quẻ Khai Vận
// ==========================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Crown,
  Compass,
  Bell,
  Music,
  Flame,
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sacredSound } from '../services/soundService';
import { sacredVoice } from '../services/sacredVoiceService';
import { wakeLockService } from '../services/wakeLockService';
import { SacredSealBadge } from './SacredSealBadge';
import { SacredTaijiSpinner } from './SacredTaijiSpinner';

interface Props {
  onOpenOracleModal?: () => void;
  onOpenTalismanModal?: () => void;
  onOpenCodexModal?: () => void;
  className?: string;
}

export const SacredSanctuaryBar: React.FC<Props> = ({
  onOpenOracleModal = () => {},
  onOpenTalismanModal = () => {},
  onOpenCodexModal,
  className = ''
}) => {
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(sacredSound.getIsAmbientPlaying());
  const [ambientMode, setAmbientMode] = useState<'432hz' | '528hz' | 'zen'>('432hz');
  const [isMuted, setIsMuted] = useState<boolean>(sacredSound.getIsMuted());
  const [gongActive, setGongActive] = useState(false);
  const [bowlActive, setBowlActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [isWakeLocked, setIsWakeLocked] = useState<boolean>(() => wakeLockService.isActive());

  useEffect(() => {
    return wakeLockService.subscribe((active) => {
      setIsWakeLocked(active);
    });
  }, []);

  const handleToggleWakeLock = async () => {
    const next = await wakeLockService.toggle();
    if (next) {
      sacredSound.playSacredTap(528);
    }
  };

  const handleStrikeBowl = () => {
    setBowlActive(true);
    sacredSound.playTibetanBowl(432);
    setTimeout(() => setBowlActive(false), 2000);
  };

  const handleStrikeGong = () => {
    setGongActive(true);
    sacredSound.playTempleGong(108);
    setTimeout(() => setGongActive(false), 3000);
  };

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      sacredSound.stopAmbient();
      setIsAmbientPlaying(false);
    } else {
      sacredSound.startAmbient(ambientMode);
      setIsAmbientPlaying(true);
    }
  };

  const handleSwitchMode = (mode: '432hz' | '528hz') => {
    setAmbientMode(mode);
    if (isAmbientPlaying) {
      sacredSound.startAmbient(mode);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171228]/95 via-[#120f20]/95 to-[#0b141a]/95 border-2 border-amber-400/40 p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] text-slate-100 ${className}`}>
      {/* Golden Aura Glow Background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      {/* Main Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
            <SacredTaijiSpinner size={28} speed={7} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                Không Gian Khai Mở &amp; Pháp Bảo Linh Thiêng
              </span>
              <SacredSealBadge text="BÁT NHÃ" subtext="THANH TỊNH" size="sm" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5 tracking-wide">
              Chuông Ngân Khai Tuệ • Thiền Âm 432Hz &amp; Thỉnh Quẻ Bản Mệnh
            </h3>
          </div>
        </div>

        {/* Sacred Quick Action Tools */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* 1. Tibetan Singing Bowl Button */}
          <button
            type="button"
            onClick={handleStrikeBowl}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              bowlActive
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400 scale-105'
                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/40 text-amber-200'
            }`}
            title="Đánh tiếng Chuông Xoay Tây Tạng (432Hz)"
          >
            <Bell className={`w-3.5 h-3.5 ${bowlActive ? 'animate-bounce' : 'text-amber-300'}`} />
            <span>Chuông Bát Nhã (432Hz)</span>
          </button>

          {/* 2. Temple Gong Button */}
          <button
            type="button"
            onClick={handleStrikeGong}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              gongActive
                ? 'bg-orange-400 text-slate-950 border-orange-300 ring-2 ring-orange-400 scale-105'
                : 'bg-orange-500/15 hover:bg-orange-500/25 border-orange-400/40 text-orange-200'
            }`}
            title="Đánh tiếng Đại Hồng Chung (Tiếng chuông chùa trầm hùng 108Hz)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${gongActive ? 'animate-spin' : 'text-orange-300'}`} />
            <span>Đại Hồng Chung (108Hz)</span>
          </button>

          {/* 3. Ambient Drone Wave Toggle */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isAmbientPlaying
                ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                : 'bg-teal-500/15 hover:bg-teal-500/25 border-teal-400/40 text-teal-200'
            }`}
            title="Bật/Tắt nhạc thiền tần số chữa lành không lời chạy ngầm"
          >
            <Music className={`w-3.5 h-3.5 ${isAmbientPlaying ? 'animate-pulse' : 'text-teal-300'}`} />
            <span>{isAmbientPlaying ? 'Đang Phát Thiền Âm' : 'Bật Sóng Thiền'}</span>
          </button>

          {/* 4. Thỉnh Quẻ Khai Mệnh */}
          <button
            type="button"
            onClick={onOpenOracleModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Gieo quẻ Bát Quái và thỉnh thẻ xâm khai vận đầu ngày"
          >
            <Compass className="w-3.5 h-3.5 text-slate-950" />
            <span>Thỉnh Quẻ Linh Ứng</span>
          </button>

          {/* 5. Thỉnh Pháp Bảo Kim Giáp */}
          <button
            type="button"
            onClick={onOpenTalismanModal}
            className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Khai mở Thẻ Mệnh Kim Giáp 3D & Bia Vàng Công Đức"
          >
            <Crown className="w-3.5 h-3.5 text-purple-300" />
            <span>Thẻ Kim Giáp 3D</span>
          </button>

          {/* 6. Screen Wake Lock (Giữ Sáng Màn Hình Khi Thiền) */}
          {wakeLockService.isSupported() && (
            <button
              type="button"
              onClick={handleToggleWakeLock}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isWakeLocked
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/20 text-slate-300'
              }`}
              title="Giữ sáng màn hình thiết bị khi thiền định hoặc quan sát thiên bàn"
            >
              <Sun className={`w-3.5 h-3.5 ${isWakeLocked ? 'text-slate-950 animate-spin' : 'text-slate-400'}`} />
              <span>{isWakeLocked ? 'Đang Giữ Sáng' : 'Giữ Sáng'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
