// ==========================================
// RESPONSIBLE AI & ETHICAL BOUNDARY BANNER
// ==========================================

import React, { useState } from 'react';
import { ShieldCheck, Info, X, Sparkles } from 'lucide-react';
import { t } from '../i18n/translations';
import { LanguageCode } from '../types/destiny';

interface Props {
  language: LanguageCode;
  consistencyScore?: number;
  uncertaintyIndex?: number;
}

export const ResponsibleAIBanner: React.FC<Props> = ({
  language,
  consistencyScore = 88,
  uncertaintyIndex = 12
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-white/[0.02] backdrop-blur-md border-b border-white/10 px-3 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="leading-tight text-xs text-slate-300">
            <span className="font-semibold text-teal-300">Nguyên Tắc Trí Tuệ Nhân Tạo:</span>{' '}
            {t('disclaimerText', language)}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 font-mono">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Độ Nhất Quán Mô Hình: {consistencyScore}/100</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 font-mono">
            <span>Độ Bất Định: {uncertaintyIndex}%</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
