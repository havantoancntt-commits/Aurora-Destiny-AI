// ==========================================
// PWA INSTALL BUTTON COMPONENT — NAVBAR & HEADER
// Clean, luxury trigger with auto-suppression in standalone mode
// ==========================================

import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface Props {
  className?: string;
  variant?: 'compact' | 'full' | 'floating' | 'banner';
  onInstallSuccess?: () => void;
}

export const PWAInstallButton: React.FC<Props> = ({
  className = '',
  variant = 'compact',
  onInstallSuccess
}) => {
  const { isInstalled, isIOS, hasNativePrompt, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('aurora_pwa_banner_dismissed') === '1';
    } catch {
      return false;
    }
  });

  // If already installed and running standalone, suppress the install button
  if (isInstalled) {
    return null;
  }

  const handleTriggerInstall = async () => {
    if (hasNativePrompt) {
      const outcome = await install();
      if (outcome === 'accepted') {
        onInstallSuccess?.();
        return;
      }
    }
    // If iOS or native prompt dismissed/unavailable, show step-by-step guided modal
    setIsModalOpen(true);
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('aurora_pwa_banner_dismissed', '1');
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Compact variant: Perfect for top navbar without overflowing */}
      {variant === 'compact' && (
        <button
          id="btn-pwa-install-header"
          onClick={handleTriggerInstall}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-400/25 border border-amber-500/40 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] cursor-pointer select-none shrink-0 ${className}`}
          title="Cài đặt ứng dụng Tinh Hoa Tử Vi vào thiết bị"
        >
          {isIOS ? (
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="font-sans font-semibold tracking-wide hidden min-[360px]:inline text-[11px] sm:text-xs">
            Cài App
          </span>
        </button>
      )}

      {/* Full variant: For drawers, modals, onboarding */}
      {variant === 'full' && (
        <button
          id="btn-pwa-install-full"
          onClick={handleTriggerInstall}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer select-none ${className}`}
        >
          {isIOS ? (
            <Smartphone className="w-4 h-4 text-slate-950" />
          ) : (
            <Download className="w-4 h-4 text-slate-950" />
          )}
          <span>Cài Đặt Tinh Hoa Tử Vi (PWA)</span>
        </button>
      )}

      {/* Floating variant: Positioned above mobile BottomNav safely */}
      {variant === 'floating' && (
        <button
          id="btn-pwa-install-floating"
          onClick={handleTriggerInstall}
          className={`fixed bottom-24 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-200 text-xs font-medium shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all cursor-pointer ${className}`}
          title="Cài đặt ứng dụng vào màn hình chính"
        >
          <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="text-[11px]">Cài App</span>
        </button>
      )}

      {/* Smart Banner variant: Elegant top notification banner for mobile web */}
      {variant === 'banner' && !isDismissed && (
        <div
          id="banner-pwa-smart-install"
          className={`w-full bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-purple-950/70 border-b border-amber-500/30 px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-lg backdrop-blur-md ${className}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-left truncate">
              <p className="font-semibold text-amber-200 text-[11px] truncate">
                Cài đặt Tinh Hoa Tử Vi
              </p>
              <p className="text-[10px] text-slate-400 truncate hidden min-[340px]:block">
                Mượt mà, không quảng cáo, mở nhanh từ màn hình chính
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleTriggerInstall}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-sm cursor-pointer transition-all"
            >
              Cài Đặt
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Để sau"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
