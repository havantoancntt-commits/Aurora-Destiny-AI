// ==========================================
// AURORA DESTINY AI — REFLECTION JOURNAL & RETENTION ENGINE
// Self-Reflection, Weekly Insights & Respectful Retention (No Dark Patterns)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Calendar,
  Save,
  Trash2,
  Download,
  CheckCircle2,
  TrendingUp,
  Heart,
  Briefcase,
  Coins,
  Shield,
  Clock,
  Star,
  Plus,
  Compass,
  Smile
} from 'lucide-react';
import { CalculationResult } from '../types/destiny';
import { LanguageCode } from '../types/destiny';

export interface JournalEntry {
  id: string;
  date: string;
  rating: number; // 1 to 5
  domain: 'career' | 'finance' | 'relationships' | 'growth' | 'wellness';
  note: string;
  energyAlignment: string; // e.g. 'Thuận Dụng Thần' | 'Thận Trọng'
  createdAt: string;
}

export interface SavedInsight {
  id: string;
  title: string;
  content: string;
  source: string;
  savedAt: string;
}

interface Props {
  calculation: CalculationResult;
  language: LanguageCode;
  onClose?: () => void;
}

const STORAGE_KEY_JOURNAL = 'aurora_destiny_reflection_journal';
const STORAGE_KEY_INSIGHTS = 'aurora_destiny_saved_insights';

export const ReflectionJournal: React.FC<Props> = ({ calculation, language, onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOURNAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load journal from localStorage', e);
    }
    return [
      {
        id: 'entry_default_1',
        date: new Date().toISOString().split('T')[0],
        rating: 5,
        domain: 'career',
        note: 'Đã ứng dụng nguyên tắc Dụng Thần để giữ vững sự bình tĩnh trong cuộc đàm phán hợp đồng sáng nay. Kết quả rất thuận lợi.',
        energyAlignment: 'Thuận Dụng Thần',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSIGHTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved insights from localStorage', e);
    }
    return [
      {
        id: 'ins_1',
        title: `Dụng Thần Bản Mệnh: ${calculation.bazi.favorableElements.join(', ')}`,
        content: `Cốt lõi bản mệnh cần tương sinh với hành ${calculation.bazi.favorableElements.join(', ')} để giảm thiểu hao tổn khí lực và khơi thông sức sáng tạo.`,
        source: 'Bát Tự Mệnh Bàn',
        savedAt: new Date().toISOString()
      }
    ];
  });

  // Active view: 'journal' | 'insights' | 'summary'
  const [activeTab, setActiveTab] = useState<'journal' | 'insights' | 'summary'>('journal');

  // New entry form state
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newRating, setNewRating] = useState<number>(4);
  const [newDomain, setNewDomain] = useState<'career' | 'finance' | 'relationships' | 'growth' | 'wellness'>('career');
  const [newNote, setNewNote] = useState<string>('');
  const [newAlignment, setNewAlignment] = useState<string>('Thuận Dụng Thần');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(entries));
    } catch (e) {
      console.warn('Could not persist journal', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(savedInsights));
    } catch (e) {
      console.warn('Could not persist insights', e);
    }
  }, [savedInsights]);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      rating: newRating,
      domain: newDomain,
      note: newNote.trim(),
      energyAlignment: newAlignment,
      createdAt: new Date().toISOString()
    };

    setEntries([newEntry, ...entries]);
    setNewNote('');
    setIsAddingEntry(false);
    showToast('Đã lưu nhật ký chiêm nghiệm thành công!');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    showToast('Đã xóa ghi chép');
  };

  const handleDeleteInsight = (id: string) => {
    setSavedInsights(savedInsights.filter(i => i.id !== id));
    showToast('Đã xóa khỏi danh sách lưu');
  };

  const handleExportJournal = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      app: 'Aurora Destiny AI',
      profileCalculationId: calculation.id,
      exportedAt: new Date().toISOString(),
      journalEntries: entries,
      savedInsights
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aurora_reflection_journal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất toàn bộ nhật ký chiêm nghiệm');
  };

  // Domain badge colors
  const domainConfig = {
    career: { label: 'Sự Nghiệp', icon: Briefcase, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    finance: { label: 'Tài Chính', icon: Coins, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    relationships: { label: 'Mối Quan Hệ', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    growth: { label: 'Tự Phát Triển', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    wellness: { label: 'Thân Tâm', icon: Smile, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      <AnimatePresence>
        {feedbackNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black/90 border border-amber-500/40 text-amber-300 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{feedbackNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
              Nhật Ký Chiêm Nghiệm & Lưu Trữ Tinh Hoa
            </h3>
            <p className="text-xs text-slate-400">
              Ghi lại sự cộng hưởng giữa các chu kỳ năng lượng và quyết định thực tế của bạn.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'journal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhật Ký ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'insights'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã Lưu ({savedInsights.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'summary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tổng Kết Tuần
          </button>
        </div>
      </div>

      {/* 1. JOURNAL TAB */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Dữ liệu được bảo mật cục bộ tại trình duyệt của bạn (Privacy-First).
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJournal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Tải về file JSON cá nhân"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Xuất file</span>
              </button>
              <button
                onClick={() => setIsAddingEntry(!isAddingEntry)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-semibold text-black transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Viết Nhật Ký</span>
              </button>
            </div>
          </div>

          {/* Add New Entry Form */}
          <AnimatePresence>
            {isAddingEntry && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveEntry}
                className="p-5 rounded-3xl bg-black/60 border border-amber-500/40 space-y-4 backdrop-blur-xl overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ghi Chép Chiêm Nghiệm Hôm Nay</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date().toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Rating */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Mức độ an hòa nội tâm (1-5)</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Domain */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Lĩnh vực trọng tâm</label>
                    <select
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="career">Sự Nghiệp & Dự Án</option>
                      <option value="finance">Tài Chính & Đầu Tư</option>
                      <option value="relationships">Mối Quan Hệ & Gia Đình</option>
                      <option value="growth">Phát Triển Cá Nhân</option>
                      <option value="wellness">Thân Tâm & Sức Khỏe</option>
                    </select>
                  </div>

                  {/* Energy Alignment */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Cảm nhận năng lượng</label>
                    <select
                      value={newAlignment}
                      onChange={(e) => setNewAlignment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="Thuận Dụng Thần">Thuận Dụng Thần (Thuận dòng, suôn sẻ)</option>
                      <option value="Thận Trọng">Thận Trọng (Cần kiên nhẫn, rà soát)</option>
                      <option value="Cân Bằng">Cân Bằng (Bình hòa, ổn định)</option>
                      <option value="Thử Thách Vượt Qua">Thử Thách Vượt Qua (Tăng trưởng bản lĩnh)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Chiêm nghiệm & bài học rút ra</label>
                  <textarea
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Hôm nay bạn đã đưa ra quyết định gì? Nhịp năng lượng diễn ra như thế nào so với dự báo của la số?..."
                    className="w-full p-3 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingEntry(false)}
                    className="px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300 transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black transition-all cursor-pointer shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Chiêm Nghiệm</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Entries List */}
          {entries.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Bạn chưa có nhật ký nào. Hãy bấm "Viết Nhật Ký" để bắt đầu ghi lại hành trình.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const conf = domainConfig[entry.domain] || domainConfig.career;
                const DomainIcon = conf.icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all space-y-2.5 backdrop-blur-xl group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${conf.color}`}>
                          <DomainIcon className="w-3 h-3" />
                          <span>{conf.label}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-slate-300 border border-white/10">
                          {entry.energyAlignment}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: entry.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">{entry.date}</span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                          title="Xóa ghi chép này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pl-1">
                      {entry.note}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. SAVED INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Các phát hiện then chốt, Dụng Thần và cẩm nang hành động bạn đã lưu giữ từ các phân tích.
          </p>

          {savedInsights.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Chưa có phát hiện nào được lưu lại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-3xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold font-mono">
                        {insight.source}
                      </span>
                      <button
                        onClick={() => handleDeleteInsight(insight.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Bỏ lưu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5 font-mono">
                    Lưu ngày {new Date(insight.savedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. WEEKLY SUMMARY TAB */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Nhịp Điệu Chiêm Nghiệm Tuần Này</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {entries.length} phiên ghi nhận
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                <div className="text-xl font-bold font-mono text-amber-400">
                  {entries.length > 0
                    ? (entries.reduce((acc, e) => acc + e.rating, 0) / entries.length).toFixed(1)
                    : '5.0'}
                  <span className="text-xs text-slate-400 font-normal">/5</span>
                </div>
                <span className="text-[10px] text-slate-400">Độ an hòa bình quân</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                <div className="text-xl font-bold font-mono text-teal-400">
                  {calculation.bazi.favorableElements.join(', ')}
                </div>
                <span className="text-[10px] text-slate-400">Hành Dụng Thần cốt lõi</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                <div className="text-xl font-bold font-mono text-purple-400">
                  {typeof calculation.annualTransits[0]?.opportunityWave === 'number'
                    ? `${calculation.annualTransits[0].opportunityWave}%`
                    : '—'}
                </div>
                <span className="text-[10px] text-slate-400">Sóng cơ hội lưu niên</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {entries.length} ngày
                </div>
                <span className="text-[10px] text-slate-400">Chuỗi tự phản chiếu</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
              💡 <strong>Lời khuyên tuần:</strong> Sự tự chủ và kỷ luật hành vi là chìa khóa định hình tương lai. Bằng cách định kỳ ghi lại cảm xúc và đối chiếu với nhịp năng lượng ngày, bạn xây dựng được bộ phản xạ quản trị rủi ro vững chắc nhất.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
