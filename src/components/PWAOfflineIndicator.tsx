// ==========================================
// PWA CONNECTIVITY & UPDATE NOTIFICATION INDICATOR
// Non-intrusive floating indicator for offline and updates
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RefreshCw, Sparkles, Check } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAOfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { updateAvailable, applyUpdate } = usePWAInstall();

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none flex flex-col gap-2">
      {/* 1. Offline Mode Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-200 text-xs font-medium shadow-2xl backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Chế độ Ngoại Tuyến • Dữ liệu đang được lưu trữ cục bộ</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Service Worker Update Available Notification */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/40 text-purple-100 text-xs font-medium shadow-2xl backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Đã có phiên bản cập nhật mới!</span>
            <button
              onClick={applyUpdate}
              className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Cập Nhật Ngay</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
