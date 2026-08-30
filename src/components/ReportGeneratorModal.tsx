// ==========================================
// EXECUTIVE DESTINY DOSSIER & REPORT MODAL
// ==========================================

import React, { useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Sparkles,
  Shield,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { MultiAgentEnsemble } from '../types/ai';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { PALACE_DEFS } from '../engine/ziwei';
import { LanguageCode } from '../types/destiny';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  ensemble: MultiAgentEnsemble;
  backtest: BacktestResult;
  language: LanguageCode;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<Props> = ({
  profile,
  calculation,
  ensemble,
  backtest,
  language,
  onClose
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-cinzel">
              Hồ Sơ Mệnh Lý & Báo Cáo Chiến Lược Toàn Diện
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Báo Cáo / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div
          ref={reportRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-200 text-xs print:bg-white print:text-black print:p-0 scrollbar-thin"
        >
          {/* Cover Header */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  HỒ SƠ BẢN MỆNH BẢO MẬT CAO CẤP
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-cinzel">
                  {profile.name}
                </h1>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Độ Nhất Quán Mô Hình</div>
                <div className="text-lg font-bold font-mono text-cyan-400">
                  {ensemble.overallConsistencyScore}/100
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
              <span>Sinh: {profile.birthData.solarDay}/{profile.birthData.solarMonth}/{profile.birthData.solarYear} ({profile.birthData.solarHour}:{profile.birthData.solarMinute})</span>
              <span>Nơi sinh: {profile.birthData.birthCity}</span>
              <span>Bản Mệnh: {bazi.structureType}</span>
              <span>Cục: {ziwei.elementBureau}</span>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-cinzel">
              1. TỔNG QUAN CHIẾN LƯỢC & QUY LUẬT VẬN TRÌNH
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {ensemble.executiveSummary}
            </p>
          </div>

          {/* 2. Four Pillars Matrix */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-cinzel">
              2. MA TRẬN TỨ TRỤ BÁT TỰ
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              {[
                { title: 'Trụ Giờ', p: bazi.hourPillar },
                { title: 'Trụ Ngày (Nhật Chủ)', p: bazi.dayPillar, active: true },
                { title: 'Trụ Tháng', p: bazi.monthPillar },
                { title: 'Trụ Năm', p: bazi.yearPillar },
              ].map(({ title, p, active }, i) => (
                <div key={i} className={`p-2.5 rounded-xl border ${active ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="text-[10px] text-slate-400">{title}</div>
                  <div className="text-sm font-bold text-white my-1 font-serif">
                    {STEMS[p.stem]?.nameVi || p.stem} {BRANCHES[p.branch]?.nameVi || p.branch}
                  </div>
                  <div className="text-[10px] text-cyan-300">{p.tenGod}</div>
                  <div className="text-[9px] text-slate-500 truncate">{p.naYin}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Five Elements & Favorable */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-300">Cân Bằng Ngũ Hành</span>
              <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                <span className="text-emerald-400">Mộc {bazi.elementBalance.Wood}%</span>
                <span className="text-rose-400">Hỏa {bazi.elementBalance.Fire}%</span>
                <span className="text-amber-400">Thổ {bazi.elementBalance.Earth}%</span>
                <span className="text-slate-300">Kim {bazi.elementBalance.Metal}%</span>
                <span className="text-cyan-400">Thủy {bazi.elementBalance.Water}%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <div>Dụng Thần: <strong className="text-cyan-300">{bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong></div>
              <div>Kỵ Thần: <strong className="text-rose-300">{bazi.unfavorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ')}</strong></div>
            </div>
          </div>

          {/* 4. Zi Wei 12 Palaces Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-cinzel">
              3. TỔNG HỢP 12 CUNG VỊ TỬ VI ĐẨU SỐ
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PALACE_DEFS.map((def) => {
                const pal = ziwei.palaces[def.key];
                return (
                  <div key={def.key} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300">{def.nameVi}</span>
                      <span className="font-mono text-slate-400">{pal?.score}đ</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {pal?.majorStars?.map(s => s?.nameVi || '').filter(Boolean).join(', ') || 'Chính tinh đắc địa'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Backtesting Empirical Proof */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-cinzel">
              4. KIỂM CHỨNG LỊCH SỬ (BACKTESTING SCORE: {backtest.destinyConsistencyScore}/100)
            </h2>
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/40 text-xs space-y-1.5">
              <div>Độ tin cậy: <strong className="text-emerald-300">{backtest.confidenceBand}</strong> ({backtest.totalEventsAnalyzed} sự kiện đã kiểm chứng)</div>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                {backtest.strengthsSummary.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Strategic Timing Windows */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-cinzel">
              5. CỬA SỔ THỜI ĐIỂM CHIẾN LƯỢC TRUNG HẠN
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ensemble.strategicTimingWindows.map((win, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-indigo-300">{win.timeframe} ({win.phaseType})</div>
                  <p className="text-slate-300 text-[11px]">{win.strategicFocus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 italic text-center">
            {ensemble.responsibleDisclaimer} • Aurora Mathematical Core v2.4.1
          </div>
        </div>
      </div>
    </div>
  );
};
