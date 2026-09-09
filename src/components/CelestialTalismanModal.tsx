// ==========================================================
// AURORA DESTINY AI — THIÊN BẢN KHAI MỆNH & PHÁP BẢO VẬN HẠN ĐỘC BẢN
// Sacred Celestial Talisman & Karmic Transmutation Studio
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  Sparkles,
  Heart,
  Award,
  Download,
  Copy,
  Check,
  Compass,
  Zap,
  Coffee,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Flame,
  Crown,
  Eye,
  Layers,
  Star,
  Send,
  UserCheck
} from 'lucide-react';
import { CalculationResult, LanguageCode } from '../types/destiny';
import { UserProfile } from '../types/user';
import { computeKarmicPivot } from '../services/talismanEngine';
import { CelestialPatron, PatronTier } from '../types/talisman';
import { sacredSound } from '../services/soundService';
import { STEMS, BRANCHES } from '../engine/canchi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  calculation: CalculationResult;
  profile: UserProfile;
  language?: LanguageCode;
  initialTab?: 'card' | 'pivot' | 'patrons';
}

export const CelestialTalismanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  calculation,
  profile,
  language = 'vi',
  initialTab = 'card'
}) => {
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'card' | 'pivot' | 'patrons'>(initialTab);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Bank Info (Prof. TOAN)
  const BANK_INFO = {
    bankName: 'Vietcombank',
    bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    accountNumber: '0501000160764',
    accountName: 'HA VAN TOAN',
    bin: '970436'
  };

  const [selectedDonation, setSelectedDonation] = useState<number | null>(50000);
  const [donationNote, setDonationNote] = useState<string>(`Ung ho HPPD - ${profile.name}`);

  // Patrons State
  const [patrons, setPatrons] = useState<CelestialPatron[]>([]);
  const [patronName, setPatronName] = useState(profile.name || '');
  const [patronTier, setPatronTier] = useState<PatronTier>('vang');
  const [patronMessage, setPatronMessage] = useState('Kính chúc Kênh Huyền Phong Phật Đạo & Thầy TOAN vạn sự cát tường.');
  const [isSubmittingPatron, setIsSubmittingPatron] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<CelestialPatron | null>(null);

  // 3D Card Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Karmic analysis calculation
  const karmicData = computeKarmicPivot(calculation, profile);

  // Fetch patrons on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/patrons')
        .then((res) => res.json())
        .then((data) => {
          if (data?.patrons && Array.isArray(data.patrons)) {
            setPatrons(data.patrons);
          }
        })
        .catch((err) => {
          console.error('Failed to load patrons:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Card Mouse Move for 3D Perspective
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Submit Patron Form
  const handleSubmitPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronName.trim()) return;

    setIsSubmittingPatron(true);
    sacredSound.playCelestialChime(880);

    try {
      const res = await fetch('/api/patrons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patronName.trim(),
          tier: patronTier,
          amount: selectedDonation || undefined,
          message: patronMessage.trim()
        })
      });
      const data = await res.json();
      if (data?.status === 'success' && data.patron) {
        setPatrons((prev) => [data.patron, ...prev]);
        setRegisteredSuccess(data.patron);
      }
    } catch (err) {
      console.error('Error submitting patron:', err);
    } finally {
      setIsSubmittingPatron(false);
    }
  };

  // Export Golden Talisman to Canvas Image
  const handleDownloadCard = () => {
    setIsDownloading(true);
    sacredSound.playCelestialChime(768);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark Cosmic Obsidian Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1400);
      bgGrad.addColorStop(0, '#0a0812');
      bgGrad.addColorStop(0.5, '#120f24');
      bgGrad.addColorStop(1, '#06050b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 900, 1400);

      // Gold Shimmer Border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 840, 1340);

      // Inner Filigree Border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(45, 45, 810, 1310);

      // Header Text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('HỘ THÂN KIM GIÁP • THIÊN BẢN KHAI MỆNH', 450, 120);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '18px sans-serif';
      ctx.fillText('KÊNH HUYỀN PHONG PHẬT ĐẠO • GIÁO SƯ - PROF.TOAN', 450, 160);

      // Divider Line
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 190);
      ctx.lineTo(750, 190);
      ctx.stroke();

      // Person Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px serif';
      ctx.fillText(profile.name.toUpperCase(), 450, 270);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Mệnh: ${calculation.bazi.yearPillar?.naYin || 'Đặc định'} • Dụng Thần: ${karmicData.remedyElement}`, 450, 320);

      // 4 Pillars Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(80, 380, 740, 160);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.strokeRect(80, 380, 740, 160);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TỨ TRỤ BÁT TỰ BẢN MỆNH', 450, 420);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px monospace';
      const pY = `${STEMS[calculation.bazi.yearPillar.stem]?.nameVi || ''} ${BRANCHES[calculation.bazi.yearPillar.branch]?.nameVi || ''}`;
      const pM = `${STEMS[calculation.bazi.monthPillar.stem]?.nameVi || ''} ${BRANCHES[calculation.bazi.monthPillar.branch]?.nameVi || ''}`;
      const pD = `${STEMS[calculation.bazi.dayPillar.stem]?.nameVi || ''} ${BRANCHES[calculation.bazi.dayPillar.branch]?.nameVi || ''}`;
      const pH = `${STEMS[calculation.bazi.hourPillar.stem]?.nameVi || ''} ${BRANCHES[calculation.bazi.hourPillar.branch]?.nameVi || ''}`;
      ctx.fillText(`${pY}    |    ${pM}    |    ${pD}    |    ${pH}`, 450, 480);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '16px sans-serif';
      ctx.fillText('TRỤ NĂM         TRỤ THÁNG         TRỤ NGÀY         TRỤ GIỜ', 450, 515);

      // Transmutation & Karmic Guidance
      ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
      ctx.fillRect(80, 580, 740, 300);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.strokeRect(80, 580, 740, 300);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px serif';
      ctx.fillText('PHÁP TRỊ CHUYỂN HÓA NGHIỆP LỰC', 450, 630);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText(`• ${karmicData.knotName}`, 450, 680);
      ctx.fillText(`• Cung vị cứu giải: ${karmicData.remedyPalace}`, 450, 730);
      ctx.fillText(`• Hướng vượng khí: ${karmicData.favorableDirection}`, 450, 780);
      ctx.fillText(`• Sắc màu bổ trợ: ${karmicData.elementColor}`, 450, 830);

      // Sacred Motto Box
      ctx.fillStyle = 'rgba(20, 184, 166, 0.1)';
      ctx.fillRect(80, 920, 740, 170);
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
      ctx.strokeRect(80, 920, 740, 170);

      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 22px serif';
      ctx.fillText('KHẨU QUYẾT ĐẮC VẬN KHAI MỆNH', 450, 970);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'italic 20px serif';
      ctx.fillText(`"${karmicData.sacredMotto}"`, 450, 1030);

      // Cryptographic Seal at bottom
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(450, 1200, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('HPPD SEAL', 450, 1195);
      ctx.font = 'bold 12px monospace';
      ctx.fillText('PROF.TOAN', 450, 1215);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '14px monospace';
      ctx.fillText(`MÃ ẤN CHỨNG: ${karmicData.cryptographicSeal}`, 450, 1310);

      // Trigger download
      const link = document.createElement('a');
      link.download = `The_Kim_Giap_${profile.name.replace(/\s+/g, '_')}_Aurora_Destiny.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${selectedDonation || ''}&addInfo=${encodeURIComponent(donationNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div
      id="celestial-talisman-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0a0814] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.2)] overflow-hidden text-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sacred Shimmer */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 animate-pulse" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0814] rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-300 fill-amber-300/30" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                  ĐỘC QUYỀN TRỌN ĐỜI
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/40 text-teal-300 text-[10px] font-mono">
                  HMAC-SHA256 VERIFIED
                </span>
              </div>
              <h2 className="text-base sm:text-2xl font-serif font-bold text-white tracking-tight mt-1">
                {isVi ? 'Thiên Bản Khai Mệnh & Pháp Bảo Kim Giáp 3D' : 'Sacred Celestial Talisman & Karmic Blueprint'}
              </h2>
              <p className="text-xs text-slate-400 font-light">
                Chủ nhiệm sáng tạo: Giáo Sư - Prof.TOAN • Kênh Huyền Phong Phật Đạo
              </p>
            </div>
          </div>

          <button
            id="btn-close-talisman-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-white/10 bg-black/40 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'card'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>{isVi ? 'Thẻ Mệnh Kim Giáp 3D' : 'Golden Talisman 3D'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pivot')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pivot'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isVi ? 'Bản Đồ Nút Thắt & Cứu Giải' : 'Karmic Pivot & Remedy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('patrons')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'patrons'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isVi ? 'Bia Vàng Công Đức & Bảo Trợ' : 'Hall of Patrons'}</span>
            {patrons.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 text-[10px]">
                {patrons.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[72vh] overflow-y-auto space-y-6">
          {/* TAB 1: 3D GOLDEN TALISMAN CARD */}
          {activeTab === 'card' && (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Interactive 3D Card Stage */}
              <div
                className="w-full lg:w-1/2 flex justify-center perspective-[1000px] py-2"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  ref={cardRef}
                  style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                  className="w-full max-w-[340px] sm:max-w-[380px] rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#1c172e] via-[#100d1e] to-[#08070d] border-2 border-amber-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(251,191,36,0.3)] relative overflow-hidden select-none"
                >
                  {/* Card Filigree Corners */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

                  {/* Shimmer Light Layer */}
                  <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="text-center space-y-1 pb-3 border-b border-amber-400/30">
                    <div className="text-[10px] font-mono tracking-widest text-amber-300/80 uppercase font-bold">
                      HỘ THÂN KIM GIÁP • THIÊN BẢN KHAI MỆNH
                    </div>
                    <div className="text-xl font-serif font-bold text-amber-200 tracking-wider">
                      {profile.name.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-teal-300 font-mono">
                      Mệnh: {calculation.bazi.yearPillar?.naYin || 'Đặc định'}
                    </div>
                  </div>

                  {/* 4 Pillars Mini Grid */}
                  <div className="grid grid-cols-4 gap-1.5 py-3 text-center border-b border-white/10 font-mono text-[11px]">
                    <div className="p-1 rounded bg-black/40 border border-amber-400/20">
                      <div className="text-[9px] text-slate-400">NĂM</div>
                      <div className="text-amber-200 font-bold">
                        {STEMS[calculation.bazi.yearPillar.stem]?.nameVi} {BRANCHES[calculation.bazi.yearPillar.branch]?.nameVi}
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/40 border border-amber-400/20">
                      <div className="text-[9px] text-slate-400">THÁNG</div>
                      <div className="text-amber-200 font-bold">
                        {STEMS[calculation.bazi.monthPillar.stem]?.nameVi} {BRANCHES[calculation.bazi.monthPillar.branch]?.nameVi}
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/40 border border-amber-400/20">
                      <div className="text-[9px] text-slate-400">NGÀY</div>
                      <div className="text-amber-200 font-bold">
                        {STEMS[calculation.bazi.dayPillar.stem]?.nameVi} {BRANCHES[calculation.bazi.dayPillar.branch]?.nameVi}
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/40 border border-amber-400/20">
                      <div className="text-[9px] text-slate-400">GIỜ</div>
                      <div className="text-amber-200 font-bold">
                        {STEMS[calculation.bazi.hourPillar.stem]?.nameVi} {BRANCHES[calculation.bazi.hourPillar.branch]?.nameVi}
                      </div>
                    </div>
                  </div>

                  {/* Core Cosmic Remedies */}
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Dụng Thần Bổ Khuyết:</span>
                      <span className="text-amber-300 font-bold font-mono">Hành {karmicData.remedyElement}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Cung Vị Cứu Giải:</span>
                      <span className="text-teal-300 font-medium truncate max-w-[190px] text-right">
                        {karmicData.remedyPalace}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Phương Vị Vượng Khí:</span>
                      <span className="text-indigo-300 font-medium text-right">{karmicData.favorableDirection}</span>
                    </div>
                  </div>

                  {/* Sacred Motto */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-center font-serif text-xs text-amber-200/90 italic leading-relaxed">
                    "{karmicData.sacredMotto}"
                  </div>

                  {/* Card Seal Footer */}
                  <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-rose-700 border border-amber-400 flex items-center justify-center text-[7px] text-white font-bold">
                        ẤN
                      </div>
                      <span className="text-amber-300/80">Prof.TOAN</span>
                    </div>
                    <span className="text-slate-500 tracking-wider">{karmicData.cryptographicSeal}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Column & Actions */}
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Bảo Vật Trợ Mệnh Độc Bản Cá Nhân Hóa
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    Tấm Thẻ Mệnh Kim Giáp được kết tinh từ ngày giờ sinh chân mặt trời chuẩn thiên văn và phép tính Dụng Thần Bát Tự thực chứng. Được bảo chứng mã hóa độc quyền bởi <strong className="text-amber-200">Giáo Sư - Prof.TOAN</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/[0.07] border border-amber-400/30 space-y-2.5 text-xs">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Đặc Quyền Của Thẻ Mệnh Kim Giáp:
                  </div>
                  <ul className="space-y-1.5 text-slate-300 font-light">
                    <li>• Lưu trữ vĩnh viễn trên thiết bị làm hình nền điện thoại hộ thân.</li>
                    <li>• Khắc ghi chính xác phương vị đón sinh khí và quý nhân tương trợ.</li>
                    <li>• Miễn nhiễm hoàn toàn khỏi mê tín dị đoan nhờ nền tảng khoa học cổ thư.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    id="btn-download-talisman-card"
                    onClick={handleDownloadCard}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Đang Khởi Tạo Thẻ...' : 'Tải Về Ảnh Thẻ Kim Giáp (HD)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('patrons')}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs sm:text-sm text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Gieo Duyên &amp; Ghi Danh Bia Vàng</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KARMIC PIVOT & REMEDY */}
          {activeTab === 'pivot' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-black border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5 text-sm">
                    <Flame className="w-4 h-4 text-rose-400" />
                    Nút Thắt Khí Vận &amp; Thử Thách Bản Mệnh
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono text-[10px] font-bold">
                    CUNG VỊ: {karmicData.knotPalace}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {karmicData.knotDescription}
                </p>
                <div className="pt-2 text-xs text-slate-400 font-light italic">
                  <strong>Gốc rễ nhân quả:</strong> {karmicData.rootCause}
                </div>
              </div>

              {/* 4 Pillars of Transmutation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-1.5">
                  <div className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-400" />
                    Cung Vị Hóa Giải Trọng Tâm
                  </div>
                  <div className="text-sm font-bold text-white">{karmicData.remedyPalace}</div>
                  <p className="text-xs text-slate-300 font-light">
                    Tập trung vun bồi phước thiện, tu sửa tâm ý tại cung vị này để chuyển hóa biến động thành phúc lộc.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-1.5">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Ngũ Hành Bổ Khuyết &amp; Sắc Màu
                  </div>
                  <div className="text-sm font-bold text-white">Hành {karmicData.remedyElement}</div>
                  <p className="text-xs text-slate-300 font-light">
                    Ưu tiên sử dụng tông màu: <strong className="text-amber-200">{karmicData.elementColor}</strong> trong trang phục và không gian sống.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-1.5">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-indigo-400" />
                    Quý Nhân Tương Trợ &amp; Ngành Nghề
                  </div>
                  <div className="text-sm font-bold text-white">{karmicData.catalystCareer}</div>
                  <p className="text-xs text-slate-300 font-light">
                    {karmicData.benefactorArchetype}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-1.5">
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Khung Giờ Hoàng Đạo &amp; Phương Vị
                  </div>
                  <div className="text-sm font-bold text-white">{karmicData.favorableDirection}</div>
                  <p className="text-xs text-slate-300 font-light">
                    {karmicData.auspiciousHours}.
                  </p>
                </div>
              </div>

              {/* Prof. TOAN Sacred Message */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/30 via-slate-900 to-amber-950/20 border border-teal-500/30 space-y-2">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-400" />
                  Lời Khai Thị Từ Kênh Huyền Phong Phật Đạo &amp; Giáo Sư Prof.TOAN
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-200 font-serif italic leading-relaxed pl-3 border-l-2 border-amber-400">
                  "{karmicData.sacredMotto}. Người thấu tỏ thiên mệnh là người không oán trách hoàn cảnh, biết lấy đức hạnh làm cội rễ và hành động chính trực làm thuyền nan vượt biển trần gian."
                </blockquote>
              </div>
            </div>
          )}

          {/* TAB 3: CELESTIAL HALL OF PATRONS & SUPPORT */}
          {activeTab === 'patrons' && (
            <div className="space-y-6">
              {/* Introduction & Philosophy */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-400/30 space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Bia Vàng Công Đức Đồng Hành Cùng Kênh &amp; Dự Án
                </div>
                <p className="font-light leading-relaxed">
                  Toàn bộ sự ủng hộ tự nguyện của Quý vị được dùng để chi trả máy chủ điện toán đám mây (GPU Cloud Servers), nghiên cứu nâng cấp thuật toán và duy trì kênh <strong className="text-amber-200">Huyền Phong Phật Đạo</strong> phụng sự cộng đồng hoàn toàn miễn phí.
                </p>
              </div>

              {/* QR & Bank Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* QR Code Container */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col items-center text-center space-y-3">
                  <div className="p-2.5 rounded-xl bg-white shadow-lg">
                    <img
                      src={vietQrUrl}
                      alt="VietQR HA VAN TOAN"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      VIETCOMBANK — 0501000160764
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Chủ Tài Khoản: <strong className="text-white">HA VAN TOAN</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(BANK_INFO.accountNumber, 'stk')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'stk' ? 'Đã sao chép STK' : 'Sao chép STK'}</span>
                    </button>
                  </div>
                </div>

                {/* Donation Presets & Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-300 block">
                      Chọn Mức Gieo Duyên Tùy Tâm:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { amount: 20000, label: '20.000 đ', note: 'Tách Cà Phê' },
                        { amount: 50000, label: '50.000 đ', note: 'Tách Trà Đạo' },
                        { amount: 100000, label: '100.000 đ', note: 'Máy Chủ GPU' },
                        { amount: 200000, label: '200.000 đ', note: 'Bảo Trợ Nghiên Cứu' },
                        { amount: 500000, label: '500.000 đ', note: 'Hộ Pháp Tri Thức' },
                        { amount: null, label: 'Tùy Tâm', note: 'Hảo Tâm' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDonation(item.amount)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedDonation === item.amount
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.note}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Patron Inscription Form */}
                  <form onSubmit={handleSubmitPatron} className="space-y-3 pt-2">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-300">
                      Khắc Tên Lên Bia Vàng Công Đức:
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={patronName}
                        onChange={(e) => setPatronName(e.target.value)}
                        placeholder="Tên hoặc Pháp danh của Quý vị..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-teal-400"
                        required
                      />

                      <textarea
                        value={patronMessage}
                        onChange={(e) => setPatronMessage(e.target.value)}
                        placeholder="Lời nguyện chúc hoặc thông điệp gửi kênh..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingPatron}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingPatron ? 'Đang Khắc Bia Vàng...' : 'Khắc Tên Lên Bia Vàng Công Đức'}</span>
                    </button>

                    {registeredSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Trân trọng cảm tạ! Tên của Quý vị đã được khắc ghi với mã ấn: {registeredSuccess.sealHash}</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Hall of Patrons List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Danh Hiệu Hộ Pháp &amp; Huynh Đệ Đã Ghi Danh ({patrons.length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Cập nhật thời gian thực</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {patrons.map((patron) => (
                    <div
                      key={patron.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-3 text-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 mt-0.5">
                        <Award className="w-4 h-4 text-slate-950" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-amber-200 truncate">{patron.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{patron.date}</span>
                        </div>
                        {patron.message && (
                          <p className="text-slate-300/90 text-[11px] font-light line-clamp-2">
                            "{patron.message}"
                          </p>
                        )}
                        <div className="text-[9px] font-mono text-teal-400/80">
                          {patron.sealHash}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pháp bảo tâm thức • Cải vận thực nghiệm • Khoa học &amp; Minh triết</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold transition-all cursor-pointer text-center"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
