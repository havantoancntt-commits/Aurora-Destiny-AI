// ==========================================
// AURORA DESTINY AI — TERM EXPLAINER TOOLTIP & POPOVER
// Interactive contextual explainer for technical astrological terms
// Accessible, touch-friendly on mobile, zero-pill typography
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, BookOpen, ChevronRight, X } from 'lucide-react';
import { ASTROLOGY_GLOSSARY, GlossaryItem } from '../data/astrologyGlossary';

interface Props {
  termId?: string;
  customTerm?: string;
  customDefinition?: string;
  customLifeMeaning?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  onOpenFullGlossary?: () => void;
  className?: string;
}

export const TermExplainerTooltip: React.FC<Props> = ({
  termId,
  customTerm,
  customDefinition,
  customLifeMeaning,
  children,
  showIcon = true,
  onOpenFullGlossary,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Look up glossary item if termId provided
  const glossaryItem: GlossaryItem | undefined = termId
    ? ASTROLOGY_GLOSSARY.find((item) => item.id === termId)
    : undefined;

  const termTitle = customTerm || glossaryItem?.termVi || 'Thuật Ngữ Mệnh Lý';
  const definition = customDefinition || glossaryItem?.shortDefinition || 'Khái niệm chuyên môn trong hệ thống Tử Vi & Bát Tự.';
  const lifeMeaning = customLifeMeaning || glossaryItem?.lifeMeaning.general;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <span ref={containerRef} className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* Clickable trigger text or wrapper */}
      <span
        onClick={togglePopover}
        className="cursor-pointer border-b border-dotted border-amber-400/50 hover:border-amber-300 hover:text-amber-200 transition-colors inline-flex items-center gap-1"
        title="Nhấn để xem giải thích thuật ngữ dễ hiểu"
      >
        {children || termTitle}
        {showIcon && (
          <HelpCircle className="w-3 h-3 text-amber-400/70 hover:text-amber-300 transition-colors shrink-0 inline-block" />
        )}
      </span>

      {/* Elegant Celestial Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl text-left"
          >
            {/* Header with Title & Close button */}
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <h4 className="text-xs font-bold text-amber-300 font-serif truncate">
                  {termTitle}
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core Definition */}
            <p className="text-[11px] text-slate-200 leading-relaxed font-light mb-2">
              {definition}
            </p>

            {/* Real-World Life Meaning */}
            {lifeMeaning && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-2.5">
                <div className="text-[10px] uppercase font-semibold text-amber-300 tracking-wider mb-0.5">
                  Ý Nghĩa Đời Sống Thực Tế:
                </div>
                <p className="text-[10px] text-slate-300 leading-normal line-clamp-3">
                  {lifeMeaning}
                </p>
              </div>
            )}

            {/* Action footer */}
            {onOpenFullGlossary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onOpenFullGlossary();
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 text-[10px] font-medium transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Mở Cẩm Nang Giải Mã Chi Tiết</span>
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
