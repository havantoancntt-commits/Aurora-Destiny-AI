// ==========================================
// AURORA DESTINY AI — SOCIAL SHARE CARD MODAL
// Phase 9: Viral Loop & Discovery Card (Privacy-First)
// Zero Sensitive Data in URL, Elegant Celestial Badge
// ==========================================

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Share2,
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  Shield,
  Compass,
  Zap,
  Star,
  ExternalLink
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  onClose: () => void;
}

export const SocialShareCardModal: React.FC<Props> = ({
  profile,
  calculation,
  ensemble,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { bazi, ziwei } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const dmElementVi = ELEMENT_RELATIONS[dm.element]?.vi || dm.element;
  const favorableStr = bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(' • ');

  // Compute privacy-safe codex ID
  const codexId = `AURORA-${calculation.inputSnapshot.solarYear}-${bazi.dayMaster.substring(0, 3).toUpperCase()}-${Math.abs(calculation.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 9000 + 1000)}`;

  const shareUrl = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
    ? window.location.origin
    : 'https://tinhhoa-tuvi.vercel.app';

  const shareSummaryText = `✨ Thẻ Khám Phá Năng Lượng Bản Mệnh — Tinh Hoa Tử Vi (Aurora Destiny AI)
Nhật Chủ: ${dm.nameVi} (${dmElementVi})
Cách Cục: ${bazi.structureType}
Dụng Thần Cân Bằng: ${favorableStr}
Mã Bản Mệnh Codex: ${codexId}
"Chiêm bái thiên văn, thấu hiểu vận mệnh."
Khám phá tại: ${shareUrl}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    // Print/Save focused snapshot
    window.print();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white font-cinzel">
              Thẻ Chia Sẻ Tinh Hoa Bản Mệnh
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas for Social Sharing */}
        <div className="p-6 space-y-4">
          <div
            ref={cardRef}
            className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1320] via-[#090d16] to-[#04060a] border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.15)] text-center space-y-5 overflow-hidden"
          >
            {/* Background Constellation Accents */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

            {/* Top Brand & Codex ID */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px] font-mono">
              <span className="text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5 font-cinzel">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aurora Destiny AI</span>
              </span>
              <span className="text-slate-400">{codexId}</span>
            </div>

            {/* Profile Avatar / Emblem */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[2px] shadow-lg">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-cinzel text-amber-300">
                  {dm.nameVi}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {dmElementVi}
                </span>
              </div>
            </div>

            {/* Name & Archetype */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white font-cinzel tracking-wide">
                {profile.name}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                Cách Cục: {bazi.structureType} • Nhật Chủ {bazi.dayMasterStrength}
              </p>
            </div>

            {/* Core Badges */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Dụng Thần Cân Bằng</span>
                <p className="text-xs font-bold text-amber-300 font-mono">
                  Hành {favorableStr}
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tử Vi Cung Mệnh</span>
                <p className="text-xs font-bold text-teal-300 font-mono truncate">
                  {ziwei.palaces.life?.majorStars?.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}
                </p>
              </div>
            </div>

            {/* 3 Core Strengths */}
            <div className="space-y-1.5 text-left pt-2 border-t border-white/10 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Thế Mạnh Bản Mệnh Nổi Bật:
              </span>
              <ul className="space-y-1 text-slate-200">
                {ensemble.coreStrengths.slice(0, 3).map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ethical Footer */}
            <div className="pt-3 border-t border-white/10 text-[9px] text-slate-500 leading-tight">
              Phân tích định hướng tự chủ & tham khảo chiêm nghiệm • Không lưu trữ thông tin nhạy cảm công khai.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs text-white font-medium transition-all cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Sao chép Tóm Tắt</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs text-black font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>In / Lưu Thẻ Ảnh</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
