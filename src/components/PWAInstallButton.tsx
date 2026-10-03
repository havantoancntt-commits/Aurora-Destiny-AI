// ==========================================
// PWA INSTALL BUTTON COMPONENT — NAVBAR & HEADER
// Clean, luxury trigger with auto-suppression in standalone mode
// ==========================================

import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface Props {
  className?: string;
  variant?: 'compact' | 'full' | 'floating';
}

export const PWAInstallButton: React.FC<Props> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstalled, isIOS, hasNativePrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and running standalone, suppress the install button
  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS, still allow opening guided modal from menu/header
  return (
    <>
      {variant === 'compact' && (
        <button
          id="btn-pwa-install-header"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-400/25 border border-amber-500/40 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] cursor-pointer select-none ${className}`}
          title="Cài đặt ứng dụng Aurora Destiny AI vào thiết bị"
        >
          {isIOS ? (
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-sans font-semibold tracking-wide">Cài App</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          id="btn-pwa-install-full"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer ${className}`}
        >
          {isIOS ? (
            <Smartphone className="w-4 h-4 text-slate-950" />
          ) : (
            <Download className="w-4 h-4 text-slate-950" />
          )}
          <span>Cài Đặt Aurora AI (PWA)</span>
        </button>
      )}

      {variant === 'floating' && (
        <button
          id="btn-pwa-install-floating"
          onClick={() => setIsModalOpen(true)}
          className={`fixed bottom-20 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 border border-amber-500/50 text-amber-200 text-xs font-semibold shadow-xl backdrop-blur-md hover:bg-slate-800 transition-all cursor-pointer ${className}`}
          title="Cài đặt ứng dụng vào màn hình chính"
        >
          <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Cài Đặt App</span>
        </button>
      )}

      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
