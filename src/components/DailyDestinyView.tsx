// ==========================================
// DAILY DESTINY & HOURLY GUIDANCE VIEW
// Ultra-luxury animated Daily Destiny View
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  Zap
} from 'lucide-react';
import { DailyDestiny } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { computeDailyDestiny } from '../services/aiSynthesizer';
import { ELEMENT_RELATIONS } from '../engine/canchi';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';
import { Radio } from 'lucide-react';

interface Props {
  calculation: CalculationResult;
  language: LanguageCode;
  onOpenAlertCenter?: () => void;
}

export const DailyDestinyView: React.FC<Props> = ({ calculation, language, onOpenAlertCenter }) => {
  const [dailyData, setDailyData] = useState<DailyDestiny>(() => computeDailyDestiny(calculation));

  useEffect(() => {
    setDailyData(computeDailyDestiny(calculation));
  }, [calculation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Sun className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel">
              Chỉ Dẫn Vận Trình Hôm Nay & Khung Giờ Hoàng Đạo
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cập nhật theo chu kỳ Can Chi ngày và giờ hoàng đạo tương thích với bản mệnh.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-sm">
            {dailyData.dailyStemBranch} • Hành {ELEMENT_RELATIONS[dailyData.dailyElement]?.vi || dailyData.dailyElement}
          </span>
          {onOpenAlertCenter && (
            <button
              onClick={onOpenAlertCenter}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-gradient-to-r from-teal-900/70 to-emerald-900/70 border border-teal-400/50 hover:border-teal-300 text-teal-200 hover:text-white transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Radar Thiên Thời LIVE</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 1. TODAY'S THEME & HARMONY SCORE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-amber-950/30 border border-amber-500/30 p-5 sm:p-7 backdrop-blur-2xl shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{dailyData.date}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-medium">{dailyData.lunarDateStr}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white font-cinzel flex items-center gap-2">
              <span>{dailyData.todayTheme}</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {dailyData.elementBalancingTip}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-black/60 border border-amber-500/40 shadow-inner">
              <div className="text-3xl font-light font-mono text-amber-400">
                {dailyData.harmonyLevel}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold mt-1">
                Độ Thuận Khí
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. 4 FOCAL DOMAINS DAILY ENERGY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: 'career', label: 'Sự Nghiệp', data: dailyData.focalDomains.career, color: 'text-purple-400', border: 'border-purple-500/30' },
          { key: 'finance', label: 'Tài Chính', data: dailyData.focalDomains.finance, color: 'text-teal-400', border: 'border-teal-500/30' },
          { key: 'relationships', label: 'Mối Quan Hệ', data: dailyData.focalDomains.relationships, color: 'text-rose-400', border: 'border-rose-500/30' },
          { key: 'growth', label: 'Tự Phản Chiếu', data: dailyData.focalDomains.personalGrowth, color: 'text-amber-400', border: 'border-amber-500/30' },
        ].map(({ key, label, data, color, border }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className={`p-4 rounded-3xl bg-black/40 border ${border} space-y-2 flex flex-col justify-between backdrop-blur-xl shadow-lg`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-bold text-slate-200">{label}</span>
                <span className={`text-base font-bold font-mono ${color}`}>{data.score}đ</span>
              </div>
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{data.note}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. AUSPICIOUS HOURS & OPPORTUNITY HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auspicious & Incompatible Hours */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3.5 backdrop-blur-2xl shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Khung Giờ Hoàng Đạo & Thận Trọng
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-teal-500/30 space-y-1.5">
              <span className="text-teal-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Giờ Cát Lợi (Thực hiện việc trọng đại / Đàm phán):</span>
              </span>
              <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                {dailyData.auspiciousHours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/30 space-y-1.5">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Giờ Thận Trọng (Tránh xung đột / Ký kết vội):</span>
              </span>
              <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                {dailyData.incompatibleHours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Actionable Priorities & Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3.5 backdrop-blur-2xl shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Điểm Sáng Cơ Hội & Lưu Ý
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1.5">
              <span className="text-purple-300 font-semibold">Tối Ưu Hóa Năng Lượng Ngày:</span>
              <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                {dailyData.opportunities.map((opp, i) => (
                  <li key={i}>{opp}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
              <span className="text-amber-400 font-semibold">Phòng Ngừa Rủi Ro:</span>
              <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                {dailyData.cautionSignals.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
