// ==========================================================
// AURORA DESTINY AI — LUXURY SPONSORSHIP & PATRONAGE STUDIO
// ĐỒNG HÀNH CÙNG NGHIÊN CỨU & ỦNG HỘ KÊNH HUYỀN PHONG PHẬT ĐẠO
// Tích Hợp Kênh Tiếp Nhận Chính Thức Đẳng Cấp & Chuẩn Mực:
// 1. Vietcombank (VietQR 24/7): 0501000160764 - HA VAN TOAN
// 2. Ví Điện Tử MoMo:          0974313633 - HÀ VĂN TOÀN
// 3. Ví Điện Tử ZaloPay:       0974313633 - HÀ VĂN TOÀN
// Tuân thủ triệt để pháp luật Việt Nam: Điều 457 BLDS 2015,
// Nghị định 72/2013/NĐ-CP, Nghị định 147/2024/NĐ-CP & Nghị định 13/2023/NĐ-CP
// ==========================================================

import React, { useState } from 'react';
import {
  Heart,
  Coffee,
  Sparkles,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Download,
  CreditCard,
  Award,
  Crown,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  Wallet,
  Smartphone,
  Send,
  Scale
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';
import {
  PAYMENT_CHANNELS,
  PaymentMethodId,
  DONATION_PRESETS,
  generateQrUrl
} from '../data/paymentConfig';

interface Props {
  language?: LanguageCode;
  onClose: () => void;
  onOpenLegalModal?: () => void;
}

export const SponsorshipModal: React.FC<Props> = ({
  language = 'vi',
  onClose,
  onOpenLegalModal
}) => {
  const isVi = language === 'vi';

  const [activeChannel, setActiveChannel] = useState<PaymentMethodId>('vcb');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customNote, setCustomNote] = useState<string>('Ung ho Aurora Destiny AI');
  const [donorName, setDonorName] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrError, setQrError] = useState<boolean>(false);
  const [submittedGratitude, setSubmittedGratitude] = useState<boolean>(false);

  const currentChannel = PAYMENT_CHANNELS[activeChannel];

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2500);
      }).catch(() => {
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2500);
      });
    } else {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // Compute dynamic transfer note
  const computedNote = customNote.trim() || `Ung ho Aurora Destiny AI${donorName ? ' - ' + donorName : ''}`;

  // Generate dynamic QR Code URL
  const qrUrl = generateQrUrl(activeChannel, selectedAmount, computedNote, donorName);

  // Submit donor appreciation note
  const handleSaveAppreciation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('aurora_donor_inscriptions') || '[]');
      existing.push({
        name: donorName.trim(),
        channel: currentChannel.shortName,
        amount: selectedAmount,
        note: computedNote,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('aurora_donor_inscriptions', JSON.stringify(existing));
      setSubmittedGratitude(true);
      setTimeout(() => setSubmittedGratitude(false), 4000);
    } catch {
      setSubmittedGratitude(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#080911] border border-amber-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Radiant Gradient Beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 via-pink-500 to-sky-500" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.35)] shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0e19] rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300/30" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                  {isVi ? 'Đồng Hành & Tri Ân' : 'Patronage & Sponsorship'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {isVi ? 'Tự Nguyện & Tuân Thủ Pháp Luật' : 'Voluntary & Legally Compliant'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-wide">
                {isVi ? 'Ủng Hộ Kênh Huyền Phong Phật Đạo & Dự Án' : 'Support Huyền Phong Phật Đạo & Research'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={isVi ? 'Đóng cửa sổ' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 px-5 sm:px-7 py-5 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Subtle Philosophical Preface */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-purple-950/[0.2] to-teal-950/[0.1] border border-amber-400/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-amber-200">Kính gửi Quý Huynh Đệ &amp; Bạn Đọc Hữu Duyên:</strong> Nền tảng <span className="text-teal-300 font-medium">Aurora Destiny AI</span> trực thuộc <strong className="text-amber-300 font-semibold">kênh Huyền Phong Phật Đạo</strong> do <strong className="text-amber-200">Giáo Sư - Prof.TOAN</strong> sáng lập. Hệ thống phụng sự cộng đồng phi thương mại, chuẩn hóa khoa học lý số cổ học và bài trừ triệt để mê tín dị đoan. 
              Sự ủng hộ tự nguyện của Quý vị — dù chỉ là một <span className="text-amber-300 font-medium">tách cà phê</span> hay <span className="text-amber-300 font-medium">tách trà ấm</span> — chính là nguồn trợ lực quý báu để duy trì máy chủ điện toán đám mây AI và nghiên cứu thuật toán phụng sự cộng đồng hoàn toàn miễn phí.
            </p>
          </div>

          {/* SMART PAYMENT CHANNEL SWITCHER (VCB, MoMo, ZaloPay) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-400" />
                {isVi ? 'Chọn Phương Thức Chuyển Tiền Ủng Hộ:' : 'Select Payment Method:'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {isVi ? 'Chạm để chuyển kênh' : 'Instant channel switch'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Channel 1: Vietcombank */}
              <button
                type="button"
                onClick={() => {
                  setActiveChannel('vcb');
                  setQrError(false);
                }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-center sm:text-left ${
                  activeChannel === 'vcb'
                    ? 'bg-gradient-to-br from-emerald-950/70 to-[#031d13] border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0">
                  VCB
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    Vietcombank
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300 truncate">
                    0501000160764
                  </div>
                </div>
              </button>

              {/* Channel 2: Ví MoMo */}
              <button
                type="button"
                onClick={() => {
                  setActiveChannel('momo');
                  setQrError(false);
                }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-center sm:text-left ${
                  activeChannel === 'momo'
                    ? 'bg-gradient-to-br from-[#380623]/80 to-[#1e0313] border-pink-500 ring-2 ring-pink-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-pink-500/40 hover:bg-white/[0.06]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#A50064] text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                  MoMo
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    Ví MoMo
                  </div>
                  <div className="text-[10px] font-mono text-pink-300 truncate">
                    0974313633
                  </div>
                </div>
              </button>

              {/* Channel 3: Ví ZaloPay */}
              <button
                type="button"
                onClick={() => {
                  setActiveChannel('zalopay');
                  setQrError(false);
                }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-center sm:text-left ${
                  activeChannel === 'zalopay'
                    ? 'bg-gradient-to-br from-[#06243d]/80 to-[#041525] border-sky-400 ring-2 ring-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-sky-500/40 hover:bg-white/[0.06]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#0088FF] text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                  Zalo
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    Ví ZaloPay
                  </div>
                  <div className="text-[10px] font-mono text-sky-300 truncate">
                    0974313633
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Preset Contribution Amounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Chọn Mức Tùy Hỷ (Tự Động Gắn Vào Mã QR):' : 'Select Contribution Tier:'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedAmount ? `${selectedAmount.toLocaleString('vi-VN')} đ` : 'Tùy tâm'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {DONATION_PRESETS.map((preset, idx) => {
                const isSelected = selectedAmount === preset.amount;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAmount(preset.amount)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-amber-400/50 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {preset.subtitle}
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                      {preset.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CORE FINTECH CARD & DYNAMIC QR DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left: Luxury Dynamic Metal Card (7 Columns) */}
            <div className={`md:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-br ${currentChannel.accentBg} border ${currentChannel.borderAccent} shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden`}>
              {/* Subtle Specular Glows */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Brand & Badge Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-xs" style={{ backgroundColor: currentChannel.brandColor }}>
                      {currentChannel.id === 'vcb' ? 'VCB' : currentChannel.id === 'momo' ? 'MoMo' : 'Zalo'}
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm sm:text-base tracking-wider uppercase block">
                        {currentChannel.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                        Kênh Tiếp Nhận Hợp Pháp &amp; Trực Tiếp
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono font-semibold">
                    {currentChannel.badge}
                  </span>
                </div>

                {/* EMV Chip & Contactless Visual */}
                <div className="flex items-center gap-3 my-2">
                  <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 p-0.5 shadow flex flex-col justify-around px-1">
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                    </svg>
                  </div>
                </div>

                {/* Main Identifier: STK hoặc SĐT */}
                <div className="my-3">
                  <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>
                      {currentChannel.type === 'bank' ? 'Số Tài Khoản (Account Number):' : 'Số Điện Thoại Ví (Phone Number):'}
                    </span>
                    <span className="text-[9px] text-slate-400">Nhấn để sao chép</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-black/60 border border-white/15">
                    <span className="text-xl sm:text-2xl font-mono font-bold tracking-[0.15em] text-amber-300 select-all">
                      {currentChannel.accountNumber}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(currentChannel.accountNumber, 'accNumber')}
                      className="px-3 py-1.5 rounded-lg text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow shrink-0"
                      style={{ backgroundColor: currentChannel.brandColorHover, color: '#FFFFFF' }}
                      title="Sao chép số tài khoản / số điện thoại"
                    >
                      {copiedField === 'accNumber' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ĐÃ COPY</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY SỐ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Beneficiary & Provider Details */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Chủ Tài Khoản (Beneficiary)
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm sm:text-base font-mono font-bold text-white tracking-wider">
                        {currentChannel.accountName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentChannel.accountName, 'accName')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        title="Sao chép tên chủ tài khoản"
                      >
                        {copiedField === 'accName' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Đơn Vị Thụ Hưởng
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">
                        {currentChannel.shortName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Transfer Syntax Note */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5 overflow-hidden mr-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Nội dung:</span>
                  <span className="font-mono text-amber-200 text-xs font-medium truncate">
                    {computedNote}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(computedNote, 'note')}
                  className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedField === 'note' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'note' ? 'Đã chép' : 'Chép cú pháp'}</span>
                </button>
              </div>
            </div>

            {/* Right: Dynamic High-Res QR Showcase (5 Columns) */}
            <div className="md:col-span-5 flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl bg-[#0d0f1b] border border-white/10 shadow-lg text-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <QrCode className="w-3.5 h-3.5" />
                  Mã Quét QR {currentChannel.shortName}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  Tức Thì 24/7
                </span>
              </div>

              {/* QR Image Box with Glow */}
              <div className="relative p-2.5 rounded-2xl bg-white shadow-2xl max-w-[210px] w-full aspect-square flex items-center justify-center my-1 group">
                <img
                  src={qrUrl}
                  alt={`Mã QR ${currentChannel.name}`}
                  className="w-full h-full object-contain rounded-lg"
                  onError={() => setQrError(true)}
                />

                {qrError && (
                  <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-3 text-center rounded-2xl">
                    <QrCode className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="text-xs font-mono">{currentChannel.accountNumber}</span>
                    <span className="text-[10px] text-slate-400">{currentChannel.accountName}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight mt-2 px-1">
                {currentChannel.instructionsVi}
              </p>

              {/* Action Buttons: App Open or Download */}
              <div className="w-full flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                {/* Mobile Deep Link Buttons */}
                {currentChannel.id === 'momo' && (
                  <a
                    href="https://me.momo.vn/0974313633"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 rounded-xl bg-[#A50064] hover:bg-[#C40076] text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mở Ứng Dụng MoMo Ngay</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {currentChannel.id === 'zalopay' && (
                  <button
                    type="button"
                    onClick={() => handleCopy('0974313633', 'zalopay_phone')}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#0088FF] hover:bg-[#299AFF] text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{copiedField === 'zalopay_phone' ? 'Đã Sao Chép SĐT ZaloPay' : 'Sao Chép SĐT ZaloPay: 0974313633'}</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={qrUrl}
                    download={`QR-${currentChannel.shortName}-0974313633.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-amber-300" />
                    <span>Tải Mã QR</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentChannel.accountNumber, 'qrCopy')}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'qrCopy' ? 'Đã Copy' : 'Copy Số'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SỔ VÀNG TRI ÂN & LỜI CHÚC ĐỒNG HÀNH (Donor Appreciation Form) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.05] via-purple-500/[0.05] to-teal-500/[0.05] border border-amber-400/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs sm:text-sm">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Sổ Vàng Tri Ân &amp; Lưu Danh Hảo Tâm</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Tùy chọn ghi danh
              </span>
            </div>

            <form onSubmit={handleSaveAppreciation} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Họ tên hoặc Pháp danh của Quý vị..."
                  className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Lời chúc hoặc lời nhắn gửi..."
                  className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400 font-light">
                  Nội dung sẽ được cập nhật tự động vào cú pháp chuyển khoản và lưu giữ tri ân.
                </p>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittedGratitude ? 'Đã Ghi Nhận Tri Ân!' : 'Gửi Lời Chúc'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* LEGAL COMPLIANCE & ETHICS BOX (Không Vi Phạm Pháp Luật 100%) */}
          <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/30 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cam Kết Tuân Thủ Pháp Luật Việt Nam &amp; Minh Bạch 100%</span>
              </div>

              {onOpenLegalModal && (
                <button
                  type="button"
                  onClick={onOpenLegalModal}
                  className="text-amber-300 hover:text-amber-200 text-[11px] font-mono underline flex items-center gap-1 cursor-pointer"
                >
                  <Scale className="w-3 h-3" />
                  <span>Xem Hiến Chương Pháp Lý Đầy Đủ</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed font-light space-y-1">
              <p>
                • <strong>Cơ sở pháp lý:</strong> Hoạt động ủng hộ mang bản chất <strong>Hợp đồng tặng cho tài sản tự nguyện</strong> theo quy định tại <strong className="text-slate-200">Điều 457 Bộ luật Dân sự 2015</strong> của nước CHXHCN Việt Nam, xuất phát từ thiện chí của người dùng đối với các nghiên cứu học thuật của tác giả.
              </p>
              <p>
                • <strong>Tuân thủ Luật An ninh mạng, Nghị định 72/2013 &amp; Nghị định 147/2024:</strong> Ứng dụng bài trừ mọi hành vi mê tín dị đoan, buôn thần bán thánh, không bán các vật phẩm tâm linh lừa gạt hay thu phí xem bói; luôn đề cao tư duy khoa học, tự do ý chí và đạo đức nhân bản.
              </p>
              <p>
                • <strong>Mục đích tài trợ:</strong> 100% kinh phí ủng hộ được chi trả trực tiếp cho máy chủ điện toán đám mây AI (GPU servers) và công tác nâng cấp nghiên cứu phụng sự cộng đồng phi thương mại.
              </p>
              <p>
                • <strong>Bảo vệ dữ liệu (Nghị định 13/2023/NĐ-CP):</strong> Thông tin sinh thần của người dùng được bảo mật tuyệt đối, không chia sẻ cho bất kỳ bên thứ ba nào.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-5 sm:px-7 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Trân trọng cảm ơn tấm lòng hảo tâm &amp; sự đồng hành của Quý vị!</span>
            <span className="sm:hidden">Trân trọng cảm ơn Quý vị!</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLegalModal && (
              <button
                type="button"
                onClick={onOpenLegalModal}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all cursor-pointer"
              >
                Hiến Chương Pháp Lý
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 text-slate-950 font-bold text-xs tracking-wider transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow"
            >
              {isVi ? 'Hoàn Tất & Đóng' : 'Done & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
