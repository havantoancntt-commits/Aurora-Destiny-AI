// ==========================================
// AURORA DESTINY AI — CẨM NANG & TỪ ĐIỂN GIẢI MÃ THUẬT NGỮ TINH HOA
// Comprehensive Interactive Metaphysical Glossary & Practical Life Guide
// Zero-Pill Discipline, Typographic Hierarchy, Audio Pronunciation & Search
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  Copy,
  Compass,
  Layers,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  Heart,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import {
  ASTROLOGY_GLOSSARY,
  GlossaryCategory,
  GlossaryItem,
  searchGlossary
} from '../data/astrologyGlossary';
import { sacredVoice } from '../services/sacredVoiceService';
import { sacredSound } from '../services/soundService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string;
}

export const AstrologyGlossaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTermId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GlossaryItem | null>(() => {
    if (initialTermId) {
      return ASTROLOGY_GLOSSARY.find((item) => item.id === initialTermId) || ASTROLOGY_GLOSSARY[0];
    }
    return ASTROLOGY_GLOSSARY[0];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filtered glossary items based on category and query
  const filteredItems = useMemo(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    return searchGlossary(searchQuery, cat);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleCopy = (item: GlossaryItem) => {
    const textToCopy = `${item.termVi} (${item.termEn}):\n- Bản chất: ${item.shortDefinition}\n- Ý nghĩa đời sống: ${item.lifeMeaning.general}\n- Lời khuyên: ${item.actionableAdvice}\n- Ví dụ: ${item.example}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      sacredSound.playCelestialChime(880);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSpeak = (item: GlossaryItem) => {
    if (isSpeaking) {
      sacredVoice.stop();
      setIsSpeaking(false);
      return;
    }

    const narration = `Giải mã thuật ngữ: ${item.termVi}. ${item.shortDefinition}. Về đời sống: ${item.lifeMeaning.general}. Lời khuyên vàng: ${item.actionableAdvice}.`;
    setIsSpeaking(true);
    sacredVoice.speak('glossary_term', narration);

    // Auto reset state after speech ends
    setTimeout(() => {
      setIsSpeaking(false);
    }, 12000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Main Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[850px] bg-gradient-to-b from-[#121526]/98 via-[#0b0d19]/98 to-[#05060d]/98 border border-amber-500/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-2xl"
      >
        {/* 1. Header (Fixed) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-4 shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80 uppercase tracking-widest">
                <span>Cẩm Nang Tri Thức</span>
                <span>·</span>
                <span>Chính Tông & Dễ Hiểu</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                Giải Mã Toàn Diện Thuật Ngữ Tử Vi & Bát Tự
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng cẩm nang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Controls Bar: Search & Category Filter (Fixed) */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-black/20 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhanh thuật ngữ (VD: Chính Quan, Hóa Kỵ, Dụng Thần, Cung Mệnh...)"
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs (Segmented Button Control - Compliant with Zero-Pill Design) */}
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'bazi', label: 'Tứ Trụ & Thập Thần' },
              { id: 'ziwei_palaces', label: '12 Cung Tử Vi' },
              { id: 'ziwei_stars', label: 'Chính Tinh & Tứ Hóa' },
              { id: 'astronomy_rules', label: 'Thiên Văn & Quy Tắc' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Workspace: Two-Column Master / Detail Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: Term List (Scrollable) */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto p-3 space-y-1.5 bg-black/10 shrink-0">
            <div className="text-[11px] text-slate-400 px-2 py-1 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Danh mục thuật ngữ ({filteredItems.length})</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy thuật ngữ phù hợp với từ khóa "{searchQuery}"
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      sacredSound.playSacredTap(528);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/10 border-amber-500/50 text-white shadow-md'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold font-serif ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                        {item.termVi}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.categoryLabelVi}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.shortDefinition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: In-Depth Term Dossier (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {selectedItem ? (
              <div className="space-y-6 max-w-3xl">
                {/* Title & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                      <span>{selectedItem.categoryLabelVi}</span>
                      <span>·</span>
                      <span className="text-slate-400">{selectedItem.termEn}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                      {selectedItem.termVi}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleSpeak(selectedItem)}
                      className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                      title={isSpeaking ? 'Dừng đọc' : 'Nghe giọng đọc diễn giải'}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                      <span className="text-[11px] hidden sm:inline">{isSpeaking ? 'Dừng' : 'Nghe Đọc'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(selectedItem)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Sao chép nội dung giải nghĩa"
                    >
                      {copiedId === selectedItem.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] text-emerald-300">Đã Chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] hidden sm:inline">Sao Chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1. Core Plain-Language Definition */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Thuật ngữ này hiểu đơn giản là gì?</span>
                  </div>
                  <p className="text-sm text-slate-100 font-light leading-relaxed">
                    {selectedItem.shortDefinition}
                  </p>
                </div>

                {/* 2. Real-World Practical Meaning in 3 Life Dimensions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Ý Nghĩa Ứng Dụng Trong Đời Sống Thực Tế</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {/* General Dimension */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-teal-400" />
                        <span>Bản Thể & Tâm Lý Cuộc Sống</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {selectedItem.lifeMeaning.general}
                      </p>
                    </div>

                    {/* Career & Wealth Dimension */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sự Nghiệp, Công Danh & Dòng Tiền Tài Chính</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {selectedItem.lifeMeaning.careerAndWealth}
                      </p>
                    </div>

                    {/* Relationship & Family Dimension */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Hôn Nhân, Tình Cảm & Mối Quan Hệ Gia Đình</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {selectedItem.lifeMeaning.relationshipAndFamily}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Golden Actionable Advice */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-black/30 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Lời Khuyên Vàng Để Hành Động & Kích Hoạt Cát Khí</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    {selectedItem.actionableAdvice}
                  </p>
                </div>

                {/* 4. Concrete Real-Life Example */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Ví Dụ Thực Tế Đời Thường:
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{selectedItem.example}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chọn một thuật ngữ từ danh sách bên trái để xem giải mã chi tiết
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer (Fixed) */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tri thức được thẩm định bởi Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Đã Hiểu & Tiếp Tục
          </button>
        </div>
      </motion.div>
    </div>
  );
};
