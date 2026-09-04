// ==========================================================
// AURORA DESTINY AI — SPONSORSHIP & CHANNEL SUPPORT STUDIO
// ĐỒNG HÀNH CÙNG NGHIÊN CỨU & ỦNG HỘ KÊNH
// Thông tin: Ngân Hàng Vietcombank - HA VAN TOAN - 0501000160764
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
  Share2,
  X,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';

interface Props {
  language?: LanguageCode;
  onClose: () => void;
}

export const SponsorshipModal: React.FC<Props> = ({
  language = 'vi',
  onClose
}) => {
  const isVi = language === 'vi';

  // Bank Credentials
  const BANK_INFO = {
    bankName: 'Vietcombank',
    bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    accountNumber: '0501000160764',
    accountName: 'HA VAN TOAN',
    bin: '970436', // Vietcombank Napas BIN
    shortName: 'VCB'
  };

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customNote, setCustomNote] = useState<string>('Ung ho Aurora Destiny AI');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrLoaded, setQrLoaded] = useState<boolean>(true);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2200);
      }).catch(() => {
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2200);
      });
    } else {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2200);
    }
  };

  // Amounts
  const DONATION_PRESETS = [
    {
      amount: null,
      label: isVi ? 'Tùy Tâm Gieo Duyên' : 'Custom Amount',
      icon: Heart,
      desc: isVi ? 'Tùy nghi hảo tâm theo điều kiện' : 'Any contribution from the heart'
    },
    {
      amount: 20000,
      label: '20.000 đ',
      subtitle: isVi ? 'Tách Cà Phê Tỉnh Thức' : 'Cup of Coffee',
      icon: Coffee,
      desc: isVi ? 'Tiếp lửa năng lượng sáng tạo' : 'Spark creative inspiration'
    },
    {
      amount: 50000,
      label: '50.000 đ',
      subtitle: isVi ? 'Tách Trà Đàm Đạo' : 'Pot of Herbal Tea',
      icon: Sparkles,
      desc: isVi ? 'Đồng hành tri thức cùng tác giả' : 'Companion in wisdom & study'
    },
    {
      amount: 100000,
      label: '100.000 đ',
      subtitle: isVi ? 'Tiếp Sức Máy Chủ AI' : 'AI Cloud Compute',
      icon: CreditCard,
      desc: isVi ? 'Duy trì GPU & chi phí vận hành' : 'Cover GPU server & hosting costs'
    },
    {
      amount: 200000,
      label: '200.000 đ',
      subtitle: isVi ? 'Bảo Trợ Nghiên Cứu' : 'Research Patron',
      icon: Award,
      desc: isVi ? 'Nâng cấp mô hình đa tác tử' : 'Accelerate algorithm development'
    }
  ];

  // Dynamic VietQR generator
  const qrAmountParam = selectedAmount ? selectedAmount.toString() : '';
  const qrTransferNote = customNote || 'Ung ho Aurora Destiny AI';
  const vietQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${qrAmountParam}&addInfo=${encodeURIComponent(qrTransferNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#080911] border border-amber-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(251,191,36,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Radiant Lighting */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 via-rose-400 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.35)] shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0e19] rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300/30" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                  {isVi ? 'Đồng Hành & Tri Ân' : 'Patronage & Sponsorship'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {isVi ? 'Tự Nguyện & Minh Bạch' : 'Voluntary & Transparent'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-wide mt-0.5">
                {isVi ? 'Ủng Hộ Kênh & Đồng Hành Cùng Dự Án' : 'Support the Channel & Research'}
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.07] via-purple-950/[0.2] to-teal-950/[0.1] border border-amber-400/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              {isVi ? (
                <>
                  <strong className="text-amber-200">Kính gửi Quý Huynh Đệ & Bạn Đọc Hữu Duyên:</strong> Nền tảng <span className="text-teal-300 font-medium">Aurora Destiny AI</span> được phát triển bởi <strong className="text-amber-200">Giáo Sư - Prof.TOAN</strong> với tâm nguyện phụng sự cộng đồng, chuẩn hóa khoa học lý số cổ học và bài trừ triệt để mê tín dị đoan. 
                  Sự ủng hộ tự nguyện của Quý vị — dù chỉ là một <span className="text-amber-300 font-medium">tách trà ấm</span> hay <span className="text-amber-300 font-medium">tách cà phê</span> — chính là nguồn trợ lực quý giá giúp đội ngũ duy trì máy chủ điện toán AI và liên tục nâng cấp thuật toán ngày một chuẩn xác hơn.
                </>
              ) : (
                <>
                  <strong className="text-amber-200">Dear Friends & Patrons:</strong> Aurora Destiny AI is created and curated by <strong className="text-amber-200">Professor Prof.TOAN</strong> to make astronomical and destiny wisdom accessible, rigorous, and completely free of superstition. Your voluntary patronage directly fuels our high-performance AI GPU servers and continuous open-access research.
                </>
              )}
            </p>
          </div>

          {/* Preset Contribution Pills */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Chọn Mức Tiếp Sức Yêu Thích (Tùy Chọn):' : 'Select Contribution (Optional):'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {isVi ? 'Tự động gắn vào mã QR' : 'Auto-updates QR code'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {DONATION_PRESETS.map((preset, idx) => {
                const IconComponent = preset.icon;
                const isSelected = selectedAmount === preset.amount;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAmount(preset.amount)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-amber-400/50 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div>
                      <div className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {preset.label}
                      </div>
                      {preset.subtitle && (
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {preset.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Transfer Container: High-End Metal Card + VietQR Standard Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left: Luxury Vietcombank Metal Card (7 Columns) */}
            <div className="md:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#072418] via-[#09151f] to-[#120e24] border border-emerald-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(52,211,153,0.3)] relative overflow-hidden">
              {/* Card Holographic Specular Sheen */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header: VCB Brand & EMV Chip */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Vietcombank Emerald Emblem */}
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-xs shadow-md">
                      VCB
                    </div>
                    <div>
                      <span className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase block">
                        Vietcombank
                      </span>
                      <span className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest block">
                        TMCP Ngoại Thương Việt Nam
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono tracking-wider">
                      NAPAS 24/7
                    </span>
                  </div>
                </div>

                {/* EMV Gold Chip Representation */}
                <div className="flex items-center gap-3 my-3">
                  <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 p-0.5 shadow flex flex-col justify-around px-1">
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                    <div className="h-[1px] bg-amber-600/50 w-full" />
                  </div>
                  {/* Contactless Wave Icon */}
                  <div className="text-emerald-300/80">
                    <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                    </svg>
                  </div>
                </div>

                {/* Account Number Dập Nổi Cực Lớn */}
                <div className="my-3">
                  <div className="text-[10px] font-mono text-emerald-300/90 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Số Tài Khoản (Account Number):</span>
                    <span className="text-[9px] text-slate-400">Chạm để sao chép</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/50 border border-emerald-500/30">
                    <span className="text-xl sm:text-2xl font-mono font-bold tracking-[0.15em] text-amber-300 select-all">
                      0501000160764
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_INFO.accountNumber, 'accNumber')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow shrink-0"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'accNumber' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ĐÃ COPY</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY STK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Holder Name */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Chủ Tài Khoản (Beneficiary)
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm sm:text-base font-mono font-bold text-white tracking-wider">
                        HA VAN TOAN
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(BANK_INFO.accountName, 'accName')}
                        className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors"
                        title="Sao chép tên chủ tài khoản"
                      >
                        {copiedField === 'accName' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Ngân Hàng Thụ Hưởng
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-semibold text-emerald-300">
                        Vietcombank
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('Vietcombank', 'bankName')}
                        className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors"
                        title="Sao chép tên ngân hàng"
                      >
                        {copiedField === 'bankName' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Transfer Note */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Nội dung CK:</span>
                  <span className="font-mono text-amber-200 text-xs font-medium truncate max-w-[140px] sm:max-w-[190px]">
                    {qrTransferNote}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(qrTransferNote, 'note')}
                  className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'note' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'note' ? 'Đã chép' : 'Chép cú pháp'}</span>
                </button>
              </div>
            </div>

            {/* Right: VietQR Code Box (5 Columns) */}
            <div className="md:col-span-5 flex flex-col items-center justify-between p-4 sm:p-5 rounded-3xl bg-[#0d0f1b] border border-white/10 shadow-lg text-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <QrCode className="w-3.5 h-3.5" />
                  Mã Quét VietQR 24/7
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  Napas 24/7
                </span>
              </div>

              {/* QR Image Container */}
              <div className="relative p-2.5 rounded-2xl bg-white shadow-xl max-w-[210px] w-full aspect-square flex items-center justify-center my-1 group">
                <img
                  src={vietQrUrl}
                  alt="VietQR Vietcombank HA VAN TOAN"
                  className="w-full h-full object-contain rounded-lg"
                  onError={() => setQrLoaded(false)}
                />

                {!qrLoaded && (
                  <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-3 text-center rounded-2xl">
                    <QrCode className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="text-xs font-mono">0501000160764</span>
                    <span className="text-[10px] text-slate-400">Vietcombank - HA VAN TOAN</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight mt-2 px-1">
                {isVi
                  ? 'Mở bất kỳ ứng dụng ngân hàng (VCB, Techcom, MB, MoMo...) và quét mã để chuyển tức thì.'
                  : 'Scan with any banking app in Vietnam for instant zero-fee transfer.'}
              </p>

              {/* Quick Action Download / Open Link */}
              <div className="w-full flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                <a
                  href={vietQrUrl}
                  download="VietQR-Vietcombank-HAVANTOAN.png"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-amber-300" />
                  <span>Tải Ảnh QR</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(BANK_INFO.accountNumber, 'accNumber')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'accNumber' ? 'Đã Sao Chép' : 'Sao Chép STK'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Legal Compliance & Moral Transparency Statement (Tuân thủ pháp luật 100%) */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-slate-400 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isVi ? 'Cam Kết Minh Bạch & Tuân Thủ Pháp Luật Việt Nam' : 'Legal Compliance & Ethical Transparency'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              {isVi ? (
                <>
                  • <strong>Cơ sở pháp lý:</strong> Hoạt động ủng hộ mang bản chất tặng cho tài sản tự nguyện theo quy định tại <span className="text-slate-300">Điều 457 Bộ luật Dân sự 2015</span> của nước CHXHCN Việt Nam, xuất phát từ thiện chí của người dùng đối với các nghiên cứu học thuật của tác giả.<br />
                  • <strong>Mục đích sử dụng:</strong> Toàn bộ nguồn kinh phí tài trợ được sử dụng trực tiếp để thanh toán chi phí máy chủ điện toán đám mây AI, lưu trữ dữ liệu an toàn và nghiên cứu phát triển các thuật toán hữu ích phục vụ cộng đồng hoàn toàn miễn phí.<br />
                  • <strong>Tôn chỉ:</strong> Ứng dụng bài trừ mọi hành vi mê tín dị đoan, buôn thần bán thánh, không bán các vật phẩm mang tính tâm linh lừa gạt, luôn đề cao tinh thần tự chủ và trí tuệ nhân bản.
                </>
              ) : (
                <>
                  • Fully compliant with Vietnamese Civil Code Article 457 regarding voluntary gifts and sponsorships.<br />
                  • Contributions are non-commercial and dedicated to AI server infrastructure and scientific open-access research.<br />
                  • Dedicated to rational knowledge, ethical AI development, and superstition-free personal empowerment.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-5 sm:px-7 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Trân trọng cảm ơn tấm lòng hảo tâm của Quý vị!</span>
          </div>

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
  );
};
