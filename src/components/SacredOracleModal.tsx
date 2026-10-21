// ==========================================================
// SACRED ORACLE MODAL — HUYỀN PHONG PHẬT ĐẠO
// Đài Gieo Quẻ Bát Quái & Thỉnh Quẻ Linh Ứng Đầu Ngày
// 64 Quẻ Kinh Dịch • Lắc Ống Xâm 3D • Chuông Bát Nhã Khai Quang
// ==========================================================

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Compass,
  RotateCw,
  Share2,
  Check,
  Volume2,
  VolumeX,
  Crown,
  Heart,
  Briefcase,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { sacredSound } from '../services/soundService';
import { sacredVoice } from '../services/sacredVoiceService';
import { SacredParticles } from './SacredParticles';
import { SacredSealBadge } from './SacredSealBadge';
import { SacredTaijiSpinner } from './SacredTaijiSpinner';
import { SacredMandalaAura } from './SacredMandalaAura';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dayMasterElement?: string;
  userName?: string;
}

export interface OracleHexagram {
  id: string;
  name: string;
  hanzi: string;
  rank: 'Thượng Thượng Cát' | 'Đại Cát' | 'Trung Cát' | 'Bình Hòa Cát';
  trigramSymbol: string;
  hexagramNumber: number;
  poem: [string, string, string, string];
  generalMeaning: string;
  career: string;
  wealth: string;
  love: string;
  healthAndTravel: string;
  spiritualRemedy: string;
  luckyDirection: string;
  favorableHours: string;
}

const SACRED_HEXAGRAMS: OracleHexagram[] = [
  {
    id: 'hex_01',
    name: 'Càn Vi Thiên (Trời)',
    hanzi: '乾為天',
    rank: 'Thượng Thượng Cát',
    trigramSymbol: '☰☰',
    hexagramNumber: 1,
    poem: [
      'Càn nguyên hưng vượng sáng trời đông,',
      'Long khởi phong vân đắc đại đồng.',
      'Chính đạo kiên trì âu tất đạt,',
      'Quý nhân tương trợ phúc viên thông.'
    ],
    generalMeaning: 'Quẻ thuần Càn là đỉnh cao của sinh khí trời đất. Thời vận rực rỡ, chính khí sung mãn, mưu sự đại sự ắt có quý nhân tương trợ khai thông vạn nẻo.',
    career: 'Khởi đầu đại dự án thuận buồm xuôi gió. Được cấp trên tin cẩn giao phó trọng trách, uy danh vang dội.',
    wealth: 'Nguồn tài chính mở rộng, đầu tư sinh sôi vững chãi. Tránh tham lợi mù quáng, giữ tâm chính trực tài lộc bền lâu.',
    love: 'Gia đạo êm ấm, tình duyên thấu hiểu đồng lòng. Người độc thân dễ gặp gỡ ý trung nhân môn đăng hộ đối.',
    healthAndTravel: 'Nguyên khí dồi dào, xuất hành hướng Tây Bắc đại cát, nghênh tiếp phúc tinh.',
    spiritualRemedy: 'Hành thiện tích đức, cung kính hiếu thảo với đấng sinh thành, đọc tụng Chú Đại Bi tăng trưởng phúc huệ.',
    luckyDirection: 'Tây Bắc (Càn Cung)',
    favorableHours: 'Giờ Thìn (07:00 - 09:00), Giờ Tỵ (09:00 - 11:00)'
  },
  {
    id: 'hex_14',
    name: 'Hỏa Thiên Đại Hữu (Lớn Có)',
    hanzi: '火天大有',
    rank: 'Thượng Thượng Cát',
    trigramSymbol: '☲☰',
    hexagramNumber: 14,
    poem: [
      'Mặt trời giữa trưa tỏa sáng ngời,',
      'Đại hữu muôn phương phúc lộc bồi.',
      'Kho tàng dồi dào ơn trời bể,',
      'Khiêm cung đức độ rạng nơi nơi.'
    ],
    generalMeaning: 'Lửa cháy sáng trên trời cao, vạn vật được soi chiếu rạng ngời. Thời điểm gặt hái thành quả to lớn sau những tháng ngày bền bỉ gieo mầm.',
    career: 'Công việc đạt mốc son rực rỡ. Đàm phán hợp đồng lớn tất thành, vị thế được nâng tầm rõ rệt.',
    wealth: 'Tài chính dồi dào, tiền bạc hanh thông, các khoản thu nhập đổ về vượt kỳ vọng.',
    love: 'Hòa khí sinh tài, gia đình hoan hỷ, vợ chồng hòa thuận tương kính như tân.',
    healthAndTravel: 'Thân tâm an lạc, xuất hành hướng Chính Nam gặp gỡ quý nhân tương trợ đắc lực.',
    spiritualRemedy: 'Tùy hỷ phóng sinh, cúng dường Tam Bảo hoặc giúp đỡ người cơ nhỡ để tài lộc tụ hội dài lâu.',
    luckyDirection: 'Chính Nam (Ly Cung)',
    favorableHours: 'Giờ Ngọ (11:00 - 13:00), Giờ Thân (15:00 - 17:00)'
  },
  {
    id: 'hex_11',
    name: 'Địa Thiên Thái (Thái Bình)',
    hanzi: '地天泰',
    rank: 'Thượng Thượng Cát',
    trigramSymbol: '☷☰',
    hexagramNumber: 11,
    poem: [
      'Khí trời giáng xuống đất giao hòa,',
      'Xuân ấm mầm xanh khắp mọi nhà.',
      'Tiểu nhân lánh xa quân tử tiến,',
      'Thái bình thịnh vượng khúc âu ca.'
    ],
    generalMeaning: 'Đất Trời giao cảm, âm dương hòa hợp sinh sôi. Khó khăn quá khứ tiêu tan, mở ra giai đoạn thái bình, công danh gia đạo vững như bàn thạch.',
    career: 'Môi trường làm việc thuận lợi, đồng nghiệp đồng lòng, tiến cử thăng chức dễ dàng.',
    wealth: 'Tài lộc bình ổn và tăng trưởng đều đặn, không có rủi ro bất ngờ, giữ gìn tiền của an toàn.',
    love: 'Gia đạo viên mãn, vợ chồng son sắt, duyên lành đưa lối cho người chưa lập gia đình.',
    healthAndTravel: 'Tâm thần thanh thản, tiêu trừ mệt mỏi, du xuân hành hương tích phúc mang lại vận đỏ.',
    spiritualRemedy: 'Thắp nhang nguyện cầu quốc thái dân an, giữ giới thanh tịnh, ăn chay hồi hướng công đức.',
    luckyDirection: 'Tây Nam (Khôn Cung)',
    favorableHours: 'Giờ Mão (05:00 - 07:00), Giờ Dậu (17:00 - 19:00)'
  },
  {
    id: 'hex_42',
    name: 'Phong Lôi Ích (Tăng Thêm)',
    hanzi: '風雷益',
    rank: 'Đại Cát',
    trigramSymbol: '☴☳',
    hexagramNumber: 42,
    poem: [
      'Gió sấm trợ oai thế chuyển dời,',
      'Gieo mầm phúc đức khắp trần ai.',
      'Tổn trên ích dưới muôn người phục,',
      'Tiền tài sự nghiệp tựa biển khơi.'
    ],
    generalMeaning: 'Gió và Sấm tương sinh tương trợ, thế nước dâng cao. Càng cống hiến sẻ chia, phúc đức và cơ hội thăng tiến càng ùa về dồi dào.',
    career: 'Mở rộng thị trường, phát triển kỹ năng mới đạt đột phá bất ngờ.',
    wealth: 'Đầu tư gặt hái lợi nhuận tốt, cơ hội tăng lương hoặc mở rộng nguồn thu thứ hai.',
    love: 'Tình cảm thăng hoa, có tin vui về hỷ sự hoặc con cái trong gia đình.',
    healthAndTravel: 'Năng lượng chuyển hóa tích cực, xuất hành hướng Đông Nam cầu tài đắc tài.',
    spiritualRemedy: 'Bố thí cúng dường, ấn tống kinh sách hoặc làm việc nghĩa vô điều kiện.',
    luckyDirection: 'Đông Nam (Tốn Cung)',
    favorableHours: 'Giờ Dần (03:00 - 05:00), Giờ Hợi (21:00 - 23:00)'
  },
  {
    id: 'hex_15',
    name: 'Địa Sơn Khiêm (Khiêm Nhường)',
    hanzi: '地山謙',
    rank: 'Đại Cát',
    trigramSymbol: '☷☶',
    hexagramNumber: 15,
    poem: [
      'Núi cao ẩn bóng dưới đất sâu,',
      'Khiêm đức xưa nay vượt mọi âu.',
      'Người kính trời thương muôn lối mở,',
      'Bình an phúc trạch vạn niên trường.'
    ],
    generalMeaning: 'Núi cao chót vót nhưng chịu hạ mình nằm dưới mặt đất. Biểu trưng của đức tính khiêm cung cao thượng: càng nhún nhường, phúc lộc càng bền vững không gì phá vỡ.',
    career: 'Được đối tác nể phục vì chữ tín và thái độ cầu thị. Tránh khoa trương ắt vạn sự bình yên.',
    wealth: 'Tài chính bảo toàn vững chắc, tránh xa các cạm bẫy lừa gạt tài chính nhờ sự thận trọng.',
    love: 'Thấu hiểu và bao dung hóa giải mọi hiểu lầm, gia đạo đầm ấm bình an.',
    healthAndTravel: 'Sức khỏe ổn định, nên dưỡng khí tĩnh tâm thiền định mỗi sớm mai.',
    spiritualRemedy: 'Niệm Phật A Di Đà, giữ tâm nhu hòa, không tranh biện hơn thua với đời.',
    luckyDirection: 'Đông Bắc (Cấn Cung)',
    favorableHours: 'Giờ Tý (23:00 - 01:00), Giờ Mùi (13:00 - 15:00)'
  },
  {
    id: 'hex_48',
    name: 'Thủy Phong Tỉnh (Giếng Nước)',
    hanzi: '水風井',
    rank: 'Trung Cát',
    trigramSymbol: '☵☴',
    hexagramNumber: 48,
    poem: [
      'Nước giếng mát trong dưỡng vạn loài,',
      'Múc hoài chẳng cạn, mạch nguồn dài.',
      'Nội lực tinh thông bền chí nguyện,',
      'Trời cao soi tỏ tấm lòng ngay.'
    ],
    generalMeaning: 'Giếng nước ngọt nuôi sống dân làng, mạch ngầm không bao giờ cạn. Khuyên người nên mài giũa nội lực, học hỏi không ngừng thì tài vận tự khắc dâng trào.',
    career: 'Tích lũy kinh nghiệm, trau dồi chuyên môn, thành tựu sẽ nở rộ trong thời gian ngắn tới.',
    wealth: 'Thu nhập ổn định từ thực lực của bản thân, chớ trông chờ vào may rủi hay cờ bạc.',
    love: 'Tình cảm êm đềm như dòng suối nhỏ, cùng nhau vun đắp tương lai lâu bền.',
    healthAndTravel: 'Uống nhiều nước thanh lọc cơ thể, tránh thức khuya làm tổn hại thận thủy.',
    spiritualRemedy: 'Cúng dường nước sạch lên bàn thờ Phật, giữ thân tâm thanh khiết.',
    luckyDirection: 'Chính Bắc (Khảm Cung)',
    favorableHours: 'Giờ Thìn (07:00 - 09:00), Giờ Thân (15:00 - 17:00)'
  }
];

export const SacredOracleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dayMasterElement = 'Kim',
  userName = 'Đương Số'
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [currentHexagram, setCurrentHexagram] = useState<OracleHexagram | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isVoiceReading, setIsVoiceReading] = useState(false);

  if (!isOpen) return null;

  const handleShakeBamboo = () => {
    if (isShaking) return;
    setIsShaking(true);
    setCopied(false);

    // Audio rattle
    sacredSound.playBambooShaking();

    // Secondary rattle
    setTimeout(() => {
      sacredSound.playBambooShaking();
    }, 450);

    setTimeout(() => {
      // Pick next deterministic or randomized hexagram
      const randIdx = Math.floor(Math.random() * SACRED_HEXAGRAMS.length);
      setCurrentHexagram(SACRED_HEXAGRAMS[randIdx]);
      setIsShaking(false);
      setShakeCount((prev) => prev + 1);

      // Sacred gong + bell
      sacredSound.playTempleGong(108);
      sacredSound.playSacredSuccess();
    }, 1100);
  };

  const handleCoinDivination = () => {
    if (isShaking) return;
    setIsShaking(true);
    setCopied(false);

    sacredSound.playCoinToss();

    setTimeout(() => {
      sacredSound.playCoinToss();
    }, 380);

    setTimeout(() => {
      const randIdx = Math.floor(Math.random() * SACRED_HEXAGRAMS.length);
      setCurrentHexagram(SACRED_HEXAGRAMS[randIdx]);
      setIsShaking(false);
      setShakeCount((prev) => prev + 1);

      sacredSound.playTempleGong(108);
      sacredSound.playSacredSuccess();
    }, 950);
  };

  const handleCopyPoem = () => {
    if (!currentHexagram) return;
    const text = `【QUẺ LINH ỨNG: ${currentHexagram.name} - ${currentHexagram.rank}】\n` +
      `Thơ Khai Mệnh:\n${currentHexagram.poem.join('\n')}\n\n` +
      `Ý Nghĩa: ${currentHexagram.generalMeaning}\n` +
      `Phương Vị Cát: ${currentHexagram.luckyDirection} | Giờ Vàng: ${currentHexagram.favorableHours}\n` +
      `Hóa Giải: ${currentHexagram.spiritualRemedy}\n` +
      `— Kênh Huyền Phong Phật Đạo • Aurora Destiny AI`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    sacredSound.playSacredTap(640);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSpeakWisdom = () => {
    if (!currentHexagram) return;
    if (isVoiceReading) {
      sacredVoice.stop();
      setIsVoiceReading(false);
      return;
    }
    setIsVoiceReading(true);
    const speechText = `Quẻ thỉnh được hôm nay là quẻ ${currentHexagram.name}, thuộc phẩm ${currentHexagram.rank}. Lời thơ khai tâm: ${currentHexagram.poem.join('. ')}. Lời khuyên hóa giải: ${currentHexagram.spiritualRemedy}.`;
    
    sacredSound.playTibetanBowl(432);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsVoiceReading(false);
      utterance.onerror = () => setIsVoiceReading(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
      {/* Background stardust */}
      <SacredParticles density="subtle" className="opacity-25" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#161224] via-[#0f0c1c] to-[#070611] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-slate-100 overflow-hidden my-auto"
      >
        {/* Subtle Sacred Mandala Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10">
          <SacredMandalaAura size={480} opacity={0.18} />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                  Huyền Phong Phật Đạo
                </span>
                <SacredSealBadge text="LINH ỨNG" subtext="KHAI TÂM" size="sm" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                Đài Gieo Quẻ Bát Quái • Thỉnh Quẻ Khai Mệnh
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sacredSound.playSacredTap(432);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector / Actions when NO card drawn yet or ready to re-draw */}
        {!currentHexagram ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
            {/* Visual 3D Bamboo Cylinder / Coins */}
            <motion.div
              animate={isShaking ? {
                rotateZ: [-12, 12, -8, 8, -4, 4, 0],
                y: [0, -12, 0, -8, 0],
                transition: { duration: 0.9, repeat: Infinity }
              } : {
                y: [0, -6, 0],
                transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-3xl bg-gradient-to-b from-amber-600/80 via-yellow-700/80 to-amber-950/90 border-2 border-amber-300 p-3 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex flex-col items-center justify-between cursor-pointer select-none group"
              onClick={handleShakeBamboo}
            >
              {/* Bamboo Stick Tips sticking out */}
              <div className="flex items-end justify-center gap-1.5 -mt-8">
                <div className="w-2.5 h-12 bg-gradient-to-b from-amber-200 to-amber-400 rounded-t-sm shadow-md" />
                <div className="w-2.5 h-16 bg-gradient-to-b from-yellow-200 to-amber-300 rounded-t-sm shadow-md" />
                <div className="w-2.5 h-14 bg-gradient-to-b from-amber-200 to-yellow-400 rounded-t-sm shadow-md" />
                <div className="w-2.5 h-10 bg-gradient-to-b from-amber-100 to-amber-300 rounded-t-sm shadow-md" />
              </div>

              {/* Engraved Seal on Cylinder */}
              <div className="my-auto text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center">
                  <SacredTaijiSpinner size={32} speed={8} />
                </div>
                <div className="text-xs font-serif font-bold text-amber-200 tracking-wider">
                  THIÊN CƠ ỐNG XÂM
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono">
                  64 Quẻ Dịch Chuẩn
                </div>
              </div>

              {/* Bottom Gold Rim */}
              <div className="w-full py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider text-center">
                Chạm Để Lắc Xâm
              </div>
            </motion.div>

            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Hãy tịnh tâm, tưởng nhớ bản mệnh và nguyện cầu điều mong muốn khai mở. Bấm nút dưới đây để lắc ống xâm hoặc gieo 3 đồng tiền xu cổ truyền.
              </p>
              <div className="text-xs text-amber-300/90 font-mono">
                Bản mệnh: <span className="text-white font-bold">{userName}</span> • Dụng Thần: <span className="text-teal-300 font-bold">{dayMasterElement}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleShakeBamboo}
                disabled={isShaking}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isShaking ? 'animate-spin' : ''}`} />
                <span>{isShaking ? 'Đang Lắc Xâm...' : 'Lắc Ống Thẻ Xâm'}</span>
              </button>

              <button
                type="button"
                onClick={handleCoinDivination}
                disabled={isShaking}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-amber-500/20 border border-amber-400/50 hover:border-amber-300 text-amber-200 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Gieo 3 Đồng Tiền Xu</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= DISPLAY DRAWN ORACLE CARD ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Card Header Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-serif">{currentHexagram.trigramSymbol}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                      {currentHexagram.rank}
                    </span>
                    <span className="text-xs font-mono text-amber-300">Quẻ Số {currentHexagram.hexagramNumber}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                    {currentHexagram.name} ({currentHexagram.hanzi})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeakWisdom}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                    isVoiceReading
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
                  }`}
                  title="Nghe giọng đọc khẩu quyết"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isVoiceReading ? 'Đang Đọc...' : 'Nghe Giọng'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPoem}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Sao chép lời thơ khai tâm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã Chép' : 'Chia Sẻ'}</span>
                </button>
              </div>
            </div>

            {/* Sacred 4-line Poem in Gold Frame */}
            <div className="p-4 rounded-2xl bg-[#090812] border-2 border-amber-400/60 shadow-[inset_0_0_20px_rgba(245,158,11,0.15)] text-center space-y-1">
              <div className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">
                — LỜI THƠ KHẨU QUYẾT HUYỀN PHONG —
              </div>
              <div className="font-serif italic text-base sm:text-lg text-amber-100 font-medium leading-relaxed py-1">
                {currentHexagram.poem.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            {/* Detailed Predictions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Sự Nghiệp &amp; Công Danh</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-light">{currentHexagram.career}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Tài Lộc &amp; Làm Ăn</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-light">{currentHexagram.wealth}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Tình Cảm &amp; Gia Đạo</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-light">{currentHexagram.love}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Xuất Hành &amp; Giờ Vàng</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-light">
                  <span className="font-semibold text-white">Hướng Cát:</span> {currentHexagram.luckyDirection}<br />
                  <span className="font-semibold text-white">Khung Giờ:</span> {currentHexagram.favorableHours}
                </p>
              </div>
            </div>

            {/* Spiritual Remedy / Dharma Guidance */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-400/35 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-amber-200">Phương Pháp Tu Tập &amp; Hóa Giải: </span>
                <span className="text-slate-200 font-light">{currentHexagram.spiritualRemedy}</span>
              </div>
            </div>

            {/* Re-draw Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Lần lắc: #{shakeCount}
              </span>
              <button
                type="button"
                onClick={() => {
                  sacredSound.playSacredTap(528);
                  setCurrentHexagram(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Gieo Quẻ Khác</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
