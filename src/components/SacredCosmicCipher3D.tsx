// ==========================================================
// SACRED ANCIENT TỬ VI CODEX — BẢO THIÊN THƯ TỬ VI HOÀNG GIA
// Thiết Kế Đẳng Cấp Hoàng Gia • Thần Vận Khai Quang • Mỹ Thuật Đỉnh Cao
// Tôn vinh Cổ Thư ngự trên Bệ Ngọc Sen Vàng, loại bỏ hoàn toàn vòng xoay chồng lấn
// ==========================================================

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, BookOpen, Star, ChevronRight, Crown } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';
import { sacredSound } from '../services/soundService';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  onActivate?: () => void;
}

export const SacredCosmicCipher3D: React.FC<Props> = ({ size = 'lg', onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Physics for Sacred Artifact Feel (Mượt mà, sống động)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 190, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    sacredSound.playTempleGong(108);
    sacredSound.playSacredSuccess();
    if (onActivate) onActivate();
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none my-2 w-full max-w-xl mx-auto">
      {/* 1. Outer Ethereal Radiant Background — Êm dịu, tĩnh tại, thuần khiết (KHÔNG vòng tròn, KHÔNG xoay rối mắt) */}
      <div className="absolute -inset-6 sm:-inset-10 pointer-events-none flex items-center justify-center -z-20">
        <div className="w-full max-w-lg h-52 bg-gradient-to-b from-amber-500/12 via-yellow-600/8 to-transparent blur-3xl" />
      </div>

      {/* 2. Interactive 3D Ancient Codex Presentation Container */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          soundEngine.playRadarTick();
        }}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        animate={{
          y: isHovered ? -6 : [0, -4, 0],
        }}
        transition={{
          y: isHovered
            ? { duration: 0.25, ease: 'easeOut' }
            : { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative group cursor-pointer flex flex-col items-center w-full px-2"
        whileTap={{ scale: 0.97 }}
      >
        {/* Soft Golden Aura Beam Rising Directly from Book Center */}
        <div className="absolute -top-10 sm:-top-14 w-44 sm:w-60 h-44 sm:h-52 bg-gradient-to-t from-amber-400/25 via-yellow-200/15 to-transparent blur-lg pointer-events-none animate-book-burst flex items-center justify-center -z-10">
          <div className="w-12 h-full bg-gradient-to-t from-white/45 via-amber-200/20 to-transparent blur-xs" />
        </div>

        {/* Floating Sacred Mystical Runes Drifting Upward from the Ancient Codex */}
        <div className="absolute inset-x-0 -top-12 h-44 pointer-events-none overflow-hidden flex items-center justify-center z-20">
          <span className="absolute text-amber-300 text-sm font-serif font-bold animate-[book-rune-float-up_3.4s_infinite_ease-out] left-[32%] top-[65%]">
            ✦
          </span>
          <span className="absolute text-yellow-200 text-xs font-mono font-bold animate-[book-rune-float-up_4.2s_infinite_ease-out_0.9s] left-[58%] top-[60%]">
            紫微
          </span>
          <span className="absolute text-amber-400 text-sm font-serif font-bold animate-[book-rune-float-up_4.6s_infinite_ease-out_1.7s] left-[45%] top-[55%]">
            ☯
          </span>
          <span className="absolute text-yellow-100 text-xs animate-[book-rune-float-up_3.2s_infinite_ease-out_1.3s] left-[26%] top-[68%]">
            ✧
          </span>
          <span className="absolute text-amber-200 text-[11px] font-mono font-bold animate-[book-rune-float-up_3.8s_infinite_ease-out_2.1s] left-[70%] top-[62%]">
            天機
          </span>
        </div>

        {/* ============================================================== */}
        {/* THE ROYAL ANCIENT TỬ VI CODEX (QUYỂN CỔ THƯ TỬ VI HOÀNG GIA) */}
        {/* Thoát ly hoàn toàn khỏi vòng tròn chật hẹp, mở rộng trang trọng */}
        {/* ============================================================== */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ transform: 'translateZ(30px)' }}
        >
          {/* Detailed SVG Ancient Codex with Real Gold Leaf & Royal Cinnabar */}
          <svg
            viewBox="0 0 320 200"
            className="w-72 h-48 sm:w-96 sm:h-60 md:w-[420px] md:h-[265px] drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] filter hover:drop-shadow-[0_20px_48px_rgba(245,158,11,0.35)] transition-all duration-500 overflow-visible"
          >
            <defs>
              {/* Aged Parchment Left Page Texture (Trang Thư Cổ Mạn Trái) */}
              <linearGradient id="parchmentLeftGrand" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fef3c7" />
                <stop offset="70%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Aged Parchment Right Page Texture (Trang Thư Cổ Mạn Phải) */}
              <linearGradient id="parchmentRightGrand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#fef3c7" />
                <stop offset="70%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Imperial Mahogany Hardbound Cover Gradient */}
              <linearGradient id="coverLeatherGrand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#380606" />
                <stop offset="45%" stopColor="#631010" />
                <stop offset="100%" stopColor="#220404" />
              </linearGradient>

              {/* 24K Gold Leaf Filigree Gradient */}
              <linearGradient id="goldLeafGrand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="35%" stopColor="#fcd34d" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Holy Spine Radiance */}
              <linearGradient id="spineRadianceGrand" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.9" />
              </linearGradient>

              {/* Page Spine Shadow */}
              <linearGradient id="spineCreaseShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#451a03" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.4" />
              </linearGradient>

              {/* Subtle Gold Shimmer Filter */}
              <filter id="royalGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- 1. HARDBOUND IMPERIAL LEATHER COVER (3D BACKDROP) --- */}
            {/* Outer leather base rim */}
            <path
              d="M 18 152 L 160 172 L 160 177 L 15 157 Z"
              fill="#180303"
              opacity="0.95"
            />
            <path
              d="M 302 152 L 160 172 L 160 177 L 305 157 Z"
              fill="#180303"
              opacity="0.95"
            />
            {/* Outer cover panels with gold-rimmed edges */}
            <path
              d="M 18 36 L 158 52 L 158 172 L 18 152 Z"
              fill="url(#coverLeatherGrand)"
              stroke="url(#goldLeafGrand)"
              strokeWidth="1.2"
            />
            <path
              d="M 302 36 L 162 52 L 162 172 L 302 152 Z"
              fill="url(#coverLeatherGrand)"
              stroke="url(#goldLeafGrand)"
              strokeWidth="1.2"
            />

            {/* --- 2. MULTI-LEAF THICKNESS (CẠNH TRANG SÁCH HOÀNG KIM) --- */}
            <path
              d="M 22 149 L 158 167 L 158 171 L 22 153 Z"
              fill="#d97706"
              opacity="0.8"
            />
            <path
              d="M 298 149 L 162 167 L 162 171 L 298 153 Z"
              fill="#d97706"
              opacity="0.8"
            />

            {/* --- 3. LEFT MAIN PARCHMENT PAGE (THIÊN BÀN 12 CUNG TỬ VI) --- */}
            <path
              d="M 26 42 Q 92 46 158 55 L 158 166 Q 92 156 26 148 Z"
              fill="url(#parchmentLeftGrand)"
              stroke="#b45309"
              strokeWidth="0.8"
            />
            {/* Left page inner gold border */}
            <path
              d="M 32 47 Q 92 51 152 59 L 152 161 Q 92 152 32 144 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.6"
              strokeDasharray="4 2"
              opacity="0.75"
            />

            {/* Left Page Calligraphy Header: 天機紫微 · 十二宮 */}
            <text x="92" y="62" fill="#78350f" fontSize="7.5" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.8">
              天機紫微 • 十二宮
            </text>
            <text x="92" y="70" fill="#92400e" fontSize="5" fontWeight="medium" textAnchor="middle" letterSpacing="0.5">
              TỬ VI ĐẨU SỐ TOÀN THƯ
            </text>
            <line x1="44" y1="73" x2="140" y2="73" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* 12 Palaces Celestial Chart Grid (Thiên Bàn Thập Nhị Cung Hình Đồ) */}
            <g opacity="0.9" transform="translate(42, 78)">
              {/* Outer grid boundary */}
              <rect x="0" y="0" width="100" height="62" fill="#fffbeb" stroke="#b45309" strokeWidth="0.7" rx="1.5" />
              
              {/* Grid cell lines: 4 columns x 4 rows layout with center courtyard */}
              <line x1="25" y1="0" x2="25" y2="62" stroke="#d97706" strokeWidth="0.4" />
              <line x1="50" y1="0" x2="50" y2="15.5" stroke="#d97706" strokeWidth="0.4" />
              <line x1="50" y1="46.5" x2="50" y2="62" stroke="#d97706" strokeWidth="0.4" />
              <line x1="75" y1="0" x2="75" y2="62" stroke="#d97706" strokeWidth="0.4" />

              <line x1="0" y1="15.5" x2="100" y2="15.5" stroke="#d97706" strokeWidth="0.4" />
              <line x1="0" y1="31" x2="25" y2="31" stroke="#d97706" strokeWidth="0.4" />
              <line x1="75" y1="31" x2="100" y2="31" stroke="#d97706" strokeWidth="0.4" />
              <line x1="0" y1="46.5" x2="100" y2="46.5" stroke="#d97706" strokeWidth="0.4" />

              {/* Center Courtyard (Thiên Tâm Vị): Taiji Symbol & Star Realm */}
              <rect x="25" y="15.5" width="50" height="31" fill="#fef3c7" stroke="#b45309" strokeWidth="0.5" />
              <circle cx="50" cy="31" r="9" fill="none" stroke="#b45309" strokeWidth="0.5" strokeDasharray="1 1.5" />
              <text x="50" y="29" fill="#92400e" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                ☯ MỆNH BÀN
              </text>
              <text x="50" y="37" fill="#b45309" fontSize="4" fontWeight="bold" textAnchor="middle">
                2026 BÍNH NGỌ
              </text>

              {/* Key Palaces Inscribed in Cells with Golden Calligraphy */}
              <text x="12.5" y="11" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Mệnh</text>
              <text x="37.5" y="11" fill="#92400e" fontSize="4.2" textAnchor="middle">Phụ</text>
              <text x="62.5" y="11" fill="#92400e" fontSize="4.2" textAnchor="middle">Phúc</text>
              <text x="87.5" y="11" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Điền</text>

              <text x="12.5" y="26" fill="#92400e" fontSize="4.2" textAnchor="middle">Huynh</text>
              <text x="87.5" y="26" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Quan</text>

              <text x="12.5" y="41.5" fill="#92400e" fontSize="4.2" textAnchor="middle">Phu Thê</text>
              <text x="87.5" y="41.5" fill="#92400e" fontSize="4.2" textAnchor="middle">Nô Bộc</text>

              <text x="12.5" y="57" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Tử Tức</text>
              <text x="37.5" y="57" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Tài Bạch</text>
              <text x="62.5" y="57" fill="#92400e" fontSize="4.2" textAnchor="middle">Tật Ách</text>
              <text x="87.5" y="57" fill="#78350f" fontSize="4.5" fontWeight="bold" textAnchor="middle">Thiên Di</text>
            </g>

            {/* Ancient Imperial Dragon Leaf Corner Ornaments (Left Page) */}
            <path d="M 28 44 L 38 44 L 28 54 Z" fill="url(#goldLeafGrand)" opacity="0.85" />
            <path d="M 28 146 L 38 146 L 28 136 Z" fill="url(#goldLeafGrand)" opacity="0.85" />

            {/* --- 4. RIGHT MAIN PARCHMENT PAGE (TỨ TRỤ BÁT TỰ & ẤN TRIỆN CHU SA) --- */}
            <path
              d="M 162 55 Q 228 46 294 42 L 294 148 Q 228 156 162 166 Z"
              fill="url(#parchmentRightGrand)"
              stroke="#b45309"
              strokeWidth="0.8"
            />
            {/* Right page inner gold border */}
            <path
              d="M 168 59 Q 228 51 288 47 L 288 144 Q 228 152 168 161 Z"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.6"
              strokeDasharray="4 2"
              opacity="0.75"
            />

            {/* Right Page Calligraphy Header: 四柱八字 · 乾坤定數 */}
            <text x="228" y="62" fill="#78350f" fontSize="7.5" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.8">
              四柱八字 • 乾坤定數
            </text>
            <text x="228" y="70" fill="#92400e" fontSize="5" fontWeight="medium" textAnchor="middle" letterSpacing="0.5">
              MỆNH BÀN ĐẠI ĐẠO CHIÊM NGHIỆM
            </text>
            <line x1="180" y1="73" x2="276" y2="73" stroke="#b45309" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Four Pillars Tablets (Năm • Tháng • Ngày • Giờ) */}
            <g opacity="0.95" transform="translate(180, 78)">
              {[
                { label: 'Năm', stem: '丙', branch: '午', desc: 'Bính Ngọ' },
                { label: 'Tháng', stem: '庚', branch: '寅', desc: 'Canh Dần' },
                { label: 'Ngày', stem: '甲', branch: '子', desc: 'Giáp Tý' },
                { label: 'Giờ', stem: '戊', branch: '辰', desc: 'Mậu Thìn' },
              ].map((pillar, i) => (
                <g key={`grand-pillar-${i}`} transform={`translate(${i * 24}, 0)`}>
                  {/* Tablet background */}
                  <rect
                    x="2"
                    y="0"
                    width="20"
                    height="38"
                    fill="#fffbeb"
                    stroke="#b45309"
                    strokeWidth="0.6"
                    rx="2"
                  />
                  {/* Pillar Label */}
                  <rect x="3" y="1" width="18" height="9" fill="#fef3c7" rx="1" />
                  <text x="12" y="7.5" fill="#92400e" fontSize="4.5" fontWeight="bold" textAnchor="middle">
                    {pillar.label}
                  </text>
                  {/* Can Chi Calligraphy */}
                  <text x="12" y="18" fill="#78350f" fontSize="7.5" fontWeight="extrabold" textAnchor="middle" fontFamily="serif">
                    {pillar.stem}
                  </text>
                  <text x="12" y="27" fill="#991b1b" fontSize="7.5" fontWeight="extrabold" textAnchor="middle" fontFamily="serif">
                    {pillar.branch}
                  </text>
                  {/* Subtext */}
                  <text x="12" y="34.5" fill="#b45309" fontSize="3.5" fontWeight="medium" textAnchor="middle">
                    {pillar.desc}
                  </text>
                </g>
              ))}
            </g>

            {/* IMPERIAL CINNABAR RED SEAL (DẤU ẤN CHU SA HOÀNG GIA - THẦN KHÍ KHAI QUANG) */}
            <g className="animate-cinnabar-seal" transform="translate(196, 122)">
              {/* Outer seal box */}
              <rect
                x="0"
                y="0"
                width="64"
                height="22"
                fill="#991b1b"
                stroke="#ef4444"
                strokeWidth="1.2"
                rx="2.5"
                opacity="0.95"
              />
              {/* Inner dashed gold-red border */}
              <rect
                x="2.5"
                y="2"
                width="59"
                height="18"
                fill="none"
                stroke="#fecaca"
                strokeWidth="0.6"
                strokeDasharray="2 1"
                opacity="0.85"
              />
              {/* Seal text in ancient script */}
              <text x="32" y="9.5" fill="#fff1f2" fontSize="5.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.8" fontFamily="serif">
                敕令 THIÊN CƠ BẢO THƯ
              </text>
              <text x="32" y="16.5" fill="#fef08a" fontSize="4.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.6">
                KHAI QUANG BÍNH NGỌ 2026
              </text>
            </g>

            {/* Ancient Imperial Dragon Leaf Corner Ornaments (Right Page) */}
            <path d="M 292 44 L 282 44 L 292 54 Z" fill="url(#goldLeafGrand)" opacity="0.85" />
            <path d="M 292 146 L 282 146 L 292 136 Z" fill="url(#goldLeafGrand)" opacity="0.85" />

            {/* --- 5. CENTRAL BOOK SPINE & GOLDEN LIGHT RADIANCE --- */}
            {/* Crease shadow */}
            <rect x="156" y="52" width="8" height="116" fill="url(#spineCreaseShadow)" opacity="0.5" />
            
            {/* Luminous Golden Central Spine Bar */}
            <line
              x1="160"
              y1="50"
              x2="160"
              y2="168"
              stroke="url(#spineRadianceGrand)"
              strokeWidth="4"
              filter="url(#royalGoldGlow)"
            />
            <line
              x1="160"
              y1="52"
              x2="160"
              y2="166"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* --- 6. SCARLET SILK BOOKMARK RIBBON (DẢI LỤA MAY MẮN) --- */}
            {/* Flowing ribbon descending past bottom of the book */}
            <path
              d="M 160 52 Q 158 110 152 170 Q 150 182 155 188 L 160 180 L 165 188 Q 170 182 168 170 Q 162 110 160 52 Z"
              fill="#dc2626"
              stroke="#f59e0b"
              strokeWidth="0.8"
            />
            {/* Carved Jade Talisman Pendant (Ngọc Bội Bình An ở đầu dải lụa) */}
            <circle cx="158" cy="182" r="3.5" fill="#10b981" stroke="#fef08a" strokeWidth="0.9" />
            <circle cx="158" cy="182" r="1.5" fill="#047857" />

            {/* --- 7. CENTRAL FLOATING SACRED SOLFEGGIO JEWEL CORE --- */}
            <circle cx="160" cy="110" r="4" fill="#fef08a" filter="url(#royalGoldGlow)" opacity="0.9" />
            <circle cx="160" cy="110" r="2" fill="#ffffff" />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 3. IMPERIAL ALTAR PEDESTAL (BỆ NGỌC SEN VÀNG NÂNG ĐỠ CỔ THƯ) */}
        {/* Tạo thế uy nghiêm, vững chãi, thiêng liêng và chuyên nghiệp */}
        {/* ============================================================== */}
        <div className="relative -mt-4 w-72 sm:w-96 md:w-[420px] flex flex-col items-center pointer-events-none z-0">
          {/* Top golden altar shelf */}
          <div className="w-64 sm:w-80 md:w-96 h-2 rounded-full bg-gradient-to-r from-transparent via-amber-400/70 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
          
          {/* Altar body base */}
          <div className="w-56 sm:w-72 md:w-84 h-3 bg-gradient-to-r from-amber-950/40 via-amber-900/60 to-amber-950/40 border-t border-b border-amber-500/30 backdrop-blur-sm rounded-sm flex items-center justify-around px-6">
            <span className="text-[8px] text-amber-300/70 tracking-widest uppercase font-mono">✦ HOÀNG GIA ĐẠI ĐẠO ✦</span>
            <span className="text-[8px] text-yellow-300/70 tracking-widest uppercase font-mono">✦ THIÊN THƯ TỬ VI ✦</span>
          </div>

          {/* Pedestal reflection glow */}
          <div className="w-48 sm:w-64 h-1.5 rounded-full bg-amber-500/20 blur-xs mt-0.5" />
        </div>

        {/* ============================================================== */}
        {/* 4. DIGNIFIED SACRED CALL-TO-ACTION BUTTON (HOÀNG KIM LINH THIÊNG) */}
        {/* Hiệu ứng 'sacred-wobble' nhẹ nhàng khi hover, thu hút và đẳng cấp */}
        {/* ============================================================== */}
        <div className="mt-4 flex flex-col items-center space-y-1.5 relative z-20">
          <div
            className={`px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 hover:from-amber-500/30 hover:via-yellow-300/35 hover:to-amber-500/30 border border-amber-400/60 hover:border-amber-300 text-amber-200 hover:text-white shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.45)] transition-all duration-300 flex items-center gap-2.5 cursor-pointer backdrop-blur-md ${
              isHovered ? 'animate-sacred-wobble' : ''
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-semibold tracking-wide drop-shadow-sm">
              Khai Mở Bản Mệnh Thiên Thư
            </span>
            <ChevronRight className={`w-4 h-4 text-amber-300 shrink-0 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </div>

          <p className="text-[11px] text-amber-300/70 font-mono tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Chạm nhẹ vào Cổ Thư để lập lá số & giải đoán vận mệnh</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
