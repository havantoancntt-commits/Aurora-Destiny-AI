// ==========================================
// WHAT-IF SCENARIO BRANCHING SIMULATOR
// Ultra-luxury animated Scenario Simulator
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitBranch,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ScenarioAnalysisResult, ScenarioOption } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { evaluateWhatIfScenario } from '../engine/scenarios';
import { LanguageCode } from '../types/destiny';
import { t } from '../i18n/translations';

interface Props {
  calculation: CalculationResult;
  language: LanguageCode;
}

export const ScenarioSimulator: React.FC<Props> = ({ calculation, language }) => {
  const [question, setQuestion] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<ScenarioAnalysisResult | null>(() =>
    evaluateWhatIfScenario('Tôi có nên chuyển sang khởi nghiệp / đổi công việc trong năm nay?', calculation)
  );

  const presetQuestions = [
    'Tôi có nên khởi nghiệp công nghệ AI trong năm nay không?',
    'Nên chuyển công tác sang thị trường nước ngoài hay ở lại?',
    'Có nên mở rộng quy mô vốn đầu tư tài sản trong 12 tháng tới?',
    'Nên chuyển đổi từ vị trí kỹ thuật sang quản lý điều hành?'
  ];

  const handleEvaluate = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim()) return;

    setIsEvaluating(true);
    try {
      // Simulate / evaluate
      const res = evaluateWhatIfScenario(query, calculation);
      setResult(res);
      setQuestion(query);
    } finally {
      setIsEvaluating(false);
    }
  };

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
            <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel">
              Mô Phỏng Kịch Bản Rẽ Nhánh Tương Lai
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            So sánh đa chiều các lựa chọn tương lai dựa trên chu kỳ năng lượng và dữ liệu lá số.
          </p>
        </div>
      </motion.div>

      {/* Input Query Bar & Presets */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-3.5 backdrop-blur-2xl shadow-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEvaluate();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            placeholder={`Nhập câu hỏi ngã rẽ bạn đang cân nhắc (VD: Tôi có nên mở rộng công ty năm ${new Date().getFullYear()}?)...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-400 transition-all placeholder:text-slate-500"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isEvaluating || !question.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-black text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEvaluating ? 'Đang mô phỏng...' : 'Mô Phỏng Ngay'}</span>
          </motion.button>
        </form>

        {/* Preset Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] text-slate-400 font-medium">Câu hỏi mẫu gợi ý:</div>
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((preset, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEvaluate(preset)}
                className="px-3 py-1.5 rounded-xl text-xs bg-black/40 border border-white/10 hover:border-teal-400/40 text-slate-300 hover:text-teal-300 transition-all text-left cursor-pointer"
              >
                {preset}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Result Simulation Breakdown */}
      {result && (
        <div className="space-y-4">
          {/* Executive Context Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/20 via-teal-950/20 to-black/60 border border-teal-500/30 space-y-2 backdrop-blur-xl shadow-xl"
          >
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider font-cinzel flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Kết Luận Tổng Hợp Chiến Lược</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {result.synthesisAdvice}
            </p>
            <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2">
              {result.contextSummary}
            </div>
          </motion.div>

          {/* 3 Scenario Branches (A, B, C) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {result.scenarios.map((sc) => {
              const isOptionA = sc.scenarioId === 'A';
              const isOptionB = sc.scenarioId === 'B';
              const isOptionC = sc.scenarioId === 'C';

              return (
                <motion.div
                  key={sc.scenarioId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-3xl border p-5 sm:p-6 flex flex-col justify-between space-y-4 backdrop-blur-2xl transition-all ${
                    isOptionB
                      ? 'bg-gradient-to-b from-teal-950/30 to-black/60 border-teal-500/50 shadow-[0_0_25px_rgba(45,212,191,0.15)] ring-1 ring-teal-500/30'
                      : isOptionC
                      ? 'bg-gradient-to-b from-purple-950/30 to-black/60 border-purple-500/40 shadow-[0_0_25px_rgba(124,58,237,0.15)]'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                          isOptionB
                            ? 'bg-teal-950 text-teal-300 border border-teal-800 shadow-sm'
                            : isOptionC
                            ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-sm'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {sc.scenarioId} • {sc.type}
                      </span>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Độ Cộng Hưởng</div>
                        <div className="text-lg font-bold font-mono text-teal-400">
                          {sc.energyAlignmentScore}/100
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white font-cinzel">
                      {sc.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sc.description}
                    </p>

                    {/* Timing Window */}
                    <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-300 font-medium">{sc.optimalTiming}</span>
                    </div>

                    {/* Advantages */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Lợi Thế Tiềm Năng:</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 pl-2">
                        {sc.potentialAdvantages.map((adv, i) => (
                          <li key={i} className="list-disc list-inside leading-relaxed">
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Thách Thức Trọng Yếu:</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 pl-2">
                        {sc.keyChallenges.map((ch, i) => (
                          <li key={i} className="list-disc list-inside text-slate-300 leading-relaxed">
                            {ch}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="pt-2.5 border-t border-white/10 text-[11px] text-slate-400 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                    <span className="font-semibold text-slate-300">Điều kiện kích hoạt: </span>
                    {sc.requiredConditions.join('; ')}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 italic text-center opacity-75">
            {result.riskNotice}
          </div>
        </div>
      )}
    </div>
  );
};
