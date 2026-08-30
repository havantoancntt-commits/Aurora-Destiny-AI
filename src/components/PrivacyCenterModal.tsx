// ==========================================
// PRIVACY CENTER & DATA SOVEREIGNTY MODAL
// ==========================================

import React, { useState } from 'react';
import {
  Shield,
  Download,
  Trash2,
  Lock,
  EyeOff,
  Database,
  CheckCircle2,
  X,
  FileCode
} from 'lucide-react';
import { UserPreferences } from '../types/user';
import { LanguageCode } from '../types/destiny';

interface Props {
  profileId: string;
  preferences: UserPreferences;
  onUpdatePreferences: (pref: Partial<UserPreferences>) => Promise<void>;
  onExportData: (profileId: string) => void;
  onClose: () => void;
}

export const PrivacyCenterModal: React.FC<Props> = ({
  profileId,
  preferences,
  onUpdatePreferences,
  onExportData,
  onClose
}) => {
  const [anonymize, setAnonymize] = useState(preferences.anonymizeData);
  const [aiLearning, setAiLearning] = useState(preferences.enableAILearning);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await onUpdatePreferences({
      anonymizeData: anonymize,
      enableAILearning: aiLearning
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white font-cinzel">
              Trung Tâm Quyền Riêng Tư & Chủ Quyền Dữ Liệu
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Export Full Dossier */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-200">Xuất Toàn Bộ Dữ Liệu (JSON)</h4>
              <p className="text-[11px] text-slate-400">Tải về toàn bộ lá số, lịch sử backtest và nhật ký trao đổi.</p>
            </div>
            <button
              onClick={() => onExportData(profileId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải JSON</span>
            </button>
          </div>

          {/* Anonymization Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200">Ẩn Danh Dữ Liệu Cá Nhân</h4>
                <p className="text-[11px] text-slate-400">
                  Mã hóa tên và thông tin nhận dạng trước khi gửi tới tầng AI tổng hợp.
                </p>
              </div>
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0"
              />
            </div>
          </div>

          {/* AI Memory Control */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200">Kích Hoạt Ngữ Cảnh Dài Hạn AI</h4>
                <p className="text-[11px] text-slate-400">
                  Cho phép AI lưu giữ các mục tiêu chiến lược để tư vấn nhất quán qua các phiên.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiLearning}
                onChange={(e) => setAiLearning(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Core Commitments */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Cam Kết Quyền Riêng Tư Tuyệt Đối:</span>
            </div>
            <ul className="space-y-0.5 text-slate-300 pl-4 list-disc">
              <li>Không bán hay chia sẻ dữ liệu sinh cho bên thứ ba.</li>
              <li>Engine tính toán chạy chuẩn định trên máy chủ an toàn.</li>
              <li>Bạn có toàn quyền trích xuất hoặc xóa bỏ vĩnh viễn bất kỳ lúc nào.</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật cài đặt!
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              Lưu Thiết Lập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
