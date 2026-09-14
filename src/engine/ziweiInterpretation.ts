// ==========================================
// ZI WEI ORTHODOX INTERPRETATION MODULE
// Phân tích luận giải Tử Vi Đẩu Số chính tông
// Xác thực, phi mê tín, tôn trọng quyền tự chủ cá nhân
// ==========================================

import {
  ZiWeiChart,
  ZiWeiPalace,
  PalaceKey,
  BirthData,
  EarthlyBranch,
  HeavenlyStem
} from '../types/destiny';
import { BRANCHES, STEMS, getNaYin } from './canchi';

export interface AuthenticZiWeiReport {
  yinYangGenderHarmony: {
    yinYangNature: string;
    isHarmonious: boolean;
    direction: 'Thuận Lý' | 'Nghịch Lý';
    decadeDirection: 'Thuận' | 'Nghịch';
    explanation: string;
  };
  elementDestinyBureauHarmony: {
    birthYearNaYin: string;
    elementBureau: string;
    relation: 'Cục Sinh Mệnh' | 'Mệnh Cục Tỷ Hòa' | 'Mệnh Sinh Cục' | 'Mệnh Khắc Cục' | 'Cục Khắc Mệnh';
    quality: 'Cát Lợi' | 'Bình Hòa' | 'Hao Tổn' | 'Thử Thách' | 'Nghịch Cảnh';
    explanation: string;
  };
  bodyPalaceAnalysis: {
    palaceKey: PalaceKey;
    palaceName: string;
    meaning: string;
    lifeImpact: string;
  };
  currentDecade: {
    palaceKey: PalaceKey;
    palaceName: string;
    startAge: number;
    endAge: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    majorStars: string[];
    evaluation: string;
  };
  currentYearTransit: {
    year: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    palaceKey: PalaceKey;
    palaceName: string;
    liuStars: string[];
    summary: string;
  };
  thaiTueCircleAnalysis: {
    groupName: string;
    characterTraits: string;
  };
  lifePalaceDeepDive: {
    majorStarsSummary: string;
    sanFangSiZhengSummary: string;
    tuanTrietImpact: string;
    overallDestinyCore: string;
  };
  careerAndWealthInsight: {
    careerOrientation: string;
    wealthAccumulationPattern: string;
  };
  strategicEmpowerment: string[];
}

// 1. Phân định Âm Dương Nam Nữ & Chiều Vận
export function evaluateYinYangGender(yearStem: HeavenlyStem, gender: 'Male' | 'Female') {
  const stemInfo = STEMS[yearStem];
  const isYang = stemInfo.yinYang === 'Yang';
  const isMale = gender === 'Male';

  let yinYangNature = '';
  if (isMale) {
    yinYangNature = isYang ? 'Dương Nam' : 'Âm Nam';
  } else {
    yinYangNature = isYang ? 'Dương Nữ' : 'Âm Nữ';
  }

  // Thuận lý: Dương Nam hoặc Âm Nữ
  const isHarmonious = (isMale && isYang) || (!isMale && !isYang);
  const direction: 'Thuận Lý' | 'Nghịch Lý' = isHarmonious ? 'Thuận Lý' : 'Nghịch Lý';
  const decadeDirection: 'Thuận' | 'Nghịch' = isHarmonious ? 'Thuận' : 'Nghịch';

  const explanation = isHarmonious
    ? `${yinYangNature} thuộc cách "Âm Dương Thuận Lý". Bạn có lợi thế thiên bẩm về tính thích ứng với hoàn cảnh sống, dòng chảy cuộc đời thường có sự thuận chiều, khi gặp khó khăn thường có quý nhân hoặc cơ duyên mở lối tháo gỡ.`
    : `${yinYangNature} thuộc cách "Âm Dương Nghịch Lý". Khởi đầu tiền vận thường phải tự lực cánh sinh, tự mình trải qua tôi luyện và tự tích lũy trải nghiệm. Đây là tố chất rèn giũa bản lĩnh kiên cường, giúp bạn đứng vững trên đôi chân của mình và kiến tạo thành công bền vững ở trung hậu vận.`;

  return {
    yinYangNature,
    isHarmonious,
    direction,
    decadeDirection,
    explanation
  };
}

// 2. Tương quan Nạp Âm Bản Mệnh và Cục Số
export function evaluateElementAndBureau(
  birthYearStem: HeavenlyStem,
  birthYearBranch: EarthlyBranch,
  elementBureau: string
) {
  const naYin = getNaYin(birthYearStem, birthYearBranch);

  let menhElement = 'Kim';
  if (naYin.includes('Kim')) menhElement = 'Kim';
  else if (naYin.includes('Mộc')) menhElement = 'Mộc';
  else if (naYin.includes('Thủy')) menhElement = 'Thủy';
  else if (naYin.includes('Hỏa')) menhElement = 'Hỏa';
  else if (naYin.includes('Thổ')) menhElement = 'Thổ';

  let cucElement = 'Kim';
  if (elementBureau.includes('Thủy')) cucElement = 'Thủy';
  else if (elementBureau.includes('Mộc')) cucElement = 'Mộc';
  else if (elementBureau.includes('Kim')) cucElement = 'Kim';
  else if (elementBureau.includes('Thổ')) cucElement = 'Thổ';
  else if (elementBureau.includes('Hỏa')) cucElement = 'Hỏa';

  // Quy luật ngũ hành sinh khắc
  const generates: Record<string, string> = {
    Mộc: 'Hỏa',
    Hỏa: 'Thổ',
    Thổ: 'Kim',
    Kim: 'Thủy',
    Thủy: 'Mộc'
  };

  const overcomes: Record<string, string> = {
    Mộc: 'Thổ',
    Thổ: 'Thủy',
    Thủy: 'Hỏa',
    Hỏa: 'Kim',
    Kim: 'Mộc'
  };

  let relation: 'Cục Sinh Mệnh' | 'Mệnh Cục Tỷ Hòa' | 'Mệnh Sinh Cục' | 'Mệnh Khắc Cục' | 'Cục Khắc Mệnh' = 'Mệnh Cục Tỷ Hòa';
  let quality: 'Cát Lợi' | 'Bình Hòa' | 'Hao Tổn' | 'Thử Thách' | 'Nghịch Cảnh' = 'Bình Hòa';
  let explanation = '';

  if (generates[cucElement] === menhElement) {
    relation = 'Cục Sinh Mệnh';
    quality = 'Cát Lợi';
    explanation = `Cục (${cucElement}) tương sinh cho Bản Mệnh (${menhElement} - ${naYin}). Môi trường xã hội, thời cuộc và hoàn cảnh xung quanh tạo nhiều thuận lợi, hỗ trợ bạn hiện thực hóa hoài bão. Khi gặp trắc trở, ngoại cảnh thường có xu hướng chuyển biến tích cực giúp bạn vượt qua.`;
  } else if (cucElement === menhElement) {
    relation = 'Mệnh Cục Tỷ Hòa';
    quality = 'Bình Hòa';
    explanation = `Bản Mệnh (${menhElement} - ${naYin}) hòa hợp với Cục (${cucElement}). Bạn dễ hòa nhập với môi trường xung quanh, phát triển vững vàng bằng chính năng lực thực chất, từng bước củng cố vị thế mà ít gặp những xáo trộn mang tính cực đoan.`;
  } else if (generates[menhElement] === cucElement) {
    relation = 'Mệnh Sinh Cục';
    quality = 'Hao Tổn';
    explanation = `Bản Mệnh (${menhElement} - ${naYin}) sinh xuất cho Cục (${cucElement}). Bạn là người nhiệt huyết, tinh thần cống hiến cao và thường dồn nhiều tâm lực cho công việc lẫn tha nhân trước khi thu về kết quả cho bản thân. Cần chú trọng quản trị năng lượng, tránh làm việc kiệt sức.`;
  } else if (overcomes[menhElement] === cucElement) {
    relation = 'Mệnh Khắc Cục';
    quality = 'Thử Thách';
    explanation = `Bản Mệnh (${menhElement} - ${naYin}) khắc Cục (${cucElement}). Bạn mang cá tính mạnh mẽ, thích tự chủ định đoạt vận mệnh và không cam chịu hoàn cảnh an bài. Bằng ý chí kiên định và năng lực chuyên môn, bạn hoàn toàn có thể làm chủ tình thế và kiến tạo bước ngoặt lớn.`;
  } else {
    relation = 'Cục Khắc Mệnh';
    quality = 'Nghịch Cảnh';
    explanation = `Cục (${cucElement}) tương khắc với Bản Mệnh (${menhElement} - ${naYin}). Hoàn cảnh thực tế đôi khi tạo ra những áp lực lớn và đòi hỏi sự kiên nhẫn cao độ. Những chông gai này đóng vai trò tôi luyện bản lĩnh thép, giúp bạn trở thành người thấu đáo và dày dạn kinh nghiệm sống.`;
  }

  return {
    birthYearNaYin: naYin,
    elementBureau,
    relation,
    quality,
    explanation
  };
}

// 3. Phân tích Cung Thân (Trọng tâm sau 30 tuổi)
export function evaluateBodyPalace(bodyPalaceKey: PalaceKey, palace: ZiWeiPalace) {
  const map: Record<PalaceKey, { meaning: string; lifeImpact: string }> = {
    life: {
      meaning: 'Thân Mệnh Đồng Cung (Sinh vào giờ Tý hoặc giờ Ngọ)',
      lifeImpact: 'Tính cách nhất quán, tự chủ từ thời niên thiếu cho đến hậu vận. Bạn là mẫu người có lập trường kiên định, tự chịu trách nhiệm về mọi quyết định và kiên trì theo đuổi con đường đã chọn.'
    },
    karma: {
      meaning: 'Thân Cư Phúc Đức (Sinh vào giờ Sửu hoặc giờ Mùi)',
      lifeImpact: 'Hậu vận gắn liền mật thiết với đời sống tinh thần, nội tâm và phúc trạch tổ tiên. Sự an yên trong tâm thức, lòng thiện lương và sự kết nối dòng tộc là cội nguồn của mọi may mắn và bình an cuộc đời.'
    },
    career: {
      meaning: 'Thân Cư Quan Lộc (Sinh vào giờ Dần hoặc giờ Thân)',
      lifeImpact: 'Hậu vận lấy sự nghiệp, danh vị và cống hiến xã hội làm kim chỉ nam. Bạn là người say mê công việc, luôn khát khao khẳng định năng lực chuyên môn và nâng cao tầm ảnh hưởng trong tổ chức.'
    },
    travel: {
      meaning: 'Thân Cư Thiên Di (Sinh vào giờ Mão hoặc giờ Dậu)',
      lifeImpact: 'Cuộc đời gắn liền với những chuyến đi xa, ngoại giao, thay đổi môi trường hoặc phát triển ở xứ người. Môi trường xã hội rộng mở và năng lực thích ứng là chìa khóa mở ra những cơ hội đột phá.'
    },
    wealth: {
      meaning: 'Thân Cư Tài Bạch (Sinh vào giờ Thìn hoặc giờ Tuất)',
      lifeImpact: 'Trọng tâm cuộc sống tập trung vào năng lực tài chính, quản trị tài sản và sự an toàn kinh tế. Bạn có tư duy thực tiễn sắc bén, nhạy bén với cơ hội kinh doanh và luôn trân trọng giá trị lao động.'
    },
    spouse: {
      meaning: 'Thân Cư Phu Thê (Sinh vào giờ Tỵ hoặc giờ Hợi)',
      lifeImpact: 'Hôn nhân và người bạn đời đóng vai trò then chốt trong sự nghiệp và đời sống cá nhân. Khi gia đạo hòa hợp, bạn sẽ có điểm tựa vững chắc để thăng hoa trong mọi lĩnh vực xã hội.'
    },
    children: {
      meaning: 'Thân Cư Tử Tức',
      lifeImpact: 'Hậu vận gắn bó sâu sắc với con cái, học trò hoặc thế hệ kế cận, coi việc truyền thừa tri thức là niềm hạnh phúc lớn.'
    },
    health: {
      meaning: 'Thân Cư Tật Ách',
      lifeImpact: 'Hậu vận nhắc nhở chú trọng giữ gìn thể chất, rèn luyện lối sống lành mạnh và tu dưỡng tâm tính để bảo tồn năng lượng sống.'
    },
    friends: {
      meaning: 'Thân Cư Nô Bộc',
      lifeImpact: 'Hậu vận được định hình bởi mạng lưới bạn bè, cộng sự và đối tác xã hội; tinh thần đồng đội mang lại sức mạnh lớn.'
    },
    property: {
      meaning: 'Thân Cư Điền Trạch',
      lifeImpact: 'Hậu vận chú trọng an cư lập nghiệp, tích lũy đất đai cơ nghiệp vững chắc cho gia đình và con cháu mai sau.'
    },
    parents: {
      meaning: 'Thân Cư Phụ Mẫu',
      lifeImpact: 'Sợi dây ân nghĩa với cha mẹ, dòng họ và người dẫn dắt có sức ảnh hưởng sâu sắc đến mọi chặng đường cuộc đời.'
    },
    siblings: {
      meaning: 'Thân Cư Huynh Đệ',
      lifeImpact: 'Mối quan hệ anh chị em thân thiết và mạng lưới cộng sự ngang hàng là bệ đỡ vững vàng trong cuộc sống.'
    }
  };

  const info = map[bodyPalaceKey] || map.life;
  return {
    palaceKey: bodyPalaceKey,
    palaceName: palace?.nameVi || 'Mệnh',
    meaning: info.meaning,
    lifeImpact: info.lifeImpact
  };
}

// 4. Nhận diện nhóm Tam Hợp Vòng Thái Tuế
export function evaluateThaiTueGroup(lifeThaiTueStar: string | undefined) {
  if (!lifeThaiTueStar) return { groupName: 'Vòng Thái Tuế', characterTraits: 'Gắn liền với chuẩn mực đạo đức và trách nhiệm xã hội.' };

  if (['Thái Tuế', 'Quan Phù', 'Bạch Hổ'].includes(lifeThaiTueStar)) {
    return {
      groupName: 'Tam Hợp Thái Tuế - Quan Phù - Bạch Hổ (Tuế Hổ Phù)',
      characterTraits: 'Tư cách quang minh chính đại, ý thức danh dự và tinh thần trách nhiệm cao. Có tư duy logic chặt chẽ, chính trực, ghét sự quanh co và luôn được tập thể tín nhiệm giao phó trọng trách.'
    };
  }

  if (['Tang Môn', 'Tuế Phá', 'Điếu Khách'].includes(lifeThaiTueStar)) {
    return {
      groupName: 'Tam Hợp Tang Môn - Tuế Phá - Điếu Khách (Tang Tuế Điếu)',
      characterTraits: 'Mang tinh thần đổi mới, phản biện, không chấp nhận lối mòn cũ kỹ. Luôn khát khao tự khẳng định bản thân, sẵn sàng dấn thân và tự tay tạo dựng cơ đồ từ nội lực khác biệt.'
    };
  }

  if (['Thiếu Dương', 'Tử Phù', 'Phúc Đức'].includes(lifeThaiTueStar)) {
    return {
      groupName: 'Tam Hợp Thiếu Dương - Tử Phù - Phúc Đức (Dương Tử Phúc)',
      characterTraits: 'Thông minh, sắc sảo, thích ứng linh hoạt và giàu lòng trắc ẩn. Biết chu toàn công việc, khéo léo trong quan hệ xã hội nhưng cần tiết chế cái tôi để tránh thị phi không đáng có.'
    };
  }

  if (['Thiếu Âm', 'Long Đức', 'Trực Phù'].includes(lifeThaiTueStar)) {
    return {
      groupName: 'Tam Hợp Thiếu Âm - Long Đức - Trực Phù (Âm Long Trực)',
      characterTraits: 'Tính tình thuần hậu, nhẫn nại, nhân ái và cần mẫn. Sống chân thành, biết lắng nghe và sẵn sàng chịu thiệt thòi ngắn hạn để đổi lấy sự bình an, hậu vận tích lũy đại phúc.'
    };
  }

  return {
    groupName: 'Vòng Thái Tuế',
    characterTraits: 'Sống có nguyên tắc, coi trọng danh dự và luôn trau dồi uy tín cá nhân.'
  };
}

// 5. Luận giải chi tiết Tam Phương Tứ Chính và Mệnh Cung
export function evaluateLifePalaceAndSanFang(chart: ZiWeiChart) {
  const life = chart.palaces.life;
  const career = chart.palaces.career;
  const wealth = chart.palaces.wealth;
  const travel = chart.palaces.travel;

  const lifeStars = life?.majorStars || [];
  const careerStars = career?.majorStars || [];
  const wealthStars = wealth?.majorStars || [];
  const travelStars = travel?.majorStars || [];

  // Mệnh Cung
  let majorStarsSummary = '';
  if (lifeStars.length === 0) {
    const travelFacing = travelStars.map(s => `${s.nameVi} (${s.brightness})`).join(', ') || 'Vô Chính Diệu';
    majorStarsSummary = `Cung Mệnh Vô Chính Diệu (không có chính tinh tọa thủ). Đặc tính nổi bật là sự uyển chuyển, năng lực thích ứng tuyệt vời với mọi hoàn cảnh, tư duy mở rộng và khả năng đa nhiệm. Cung Mệnh mượn trường năng lượng xung chiếu từ Cung Thiên Di: [${travelFacing}] làm phương vị định hướng phát triển bản thân.`;
  } else {
    const starNamesWithBrightness = lifeStars.map(s => {
      const brightDesc = s.brightness === 'M' ? 'Miếu Địa' : s.brightness === 'V' ? 'Vượng Địa' : s.brightness === 'D' ? 'Đắc Địa' : s.brightness === 'B' ? 'Bình Hòa' : 'Hãm Địa';
      const transDesc = s.transformation ? ` [Hóa ${s.transformation === 'Lu' ? 'Lộc' : s.transformation === 'Quan' ? 'Quyền' : s.transformation === 'Khoa' ? 'Khoa' : 'Kỵ'}]` : '';
      return `${s.nameVi} (${brightDesc}${transDesc})`;
    }).join(', ');
    majorStarsSummary = `Cung Mệnh tọa thủ chính tinh: ${starNamesWithBrightness}. Khẳng định phong cách tư duy độc lập, khí chất bản lĩnh và thiên hướng phát triển tài năng nổi bật.`;
  }

  // Tuần Triệt
  let tuanTrietImpact = 'Cung Mệnh không vướng Tuần Không hay Triệt Không, trường năng lượng của các tinh tú phát huy đầy đủ và thông suốt.';
  if (life?.tuanTriet && life.tuanTriet.length > 0) {
    const ttStr = life.tuanTriet.join(' & ');
    tuanTrietImpact = `Cung Mệnh ngộ [${ttStr}]. Tuần/Triệt đóng vai trò sàng lọc và chuyển hóa: nếu gặp sao hãm địa sẽ được khai sáng giảm bớt bất lợi; nếu gặp sao miếu vượng đòi hỏi đương số phải trải qua giai đoạn rèn luyện tôi chí trước khi gặt hái thành quả lớn.`;
  }

  // Tam phương tứ chính hội chiếu
  const sanFangSiZhengSummary = `Tam Phương Tứ Chính hội tụ: Quan Lộc tọa [${careerStars.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}], Tài Bạch tọa [${wealthStars.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}], Thiên Di tọa [${travelStars.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}]. Sự tương phối chặt chẽ giữa 4 cung vị nòng cốt tạo nên trục phát triển toàn diện giữa Tài Năng - Công Danh - Tài Chính - Ngoại Giao.`;

  // Career Orientation
  let careerOrientation = '';
  if (careerStars.some(s => ['Vũ Khúc', 'Thất Sát', 'Phá Quân'].includes(s.nameVi))) {
    careerOrientation = 'Thiên hướng lãnh đạo quyết liệt, tư duy hành động, phù hợp với điều hành doanh nghiệp, tài chính đầu tư, kỹ thuật công nghệ cao hoặc các dự án tiên phong.';
  } else if (careerStars.some(s => ['Thái Dương', 'Cự Môn', 'Thiên Tướng'].includes(s.nameVi))) {
    careerOrientation = 'Thiên hướng truyền thông, ngoại giao, đàm phán chiến lược, quản trị tổ chức hoặc các lĩnh vực đòi hỏi tầm ảnh hưởng xã hội và tư duy pháp lý.';
  } else if (careerStars.some(s => ['Thiên Cơ', 'Thái Âm', 'Thiên Lương', 'Thiên Đồng'].includes(s.nameVi))) {
    careerOrientation = 'Thiên hướng hoạch định mưu lược, cố vấn quản trị, nghiên cứu chuyên sâu, giáo dục, tài chính phân tích hoặc sáng tạo nghệ thuật.';
  } else {
    careerOrientation = 'Khả năng ứng biến đa năng, phát triển tốt trong môi trường linh hoạt, sáng tạo và tự chủ chuyên môn.';
  }

  // Wealth Pattern
  let wealthAccumulationPattern = '';
  if (wealthStars.some(s => ['Vũ Khúc', 'Thiên Phủ', 'Hóa Lộc'].includes(s.nameVi)) || wealth?.transformations.some(t => t.includes('Lộc'))) {
    wealthAccumulationPattern = 'Dòng tiền dồi dào, có năng khiếu tích lũy và mở rộng nguồn thu từ tài năng thực lực. Chiến lược quản lý dòng tiền bài bản sẽ bảo toàn tài sản vượt bậc.';
  } else if (wealthStars.some(s => ['Tham Lang', 'Phá Quân'].includes(s.nameVi))) {
    wealthAccumulationPattern = 'Có cơ hội đón nhận những đợt bứt phá tài chính bất ngờ từ các ý tưởng mới hoặc chu kỳ đầu tư mạo hiểm; cần giữ kỷ luật phân bổ vốn để kiểm soát rủi ro.';
  } else {
    wealthAccumulationPattern = 'Tích lũy tài chính theo lộ trình bền vững, đi lên từ chuyên môn và uy tín lao động, hạn chế đầu cơ rủi ro cao.';
  }

  return {
    majorStarsSummary,
    sanFangSiZhengSummary,
    tuanTrietImpact,
    careerOrientation,
    wealthAccumulationPattern,
    overallDestinyCore: `${majorStarsSummary} ${sanFangSiZhengSummary}`
  };
}

// 6. Xác định Đại Vận hiện tại dựa trên tuổi âm lịch
export function evaluateCurrentDecade(chart: ZiWeiChart, birthData: BirthData) {
  const currentYear = new Date().getFullYear();
  // Tuổi mụ âm lịch
  const lunarAge = currentYear - birthData.solarYear + 1;

  // Tìm cung đại vận chứa tuổi mụ này
  let matchedPalaceKey: PalaceKey = 'life';
  let matchedPalace = chart.palaces.life;

  for (const [key, p] of Object.entries(chart.palaces) as [PalaceKey, ZiWeiPalace][]) {
    if (p.startAge !== undefined && p.endAge !== undefined) {
      if (lunarAge >= p.startAge && lunarAge <= p.endAge) {
        matchedPalaceKey = key;
        matchedPalace = p;
        break;
      }
    }
  }

  const majorStarNames = matchedPalace?.majorStars.map(s => s.nameVi) || [];
  const starStr = majorStarNames.length > 0 ? majorStarNames.join(', ') : 'Vô Chính Diệu';

  const evaluation = `Đại Vận hiện tại (${matchedPalace?.decadeRangeStr || `${matchedPalace?.startAge || 30}-${matchedPalace?.endAge || 39}`} tuổi - đang ở tuổi ${lunarAge}) đang đóng tại Cung ${matchedPalace?.nameVi} (${STEMS[matchedPalace.stem]?.nameVi} ${BRANCHES[matchedPalace.branch]?.nameVi}). Tọa thủ chính tinh [${starStr}]. Đây là chu kỳ tập trung củng cố nền tảng ${matchedPalace?.focalTheme.toLowerCase()}, chuyển hóa nội lực thành thành tựu rõ nét.`;

  return {
    palaceKey: matchedPalaceKey,
    palaceName: matchedPalace?.nameVi || 'Mệnh',
    startAge: matchedPalace?.startAge || 30,
    endAge: matchedPalace?.endAge || 39,
    stem: matchedPalace?.stem || 'Jia',
    branch: matchedPalace?.branch || 'Zi',
    majorStars: majorStarNames,
    evaluation
  };
}

// 7. Lưu Niên năm nay
export function evaluateCurrentYearTransit(
  chart: ZiWeiChart,
  birthYearStem: HeavenlyStem,
  birthYearBranch: EarthlyBranch,
  targetYear?: number
) {
  const currentYear = targetYear || new Date().getFullYear();
  // Formula: year stem & branch (modulo arithmetic handling negative years)
  const stemIdx = ((currentYear - 4) % 10 + 10) % 10;
  const branchIdx = ((currentYear - 4) % 12 + 12) % 12;
  const currentStem = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'][stemIdx] as HeavenlyStem;
  const currentBranch = ['Zi', 'Chou', 'Yin_B', 'Mao', 'Chen', 'Si', 'Wu_B', 'Wei', 'Shen', 'You', 'Xu', 'Hai'][branchIdx] as EarthlyBranch;

  // Cung vị trên tinh bàn trùng với chi của năm phân tích
  const targetPalaceEntry = Object.entries(chart.palaces).find(([_, p]) => p.branch === currentBranch);
  const targetPalace = targetPalaceEntry ? targetPalaceEntry[1] : chart.palaces.life;
  const targetPalaceKey = (targetPalaceEntry ? targetPalaceEntry[0] : 'life') as PalaceKey;

  const summary = `Năm ${currentYear} (${STEMS[currentStem]?.nameVi} ${BRANCHES[currentBranch]?.nameVi}) tác động trực tiếp vào Cung ${targetPalace.nameVi} (${targetPalace.majorStars.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}). Năng lượng năm nay thúc đẩy tái cấu trúc và khai mở cơ hội trong lĩnh vực ${targetPalace.focalTheme.toLowerCase()}.`;

  return {
    year: currentYear,
    stem: currentStem,
    branch: currentBranch,
    palaceKey: targetPalaceKey,
    palaceName: targetPalace.nameVi,
    liuStars: [`Lưu Thái Tuế tại ${BRANCHES[currentBranch]?.nameVi}`, `Lưu Niên ${STEMS[currentStem]?.nameVi} ${BRANCHES[currentBranch]?.nameVi}`],
    summary
  };
}

// 8. Tổng hợp toàn bộ Báo cáo Luận giải Xác thực
export function generateAuthenticZiWeiReport(
  chart: ZiWeiChart,
  birthData: BirthData,
  yearStem: HeavenlyStem,
  yearBranch: EarthlyBranch,
  analysisYear?: number
): AuthenticZiWeiReport {
  const gender = birthData.gender === 'Female' ? 'Female' : 'Male';
  const yinYangGenderHarmony = evaluateYinYangGender(yearStem, gender);
  const elementDestinyBureauHarmony = evaluateElementAndBureau(yearStem, yearBranch, chart.elementBureau);
  const bodyPalace = chart.palaces[chart.bodyPalaceKey] || chart.palaces.career;
  const bodyPalaceAnalysis = evaluateBodyPalace(chart.bodyPalaceKey, bodyPalace);
  const thaiTueCircleAnalysis = evaluateThaiTueGroup(chart.palaces.life?.thaiTueStar);
  const lifeAndSanFang = evaluateLifePalaceAndSanFang(chart);
  const currentDecade = evaluateCurrentDecade(chart, birthData);
  const currentYearTransit = evaluateCurrentYearTransit(chart, yearStem, yearBranch, analysisYear);

  const strategicEmpowerment = [
    `Tận dụng thế mạnh tinh hoa của bộ sao Cung Mệnh [${chart.palaces.life?.majorStars.map(s => s.nameVi).join(', ') || 'Đặc tính uyển chuyển của Mệnh Vô Chính Diệu'}] để tạo dấu ấn chuyên môn riêng biệt.`,
    `Tương hợp ${elementDestinyBureauHarmony.relation} (${elementDestinyBureauHarmony.quality}): ${elementDestinyBureauHarmony.explanation.split('.')[0]}.`,
    `Tại đại vận tuổi ${currentDecade.startAge}-${currentDecade.endAge} (Cung ${currentDecade.palaceName}): Tập trung dồn lực thực thi vào các mục tiêu dài hạn, tránh dàn trải nguồn lực.`,
    `Tự chủ và làm chủ vận mệnh: Lá số là bản đồ các xu thế tiềm năng và thời vận; hành động kỷ luật, tư duy phản biện và năng lực thực thi của bạn mới là yếu tố quyết định thành công tối hậu.`
  ];

  return {
    yinYangGenderHarmony,
    elementDestinyBureauHarmony,
    bodyPalaceAnalysis,
    currentDecade,
    currentYearTransit,
    thaiTueCircleAnalysis,
    lifePalaceDeepDive: {
      majorStarsSummary: lifeAndSanFang.majorStarsSummary,
      sanFangSiZhengSummary: lifeAndSanFang.sanFangSiZhengSummary,
      tuanTrietImpact: lifeAndSanFang.tuanTrietImpact,
      overallDestinyCore: lifeAndSanFang.overallDestinyCore
    },
    careerAndWealthInsight: {
      careerOrientation: lifeAndSanFang.careerOrientation,
      wealthAccumulationPattern: lifeAndSanFang.wealthAccumulationPattern
    },
    strategicEmpowerment
  };
}
