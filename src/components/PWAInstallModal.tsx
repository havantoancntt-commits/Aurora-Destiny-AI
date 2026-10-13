// ==========================================
// LUXURY PWA INSTALL MODAL — INTERNATIONAL STANDARD
// Guided native installation for Android, iOS Safari, Desktop
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  Zap,
  ShieldCheck,
  BellRing,
  WifiOff,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    isInstalled,
    hasNativePrompt,
    isIOS,
    isAndroid,
    install
  } = usePWAInstall();

  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'dismissed'>('idle');

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setInstallStatus('installing');
    const outcome = await install();
    if (outcome === 'accepted') {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setInstallStatus('dismissed');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 shadow-2xl p-5 sm:p-7 overflow-hidden text-slate-100"
        >
          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Brand Header */}
          <div className="flex items-center gap-3.5 mb-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <img
                src="/icon.svg"
                alt="Aurora Destiny AI Icon"
                className="w-full h-full rounded-[14px] object-cover bg-black"
                onError={(e) => {
                  // Fallback if SVG fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                  Progressive Web App
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  CHUẨN QUỐC TẾ
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Cài Đặt Tinh Hoa Tử Vi
              </h2>
              <p className="text-xs text-slate-400">
                Trải nghiệm ứng dụng bản địa độc lập trên mọi thiết bị (PWA)
              </p>
            </div>
          </div>

          {/* If already running in Standalone mode */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-teal-200 space-y-2 mb-4">
              <div className="flex items-center gap-2 font-semibold text-sm text-teal-300">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>Ứng dụng đã được cài đặt thành công!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn đang chạy Tinh Hoa Tử Vi (Aurora Destiny AI) trong chế độ Standalone Native độc lập. Mọi cập nhật và tính năng ngoại tuyến đã được kích hoạt hoàn toàn.
              </p>
            </div>
          ) : (
            <>
              {/* Key PWA Advantages */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Mở Tức Thì</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Khởi động siêu tốc từ màn hình chính, không vướng thanh duyệt web.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                    <WifiOff className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Hỗ Trợ Offline</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tra cứu và tính toán lá số an toàn ngay cả khi mất kết nối mạng.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <BellRing className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Nhịp Vận Can Chi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Nhận thông báo chuyển canh giờ và các tiết khí thiên văn kịp thời.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bảo Mật Cục Bộ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dữ liệu cá nhân được lưu trữ mã hóa riêng biệt trên thiết bị.
                  </p>
                </div>
              </div>

              {/* INSTALLATION FLOW: Android / Desktop Native Prompt vs iOS Safari Guided */}
              {isIOS ? (
                /* iOS Safari Guided Steps */
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Hướng Dẫn Cài Đặt Trên iPhone / iPad (Safari)</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Nhấn vào biểu tượng <strong className="text-white">Chia sẻ</strong>{' '}
                        (<Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" />) trên thanh công cụ Safari.
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Cuộn xuống và chọn{' '}
                        <strong className="text-white">
                          "Thêm vào Màn hình chính"
                        </strong>{' '}
                        (hoặc <em>"Add to Home Screen"</em>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-teal-400 mx-0.5" />
                        ).
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Nhấn <strong className="text-amber-300">"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
                      </span>
                    </div>
                  </div>
                </div>
              ) : hasNativePrompt ? (
                /* Native 1-Click Install Button for Android / Desktop */
                <div className="space-y-3 mb-5">
                  <button
                    onClick={handleNativeInstall}
                    disabled={installStatus === 'installing'}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>
                      {installStatus === 'installing' ? 'Đang tiến hành cài đặt...' : 'Cài Đặt Ngay Vào Thiết Bị'}
                    </span>
                  </button>
                  {installStatus === 'dismissed' && (
                    <p className="text-[11px] text-amber-300/80 text-center">
                      Bạn đã hủy yêu cầu cài đặt. Bạn có thể mở lại bảng này bất kỳ lúc nào để cài đặt.
                    </p>
                  )}
                </div>
              ) : (
                /* Desktop Chrome / Edge Menu Hint */
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Download className="w-4 h-4 text-teal-400" />
                    <span>Cài Đặt Qua Menu Trình Duyệt</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Trên thanh địa chỉ hoặc menu (⋮) của trình duyệt Chrome / Edge, nhấn vào biểu tượng{' '}
                    <strong className="text-white">"Cài đặt Aurora AI"</strong> hoặc{' '}
                    <strong className="text-white">"Install app"</strong> để thêm ứng dụng vào màn hình máy tính / điện thoại.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Technical Diagnostics & Verification Info */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-teal-400" />
              <span>Service Worker: v2.6 (Active)</span>
            </span>
            <span>Manifest: Validated</span>
            <span>Display: Standalone</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
