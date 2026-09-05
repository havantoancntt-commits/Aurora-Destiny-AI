// ==========================================================
// MYSTIC I CHING ORACLE MODAL (GIEO QUẺ KINH DỊCH KHAI VẬN)
// Trải Nghiệm Tâm Linh Huyền Bí • 3D Ancient Coin Toss & Golden Oracle
// Kết nối trực tiếp cơ chế Tùy Hỷ Công Đức & Thỉnh Lộc Cát Tường
// ==========================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Compass,
  RotateCcw,
  Heart,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  Share2,
  Volume2,
  VolumeX,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { SACRED_HEXAGRAMS, getRandomHexagram, IChingHexagram } from '../data/ichingData';
import { sacredSound } from '../services/soundService';
import { LanguageCode } from '../types/destiny';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
  userName?: string;
  onOpenSponsorshipModal: () => void;
}

export const MysticOracleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'vi',
  userName = 'Quý Bạn',
  onOpenSponsorshipModal
}) => {
  const [step, setStep] = useState<'intro' | 'tossing' | 'revealed'>('intro');
  const [currentHexagram, setCurrentHexagram] = useState<IChingHexagram>(SACRED_HEXAGRAMS[0]);
  const [tossCount, setTossCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sacredSound.getIsMuted());

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setTossCount(0);
      sacredSound.playCelestialChime(528);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDivination = () => {
    setStep('tossing');
    sacredSound.playCoinToss();

    // Sequence of 3 sacred coin tosses
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setTossCount(count);
      sacredSound.playCoinToss();

      if (count >= 3) {
        clearInterval(interval);
        setTimeout(() => {
          const hex = getRandomHexagram(`${userName}_${Date.now()}`);
          setCurrentHexagram(hex);
          setStep('revealed');
          sacredSound.playTibetanBowl(432);
        }, 800);
      }
    }, 900);
  };

  const handleToggleSound = () => {
    const muted = sacredSound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Mystic Dark Backdrop with Cosmic Nebula */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-all"
      />

      {/* Main Celestial Oracle Dialogue Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#141226] via-[#0e0c1c] to-[#080712] border border-amber-500/30 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] p-5 sm:p-7 overflow-hidden my-auto text-white"
      >
        {/* Specular Golden Light Beam on Top Border */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1.5 font-cinzel">
              <Compass className="w-4 h-4 text-amber-400" />
              Chiêm Bái Chu Dịch • Đài Khai Vận
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 transition-all cursor-pointer"
              title={isMuted ? 'Bật âm thanh thiền' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: INTRO & CALL TO MEDITATION */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-5 py-4"
          >
            {/* Spinning Sacred Trigram Seal */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[spin_25s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-teal-500/30 animate-[spin_18s_linear_infinite_reverse]" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-teal-500/20 blur-md" />
              
              <div className="relative z-10 w-20 h-20 rounded-full bg-black/60 border border-amber-400/50 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <Flame className="w-7 h-7 text-amber-300 animate-pulse" />
                <span className="text-[9px] font-mono text-amber-200 mt-0.5 tracking-tighter">BÁT QUÁI</span>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl sm:text-2xl font-serif text-white font-medium tracking-wide">
                Gieo Quẻ Khai Vận <span className="text-amber-300 font-semibold font-cinzel">Hôm Nay</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Hãy tĩnh lặng tâm trí trong giây lát, hướng suy nghĩ về mục tiêu hoặc khúc mắc quan trọng nhất trong lòng quý vị. Thuật toán dịch học cổ truyền sẽ gieo 3 quẻ đồng âm dương tương cảm.
              </p>
            </div>

            {/* Quick Context Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">64 Quẻ Cổ Truyền</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Âm Dương Biến Hóa</span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">Chân Truyền Dịch Học</span>
            </div>

            <button
              onClick={handleStartDivination}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-cinzel"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Thành Tâm Gieo Quẻ</span>
            </button>
          </motion.div>
        )}

        {/* STEP 2: 3D ANCIENT COIN TOSSING ANIMATION */}
        {step === 'tossing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[1, 2, 3].map((coinIdx) => (
                <motion.div
                  key={coinIdx}
                  animate={{
                    rotateY: [0, 720, 1440],
                    rotateX: [0, 360, 720],
                    y: [0, -35, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{
                    duration: 0.85,
                    repeat: Infinity,
                    delay: coinIdx * 0.15,
                    ease: 'easeInOut'
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.6)] relative"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1a140a] rounded border border-amber-200/60 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-amber-300 font-bold">乾</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-amber-300 uppercase tracking-widest font-mono">
                Đang Gieo Quẻ Lần {tossCount}/3...
              </div>
              <p className="text-xs text-slate-400 font-light">
                Trường khí dịch số đang hòa nhịp cùng năng lượng sinh thần của {userName}
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 3: REVEALED HEXAGRAM GOLDEN CODEX CARD */}
        {step === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Hexagram Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-purple-500/15 border border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 font-serif">
                  <span className="text-xl leading-none">{currentHexagram.nameHan}</span>
                  <span className="text-[9px] font-mono mt-0.5">#{currentHexagram.id}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-base sm:text-lg font-bold text-amber-200 font-serif">
                      Quẻ Số {currentHexagram.id}: {currentHexagram.nameVi}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Thượng: <span className="text-teal-300 font-semibold">{currentHexagram.upperTrigram}</span> • Hạ: <span className="text-purple-300 font-semibold">{currentHexagram.lowerTrigram}</span> • Hành: <span className="text-amber-300 font-semibold">{currentHexagram.element}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm uppercase">
                  {currentHexagram.fortuneLevel}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Khí Vận Nhật Thần</span>
              </div>
            </div>

            {/* Thoán Từ & Tượng Truyện */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Thoán Lời &amp; Tượng Truyện Cổ Học:</span>
              </div>
              <p className="text-slate-200 italic font-serif text-[13px] bg-black/30 p-2.5 rounded-lg border border-white/5">
                "{currentHexagram.judgment}"
              </p>
              <p className="text-slate-300 text-xs">
                {currentHexagram.summary}
              </p>
            </div>

            {/* 3 Domain Advices (Sự Nghiệp, Tài Lộc, Tình Duyên) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-teal-400 uppercase font-mono font-semibold">Sự Nghiệp &amp; Mưu Sự</span>
                <p className="text-slate-300 leading-snug">{currentHexagram.careerAdvice}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-mono font-semibold">Tài Lộc &amp; Đầu Tư</span>
                <p className="text-slate-300 leading-snug">{currentHexagram.wealthAdvice}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-rose-400 uppercase font-mono font-semibold">Nhân Duyên &amp; Gia Đạo</span>
                <p className="text-slate-300 leading-snug">{currentHexagram.relationshipAdvice}</p>
              </div>
            </div>

            {/* Cát Phương & Lời Khuyên Tu Dưỡng */}
            <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-teal-300 font-semibold text-[11px] uppercase tracking-wide">Hướng Cát Lợi Hôm Nay:</span>
                <p className="text-slate-300">{currentHexagram.favorableDirection} • {currentHexagram.favorableHours}</p>
              </div>
              <div className="text-[11px] text-purple-300 italic">
                * {currentHexagram.spiritualRemedy}
              </div>
            </div>

            {/* TÙY HỶ CÔNG ĐỨC & THỈNH LỘC KHAI VẬN CTA (Tăng Tỷ Lệ Ủng Hộ Tuyệt Vời) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-amber-500/20 border-2 border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wide font-cinzel">
                    Thỉnh Lộc Khai Vận • Tùy Hỷ Tích Đức
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-light">
                  Gieo duyên lộc phước đồng hành cùng công trình nghiên cứu của <span className="text-amber-300 font-semibold">Giáo Sư - Prof.TOAN</span>, gia tăng năng lượng cát khí trường thọ &amp; hanh thông.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSponsorshipModal();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer font-cinzel"
                >
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>Gieo Duyên Lộc Quẻ</span>
                </button>

                <button
                  onClick={() => {
                    setStep('intro');
                    sacredSound.playCelestialChime(864);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                  title="Gieo quẻ khác"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
