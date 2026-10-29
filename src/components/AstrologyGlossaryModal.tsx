// ==========================================
// AURORA DESTINY AI — CẨM NANG & TỪ ĐIỂN GIẢI MÃ THUẬT NGỮ TINH HOA
// Comprehensive Interactive Metaphysical Glossary & Practical Life Guide
// Zero-Pill Discipline, Typographic Hierarchy, Audio Pronunciation, Web Share & Reading Scale
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ArrowUp,
  Lightbulb,
  ShieldAlert,
  Heart,
  Briefcase,
  Share2,
  ZoomIn,
  ZoomOut,
  Type,
  Award
} from 'lucide-react';
import {
  ASTROLOGY_GLOSSARY,
  GlossaryCategory,
  GlossaryItem,
  searchGlossary,
  getRelatedGlossaryItems
} from '../data/astrologyGlossary';
import { sacredVoice } from '../services/sacredVoiceService';
import { sacredSound } from '../services/soundService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string;
}

type FontSizeScale = 'standard' | 'large' | 'xlarge';

const ESSENTIAL_TOPICS = [
  { id: 'dung_than_hy_than', label: 'Dụng Thần' },
  { id: 'sao_tu_vi', label: 'Tử Vi' },
  { id: 'sao_thien_phu', label: 'Thiên Phủ' },
  { id: 'tu_hoa', label: 'Tứ Hóa' },
  { id: 'cung_than', label: 'Cung Thân' },
  { id: 'chan_gio_mat_troi', label: 'Chân Giờ Mặt Trời' },
  { id: 'tuan_triet_khong_vong', label: 'Tuần Triệt' },
  { id: 'chinh_quan', label: 'Chính Quan' }
];

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
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>('standard');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('detail');
  const detailScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll detail view to top whenever selected item changes
  useEffect(() => {
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  }, [selectedItem?.id]);

  // Synchronize selection when initialTermId or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTermId) {
        const match = ASTROLOGY_GLOSSARY.find((item) => item.id === initialTermId);
        if (match) {
          setSelectedItem(match);
          setSelectedCategory(match.category);
          setSearchQuery('');
          setMobileView('detail');
        }
      }
    }
  }, [isOpen, initialTermId]);

  // Clean speech on unmount or close
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      sacredVoice.stop();
      setIsSpeaking(false);
    }
  }, [isOpen, isSpeaking]);

  // Category items count
  const categoryCounts = useMemo(() => {
    return {
      all: ASTROLOGY_GLOSSARY.length,
      bazi: ASTROLOGY_GLOSSARY.filter((i) => i.category === 'bazi').length,
      ziwei_palaces: ASTROLOGY_GLOSSARY.filter((i) => i.category === 'ziwei_palaces').length,
      ziwei_stars: ASTROLOGY_GLOSSARY.filter((i) => i.category === 'ziwei_stars').length,
      astronomy_rules: ASTROLOGY_GLOSSARY.filter((i) => i.category === 'astronomy_rules').length
    };
  }, []);

  // Filtered glossary items based on category and query
  const filteredItems = useMemo(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    return searchGlossary(searchQuery, cat);
  }, [searchQuery, selectedCategory]);

  // Related terms for active dossier
  const relatedItems = useMemo(() => {
    return getRelatedGlossaryItems(selectedItem);
  }, [selectedItem]);

  if (!isOpen) return null;

  const handleCopy = (item: GlossaryItem) => {
    const textToCopy = `📖 [${item.termVi} - ${item.termEn}]\n• Bản chất: ${item.shortDefinition}\n• Bản thể & tâm lý: ${item.lifeMeaning.general}\n• Sự nghiệp & tài chính: ${item.lifeMeaning.careerAndWealth}\n• Tình cảm gia đạo: ${item.lifeMeaning.relationshipAndFamily}\n• Lời khuyên vàng: ${item.actionableAdvice}\n• Ví dụ thực tế: ${item.example}\n\n— Cẩm Nang Giải Mã Mệnh Lý • Kênh Huyền Phong Phật Đạo & Prof.TOAN`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      sacredSound.playCelestialChime(880);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleShare = async (item: GlossaryItem) => {
    const shareTitle = `${item.termVi} — Cẩm Nang Giải Mã Mệnh Lý`;
    const shareText = `📖 [${item.termVi} (${item.termEn})]\n• Bản chất: ${item.shortDefinition}\n• Lời khuyên vàng: ${item.actionableAdvice}\n\nĐược thẩm định bởi Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href
        });
        setSharedId(item.id);
        sacredSound.playCelestialChime(960);
        setTimeout(() => setSharedId(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Fallback: clipboard copy
    handleCopy(item);
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

    setTimeout(() => {
      setIsSpeaking(false);
    }, 12000);
  };

  // Font size responsive style map
  const bodyTextClass = {
    standard: 'text-xs sm:text-sm leading-relaxed',
    large: 'text-sm sm:text-base leading-relaxed',
    xlarge: 'text-base sm:text-lg leading-loose'
  }[fontSizeScale];

  const subTextClass = {
    standard: 'text-xs leading-relaxed',
    large: 'text-xs sm:text-sm leading-relaxed',
    xlarge: 'text-sm sm:text-base leading-relaxed'
  }[fontSizeScale];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Main Modal Container: Full-screen on mobile, elevated window on desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full h-[100dvh] sm:h-[88vh] sm:max-h-[880px] sm:max-w-5xl bg-gradient-to-b from-[#0e1224]/98 via-[#080a14]/98 to-[#04050b]/98 border-0 sm:border sm:border-amber-500/35 rounded-none sm:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-2xl"
      >
        {/* Specular Ambient Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 via-teal-300 to-transparent pointer-events-none" />

        {/* 1. Header (Fixed) */}
        <div className="p-3 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/25 via-purple-600/25 to-teal-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-amber-400/90 uppercase tracking-widest truncate">
                <span>Bách Khoa Mệnh Lý</span>
                <span aria-hidden="true">·</span>
                <span>32+ Thuật Ngữ</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="text-teal-300/80 hidden sm:inline">Prof.TOAN Thẩm Định</span>
              </div>
              <h2 className="text-sm sm:text-xl font-serif font-bold text-white tracking-wide truncate">
                Cẩm Nang Giải Mã Mệnh Lý Toàn Thư
              </h2>
            </div>
          </div>

          {/* Reading Comfort Scaling Controls & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font Scaling Control */}
            <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-white/[0.04] border border-white/10 rounded-lg text-slate-300 text-xs">
              <button
                onClick={() => {
                  setFontSizeScale('standard');
                  sacredSound.playSacredTap(440);
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] sm:text-xs ${
                  fontSizeScale === 'standard' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'hover:text-white'
                }`}
                title="Cỡ chữ tiêu chuẩn"
              >
                A-
              </button>
              <button
                onClick={() => {
                  setFontSizeScale('large');
                  sacredSound.playSacredTap(528);
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] sm:text-xs ${
                  fontSizeScale === 'large' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'hover:text-white'
                }`}
                title="Cỡ chữ vừa"
              >
                A
              </button>
              <button
                onClick={() => {
                  setFontSizeScale('xlarge');
                  sacredSound.playSacredTap(660);
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors cursor-pointer text-[11px] sm:text-xs ${
                  fontSizeScale === 'xlarge' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'hover:text-white'
                }`}
                title="Cỡ chữ lớn"
              >
                A+
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng cẩm nang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Controls Bar: Visible on Desktop, or on Mobile only in List View */}
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden md:flex'} p-3 sm:p-4 border-b border-white/10 bg-black/25 flex-col gap-2.5 shrink-0`}>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Instant Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thuật ngữ (VD: Dụng Thần, Hóa Kỵ, Tử Vi, Cung Thân, Chân Giờ...)"
                className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs with Item Counts */}
            <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: `Tất Cả (${categoryCounts.all})` },
                { id: 'bazi', label: `Tứ Trụ & Thập Thần (${categoryCounts.bazi})` },
                { id: 'ziwei_palaces', label: `12 Cung Tử Vi (${categoryCounts.ziwei_palaces})` },
                { id: 'ziwei_stars', label: `Chính Tinh & Tứ Hóa (${categoryCounts.ziwei_stars})` },
                { id: 'astronomy_rules', label: `Thiên Văn & Quy Tắc (${categoryCounts.astronomy_rules})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id as any);
                    sacredSound.playSacredTap(480);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Essential Topic Jump Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Tra cứu nhanh:
            </span>
            {ESSENTIAL_TOPICS.map((topic) => {
              const isActive = selectedItem?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    const found = ASTROLOGY_GLOSSARY.find((item) => item.id === topic.id);
                    if (found) {
                      setSelectedItem(found);
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setMobileView('detail');
                      sacredSound.playSacredTap(528);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer shrink-0 font-medium ${
                    isActive
                      ? 'bg-amber-400/20 border border-amber-400/50 text-amber-200 shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.5 Mobile Navigation Switcher (Tối ưu vuốt chạm & xem độc lập trên di động) */}
        <div className="flex md:hidden items-center p-2 bg-black/50 border-b border-white/10 shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-xl w-full">
            <button
              onClick={() => {
                setMobileView('list');
                sacredSound.playSacredTap(440);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileView === 'list'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Danh Mục ({filteredItems.length})</span>
            </button>
            <button
              onClick={() => {
                setMobileView('detail');
                sacredSound.playSacredTap(528);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileView === 'detail'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[130px]">{selectedItem ? selectedItem.termVi : 'Luận Giải Chi Tiết'}</span>
            </button>
          </div>
        </div>

        {/* 3. Main Workspace: Master / Detail Layout with Independent Smooth Scrolling */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
          {/* Left Column: Term List (Scrollable) */}
          <div
            className={`${
              mobileView === 'list' ? 'flex' : 'hidden'
            } md:flex flex-col w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto overscroll-y-auto touch-auto p-3 space-y-1.5 bg-black/15 shrink-0 min-h-0 h-full scroll-smooth`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="text-[11px] text-slate-400 px-2 py-1 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Danh mục ({filteredItems.length})</span>
              <span className="text-amber-400/70">{selectedCategory === 'all' ? 'Toàn bộ' : 'Đã lọc'}</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <p>Không tìm thấy thuật ngữ phù hợp với "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-300 text-xs hover:bg-white/10 cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setMobileView('detail');
                      sacredSound.playSacredTap(528);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-purple-600/15 border-amber-500/50 text-white shadow-md'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold font-serif ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                        {item.termVi}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.categoryLabelVi}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-light">
                      {item.shortDefinition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: In-Depth Term Dossier (Scrollable with ample bottom padding) */}
          <div
            id="glossary-detail-pane"
            ref={detailScrollRef}
            className={`${
              mobileView === 'detail' ? 'flex' : 'hidden'
            } md:flex flex-col flex-1 overflow-y-auto overscroll-y-auto touch-auto p-4 sm:p-6 min-h-0 h-full scroll-smooth`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {selectedItem ? (
              <div className="space-y-6 max-w-3xl pb-28 sm:pb-20">
                {/* Mobile Header Toolbar to return to list */}
                <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/10">
                  <button
                    onClick={() => {
                      setMobileView('list');
                      sacredSound.playSacredTap(440);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 py-1.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 cursor-pointer shadow-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>← Xem danh mục 32+ thuật ngữ</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedItem.categoryLabelVi}
                  </span>
                </div>

                {/* Title & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                      <span>{selectedItem.categoryLabelVi}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{selectedItem.termEn}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                      {selectedItem.termVi}
                    </h3>
                  </div>

                  {/* Actions: Speak / Share / Copy */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Voice Narration with Live Soundwave */}
                    <button
                      onClick={() => handleSpeak(selectedItem)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                      title={isSpeaking ? 'Dừng giọng đọc' : 'Nghe diễn giải bằng giọng nói'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-400" />
                          <span className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 h-full bg-rose-400 animate-pulse"></span>
                            <span className="w-0.5 h-2/3 bg-rose-300 animate-bounce"></span>
                            <span className="w-0.5 h-full bg-rose-400 animate-pulse delay-75"></span>
                          </span>
                          <span className="text-[11px]">Dừng</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] hidden sm:inline">Nghe Đọc</span>
                        </>
                      )}
                    </button>

                    {/* Native Web Share */}
                    <button
                      onClick={() => handleShare(selectedItem)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Chia sẻ luận giải thuật ngữ này"
                    >
                      {sharedId === selectedItem.id ? (
                        <>
                          <Check className="w-4 h-4 text-teal-400" />
                          <span className="text-[11px] text-teal-300">Đã Chia Sẻ</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-teal-400" />
                          <span className="text-[11px] hidden sm:inline">Chia Sẻ</span>
                        </>
                      )}
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={() => handleCopy(selectedItem)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Sao chép toàn bộ giải nghĩa"
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
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Thuật ngữ này hiểu đơn giản là gì?</span>
                  </div>
                  <p className={`text-slate-100 font-light ${bodyTextClass}`}>
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
                      <p className={`text-slate-300 font-light ${subTextClass}`}>
                        {selectedItem.lifeMeaning.general}
                      </p>
                    </div>

                    {/* Career & Wealth Dimension */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sự Nghiệp, Công Danh & Dòng Tiền Tài Chính</span>
                      </div>
                      <p className={`text-slate-300 font-light ${subTextClass}`}>
                        {selectedItem.lifeMeaning.careerAndWealth}
                      </p>
                    </div>

                    {/* Relationship & Family Dimension */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Hôn Nhân, Tình Cảm & Mối Quan Hệ Gia Đình</span>
                      </div>
                      <p className={`text-slate-300 font-light ${subTextClass}`}>
                        {selectedItem.lifeMeaning.relationshipAndFamily}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Golden Actionable Advice */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/25 to-black/40 border border-emerald-500/35 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Lời Khuyên Vàng Để Hành Động & Kích Hoạt Cát Khí</span>
                  </div>
                  <p className={`text-emerald-100 ${bodyTextClass}`}>
                    {selectedItem.actionableAdvice}
                  </p>
                </div>

                {/* 4. Concrete Real-Life Example */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Ví Dụ Thực Tế Đời Thường:
                  </div>
                  <p className={`text-slate-300 italic ${subTextClass}`}>
                    "{selectedItem.example}"
                  </p>
                </div>

                {/* 5. Connected Concepts / Related Terms Navigation */}
                {relatedItems.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 via-black/40 to-amber-950/20 border border-purple-500/25 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                      <Compass className="w-4 h-4 text-purple-400" />
                      <span>Thuật Ngữ Liên Quan Cần Nắm Rõ</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {relatedItems.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => {
                            setSelectedItem(rel);
                            setMobileView('detail');
                            sacredSound.playSacredTap(600);
                          }}
                          className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/50 text-left transition-all cursor-pointer group flex flex-col justify-between gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                              {rel.termVi}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {rel.shortDefinition}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Scroll To Top Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (detailScrollRef.current) {
                        detailScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        sacredSound.playSacredTap(440);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
                    title="Cuộn lên đầu trang"
                  >
                    <span>Lên đầu trang</span>
                    <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                  </button>
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
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hệ thống bách khoa được thẩm định bởi Kênh Huyền Phong Phật Đạo & Giáo Sư - Prof.TOAN</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Đã Hiểu & Đóng Cẩm Nang
          </button>
        </div>
      </motion.div>
    </div>
  );
};
