// ==========================================================
// AURORA DESTINY AI — KARMIC PIVOT & TALISMAN ENGINE
// Computational Destiny Analytics & Karmic Transmutation
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

import { CalculationResult, ZiWeiPalace, FiveElement, PalaceKey } from '../types/destiny';
import { UserProfile } from '../types/user';
import { KarmicPivotAnalysis } from '../types/talisman';
import { STEMS, BRANCHES } from '../engine/canchi';

// Simple deterministic hash helper for cryptographic seal
function generateSealHash(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const hex = hash.toString(16).toUpperCase().padStart(8, '0');
  return `SEAL-HPPD-${hex}`;
}

export function computeKarmicPivot(
  calculation: CalculationResult,
  profile: UserProfile
): KarmicPivotAnalysis {
  const { ziwei, bazi } = calculation;
  const palaces: ZiWeiPalace[] = Object.values(ziwei.palaces);

  // 1. Locate palace with Hoa Ky or challenging star (Dia Kiep, Dia Khong, Linh Tinh, Hoa Tinh)
  let knotPalaceObj: ZiWeiPalace =
    palaces.find((p) => p.transformations?.some((t) => t.includes('Hóa Kỵ'))) ||
    palaces.find((p) => p.majorStars?.some((s) => s.transformation === 'Ky')) ||
    palaces.find((p) => p.minorStars?.some((s) => s.nameVi.includes('Địa Kiếp') || s.nameVi.includes('Địa Không'))) ||
    ziwei.palaces.karma ||
    ziwei.palaces.life;

  // 2. Determine weakest or favorable element in Bazi
  let remedyElement: FiveElement = 'Metal';
  if (bazi.favorableElements && bazi.favorableElements.length > 0) {
    remedyElement = bazi.favorableElements[0];
  } else if (bazi.elementBalance) {
    let minPct = 999;
    (Object.entries(bazi.elementBalance) as [FiveElement, number][]).forEach(([el, pct]) => {
      if (pct < minPct) {
        minPct = pct;
        remedyElement = el;
      }
    });
  }

  // 3. Remedy elements mapping
  const elementColors: Record<FiveElement, string> = {
    Metal: 'Vàng Ánh Kim, Trắng Bạch Ngọc, Bạc Tinh Khôi',
    Water: 'Xanh Lam Thẩm Thấu, Đen Huyền Bí, Xanh Thủy Tinh',
    Wood: 'Xanh Lục Bảo, Ngọc Bích, Xanh Rừng Nguyên Sinh',
    Fire: 'Đỏ Chu Sa, Tím Tử Vi, Cam Hổ Phách',
    Earth: 'Vàng Hoàng Thổ, Nâu Trầm Tích, Cát Sa Mạc'
  };

  const elementDirections: Record<FiveElement, string> = {
    Metal: 'Chính Tây & Tây Bắc (Cung Càn - Đoài)',
    Water: 'Chính Bắc (Cung Khảm)',
    Wood: 'Chính Đông & Đông Nam (Cung Chấn - Tốn)',
    Fire: 'Chính Nam (Cung Ly)',
    Earth: 'Đông Bắc & Tây Nam (Cung Cấn - Khôn) và Trung Cung'
  };

  const elementBenefactors: Record<FiveElement, string> = {
    Metal: 'Người hành Kim cương trực, chuyên gia tài chính, kỹ thuật chính xác, người tuổi Thân - Dậu',
    Water: 'Người trí tuệ sâu sắc, chuyên gia chiến lược, thương gia hàng hải, người tuổi Hợi - Tý',
    Wood: 'Bậc thầy giáo dục, nhà sáng tạo nhân văn, người làm y dược, người tuổi Dần - Mão',
    Fire: 'Người dẫn đầu truyền cảm hứng, chuyên gia truyền thông, học giả uyên bác, người tuổi Tỵ - Ngọ',
    Earth: 'Bậc tiền bối trầm ổn, chuyên gia bất động sản, người làm quy hoạch vững chãi, người tuổi Thìn - Tuất - Sửu - Mùi'
  };

  const elementCareers: Record<FiveElement, string> = {
    Metal: 'Công nghệ cao, kiến trúc chuẩn xác, điều hành tài chính, kim hoàn, kỹ thuật số',
    Water: 'Ngoại giao, logistics toàn cầu, nghiên cứu triết học, tư vấn tâm lý, truyền thông số',
    Wood: 'Giáo dục khai phóng, y tế dưỡng sinh, nông nghiệp công nghệ cao, xuất bản tri thức',
    Fire: 'Diễn thuyết, sáng tạo nội dung truyền cảm hứng, công nghiệp giải trí, năng lượng tái tạo',
    Earth: 'Bất động sản, xây dựng nền tảng, quản trị chuỗi cung ứng, lưu trữ dữ liệu bền vững'
  };

  // Find Remedy Palace (Life, Fortune, Career or Real Estate)
  let remedyPalaceName = 'Cung Phúc Đức (Tu Dưỡng Tâm Tính & Âm Đức Tổ Tiên)';
  if (knotPalaceObj.key === 'karma') {
    remedyPalaceName = 'Cung Điền Trạch (Kiến Thiết Không Gian Trầm Ổn & Nơi Chốn Trở Về)';
  } else if (knotPalaceObj.key === 'career' || knotPalaceObj.key === 'wealth') {
    remedyPalaceName = 'Cung Quan Lộc & Cung Thiên Di (Mở Rộng Tầm Nhìn & Quý Nhân Ngoại Cảnh)';
  } else if (knotPalaceObj.key === 'spouse' || knotPalaceObj.key === 'friends') {
    remedyPalaceName = 'Cung Huynh Đệ & Cung Nô Bộc (Dĩ Hòa Vi Quý, Lắng Nghe & Thấu Cảm)';
  }

  // Sacred enlightened motto from Prof.TOAN & Huyen Phong Phat Dao
  const sacredMottos = [
    'Tâm bình vạn sự bình • Trí sáng vận tự thông • Nghịch cảnh là lò luyện Kim Cương',
    'Nhân quả không sai một khắc • Chuyển hóa tâm niệm tức khắc chuyển hóa càn khôn',
    'Đức năng thắng số • Giữ vững chân tâm thì mọi hung tinh đều hóa thành thiện duyên',
    'Vạn vật biến dịch tùy duyên • Biết thời - Định vị - Hành động chuẩn xác để an định bản mệnh'
  ];
  const birthYear = profile.birthData?.solarYear || 2000;
  const mottoIndex = Math.abs(profile.name.length + birthYear) % sacredMottos.length;
  const selectedMotto = sacredMottos[mottoIndex];

  const seed = `${profile.name}_${birthYear}_${profile.birthData?.solarMonth || 1}_${profile.birthData?.solarDay || 1}_${remedyElement}`;
  const sealHash = generateSealHash(seed);

  return {
    knotPalace: knotPalaceObj.nameVi,
    knotName: `Nút Thắt Khí Vận tại Cung ${knotPalaceObj.nameVi}`,
    knotDescription: `Vùng năng lượng chịu thử thách trọng tâm của bản mệnh, nơi hội tụ bài học kiếp nhân sinh về sự kiên định, buông xả chấp niệm và tôi luyện bản lĩnh.`,
    rootCause: `Sự mất cân bằng giữa dục vọng nhất thời và nhịp độ vận động của Thiên thời - Địa lợi; thiếu hụt năng lượng hành ${remedyElement} làm điểm tựa vững chãi.`,
    karmicLesson: `Nhận diện trắc trở không phải là vận rủi, mà là cánh cổng bắt buộc phải vượt qua để thức tỉnh trí tuệ và mở lối cho đại vận bứt phá tiếp theo.`,
    remedyPalace: remedyPalaceName,
    remedyElement: remedyElement,
    elementColor: elementColors[remedyElement],
    favorableDirection: elementDirections[remedyElement],
    auspiciousHours: 'Giờ Dần (03:00 - 05:00) đón sinh khí & Giờ Thân (15:00 - 17:00) định thần quyết đoán',
    benefactorArchetype: elementBenefactors[remedyElement],
    catalystCareer: elementCareers[remedyElement],
    sacredMotto: selectedMotto,
    cryptographicSeal: sealHash,
    karmicScore: 92
  };
}
