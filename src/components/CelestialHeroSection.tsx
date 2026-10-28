// ==============================================================================
// AURORA DESTINY — CELESTIAL HERO & PRODUCT DISCOVERY SECTION
// International Top-Tier AI Product Landing & Exploration Experience
// Bilingual (VI & EN), Zero-Pill Discipline, Elegant Typographic Hierarchy
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  BookOpen,
  Layers,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Volume2,
  Clock,
  Eye,
  ChevronDown,
  Lock,
  Globe2,
  Cpu
} from 'lucide-react';
import { LanguageCode } from '../types/destiny';
import { SacredCosmicCipher3D } from './SacredCosmicCipher3D';
import { SacredTaijiSpinner } from './SacredTaijiSpinner';
import { sacredSound } from '../services/soundService';
import { sacredVoice } from '../services/sacredVoiceService';

interface Props {
  language: LanguageCode;
  onOpenCreateChart: () => void;
  onOpenGlossary: () => void;
  onOpenGuide: () => void;
}

export const CelestialHeroSection: React.FC<Props> = ({
  language,
  onOpenCreateChart,
  onOpenGlossary,
  onOpenGuide
}) => {
  const isEn = language === 'en';
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    sacredSound.playSacredTap(440);
    setActiveFaqIndex(activeFaqIndex === idx ? null : idx);
  };

  const scrollToHowItWorks = () => {
    sacredSound.playSacredTap(528);
    const el = document.getElementById('section-how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 4 Core Value Pillars (100% Real capabilities, anti-slop)
  const corePillars = [
    {
      id: 'astrodynamics',
      icon: Clock,
      title: isEn ? 'VSOP87 & True Solar Time' : 'Thiên Văn VSOP87 & Chân Giờ',
      subtitle: isEn ? 'Planetary Ephemeris Alignment' : 'Phương trình thời gian & kinh độ',
      desc: isEn
        ? 'Corrects standard clock hours by exact local longitude and Earth equation of time (-14 to +16 mins) for authentic celestial timing.'
        : 'Tự động hiệu chỉnh chênh lệch kinh độ và độ lệch Trái Đất (-14 đến +16 phút), xác định chính xác chân giờ sinh thiên văn thực tế.'
    },
    {
      id: 'classical_synthesis',
      icon: BookOpen,
      title: isEn ? '12 Palaces & Four Pillars' : '12 Cung Tử Vi & Tứ Trụ Bát Tự',
      subtitle: isEn ? 'Complete 108 Star Ephemeris' : 'Hợp nhất 108 Tinh Bàn cổ học',
      desc: isEn
        ? 'Harmonizes 14 Main Stars, Auspicious & Malefic stars, 4 Transformations (Si Hua), and BaZi Day Master favorable elements.'
        : 'An định trọn vẹn 14 Chính Tinh, Lục Cát Tinh, Tứ Hóa và Nhật Chủ Bát Tự, tạo nên bức tranh toàn cảnh về bản thể và chu kỳ đời người.'
    },
    {
      id: 'multi_agent',
      icon: Cpu,
      title: isEn ? '7 Multi-Agent Consensus' : 'Hợp Xướng 7 Tác Tử AI',
      subtitle: isEn ? 'Scientific Cross-Examination' : 'Hội đồng chuyên môn đa góc nhìn',
      desc: isEn
        ? 'Seven specialized AI models cross-evaluate psychological, strategic, and timing dimensions to eliminate hallucinations.'
        : 'Hội đồng 7 chuyên gia AI độc lập đối chiếu đa chiều, minh bạch hóa luận cứ, loại trừ phán đoán thiên kiến và cảm tính.'
    },
    {
      id: 'client_vault',
      icon: ShieldCheck,
      title: isEn ? '100% Client-Side Privacy' : 'Mã Hóa Cục Bộ 100% Thiết Bị',
      subtitle: isEn ? 'Zero-Leakage PWA Offline Vault' : 'Quyền riêng tư tuyệt đối cho gia chủ',
      desc: isEn
        ? 'All birth credentials and psychological profiles remain securely encrypted locally on your device with offline support.'
        : 'Toàn bộ dữ liệu ngày giờ sinh và hồ sơ phân tích được mã hóa an toàn trên thiết bị của bạn, sẵn sàng hoạt động ngoại tuyến.'
    }
  ];

  // 5-Step Guided Process
  const steps = [
    {
      num: '01',
      title: isEn ? 'Enter Birth Details' : 'Nhập Dữ Liệu Sinh',
      desc: isEn
        ? 'Provide birth date, time, and location with high-precision timezone detection.'
        : 'Cung cấp ngày, giờ và địa điểm sinh với hệ thống tự nhận diện tọa độ địa phương.'
    },
    {
      num: '02',
      title: isEn ? 'Astronomical Calibration' : 'Hiệu Chỉnh Chân Giờ',
      desc: isEn
        ? 'VSOP87 algorithms calculate the solar zenith angle for exact celestial branch.'
        : 'Thuật toán VSOP87 tính toán góc chiếu mặt trời thực tế để xác định đúng canh giờ.'
    },
    {
      num: '03',
      title: isEn ? 'Palace & Element Setup' : 'Thiết Lập 12 Cung',
      desc: isEn
        ? '108 planetary bodies, 4 transformations, and BaZi stems are mapped symmetrically.'
        : 'An vị 108 tinh tú, Tứ Hóa, Thập Thần và vòng Tràng Sinh theo đúng quy tắc cổ thư.'
    },
    {
      num: '04',
      title: isEn ? 'Multi-Agent Synthesis' : 'Luận Giải 7 Tác Tử',
      desc: isEn
        ? 'Ensemble intelligence synthesizes psychological patterns and decade transit timing.'
        : 'Hội đồng AI phân tích đa chiều về bản mệnh, tài lộc, sự nghiệp và vận trình 10 năm.'
    },
    {
      num: '05',
      title: isEn ? 'Offline Vault & Backtesting' : 'Lưu Trữ & Kiểm Chứng',
      desc: isEn
        ? 'Correlate with past life events to verify personal pattern consistency.'
        : 'Lưu trữ an toàn trong két PWA và đối chiếu sự kiện thực tế để kiểm chứng độ tương thích.'
    }
  ];

  // FAQ Items
  const faqItems = [
    {
      q: isEn
        ? 'Why does Aurora Destiny use True Solar Time instead of clock time?'
        : 'Vì sao cần Giờ Sinh Chân Mặt Trời thay vì giờ đồng hồ thông thường?',
      a: isEn
        ? 'In classical Chinese and Eastern astrodynamics, a two-hour branch represents the sun’s actual angle across the local meridian. Due to Earth’s elliptical orbit and axial tilt, clock time deviates by up to 16 minutes from the solar noon, compounded by longitude differences (4 minutes per degree). We calibrate this automatically to guarantee accurate chart configuration.'
        : 'Trong cổ học chiêm tinh Á Đông, một canh giờ gắn liền với góc chiếu thực của Mặt Trời qua kinh tuyến địa phương. Do quỹ đạo elip và trục nghiêng của Trái Đất, giờ đồng hồ lệch từ -14 đến +16 phút so với giờ Mặt Trời (Phương Trình Thời Gian), cộng thêm chênh lệch kinh độ (mỗi độ kinh lệch 4 phút). Aurora Destiny tự động hiệu chỉnh để xác định đúng canh giờ sinh chân chính.'
    },
    {
      q: isEn
        ? 'What makes the 108 Star ZiWei Chart different from basic horoscopes?'
        : 'Lá số 108 Tinh Bàn của Aurora Destiny có điểm gì khác biệt?',
      a: isEn
        ? 'Unlike simplified web generators that only position 14 main stars, Aurora Destiny deploys the full canonical 108-star celestial architecture. This includes 14 Main Stars, Six Auspicious Stars, Six Malefic Stars, Four Transformations (Lu, Quan, Ke, Ji), Life Stage cycles, and sub-influence bodies with bright/dim planetary states (Mieu, Vuong, Dac, Ham).'
        : 'Khác với các công cụ chỉ an 14 chính tinh giản lược, Aurora Destiny triển khai trọn vẹn 108 tinh tú chuẩn mực: 14 Chính Tinh, Lục Cát Tinh, Lục Sát Tinh, Tứ Hóa (Lộc, Quyền, Khoa, Kỵ), Vòng Tràng Sinh, Vòng Thái Tuế và các phụ tinh miếu hãm, mang lại độ phân giải chi tiết cho từng cung số.'
    },
    {
      q: isEn
        ? 'How does the 7 Multi-Agent Consensus eliminate AI hallucinations?'
        : 'Hệ thống 7 Tác Tử AI (Multi-Agent Consensus) hoạt động như thế nào?',
      a: isEn
        ? 'Instead of a single generative response that can invent stories, seven dedicated personas (Metaphysical Master, Structural BaZi Expert, Modern Psychologist, Strategic Decision Analyst, Astrodynamics Auditor, Practical Ethicist, and Consensual Arbiter) independently review the mathematical chart. Only conclusions backed by deterministic chart data are synthesized.'
        : 'Thay vì dùng một mô hình sinh ngôn ngữ tự do dễ bịa đặt, hệ thống phân vai 7 tác tử độc lập (Chuyên gia Cổ thư, Chuyên gia Bát Tự, Nhà Tâm lý học, Cố vấn Chiến lược, Kỹ sư Thiên văn, Chuyên gia Đạo đức và Trọng tài Đồng thuận). Mỗi phân tích phải dựa trên tọa độ sao thực tế, loại bỏ hoàn toàn các phán đoán vô căn cứ.'
    },
    {
      q: isEn
        ? 'Is my personal birth information private and secure?'
        : 'Thông tin ngày sinh và hồ sơ của tôi có được bảo mật không?',
      a: isEn
        ? 'Yes. All personal information and charts are stored locally on your device within encrypted PWA storage. Your data is never sold or shared with third-party advertisers, and you have complete control to export or permanently delete your profiles at any moment.'
        : 'Tuyệt đối an toàn. Dữ liệu ngày giờ sinh và hồ sơ phân tích được lưu trữ cục bộ mã hóa ngay trên thiết bị của bạn qua kiến trúc PWA Offline Vault. Hệ thống không bán dữ liệu và không chia sẻ cho bên thứ ba. Bạn có toàn quyền xuất báo cáo hoặc xóa dứt điểm hồ sơ bất kỳ lúc nào.'
    },
    {
      q: isEn
        ? 'Are destiny readings meant to be fatalistic or predetermined?'
        : 'Kết quả luận giải có mang tính định mệnh tiêu cực hay cố định không?',
      a: isEn
        ? 'Not at all. Aurora Destiny views the birth chart as a topographical map of inherent tendencies, energetic seasons, and psychological patterns. Understanding your structural strengths and transit cycles empowers conscious decision-making, proactive risk mitigation, and continuous personal growth.'
        : 'Hoàn toàn không. Aurora Destiny coi lá số là bản đồ địa hình về xu hướng tâm lý, nhịp sinh học và chu kỳ năng lượng. Hiểu rõ cấu trúc bản thân giúp bạn chủ động ra quyết định, nắm bắt thời cơ thuận lợi, hóa giải xung khắc và phát triển bản thân với tâm thế an nhiên, vững vàng.'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center space-y-16 sm:space-y-24 my-2 sm:my-6">
      {/* ===================================================================
          1. HERO HEADER SECTION
          International Standard, Celestial Luxury & Dignified Tone
          =================================================================== */}
      <section className="flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto relative pt-4 sm:pt-8">
        {/* Ambient Celestial Glow */}
        <div className="absolute -top-12 inset-x-0 h-96 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
          <div className="w-full max-w-2xl h-72 bg-gradient-to-b from-amber-500/10 via-indigo-900/15 to-transparent blur-3xl pointer-events-none" />
        </div>

        {/* Quiet Clean Unboxed Kicker */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-mono tracking-widest text-amber-400/90 uppercase mb-3">
          <span>{isEn ? 'Aurora Destiny AI' : 'Huyền Phong Phật Đạo'}</span>
          <span className="text-slate-600">·</span>
          <span>{isEn ? 'Celestial Intelligence Engine' : 'Tử Vi & Bát Tự Chuẩn Cổ Học'}</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-teal-400/90 hidden sm:inline">{isEn ? 'Prof.TOAN System' : 'Kiến Trúc Chuẩn Quốc Tế'}</span>
        </div>

        {/* Global Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white font-medium tracking-tight leading-[1.15] max-w-3xl">
          {isEn ? (
            <>
              Discover the Patterns of{' '}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-semibold">
                Your Destiny.
              </span>
            </>
          ) : (
            <>
              Khám Phá Lá Số.{' '}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-semibold">
                Thấu Hiểu Bản Thân.
              </span>{' '}
              Mở Rộng Góc Nhìn Cuộc Đời.
            </>
          )}
        </h1>

        {/* Subtitle Description */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-light">
          {isEn
            ? 'Explore your personal birth chart, uncover meaningful patterns, and gain a deeper perspective on your journey through a thoughtful, personalized experience.'
            : 'Giải mã bản đồ thiên cơ 12 Cung Tử Vi, Tứ Trụ Bát Tự và chu kỳ vận hạn với hệ thống Siêu Trí Tuệ Nhân Tạo & Thiên Văn VSOP87 chính xác tuyệt đối.'}
        </p>

        {/* The 3D Ancient Celestial Cipher / Book Centerpiece */}
        <div className="my-6 w-full flex justify-center">
          <SacredCosmicCipher3D onActivate={onOpenCreateChart} />
        </div>

        {/* Voice Inspiration Option */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => sacredVoice.speak('welcome_invitation')}
            className="px-4 py-1.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/40 text-amber-200/90 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm mx-auto"
            title={isEn ? 'Listen to celestial introduction' : 'Lắng nghe lời khai tâm truyền cảm'}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isEn ? 'Audio Introduction' : 'Lắng Nghe Lời Khai Tâm (Giọng Truyền Cảm)'}</span>
          </button>
        </div>

        {/* Primary & Secondary Call to Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sacredSound.playSacredTap(528);
              onOpenCreateChart();
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] transition-all cursor-pointer border border-amber-200/90"
          >
            <SacredTaijiSpinner size={20} speed={6} className="shrink-0" />
            <span>{isEn ? 'Create My Birth Chart' : 'Tạo Lá Số Của Tôi'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
          </motion.button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/40 text-slate-200 hover:text-white font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{isEn ? 'Explore How It Works' : 'Khám Phá Cách Hoạt Động'}</span>
          </button>
        </div>

        {/* Micro Trust Proof Text (Zero-Pill, clean typographic format) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-slate-400 font-sans flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="text-amber-400 font-bold">✓</span> {isEn ? 'Canonical Ephemeris' : 'Cổ Học Chính Bản'}
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="text-teal-400 font-bold">✓</span> {isEn ? 'Multi-Agent Consensus' : '7 Tác Tử AI Đồng Thuận'}
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="text-emerald-400 font-bold">✓</span> {isEn ? '100% Client-Side Privacy' : 'Bảo Mật Cục Bộ 100%'}
          </span>
        </div>
      </section>

      {/* ===================================================================
          2. CORE PRODUCT VALUE PILLARS
          High-restraint architectural cards highlighting verified capabilities
          =================================================================== */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-400">
            {isEn ? 'Core Intelligence Architecture' : 'Nền Tảng Trí Tuệ & Khoa Học Mệnh Lý'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            {isEn ? 'Engineered for Depth & Determinism' : 'Chuẩn Định Cổ Học • Minh Bạch Đa Chiều'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-light">
            {isEn
              ? 'Every calculation is mathematically bound to planetary mechanics and time-tested ancient formulas, eliminating generic advice.'
              : 'Mọi luận điểm đều bắt nguồn từ tọa độ sao thực tế và công thức cổ học chân truyền, nói không với phán đoán mơ hồ.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {corePillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-indigo-600/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-white group-hover:text-amber-200 transition-colors">
                      {p.title}
                    </h3>
                    <div className="text-[11px] font-mono text-teal-400/90 mt-0.5">
                      {p.subtitle}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[10px] text-slate-400">VERIFIED ALGORITHM</span>
                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
          3. 5-STEP GUIDED USAGE WORKFLOW
          Simple, intuitive progression from input to self-discovery
          =================================================================== */}
      <section id="section-how-it-works" className="w-full max-w-5xl mx-auto px-4 pt-8">
        <div className="text-center space-y-2 mb-10">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
            {isEn ? 'Seamless Discovery Workflow' : 'Quy Trình Khám Phá Bản Mệnh'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            {isEn ? 'From Birth Coordinates to Deep Insight' : 'Từ Tọa Độ Sinh Đến Chiều Sâu Giác Ngộ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-light">
            {isEn
              ? 'Five transparent steps guiding you through astronomical calculation, palace synthesis, and practical life alignment.'
              : 'Năm bước tinh gọn từ hiệu chỉnh giờ sinh, an vị 108 tinh bàn đến đối chiếu dòng sự kiện thực tế.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400/80">
                  {st.num}
                </span>
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                  {st.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {st.desc}
                </p>
              </div>
              <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/20 via-teal-400/20 to-transparent" />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              sacredSound.playSacredTap(528);
              onOpenCreateChart();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-yellow-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>{isEn ? 'Begin Discovery Now' : 'Bắt Đầu Lập Lá Số Ngay'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </section>

      {/* ===================================================================
          4. INTELLECTUAL TRANSPARENCY & FREQUENTLY ASKED QUESTIONS (FAQ)
          Honest, clear, educational answers with progressive disclosure
          =================================================================== */}
      <section className="w-full max-w-4xl mx-auto px-4 pb-8">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-400">
            {isEn ? 'Clarity & Methodology' : 'Giải Đáp & Cơ Sở Khoa Học'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            {isEn ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp & Cơ Sở Tính Toán'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-light">
            {isEn
              ? 'Transparent explanations regarding astronomical timing, multi-agent evaluation, and ethical data handling.'
              : 'Lý giải minh bạch về phương pháp tính chân giờ, sự đồng thuận của 7 AI và bảo vệ quyền riêng tư.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.025] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-light border-t border-white/5"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Essential Glossary Spotlight CTA */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-teal-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-xs font-serif font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Need help with classical terms?' : 'Chưa rõ các thuật ngữ cổ học?'}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-light">
              {isEn
                ? 'Explore our 32+ essential terminology dossiers for Dụng Thần, Hóa Kỵ, Tử Vi, Cung Thân and more.'
                : 'Tra cứu trọn vẹn 32+ thuật ngữ cốt tủy: Dụng Thần, Hóa Kỵ, Tử Vi, Cung Thân, Giờ Chân Mặt Trời.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sacredSound.playSacredTap(528);
              onOpenGlossary();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all shadow-sm"
          >
            {isEn ? 'Open Glossary' : 'Mở Cẩm Nang Giải Mã'}
          </button>
        </div>
      </section>
    </div>
  );
};
