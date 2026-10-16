// ============================================================================
// AURORA DESTINY AI — NHẬT THỜI KHANG NINH: LA BÀN HOÀNG KIM 24 GIỜ
// Luxury Daily Golden Window & Micro-Karma Navigator
// Tính toán thiên văn 12 Canh giờ, Khung giờ Hoàng kim cá nhân hóa theo Bát Tự,
// Vi lượng nạp khí Dụng Thần, Thẻ Minh Triết & Khối Tùy Hỷ Gieo Duyên Tri Ân
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  Clock,
  Sun,
  Flame,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  Award,
  Crown,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Zap,
  Radio,
  Eye
} from 'lucide-react';
import { CalculationResult, FiveElement, EarthlyBranch } from '../types/destiny';
import { UserProfile } from '../types/user';
import { calculateRealtimeSnapshot, HourlySlotInsight, RealtimeDestinySnapshot } from '../engine/realtimeEngine';
import { STEMS, BRANCHES } from '../engine/canchi';
import { sacredSound } from '../services/soundService';
import { SacredTaijiSpinner } from './SacredTaijiSpinner';

interface Props {
  profile: UserProfile;
  calculation: CalculationResult;
  onOpenSponsorshipModal?: () => void;
  onNavigateToDailyTab?: () => void;
  onOpenShareCardModal?: () => void;
}

// 365 Triết lý hành động vi mô & hạt giống phước lành (Daily Wisdom Precepts)
const ELEMENT_WISDOM_PRECEPTS: Record<FiveElement, { quote: string; context: string; action: string }[]> = {
  Wood: [
    {
      quote: 'Cây muốn vươn tới trời cao, bộ rễ phải âm thầm cắm sâu vào lòng đất.',
      context: 'Hôm nay Mộc khí thức tỉnh phẩm chất kiên nhẫn và lòng từ ái.',
      action: 'Hãy lắng nghe trọn vẹn một người đối diện và tưới tắm cho một ý tưởng dài hạn.'
    },
    {
      quote: 'Uốn lượn như nhành liễu trước gió giông, bền bỉ như tùng bách qua mùa tuyết giá.',
      context: 'Năng lượng Mộc giúp bạn thích ứng linh hoạt trước các chuyển biến bất ngờ.',
      action: 'Tránh tranh cãi hơn thua; dùng sự hòa nhã để hóa giải mọi khúc mắc trong công việc.'
    },
    {
      quote: 'Gieo hạt mầm thiện lương vào buổi sớm, buổi chiều sẽ gặt hái sự an nhiên.',
      context: 'Mộc chủ Nhân — lòng nhân từ chính là tấm khiên bảo vệ vận khí tốt nhất.',
      action: 'Hãy chủ động giúp đỡ hoặc động viên một đồng nghiệp đang gặp khó khăn.'
    }
  ],
  Fire: [
    {
      quote: 'Ngọn đèn soi sáng cho người khác không bao giờ làm giảm đi ánh sáng của chính mình.',
      context: 'Hôm nay Hỏa khí chủ về Lễ và trí tuệ quang minh, mang lại sức hút tự nhiên.',
      action: 'Hãy chia sẻ một giải pháp hay hoặc nói lời cảm ơn chân thành tới người thân.'
    },
    {
      quote: 'Lửa trí tuệ sưởi ấm nhân gian, lửa sân hận thiêu rụi phước đức ngàn đời.',
      context: 'Hỏa vượng cần giữ tâm bình thản, chuyển hóa sự nóng vội thành nhiệt huyết sáng tạo.',
      action: 'Khi gặp sự việc bất như ý, hãy hít sâu 3 hơi thở trước khi đưa ra phản hồi.'
    },
    {
      quote: 'Mặt trời không chọn nơi chiếu sáng; tâm thiện lành không phân biệt đối tượng trao yêu thương.',
      context: 'Trực giác và khả năng truyền cảm hứng của bạn hôm nay đạt biên độ cao.',
      action: 'Tập trung vào giải pháp cốt lõi thay vì phân tâm bởi những tiểu tiết xung quanh.'
    }
  ],
  Earth: [
    {
      quote: 'Đất mẹ nâng đỡ vạn vật mà không đòi hỏi đền đáp; người giữ chữ Tín đi khắp thiên hạ.',
      context: 'Hôm nay Thổ khí củng cố sự vững chãi, uy tín và khả năng tích lũy tài nguyên.',
      action: 'Hoàn thành dứt điểm một lời hứa hoặc một cam kết công việc còn tồn đọng.'
    },
    {
      quote: 'Tâm an định như núi Thái Sơn, sóng gió thị phi tự khắc tiêu tan.',
      context: 'Thổ chủ Tín — sự điềm tĩnh và trung thực là chìa khóa mở ra quý nhân trợ mệnh.',
      action: 'Dành 15 phút sắp xếp lại không gian làm việc sạch sẽ, gọn gàng để tụ vượng khí.'
    },
    {
      quote: 'Chuyển hóa bùn lầy thành đóa sen ngát hương; nghịch cảnh là phân bón cho đại thụ trưởng thành.',
      context: 'Năng lượng Thổ dung nạp và hóa giải mọi áp lực một cách bền bỉ.',
      action: 'Nhìn nhận thử thách hiện tại như một cơ hội rèn luyện bản lĩnh kiên cường.'
    }
  ],
  Metal: [
    {
      quote: 'Ngọc không mài giũa không thành bảo vật; vàng ròng qua lửa đỏ mới tỏ phẩm chất tinh anh.',
      context: 'Hôm nay Kim khí mang lại sự quyết đoán, rành mạch và tư duy sắc bén.',
      action: 'Dũng cảm cắt bỏ một thói quen gây trì hoãn hoặc một việc vô bổ làm hao tổn thời gian.'
    },
    {
      quote: 'Thanh kiếm báu chỉ vung lên khi cần bảo vệ lẽ phải; sự công chính là gốc rễ của quyền uy.',
      context: 'Kim chủ Nghĩa — giữ vững chuẩn mực đạo đức sẽ giúp bạn được tôn trọng tuyệt đối.',
      action: 'Quyết định dựa trên sự công bằng, minh bạch và tôn trọng sự thật khách quan.'
    },
    {
      quote: 'Chuông đồng rỗng ruột mới ngân vang muôn dặm; người biết buông bỏ chấp niệm mới dung nạp trí tuệ.',
      context: 'Tâm trí thanh tịnh giúp bạn nhận diện cơ hội kinh doanh hoặc học thuật một cách chuẩn xác.',
      action: 'Tĩnh tâm buổi tối, buông bỏ mọi phán xét để đón nhận giấc ngủ an lành.'
    }
  ],
  Water: [
    {
      quote: 'Nước chảy chỗ trũng mà nuôi dưỡng muôn loài; người khiêm hạ đi đến đâu cũng được chào đón.',
      context: 'Hôm nay Thủy khí gia tăng chiều sâu trí tuệ, khả năng ngoại giao và tầm nhìn xa.',
      action: 'Lắng nghe nhiều hơn nói; dùng sự mềm mỏng để hóa giải những định kiến cứng nhắc.'
    },
    {
      quote: 'Nước phẳng lặng soi rõ ngọn mây; tâm tĩnh tại nhìn thấu bản chất của nhân duyên.',
      context: 'Thủy chủ Trí — sự sáng suốt nội tại giúp bạn đưa ra những quyết sách tài chính đúng đắn.',
      action: 'Ghi lại một ý tưởng đột phá xuất hiện trong khoảnh khắc tĩnh lặng đầu ngày.'
    },
    {
      quote: 'Trăm sông đổ về biển lớn nhờ lòng dung nạp; người có dung lượng tâm rộng mở mới gánh vác việc lớn.',
      context: 'Khả năng kết nối và đồng cảm của bạn hôm nay là nam châm thu hút đối tác thiện lành.',
      action: 'Mỉm cười bao dung với một sai sót nhỏ của người khác và hướng dẫn họ cải thiện.'
    }
  ]
};

export const DailyGoldenCompassCard: React.FC<Props> = ({
  profile,
  calculation,
  onOpenSponsorshipModal,
  onNavigateToDailyTab,
  onOpenShareCardModal
}) => {
  const [snapshot, setSnapshot] = useState<RealtimeDestinySnapshot>(() =>
    calculateRealtimeSnapshot(calculation, new Date())
  );
  const [isMeditating, setIsMeditating] = useState<boolean>(false);
  const [meditationSeconds, setMeditationSeconds] = useState<number>(180);
  const [isWisdomCardRevealed, setIsWisdomCardRevealed] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Ngày hiện tại định dạng dd/mm/yyyy
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Đọc trạng thái đã mở thẻ quẻ hôm nay từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`aurora_wisdom_${profile.id}_${todayStr}`);
      if (stored === 'revealed') {
        setIsWisdomCardRevealed(true);
      }
    } catch {
      // Ignore storage error
    }
  }, [profile.id, todayStr]);

  // Cập nhật snapshot theo nhịp 15 giây (tối ưu hiệu năng, tránh render thừa)
  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(calculateRealtimeSnapshot(calculation, new Date()));
    }, 15000);
    return () => clearInterval(timer);
  }, [calculation]);

  // Bộ đếm thời gian thiền định 3 phút chuông xoay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating && meditationSeconds > 0) {
      interval = setInterval(() => {
        setMeditationSeconds((prev) => {
          if (prev <= 1) {
            setIsMeditating(false);
            sacredSound.playTibetanBowl(432);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating, meditationSeconds]);

  // Xác định Khung Giờ Hoàng Kim số 1 của ngày hôm nay dựa trên lá số cá nhân
  const goldenSlot = useMemo<HourlySlotInsight | null>(() => {
    if (!snapshot.hourlySlots || snapshot.hourlySlots.length === 0) return null;
    const sorted = [...snapshot.hourlySlots].sort((a, b) => {
      // Ưu tiên điểm may mắn + Hoàng Đạo + Quý Nhân
      const scoreA = a.luckPercentage + (a.isZodiacAuspicious ? 15 : 0) + (a.isGuiRen ? 10 : 0);
      const scoreB = b.luckPercentage + (b.isZodiacAuspicious ? 15 : 0) + (b.isGuiRen ? 10 : 0);
      return scoreB - scoreA;
    });
    return sorted[0] || null;
  }, [snapshot.hourlySlots]);

  // Xác định Canh Giờ cần thận trọng nhất trong ngày
  const frictionSlot = useMemo<HourlySlotInsight | null>(() => {
    if (!snapshot.hourlySlots || snapshot.hourlySlots.length === 0) return null;
    const sorted = [...snapshot.hourlySlots].sort((a, b) => a.luckPercentage - b.luckPercentage);
    return sorted[0] || null;
  }, [snapshot.hourlySlots]);

  // Lời khai mở minh triết cố định theo ngày trong năm
  const todayWisdom = useMemo(() => {
    const dayElement = calculation.bazi.dayMasterElement || 'Earth';
    const list = ELEMENT_WISDOM_PRECEPTS[dayElement] || ELEMENT_WISDOM_PRECEPTS.Earth;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const index = Math.abs(dayOfYear + (profile.id.charCodeAt(profile.id.length - 1) || 0)) % list.length;
    return list[index];
  }, [calculation.bazi.dayMasterElement, profile.id]);

  // Lật mở thẻ quẻ và phát chuông Bát Nhã
  const handleRevealWisdom = () => {
    sacredSound.playTibetanBowl(528);
    setIsWisdomCardRevealed(true);
    try {
      localStorage.setItem(`aurora_wisdom_${profile.id}_${todayStr}`, 'revealed');
    } catch {
      // Ignore storage error
    }
  };

  // Kích hoạt phiên thiền định chuông xoay 3 phút
  const handleToggleMeditation = () => {
    if (!isMeditating) {
      sacredSound.playTibetanBowl(528);
      setIsMeditating(true);
      setMeditationSeconds(180);
    } else {
      setIsMeditating(false);
    }
  };

  // Chia sẻ thẻ nhật vận nhanh
  const handleCopyDailyBlessing = () => {
    const shareText = `🌟 LA BÀN HOÀNG KIM 24 GIỜ — THIÊN MỆNH ĐỒ THƯ\n` +
      `👤 Bản mệnh: ${profile.name} (Nhật chủ ${STEMS[calculation.bazi.dayMaster]?.nameVi || ''} - ${calculation.bazi.dayMasterElement})\n` +
      `✨ Giờ Hoàng Kim hôm nay: ${goldenSlot ? `${goldenSlot.stemNameVi} ${goldenSlot.branchNameVi} (${goldenSlot.timeRangeStr})` : 'Cả ngày bình hòa'}\n` +
      `🎨 Màu nạp khí: ${snapshot.luckyColorName} | Hướng đại cát: ${snapshot.auspiciousDirection}\n` +
      `📜 Minh triết: "${todayWisdom.quote}"\n` +
      `🔗 Trải nghiệm la bàn thiên thời cá nhân tại: https://auroradestiny.ai`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  const isCurrentInGolden = goldenSlot?.isCurrent;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c0d18] via-[#090a14] to-[#04050a] border border-amber-500/25 p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(245,158,11,0.2)]">
      {/* Specular Ambient Cosmic Lighting */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ================= HEADER: BRAND & REAL-TIME BADGE ================= */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
            <SacredTaijiSpinner size={28} speed={7} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 font-mono">
                KHÍ TIẾT THỜI GIAN THỰC • ĐỘC QUYỀN CỔ HỌC
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold font-mono border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE 24H
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-cinzel tracking-tight mt-0.5">
              Nhật Thời Khang Ninh • La Bàn Hoàng Kim
            </h2>
          </div>
        </div>

        {/* Action Controls: Share & Zen Meditation Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleToggleMeditation}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isMeditating
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:border-amber-400/40'
            }`}
            title="Nghe chuông xoay Bát Nhã Solfeggio 528Hz tĩnh tâm 3 phút"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isMeditating
                ? `Tĩnh Tâm (${Math.floor(meditationSeconds / 60)}:${String(meditationSeconds % 60).padStart(2, '0')})`
                : 'Tĩnh Tâm 3 Phút'}
            </span>
          </button>

          <button
            onClick={handleCopyDailyBlessing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors cursor-pointer"
            title="Sao chép tóm tắt Nhật Vận & Lời Chúc để lưu hoặc chia sẻ"
          >
            {copiedShare ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= 24H DUAL WINDOW: GOLDEN VS CAUTION ================= */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5">
        {/* LEFT COLUMN: THE #1 GOLDEN WINDOW (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-400/35 p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none">
            <Crown className="w-24 h-24 text-amber-300" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                THỜI KHẮC HOÀNG KIM SỐ 1 TRONG NGÀY
              </span>
            </div>
            {isCurrentInGolden ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold animate-pulse">
                ĐANG TRONG KHUNG GIỜ VÀNG
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">
                Hiệu lực hôm nay
              </span>
            )}
          </div>

          {goldenSlot ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-amber-100 font-cinzel">
                  Giờ {goldenSlot.branchNameVi}
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-400/90 font-mono">
                  ({goldenSlot.stemNameVi} {goldenSlot.branchNameVi} • {goldenSlot.timeRangeStr})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-400/30">
                  {goldenSlot.zodiacStarName} (Hoàng Đạo)
                </span>
              </div>

              {/* Action Recommendation */}
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mt-2.5">
                🎯 <strong className="text-amber-300">Thời điểm vàng để hành động:</strong> Khung giờ này kích hoạt Dụng Thần tương sinh bản mệnh {profile.name}. Rất đại cát cho: ký kết khế ước, gặp đối tác quan trọng, xuất hành đàm phán, chuyển giao tài chính, hoặc thực hiện việc khởi đầu mang tính quyết định.
              </p>

              {/* Badges of Auspicious Elements */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs font-mono">
                {goldenSlot.isGuiRen && (
                  <span className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    ✨ Quý Nhân Trợ Mệnh
                  </span>
                )}
                {goldenSlot.isSanHe && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    🌀 Tam Hợp Vượng Khí
                  </span>
                )}
                {goldenSlot.isLiuHe && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    🤝 Lục Hợp Giao Hòa
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  ⚡ Chỉ số hanh thông: {goldenSlot.luckPercentage}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mt-2">Hôm nay các canh giờ đều ở mức bình hòa, an định.</p>
          )}
        </div>

        {/* RIGHT COLUMN: FRICTION & CAUTION WINDOW (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-rose-950/20 via-slate-900/40 to-black/50 border border-rose-500/25 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                  KHUNG GIỜ CẦN THẬN TRỌNG
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Giữ tâm bình an</span>
            </div>

            {frictionSlot ? (
              <div className="mt-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold text-rose-200 font-cinzel">
                    Giờ {frictionSlot.branchNameVi}
                  </span>
                  <span className="text-xs font-mono text-rose-400">
                    ({frictionSlot.timeRangeStr})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  🛡️ <strong className="text-rose-300">Khuyến nghị hóa giải:</strong> Trường khí thời điểm này dễ gây dao động cảm xúc hoặc bất đồng ý kiến. Hạn chế tranh luận gay gắt, lái xe cẩn thận, không vội vàng ký giấy tờ mập mờ. Dùng sự tĩnh lặng để chuyển hung thành cát.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Nguyên tắc: "Tri mệnh để an tâm"</span>
            {onNavigateToDailyTab && (
              <button
                onClick={onNavigateToDailyTab}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Xem cả 12 Giờ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= MICRO-REMEDY: 3 VITAL ENERGY NUGGETS ================= */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
        {/* 1. MÀU SẮC NẠP KHÍ */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: snapshot.luckyColorHex || '#f59e0b' }}
          >
            ✦
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">MÀU NẠP VƯỢNG KHÍ</span>
            <span className="text-sm font-bold text-slate-100 truncate block">
              {snapshot.luckyColorName || 'Vàng Hoàng Kim & Hổ Phách'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Trang phục, phụ kiện trợ Dụng Thần</span>
          </div>
        </div>

        {/* 2. HƯỚNG TIẾP CÁT KHÍ */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 shadow-md shrink-0 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">HƯỚNG XUẤT HÀNH ĐẠI CÁT</span>
            <span className="text-sm font-bold text-slate-100 truncate block">
              {snapshot.auspiciousDirection || 'Hướng Chính Nam (Tài Thần)'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Ngồi làm việc & đón quý nhân</span>
          </div>
        </div>

        {/* 3. VI LƯỢNG DINH DƯỠNG & NƯỚC */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-md shrink-0 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">VI LƯỢNG HÓA GIẢI TÂM THỂ</span>
            <span className="text-sm font-bold text-slate-100 truncate block">
              {calculation.bazi.dayMasterElement === 'Fire' || calculation.bazi.dayMasterElement === 'Earth'
                ? 'Trà Thảo Mộc Ấm & Nước Khoáng'
                : 'Uống Đủ 2L Nước & Trà Xanh'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Thanh lọc độc tố, điều hòa thân nhiệt</span>
          </div>
        </div>
      </div>

      {/* ================= DAILY WISDOM CARD & MINDFULNESS SEED ================= */}
      <div className="relative z-10 mt-5 p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-teal-950/20 border border-purple-500/25">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
              PHONG BAO MINH TRIẾT & HẠT GIỐNG PHƯỚC LÀNH HÔM NAY
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Mỗi ngày một thông điệp thức tỉnh
          </span>
        </div>

        {!isWisdomCardRevealed ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 border border-purple-400/40 flex items-center justify-center text-purple-200 mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Bức Thư Mật Từ Số Mệnh Đang Chờ Bạn Khai Mở
            </h4>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
              Dành riêng cho Nhật Chủ <strong>{STEMS[calculation.bazi.dayMaster]?.nameVi} ({calculation.bazi.dayMasterElement})</strong> trong ngày {todayStr}.
            </p>
            <button
              onClick={handleRevealWisdom}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Lật Mở Phong Bao Minh Triết</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 space-y-2.5"
          >
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-400/20">
              <p className="text-sm sm:text-base font-medium text-amber-200 font-cinzel italic leading-relaxed">
                "{todayWisdom.quote}"
              </p>
              <div className="mt-2 text-xs text-slate-300 font-sans leading-relaxed">
                <span className="text-purple-300 font-semibold">Quán chiếu: </span>
                {todayWisdom.context}
              </div>
              <div className="mt-1.5 text-xs text-emerald-300 font-sans leading-relaxed font-medium">
                <span className="text-emerald-400 font-bold">Hành động vi mô: </span>
                {todayWisdom.action}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Đã khai mở cho ngày {todayStr} • Lưu giữ tâm an</span>
              <button
                onClick={() => {
                  sacredSound.playTibetanBowl(432);
                  setIsWisdomCardRevealed(false);
                }}
                className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Gấp lại phong bao</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= HIGH-SUPPORT PATRON & SPONSORSHIP PORTAL ================= */}
      <div className="relative z-10 mt-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-400/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-lg mt-0.5">
            <HeartHandshake className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-amber-100 font-cinzel">
                Tùy Hỷ Gieo Duyên • Lưu Danh Bảng Vàng Quý Nhân
              </h4>
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Mỗi ngày an lạc là một hạt mầm phước báu. Hãy chung tay cùng <strong>Giáo Sư TOAN</strong> & <strong>Kênh Huyền Phong Phật Đạo</strong> bảo tồn Cổ học tinh hoa và duy trì hạ tầng máy chủ AI phi lợi nhuận. Mọi đóng góp tùy hỷ đều được cấp <strong>Mã Tri Ân & Khắc Tên vĩnh viễn trên Đài Phong Danh Quý Nhân</strong>.
            </p>
          </div>
        </div>

        {/* Call-to-action Button */}
        <div className="shrink-0 flex items-center gap-2">
          {onOpenSponsorshipModal && (
            <button
              onClick={() => {
                sacredSound.playCelestialChime(880);
                onOpenSponsorshipModal();
              }}
              className="group relative w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] transition-all cursor-pointer border border-amber-200 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>Gieo Duyên Tùy Hỷ</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
