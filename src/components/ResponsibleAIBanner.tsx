// ==========================================
// RESPONSIBLE AI & ETHICAL BOUNDARY BANNER
// Ultra-sleek, unobtrusive, international standard
// ==========================================

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
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
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('aurora_responsible_ai_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('aurora_responsible_ai_dismissed', 'true');
    } catch (e) {
      console.error('Session storage unavailable', e);
    }
  };

  if (dismissed) return null;

  return (
    <aside aria-label="Responsible AI & Ethical Boundary Banner" className="w-full bg-[#090b14]/90 backdrop-blur-md border-b border-white/[0.08] px-3 sm:px-6 py-1.5 text-xs text-slate-300 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="leading-normal text-[11px] sm:text-xs text-slate-300/90 truncate sm:whitespace-normal font-light">
            <span className="font-medium text-teal-300">Chuẩn Mực Khoa Học &amp; Chiêm Nghiệm:</span>{' '}
            <span className="text-slate-400">{t('disclaimerText', language)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-teal-300">
              Độ Nhất Quán {consistencyScore}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
              Bất Định {uncertaintyIndex}%
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng thông báo"
            aria-label="Đóng thông báo chuẩn mực AI"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
