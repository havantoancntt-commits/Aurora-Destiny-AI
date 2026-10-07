// ==========================================================
// SACRED VOICE GUIDE WIDGET — HUYỀN PHONG PHẬT ĐẠO
// Thành phần âm thanh giọng đọc linh thiêng, truyền cảm & chuyển đổi cao
// Hiệu ứng Hào Quang Kim Sắc, Sóng Âm Phật Quang & Chuông Ngân Bát Nhã
// ==========================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Compass,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Heart,
  HelpCircle,
  Flame
} from 'lucide-react';
import { sacredVoice, SACRED_VOICE_SCRIPTS, VoicePersona } from '../services/sacredVoiceService';
import { sacredSound } from '../services/soundService';

interface Props {
  currentField?: string;
  className?: string;
  autoPlayIntroOnce?: boolean;
}

export const SacredVoiceGuideWidget: React.FC<Props> = ({
  currentField,
  className = '',
  autoPlayIntroOnce = false
}) => {
  const [voiceState, setVoiceState] = useState(sacredVoice.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = sacredVoice.subscribe(setVoiceState);
    return () => unsubscribe();
  }, []);

  // Smart Gentle Trigger: Offer user to listen once if not muted and first visit
  useEffect(() => {
    if (autoPlayIntroOnce && !voiceState.isMuted) {
      const hasListened = sessionStorage.getItem('aurora_has_listened_intro');
      if (!hasListened) {
        // We do not auto-play sound without user gesture to respect browser autoplay policies,
        // but we gently pulse the widget to invite the user!
        setIsExpanded(true);
      }
    }
  }, [autoPlayIntroOnce, voiceState.isMuted]);

  const activeScript = voiceState.currentScriptId
    ? SACRED_VOICE_SCRIPTS[voiceState.currentScriptId]
    : SACRED_VOICE_SCRIPTS.welcome_invitation;

  const handleTogglePlay = (scriptId: string = 'welcome_invitation') => {
    if (voiceState.isPlaying && voiceState.currentScriptId === scriptId) {
      sacredVoice.stop();
    } else {
      sessionStorage.setItem('aurora_has_listened_intro', 'true');
      sacredVoice.speak(scriptId);
    }
  };

  const handleChimeOnly = () => {
    sacredSound.playTibetanBowl(432);
  };

  return (
    <div className={`relative ${className}`}>
      {/* ================= GOLDEN AURA HALO WHEN PLAYING ================= */}
      {voiceState.isPlaying && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-orange-500/25 to-yellow-500/30 blur-md pointer-events-none animate-pulse" />
      )}

      {/* ================= MAIN SACRED CARD ================= */}
      <div className={`relative rounded-3xl transition-all duration-300 border ${
        voiceState.isPlaying
          ? 'bg-gradient-to-r from-[#1c140d]/95 via-[#16121f]/95 to-[#0f171c]/95 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.25)]'
          : 'bg-gradient-to-r from-amber-950/40 via-[#13111c]/90 to-teal-950/40 border-amber-500/35 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
      } p-3.5 sm:p-4.5 text-slate-100 overflow-hidden`}>
        
        {/* Subtle decorative Buddhist cloud/lotus accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* TOP ROW: ICON + TITLE + WAVEFORM + CONTROLS */}
        <div className="flex items-center justify-between gap-3">
          {/* Sacred Lotus / Compass Icon with Aura Wave */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => handleTogglePlay('welcome_invitation')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all cursor-pointer relative group ${
                voiceState.isPlaying
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-300'
              }`}
              title={voiceState.isPlaying ? 'Dừng đọc' : 'Nghe Lời Thỉnh Mệnh Khai Tâm (Giọng Truyền Cảm)'}
            >
              {voiceState.isPlaying ? (
                <Square className="w-5 h-5 fill-current animate-pulse" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5 group-hover:scale-110 transition-transform" />
              )}

              {/* Pulsing beacon if not played yet */}
              {!voiceState.isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Title & Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  {voiceState.isPlaying ? 'Đang Khai Ngôn' : 'Giọng Đọc Linh Thiêng'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {voiceState.persona === 'zen_calm' ? 'Giọng Thiền Định Trầm Ấm' : 'Giọng Dịu Dàng Thanh Thoát'}
                </span>
              </div>

              <div className="text-xs sm:text-sm font-bold text-amber-200 break-words leading-tight mt-1 flex items-center gap-1.5">
                <span>{voiceState.isPlaying ? activeScript.title : 'Thỉnh Mời Khai Mở Bản Đồ Vận Mệnh'}</span>
                {voiceState.isPlaying && (
                  <span className="flex items-center gap-0.5 ml-1 text-amber-400">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tibetan Bowl Chime Button */}
            <button
              type="button"
              onClick={handleChimeOnly}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Khua Chuông Bát Nhã 432Hz (Tĩnh Tâm)"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Chuông 432Hz</span>
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={() => sacredVoice.toggleMute()}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                voiceState.isMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-black/40 hover:bg-black/60 border-amber-500/20 text-amber-300'
              }`}
              title={voiceState.isMuted ? 'Mở âm thanh giọng đọc' : 'Tắt giọng đọc'}
            >
              {voiceState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Expand / Details Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Thu gọn' : 'Xem chi tiết lời dẫn giải'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* EXPANDED CONTENT: SCRIPT TEXT & FIELD CUES */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-3"
            >
              {/* Scripture quote banner with warm reverent tone */}
              <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                  <span>Lời Thỉnh Khai Tâm:</span>
                  <span className="text-slate-400 italic font-normal">Huyền Phong Phật Đạo</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic break-words">
                  "{activeScript.text}"
                </p>
              </div>

              {/* VOICE PERSONA TOGGLE & FIELD GUIDES */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 text-xs">
                {/* Voice Style Persona Picker */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => sacredVoice.setPersona('zen_calm')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      voiceState.persona === 'zen_calm'
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Trầm Ấm (Trí Tuệ)
                  </button>
                  <button
                    type="button"
                    onClick={() => sacredVoice.setPersona('gentle_compassion')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      voiceState.persona === 'gentle_compassion'
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dịu Dàng (Phúc Lạc)
                  </button>
                </div>

                {/* Quick Field Cues */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('field_name')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    Ý Nghĩa Tên
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('field_date')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    Âm - Dương Lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('field_hour')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    Giờ Sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('cta_complete')}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] text-amber-300 font-semibold transition-colors cursor-pointer"
                  >
                    Khai Mở
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
