// ==========================================================
// AURORA DESTINY AI — CỔNG TÙY HỶ GIEO DUYÊN & BẢO TRỢ CÔNG TRÌNH
// Smart, Prestigious & Professional Academic Patronage Portal
// Dedicated to: Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// Verified Credentials:
//   - Bank: Vietcombank | STK: 0501000160764 | Tên: HA VAN TOAN
//   - E-Wallets: MoMo & ZaloPay | SĐT: 0974313633 | Tên: HA VAN TOAN
// Legal Foundation: Article 457 of Vietnam Civil Code 2015
// ==========================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Coffee,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  Crown,
  Send,
  Building2,
  Smartphone,
  Info,
  HeartHandshake,
  Download,
  Share2,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight,
  HelpCircle,
  Users
} from 'lucide-react';
import { sacredSound } from '../services/soundService';
import { LanguageCode } from '../types/destiny';
import { OfficialSocialChannels } from './OfficialSocialChannels';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
}

interface PatronRecord {
  id: string;
  name: string;
  location: string;
  contribution: string;
  note: string;
  date: string;
  sealHash?: string;
  status?: string;
  verificationType?: string;
}

const INITIAL_PATRONS: PatronRecord[] = [
  {
    id: 'p-1',
    name: 'Đạo hữu Minh Tâm',
    location: 'TP. Hồ Chí Minh',
    contribution: 'Bảo trợ GPU Cloud AI',
    note: 'Kính tri ân Thầy HÀ VĂN TOÀN đã dày công kiến tạo bộ máy Tử Vi Bát Tự khai phóng và chuẩn xác tuyệt đối.',
    date: '11/09/2026'
  },
  {
    id: 'p-2',
    name: 'Kỹ sư Hoàng Nam',
    location: 'Hà Nội',
    contribution: 'Gieo duyên cà phê',
    note: 'Khâm phục công trình kết hợp 108 tinh tú và trí tuệ nhân tạo của Thầy. Chúc kênh Huyền Phong Phật Đạo ngày càng hưng thịnh.',
    date: '09/09/2026'
  },
  {
    id: 'p-3',
    name: 'Tuệ Nghiêm Pháp Lữ',
    location: 'Đà Nẵng',
    contribution: 'Tùy hỷ trợ duyên',
    note: 'Nguyện đem chút tịnh tài này tiếp sức máy chủ, hồi hướng công đức giúp muôn người thấu triệt bản mệnh để tích đức cải nghiệp.',
    date: '06/09/2026'
  },
  {
    id: 'p-4',
    name: 'Học giả David Tran',
    location: 'California, USA',
    contribution: 'Bảo trợ máy chủ AI',
    note: 'A monumental academic masterpiece by Prof.TOAN. Truly honored to support this open scientific destiny engine.',
    date: '02/09/2026'
  }
];

const PRESET_TIERS = [
  {
    amount: 30000,
    label: '30.000 VNĐ',
    title: 'Tách Cà Phê Tỉnh Thức',
    icon: '☕',
    description: 'Mời Thầy HÀ VĂN TOÀN ly cà phê ấm lòng trong những đêm miệt mài nghiên cứu thư tịch cổ và mã nguồn AI.',
    badge: 'Khởi Tâm'
  },
  {
    amount: 50000,
    label: '50.000 VNĐ',
    title: 'Đóa Sen Trí Tuệ',
    icon: '🌸',
    description: 'Tài trợ chi phí GPU Cloud xử lý hàng trăm lượt lập lá số và phân tích đại vận miễn phí cho cộng đồng.',
    badge: 'Phổ Biến'
  },
  {
    amount: 100000,
    label: '100.000 VNĐ',
    title: 'Tiếp Sức Hạ Tầng AI',
    icon: '⚡',
    description: 'Duy trì máy chủ cơ sở dữ liệu phân tán PostgreSQL tốc độ cao và cụm mô hình AI đồng thuận 7 tầng.',
    badge: 'Đắc Lực'
  },
  {
    amount: 200000,
    label: '200.000 VNĐ',
    title: 'Bảo Trợ Danh Dự',
    icon: '👑',
    description: 'Đồng hành cùng Giáo Sư TOAN bảo tồn và hiện đại hóa kho tàng minh triết Đông Phương thời đại số.',
    badge: 'Cao Quý'
  },
  {
    amount: 500000,
    label: '500.000 VNĐ',
    title: 'Đại Thí Chủ Trợ Duyên',
    icon: '🌟',
    description: 'Bảo trợ toàn diện cho dự án phi thương mại, giúp toàn bộ tính năng cao cấp mãi mãi tự do cho đại chúng.',
    badge: 'Đặc Biệt'
  }
];

export const SponsorshipModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'vi'
}) => {
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'qr' | 'tiers' | 'patrons' | 'transparency' | 'channels'>('qr');
  const [paymentMethod, setPaymentMethod] = useState<'vcb' | 'momo' | 'zalopay'>('vcb');
  const [selectedTierAmount, setSelectedTierAmount] = useState<number>(50000);
  const [senderName, setSenderName] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Patron messaging state
  const [patrons, setPatrons] = useState<PatronRecord[]>([]);
  const [newPatronName, setNewPatronName] = useState('');
  const [newPatronLocation, setNewPatronLocation] = useState('');
  const [newPatronNote, setNewPatronNote] = useState('');
  const [isSubmittedFeedback, setIsSubmittedFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync patrons from persistent backend API
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    fetch('/api/patrons')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.patrons && Array.isArray(data.patrons)) {
          setPatrons(data.patrons);
        }
      })
      .catch(err => {
        console.warn('Could not fetch patrons list:', err);
      });
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const actualAmount = customAmount
    ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0
    : selectedTierAmount;

  // Format safe transfer syntax: remove accents and special chars
  const cleanSenderName = senderName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

  const transferSyntax = cleanSenderName
    ? `${cleanSenderName} ung ho Thay Toan`
    : 'Ung ho Thay Toan Aurora AI';

  // Accurate credentials
  const VCB_ACCOUNT = '0501000160764';
  const ACCOUNT_HOLDER = 'HA VAN TOAN';
  const WALLET_PHONE = '0974313633';

  // Dynamic VietQR generator URL with NAPAS 24/7 specifications
  const vietQrUrl = `https://img.vietqr.io/image/970436-${VCB_ACCOUNT}-compact2.png?amount=${actualAmount}&addInfo=${encodeURIComponent(
    transferSyntax
  )}&accountName=${encodeURIComponent(ACCOUNT_HOLDER)}`;

  // MoMo QR dynamic generation
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `2|99|${WALLET_PHONE}|${ACCOUNT_HOLDER}||0|0|${actualAmount}|${transferSyntax}|transfer_myqr`
  )}`;

  // ZaloPay QR dynamic generation
  const zaloPayQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `https://social.zalopay.vn/sp/deeplink/transfer?phone=${WALLET_PHONE}&amount=${actualAmount}&message=${transferSyntax}`
  )}`;

  const handleCopy = (text: string, key: string) => {
    sacredSound.playCelestialChime(768);
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleAddPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatronName.trim() || !newPatronNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sacredSound.playTibetanBowl(432);

    try {
      const resp = await fetch('/api/patrons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatronName.trim(),
          location: newPatronLocation.trim() || 'Hữu duyên',
          note: newPatronNote.trim(),
          amount: actualAmount >= 10000 ? Math.floor(actualAmount) : undefined
        })
      });
      const data = await resp.json();
      if (data?.patron) {
        setPatrons(prev => [data.patron, ...prev]);
      } else {
        const fallbackRecord: PatronRecord = {
          id: `p-${Date.now()}`,
          name: newPatronName.trim(),
          location: newPatronLocation.trim() || 'Hữu duyên',
          contribution: actualAmount > 0 ? `${actualAmount.toLocaleString('vi-VN')} VNĐ` : 'Tùy hỷ trợ duyên',
          note: newPatronNote.trim(),
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'PENDING'
        };
        setPatrons(prev => [fallbackRecord, ...prev]);
      }
      setIsSubmittedFeedback(true);
      setNewPatronName('');
      setNewPatronLocation('');
      setNewPatronNote('');
    } catch (err) {
      console.warn('Submission failed, recording locally:', err);
      const fallbackRecord: PatronRecord = {
        id: `p-${Date.now()}`,
        name: newPatronName.trim(),
        location: newPatronLocation.trim() || 'Hữu duyên',
        contribution: actualAmount > 0 ? `${actualAmount.toLocaleString('vi-VN')} VNĐ` : 'Tùy hỷ trợ duyên',
        note: newPatronNote.trim(),
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'PENDING'
      };
      setPatrons(prev => [fallbackRecord, ...prev]);
      setIsSubmittedFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="sponsorship-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="sponsorship-modal-container"
        className="relative w-full max-w-3xl bg-[#0a0c16] border border-amber-400/40 rounded-2xl sm:rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.25)] overflow-hidden text-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Gold Shimmer Top Stripe */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 via-rose-400 to-amber-500 animate-pulse" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-b from-amber-500/10 via-slate-900/40 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-rose-600 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.4)] shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d101f] rounded-[14px] flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-400/40 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  TÙY HỶ CÔNG ĐỨC
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold">
                  CHÍNH CHỦ ĐÃ XÁC THỰC
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-400/15 border border-teal-400/40 text-teal-300 text-[10px] font-mono">
                  PHI THƯƠNG MẠI
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>{isVi ? 'Bảo Trợ Học Thuật & Đồng Hành Cùng Kênh' : 'Academic Patronage & Channel Support'}</span>
              </h2>
              <p className="text-xs text-amber-200/80 font-light mt-0.5">
                {isVi
                  ? 'Kính gửi Giáo Sư - Prof.TOAN • Kênh Huyền Phong Phật Đạo'
                  : 'Official Portal for Prof.TOAN & Sovereign AI Research Foundation'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-sponsorship-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-3 sm:px-6 pt-2.5 border-b border-white/10 bg-black/50 overflow-x-auto text-xs font-mono scrollbar-none">
          <button
            id="tab-sponsor-qr"
            onClick={() => setActiveTab('qr')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 font-bold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{isVi ? 'Quét Mã QR & Tài Khoản' : 'QR Code & Banking'}</span>
          </button>

          <button
            id="tab-sponsor-tiers"
            onClick={() => setActiveTab('tiers')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10 font-bold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>{isVi ? 'Mời Cà Phê & Gói Gieo Duyên' : 'Coffee & Tiers'}</span>
          </button>

          <button
            id="tab-sponsor-patrons"
            onClick={() => setActiveTab('patrons')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'patrons'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10 font-bold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isVi ? 'Sổ Vàng Tri Ân' : 'Hall of Patrons'}</span>
          </button>

          <button
            id="tab-sponsor-transparency"
            onClick={() => setActiveTab('transparency')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'transparency'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 font-bold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVi ? 'Minh Bạch Quỹ & Pháp Lý' : 'Transparency'}</span>
          </button>

          <button
            id="tab-sponsor-channels"
            onClick={() => setActiveTab('channels')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'channels'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 font-bold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isVi ? 'Mạng Xã Hội Chính Thức' : 'Official Channels'}</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* ==================================================== */}
          {/* TAB 1: QR & BANKING DETAILS (INTELLIGENT & CLASSY)   */}
          {/* ==================================================== */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              {/* Official Credential Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-rose-500/15 border border-amber-400/40 flex items-start gap-3 shadow-lg">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-amber-200">
                      Tài Khoản Thụ Hưởng Trực Tiếp:
                    </span>
                    <span className="font-mono font-bold text-white bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                      {ACCOUNT_HOLDER} (Hà Văn Toàn)
                    </span>
                  </div>
                  <p className="text-slate-300 font-light text-[11px] sm:text-xs">
                    Toàn bộ sự ủng hộ được sử dụng trực tiếp để duy trì hạ tầng máy chủ GPU Cloud AI, lưu trữ bảo mật và giữ cho nền tảng Tử Vi Bát Tự luôn phục vụ cộng đồng hoàn toàn phi thương mại.
                  </p>
                </div>
              </div>

              {/* Payment Method Switcher Pills */}
              <div className="flex items-center justify-center p-1 rounded-2xl bg-black/60 border border-white/10 max-w-md mx-auto">
                <button
                  id="btn-method-vcb"
                  onClick={() => {
                    sacredSound.playCelestialChime(528);
                    setPaymentMethod('vcb');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'vcb'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Vietcombank (VCB)</span>
                </button>

                <button
                  id="btn-method-momo"
                  onClick={() => {
                    sacredSound.playCelestialChime(640);
                    setPaymentMethod('momo');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'momo'
                      ? 'bg-gradient-to-r from-[#a50064] to-[#d82d8b] text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Ví MoMo</span>
                </button>

                <button
                  id="btn-method-zalopay"
                  onClick={() => {
                    sacredSound.playCelestialChime(768);
                    setPaymentMethod('zalopay');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'zalopay'
                      ? 'bg-gradient-to-r from-[#0068ff] to-[#008fe5] text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Ví ZaloPay</span>
                </button>
              </div>

              {/* Main Dual Grid: Left Interactive QR Code, Right Copyable Hub */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Left Column: QR Code Viewer with Download & Action */}
                <div className="md:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/10 text-center space-y-3">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <QrCode className="w-3.5 h-3.5" />
                      {paymentMethod === 'vcb' ? 'VietQR NAPAS 24/7' : paymentMethod === 'momo' ? 'Mã QR MoMo' : 'Mã QR ZaloPay'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {actualAmount > 0 ? `${actualAmount.toLocaleString('vi-VN')} đ` : 'Tùy tâm'}
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="relative p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] group transition-transform hover:scale-[1.02]">
                    <img
                      src={
                        paymentMethod === 'vcb'
                          ? vietQrUrl
                          : paymentMethod === 'momo'
                          ? momoQrUrl
                          : zaloPayQrUrl
                      }
                      alt="Mã QR Chuyển Khoản HA VAN TOAN"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10 pointer-events-none" />
                  </div>

                  {/* Quick Action buttons below QR */}
                  <div className="w-full space-y-1.5">
                    <a
                      href={
                        paymentMethod === 'vcb'
                          ? vietQrUrl
                          : paymentMethod === 'momo'
                          ? momoQrUrl
                          : zaloPayQrUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tải / Mở Ảnh Mã QR Lớn</span>
                    </a>
                    <p className="text-[10px] text-slate-400 font-light">
                      Mở ứng dụng Ngân hàng hoặc Ví trên điện thoại, chọn quét ảnh QR vừa tải
                    </p>
                  </div>
                </div>

                {/* Right Column: Copyable Fields & Intelligent Config */}
                <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                  {/* Channel Card Depending on Selected Method */}
                  {paymentMethod === 'vcb' ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/20 to-black/40 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span>Ngân hàng Ngoại Thương (Vietcombank)</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                          VCB CHÍNH THỨC
                        </span>
                      </div>

                      {/* STK Field with 1-Click Copy */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-amber-400/40 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Số tài khoản thụ hưởng:</span>
                          <span className="font-mono font-bold text-amber-300 text-base sm:text-lg tracking-wider">
                            {VCB_ACCOUNT}
                          </span>
                        </div>
                        <button
                          id="btn-copy-vcb-stk"
                          onClick={() => handleCopy(VCB_ACCOUNT, 'vcb-stk')}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
                        >
                          {copiedKey === 'vcb-stk' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Account Holder Name */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Chủ tài khoản (Đã xác thực):</span>
                          <span className="font-bold text-white uppercase tracking-wider font-mono">
                            {ACCOUNT_HOLDER} (Hà Văn Toàn)
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(ACCOUNT_HOLDER, 'vcb-name')}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'vcb-name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Sao chép</span>
                        </button>
                      </div>
                    </div>
                  ) : paymentMethod === 'momo' ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#a50064]/20 to-black/40 border border-[#d82d8b]/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-pink-300">
                          <Smartphone className="w-4 h-4 text-pink-400" />
                          <span>Ví Điện Tử MoMo</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-400/30">
                          MOMO CHÍNH THỨC
                        </span>
                      </div>

                      {/* Phone Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-pink-400/40 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Số điện thoại ví MoMo:</span>
                          <span className="font-mono font-bold text-pink-300 text-base sm:text-lg tracking-wider">
                            {WALLET_PHONE}
                          </span>
                        </div>
                        <button
                          id="btn-copy-momo-phone"
                          onClick={() => handleCopy(WALLET_PHONE, 'momo-phone')}
                          className="px-3.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-pink-400/40"
                        >
                          {copiedKey === 'momo-phone' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Account Holder Name */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Chủ ví MoMo:</span>
                          <span className="font-bold text-white uppercase tracking-wider font-mono">
                            {ACCOUNT_HOLDER} (Hà Văn Toàn)
                          </span>
                        </div>
                        <span className="text-[11px] text-pink-300 font-mono">MoMo Pay 24/7</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0068ff]/20 to-black/40 border border-[#008fe5]/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                          <Smartphone className="w-4 h-4 text-blue-400" />
                          <span>Ví Điện Tử ZaloPay</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                          ZALOPAY CHÍNH THỨC
                        </span>
                      </div>

                      {/* Phone Field */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-blue-400/40 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Số điện thoại ví ZaloPay:</span>
                          <span className="font-mono font-bold text-blue-300 text-base sm:text-lg tracking-wider">
                            {WALLET_PHONE}
                          </span>
                        </div>
                        <button
                          id="btn-copy-zalopay-phone"
                          onClick={() => handleCopy(WALLET_PHONE, 'zalopay-phone')}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400/40"
                        >
                          {copiedKey === 'zalopay-phone' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Account Holder Name */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Chủ ví ZaloPay:</span>
                          <span className="font-bold text-white uppercase tracking-wider font-mono">
                            {ACCOUNT_HOLDER} (Hà Văn Toàn)
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-300 font-mono">ZaloPay Instant</span>
                      </div>
                    </div>
                  )}

                  {/* Transfer Syntax Box with Copy */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        Nội dung chuyển khoản chuẩn:
                      </span>
                      <button
                        id="btn-copy-syntax"
                        onClick={() => handleCopy(transferSyntax, 'syntax')}
                        className="text-[11px] text-amber-300 hover:text-amber-200 font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'syntax' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Đã chép nội dung</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép cú pháp</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 font-mono text-amber-200 font-semibold text-xs break-all">
                      {transferSyntax}
                    </div>
                  </div>

                  {/* Quick Dynamic Amount & Sender Name In-place Customizer */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 font-semibold">
                        Tùy chỉnh số tiền &amp; tên trên mã QR:
                      </span>
                      <button
                        onClick={() => setActiveTab('tiers')}
                        className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Xem chi tiết các gói</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Họ tên bạn (VD: Minh Tam)"
                        className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        value={customAmount}
                        onChange={(e) => {
                          const num = e.target.value.replace(/\D/g, '');
                          setCustomAmount(num ? parseInt(num, 10).toLocaleString('vi-VN') : '');
                        }}
                        placeholder="Số tiền VNĐ (VD: 50.000)"
                        className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Channels Quick Showcase */}
              <div className="pt-4 border-t border-white/10">
                <OfficialSocialChannels variant="compact" showTitle={true} />
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: TIERS & COFFEE GIFTS (ELEGANT PRESETS)        */}
          {/* ==================================================== */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">
                    Các Gói Tùy Hỷ &amp; Trợ Duyên Học Thuật
                  </h3>
                  <p className="text-xs text-slate-400 font-light">
                    Mỗi mức đóng góp đều tự động cập nhật số tiền và mã QR tương ứng để quý vị chuyển khoản thuận tiện nhất:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    onClick={() => {
                      sacredSound.playCelestialChime(tier.amount / 100);
                      setSelectedTierAmount(tier.amount);
                      setCustomAmount('');
                      setActiveTab('qr');
                    }}
                    className={`p-4 rounded-2xl text-left transition-all cursor-pointer border relative group flex flex-col justify-between ${
                      selectedTierAmount === tier.amount && !customAmount
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                        : 'bg-white/[0.02] border-white/10 hover:border-amber-400/50 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{tier.icon}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                          {tier.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold mt-2 text-white font-serif group-hover:text-amber-300 transition-colors">
                        {tier.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-white flex items-center gap-1">
                        Chọn gói này <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: HALL OF PATRONS & DIRECT MESSAGE FORM         */}
          {/* ==================================================== */}
          {activeTab === 'patrons' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-serif">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Sổ Vàng Danh Dự &amp; Tri Ân Đồng Hành</span>
                </div>
                <p className="text-xs text-slate-400">
                  Nơi khắc ghi tấm lòng của quý đạo hữu, học giả và bạn hữu gần xa đã tiếp sức cho công trình Tử Vi Bát Tự AI:
                </p>
              </div>

              {/* Patrons list */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {patrons.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                    <p className="text-xs text-amber-200/80 font-serif">
                      Sổ vàng đang mở để đón nhận những hạt giống thiện lành đầu tiên.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Kính mời quý đạo hữu hoan hỷ phát tâm gieo duyên trợ lực nền tảng qua biểu mẫu bên dưới.
                    </p>
                  </div>
                ) : (
                  patrons.map((patron) => (
                    <div
                      key={patron.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:border-amber-400/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-xs">{patron.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({patron.location})</span>
                          <span className="px-2 py-0.2 rounded bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[9px] font-mono font-bold">
                            {patron.contribution}
                          </span>
                          {patron.status === 'VERIFIED' && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[8px] font-mono font-bold flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {patron.verificationType === 'DEMO_SAMPLE' ? 'MẪU MINH HỌA' : 'ĐÃ ĐỐI SOÁT'}
                            </span>
                          )}
                          {patron.status === 'PENDING' && (
                            <span className="px-1.5 py-0.2 rounded bg-yellow-500/15 border border-yellow-400/30 text-yellow-300 text-[8px] font-mono">
                              ⏳ Chờ đối soát
                            </span>
                          )}
                          {patron.sealHash && (
                            <span className="text-[8px] text-slate-500 font-mono tracking-wider">
                              {patron.sealHash}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300/85 italic font-serif leading-relaxed">
                          "{patron.note}"
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {patron.date}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Message to Prof.TOAN Form */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-amber-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Send className="w-4 h-4 text-purple-400" />
                  <span>Gửi Lời Chúc / Báo Tin Gieo Duyên Tới Thầy HÀ VĂN TOÀN</span>
                </div>

                {isSubmittedFeedback ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Kính tri ân tấm lòng của quý đạo hữu! Lời chúc và thông điệp đã được ghi vào sổ vàng vinh danh. Chúc quý vị vạn sự hanh thông, cát tường như ý!
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleAddPatron} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newPatronName}
                        onChange={(e) => setNewPatronName(e.target.value)}
                        placeholder="Họ tên hoặc Đạo hiệu của bạn *"
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                        required
                      />
                      <input
                        type="text"
                        value={newPatronLocation}
                        onChange={(e) => setNewPatronLocation(e.target.value)}
                        placeholder="Tỉnh/Thành phố hoặc Quốc gia (VD: Hà Nội)"
                        className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <textarea
                      value={newPatronNote}
                      onChange={(e) => setNewPatronNote(e.target.value)}
                      placeholder="Lời nhắn nhủ, chúc phúc hoặc cảm nghĩ của bạn gửi tới Thầy TOAN..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ghi Danh Vào Sổ Vàng Tri Ân</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: TRANSPARENCY & LEGAL INTEGRITY                 */}
          {/* ==================================================== */}
          {activeTab === 'transparency' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              {/* Allocation Breakdown Chart */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-serif">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Nguyên Tắc Minh Bạch &amp; Phân Bổ Nguồn Lực</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    100% PHI THƯƠNG MẠI
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
                    <div className="h-full bg-amber-400" style={{ width: '60%' }} title="Máy chủ GPU Cloud AI (60%)" />
                    <div className="h-full bg-teal-400" style={{ width: '25%' }} title="Bảo mật & Lưu trữ Dữ liệu (25%)" />
                    <div className="h-full bg-purple-400" style={{ width: '15%' }} title="Nghiên cứu Học thuật Mở (15%)" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1 text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>60% Máy chủ GPU AI</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-300">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>25% An toàn dữ liệu</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>15% Nghiên cứu mở</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Foundation */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-300 font-serif">
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  <span>Cơ Sở Pháp Lý Theo Pháp Luật Việt Nam</span>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-rose-400/40 text-[11px] text-slate-300 font-light">
                  <p>
                    • <strong>Căn cứ Điều 457 Bộ luật Dân sự 2015</strong>: Mọi sự ủng hộ thông qua tài khoản Ngân hàng (Vietcombank <strong>0501000160764</strong> - <strong>HA VAN TOAN</strong>) hay Ví điện tử MoMo / ZaloPay (<strong>0974313633</strong> - <strong>Hà Văn Toàn</strong>) mang bản chất là <strong>Hợp đồng tặng cho tài sản tự nguyện</strong>, xuất phát từ thiện chí và sự tri ân của người dùng đối với công trình nghiên cứu và kênh Huyền Phong Phật Đạo.
                  </p>
                  <p>
                    • <strong>Không cấu thành dịch vụ tâm linh thương mại:</strong> Dự án không kinh doanh dịch vụ bói toán, không mua bán bùa chú, không thu phí giải hạn và không tạo ra cam kết bảo đảm thay đổi số mệnh mang tính mê tín.
                  </p>
                  <p>
                    • <strong>Bảo mật thông tin người ủng hộ:</strong> Danh tính và thông tin giao dịch của quý đạo hữu được bảo vệ nghiêm ngặt theo đúng tinh thần Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: OFFICIAL SOCIAL CHANNELS (TIKTOK/YT/FB)       */}
          {/* ==================================================== */}
          {activeTab === 'channels' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-red-500/10 to-blue-500/10 border border-white/15">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Kênh Truyền Thông Trực Thuộc Hệ Thống</span>
                </div>
                <h3 className="text-base font-serif font-medium text-white">
                  Kênh Huyền Phong Phật Đạo &amp; Giáo Sư - Prof.TOAN
                </h3>
                <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">
                  Quý đạo hữu, học giả và người hữu duyên hãy nhấn theo dõi, đăng ký các kênh truyền thông chính thức dưới đây để nhận thông báo bài giảng mới, video luận giải Tử Vi Bát Tự và tham gia các buổi Livestream đàm đạo học thuật.
                </p>
              </div>

              <OfficialSocialChannels variant="grid" showTitle={false} />
            </div>
          )}
        </div>

        {/* Modal Footer with Channel Signature */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              Kênh <strong className="text-white">Huyền Phong Phật Đạo</strong> • Giáo Sư - <strong className="text-amber-300">Prof.TOAN</strong> (Hà Văn Toàn)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopy('0501000160764', 'ftr-stk')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-400/30 transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1"
            >
              {copiedKey === 'ftr-stk' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã chép STK</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép STK VCB</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold transition-all cursor-pointer text-center text-xs"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
