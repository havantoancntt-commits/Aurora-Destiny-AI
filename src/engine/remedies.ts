// ==========================================
// DESTINY REMEDIES & FENG SHUI OPTIMIZATION ENGINE
// Actionable Dụng Thần, Chromatic, Spatial & Organ Wellness
// ==========================================

import {
  CalculationResult,
  FiveElement
} from '../types/destiny';
import { UserProfile } from '../types/user';
import { ELEMENT_RELATIONS, STEMS } from './canchi';

export interface RemedyColor {
  nameVi: string;
  hex: string;
  category: 'Trang phục & Phụ kiện' | 'Không gian sống & Xe cộ' | 'Điểm nhấn may mắn';
  usage: string;
}

export interface RemedyDirection {
  title: string;
  direction: string;
  element: FiveElement;
  significance: string;
  practicalAction: string;
}

export interface HolisticOrganCare {
  organ: string;
  element: FiveElement;
  sensitivities: string;
  dietaryTips: string[];
  wellnessHabits: string[];
  goldenHour: string;
}

export interface DestinyRemediesData {
  primaryFavorable: FiveElement;
  secondaryFavorable?: FiveElement;
  unfavorableElement: FiveElement;
  dayMasterSummary: string;
  whyThisRemedy: string;
  luckyNumbers: number[];
  recommendedColors: RemedyColor[];
  avoidColors: RemedyColor[];
  spatialDirections: RemedyDirection[];
  careerSectors: { title: string; element: FiveElement; description: string }[];
  organCare: HolisticOrganCare;
  spiritualVirtues: string[];
  fengShuiMaterials: { material: string; role: string; placement: string }[];
}

const ELEMENT_COLORS: Record<FiveElement, { nameVi: string; good: RemedyColor[]; avoid: RemedyColor[] }> = {
  Wood: {
    nameVi: 'Mộc (Sinh sôi, Tăng trưởng, Sáng tạo)',
    good: [
      { nameVi: 'Xanh Lá Cây / Lục Bảo', hex: '#10b981', category: 'Trang phục & Phụ kiện', usage: 'Trang phục thường nhật, cà vạt, trang sức ngọc bích, vòng cẩm thạch.' },
      { nameVi: 'Xanh Lam / Đen (Thủy sinh Mộc)', hex: '#0284c7', category: 'Không gian sống & Xe cộ', usage: 'Màu xe, rèm cửa, tranh phong cảnh sông nước, bể thủy sinh.' },
      { nameVi: 'Màu Gỗ Tự Nhiên / Nâu Trầm', hex: '#b45309', category: 'Điểm nhấn may mắn', usage: 'Bàn ghế gỗ mộc, vòng tay gỗ trầm hương, tượng gỗ nghệ thuật.' }
    ],
    avoid: [
      { nameVi: 'Trắng Sáng / Bạc Kim Loại (Kim khắc Mộc)', hex: '#f8fafc', category: 'Trang phục & Phụ kiện', usage: 'Hạn chế dùng quá nhiều phụ kiện kim loại sắc nhọn hoặc áo trắng toàn diện trong các sự kiện trọng đại.' }
    ]
  },
  Fire: {
    nameVi: 'Hỏa (Nhiệt huyết, Danh vọng, Tỏa sáng)',
    good: [
      { nameVi: 'Đỏ Ruby / Đỏ Mận', hex: '#e11d48', category: 'Trang phục & Phụ kiện', usage: 'Ví tiền, đồng hồ dây đỏ, áo khoác ấn tượng khi ký kết đàm phán.' },
      { nameVi: 'Cam San Hô / Hồng Thạch Anh', hex: '#f97316', category: 'Điểm nhấn may mắn', usage: 'Đá thạch anh tóc đỏ, đèn đá muối Himalaya, tranh mặt trời mọc.' },
      { nameVi: 'Xanh Lục (Mộc sinh Hỏa)', hex: '#16a34a', category: 'Không gian sống & Xe cộ', usage: 'Cây xanh đặt góc làm việc, sofa màu olive, tranh thảo nguyên.' }
    ],
    avoid: [
      { nameVi: 'Xanh Đậm / Đen Tuyền (Thủy khắc Hỏa)', hex: '#0f172a', category: 'Trang phục & Phụ kiện', usage: 'Tiết chế trang phục đen toàn tập khi đi đàm phán hoặc tham dự sự kiện thi cử.' }
    ]
  },
  Earth: {
    nameVi: 'Thổ (Vững chãi, Tích lũy, Điềm đạm)',
    good: [
      { nameVi: 'Vàng Hoàng Yến / Vàng Đất', hex: '#eab308', category: 'Trang phục & Phụ kiện', usage: 'Đồng hồ mặt vàng, trang phục vest kem/be, đá mắt hổ.' },
      { nameVi: 'Nâu Socola / Đất Nung', hex: '#78350f', category: 'Không gian sống & Xe cộ', usage: 'Nội thất gỗ óc chó, gốm sứ nghệ thuật Bát Tràng, sàn gạch men ấm.' },
      { nameVi: 'Đỏ / Hồng Phấn (Hỏa sinh Thổ)', hex: '#f43f5e', category: 'Điểm nhấn may mắn', usage: 'Khăn lụa đỏ, thạch anh tím, hoa tươi rực rỡ phòng khách.' }
    ],
    avoid: [
      { nameVi: 'Xanh Lá Đậm (Mộc khắc Thổ)', hex: '#15803d', category: 'Trang phục & Phụ kiện', usage: 'Hạn chế trang trí quá nhiều cây dây leo rậm rạp làm tiêu tán sinh khí của Thổ.' }
    ]
  },
  Metal: {
    nameVi: 'Kim (Quyết đoán, Tinh anh, Kỷ luật)',
    good: [
      { nameVi: 'Trắng Tuyết / Bạc Ánh Kim', hex: '#f1f5f9', category: 'Trang phục & Phụ kiện', usage: 'Sơ mi trắng thanh lịch, đồng hồ bạch kim, trang sức vàng trắng.' },
      { nameVi: 'Xám Khói / Titan', hex: '#64748b', category: 'Không gian sống & Xe cộ', usage: 'Màu xe hơi hiện đại, thiết bị công nghệ vỏ kim loại, tranh trừu tượng.' },
      { nameVi: 'Vàng Cát / Nâu Đất (Thổ sinh Kim)', hex: '#d97706', category: 'Điểm nhấn may mắn', usage: 'Túi xách màu nâu camel, đá thạch anh vàng Citrine tài lộc.' }
    ],
    avoid: [
      { nameVi: 'Đỏ Rực / Hồng Thắm (Hỏa khắc Kim)', hex: '#dc2626', category: 'Trang phục & Phụ kiện', usage: 'Tránh dùng xe hơi màu đỏ tươi hoặc sơn tường phòng làm việc màu nóng.' }
    ]
  },
  Water: {
    nameVi: 'Thủy (Linh hoạt, Trí tuệ, Giao thiệp)',
    good: [
      { nameVi: 'Xanh Dương Đậm / Xanh Biển Sâu', hex: '#2563eb', category: 'Trang phục & Phụ kiện', usage: 'Vest xanh navy, áo sơ mi lam nhạt, vòng đá Aquamarine.' },
      { nameVi: 'Đen Huyền Bí / Thạch Anh Đen', hex: '#09090b', category: 'Điểm nhấn may mắn', usage: 'Ví da đen, bút ký mực nước cao cấp, đá Tourmaline đen.' },
      { nameVi: 'Trắng Tinh Khiết / Ánh Kim (Kim sinh Thủy)', hex: '#f8fafc', category: 'Không gian sống & Xe cộ', usage: 'Chuông gió kim loại 6 thanh, tiểu cảnh nước tuần hoàn mini bàn làm việc.' }
    ],
    avoid: [
      { nameVi: 'Vàng Đậm / Nâu Đất (Thổ khắc Thủy)', hex: '#b45309', category: 'Trang phục & Phụ kiện', usage: 'Hạn chế đồ dùng màu đất sét đậm trong những ngày cần đưa ra quyết định sáng suốt.' }
    ]
  }
};

const ELEMENT_LUCKY_NUMBERS: Record<FiveElement, number[]> = {
  Wood: [3, 8, 1, 6],    // 3,8 Mộc; 1,6 Thủy sinh Mộc
  Fire: [2, 7, 3, 8],    // 2,7 Hỏa; 3,8 Mộc sinh Hỏa
  Earth: [5, 0, 2, 7],   // 5,0 Thổ; 2,7 Hỏa sinh Thổ
  Metal: [4, 9, 5, 0],   // 4,9 Kim; 5,0 Thổ sinh Kim
  Water: [1, 6, 4, 9],   // 1,6 Thủy; 4,9 Kim sinh Thủy
};

const ELEMENT_ORGAN_CARE: Record<FiveElement, HolisticOrganCare> = {
  Wood: {
    organ: 'Can & Đởm (Gan, Túi Mật, Hệ Gân Cơ, Mắt)',
    element: 'Wood',
    sensitivities: 'Dễ tích nhiệt ở gan khi thức khuya hoặc căng thẳng; khô mắt, mỏi cơ gáy.',
    dietaryTips: [
      'Bổ sung nhiều rau lá xanh đậm (cải bó xôi, súp lơ xanh, cần tây).',
      'Uống trà hoa cúc hoặc kỷ tử để mát gan sáng mắt.',
      'Hạn chế đồ uống có cồn và thực phẩm chiên xào nhiều dầu mỡ.'
    ],
    wellnessHabits: [
      'Đi ngủ trước 23h để gan hoàn thành chu trình thải độc tự nhiên.',
      'Tập kéo giãn cơ, yoga hoặc đi dạo trong công viên nhiều cây xanh.'
    ],
    goldenHour: '23h00 - 03h00 (Giờ Tý & Sửu - thời khắc gan mật tái tạo)'
  },
  Fire: {
    organ: 'Tâm & Tiểu Trường (Tim mạch, Tuần hoàn máu, Ruột non, Thần kinh)',
    element: 'Fire',
    sensitivities: 'Dễ hồi hộp, mất ngủ, huyết áp dao động khi lo âu hoặc làm việc quá độ.',
    dietaryTips: [
      'Ăn thực phẩm màu đỏ giàu chất chống oxy hóa: cà chua, táo đỏ, dâu tây, đậu đỏ.',
      'Uống trà tim sen hoặc táo nhân để dưỡng tâm an thần.',
      'Tránh ăn quá mặn và đồ ăn cay nồng kích thích tim đập nhanh.'
    ],
    wellnessHabits: [
      'Thiền định 15 phút vào buổi trưa để hạ hỏa, tĩnh tâm.',
      'Tập thở sâu theo nhịp 4-7-8 để điều hòa nhịp tim.'
    ],
    goldenHour: '11h00 - 13h00 (Giờ Ngọ - tâm kinh hoạt động mạnh nhất)'
  },
  Earth: {
    organ: 'Tỳ & Vị (Dạ dày, Hệ tiêu hóa, Lá lách, Cơ nhục)',
    element: 'Earth',
    sensitivities: 'Dễ trào ngược, chướng bụng, mệt mỏi cơ bắp khi suy nghĩ quá nhiều hoặc ăn uống thất thường.',
    dietaryTips: [
      'Ăn thực phẩm màu vàng và ngọt tự nhiên: khoai lang, bí đỏ, yến mạch, củ sen.',
      'Ưu tiên đồ ăn ấm nóng, mềm, dễ tiêu; tránh uống nước đá lạnh sau bữa ăn.',
      'Nhai kỹ no lâu, ăn đúng giờ giấc cố định.'
    ],
    wellnessHabits: [
      'Đi bộ chậm 15 phút sau bữa ăn để kích hoạt tỳ khí.',
      'Tránh làm việc trí óc căng thẳng ngay trong lúc ăn cơm.'
    ],
    goldenHour: '07h00 - 09h00 (Giờ Thìn - vị kinh hoạt động tối ưu để hấp thu dinh dưỡng)'
  },
  Metal: {
    organ: 'Phế & Đại Trường (Phổi, Đường hô hấp, Da lông, Ruột già)',
    element: 'Metal',
    sensitivities: 'Dễ viêm họng, khô da, ho dị ứng thời tiết khi giao mùa hoặc ở trong phòng máy lạnh liên tục.',
    dietaryTips: [
      'Bổ sung thực phẩm màu trắng thanh nhuận: lê tươi chưng đường phèn, nấm tuyết, củ cải trắng, hạnh nhân.',
      'Uống nhiều nước ấm để giữ độ ẩm cho niêm mạc phổi và làn da.',
      'Bổ sung chất xơ thực vật để đại tràng đào thải độc tố trơn tru.'
    ],
    wellnessHabits: [
      'Tập hít thở sâu ngoài trời vào sáng sớm để trao đổi khí tươi.',
      'Giữ ấm cổ họng và ngực khi trời trở lạnh.'
    ],
    goldenHour: '03h00 - 05h00 & 05h00 - 07h00 (Giờ Dần & Mão - phế khí và đại trường thải độc)'
  },
  Water: {
    organ: 'Thận & Bàng Quang (Thận, Hệ xương khớp, Tai, Tủy não)',
    element: 'Water',
    sensitivities: 'Dễ đau mỏi thắt lưng, lạnh bàn chân, ù tai, suy giảm sinh lực khi làm việc quá sức.',
    dietaryTips: [
      'Ăn thực phẩm màu đen bổ thận: đậu đen, mè đen, mộc nhĩ đen, gạo lứt tím.',
      'Uống đủ nước lọc ấm dàn trải trong ngày, tránh nhịn tiểu.',
      'Nấu súp xương hầm hoặc đông trùng hạ thảo để bồi bổ nguyên khí.'
    ],
    wellnessHabits: [
      'Ngâm chân nước ấm pha gừng và muối mỗi tối trước khi đi ngủ.',
      'Giữ ấm vùng thắt lưng và gan bàn chân (huyệt Dũng Tuyền).'
    ],
    goldenHour: '17h00 - 19h00 (Giờ Dậu - thận kinh lọc máu và nạp tinh khí)'
  }
};

export function generateDestinyRemedies(
  profile: UserProfile,
  calc: CalculationResult
): DestinyRemediesData {
  const favElements = calc.bazi?.favorableElements || ['Wood', 'Water'];
  const unfavElements = calc.bazi?.unfavorableElements || ['Metal'];
  const primaryFav = favElements[0] || 'Wood';
  const secondaryFav = favElements[1];
  const primaryUnfav = unfavElements[0] || 'Metal';

  const colorData = ELEMENT_COLORS[primaryFav] || ELEMENT_COLORS.Wood;
  const avoidData = ELEMENT_COLORS[primaryUnfav] || ELEMENT_COLORS.Metal;
  const luckyNumbers = ELEMENT_LUCKY_NUMBERS[primaryFav] || [3, 8, 1, 6];
  const organCare = ELEMENT_ORGAN_CARE[primaryFav] || ELEMENT_ORGAN_CARE.Wood;

  // Day Master
  const dmStem = calc.bazi?.dayMaster || 'Jia';
  const dmInfo = STEMS[dmStem] || STEMS.Jia;
  const dmStrength = calc.bazi?.dayMasterStrength || 'Balanced';

  // Spatial Directions
  const spatialDirections: RemedyDirection[] = [];
  if (primaryFav === 'Wood') {
    spatialDirections.push(
      { title: 'Hướng Bàn Làm Việc (Sinh Khí & Sáng Tạo)', direction: 'Đông & Đông Nam', element: 'Wood', significance: 'Hút khí Mộc sinh trưởng, giúp đầu óc minh mẫn, đưa ra chiến lược chính xác.', practicalAction: 'Kê bàn làm việc nhìn về hướng Đông/Đông Nam, đặt một chậu kim ngân hoặc trúc phát tài ở góc trái bàn.' },
      { title: 'Hướng Giường Ngủ (Dưỡng Sinh & Nạp Năng Lượng)', direction: 'Bắc (Thủy sinh Mộc)', element: 'Water', significance: 'Thủy sinh dưỡng Mộc, giúp giấc ngủ sâu và tái tạo tế bào gan.', practicalAction: 'Đầu giường quay về hướng Bắc, phòng ngủ dùng đèn ngủ ánh sáng vàng ấm dịu nhẹ.' },
      { title: 'Phương Vị Quý Nhân & Tài Lộc', direction: 'Đông Nam', element: 'Wood', significance: 'Góc tài lộc Tốn Mộc, kích hoạt cơ hội thăng tiến và doanh thu dồi dào.', practicalAction: 'Bố trí tủ sách hoặc vật phẩm phong thủy bằng gỗ quý tại cung Đông Nam phòng khách.' }
    );
  } else if (primaryFav === 'Fire') {
    spatialDirections.push(
      { title: 'Hướng Bàn Làm Việc (Danh Tiếng & Quyết Đoán)', direction: 'Nam (Chính Nam)', element: 'Fire', significance: 'Thu hút năng lượng Quang Minh, giúp khẳng định vị thế và uy tín lãnh đạo.', practicalAction: 'Ngồi làm việc hướng mặt về Nam, trên bàn thắp nến thơm hoặc để đèn bàn màu ấm.' },
      { title: 'Hướng Giường Ngủ (An Thần & Dưỡng Khí)', direction: 'Đông (Mộc sinh Hỏa)', element: 'Wood', significance: 'Mộc sinh Hỏa liên tục, tiếp thêm sinh lực cho một ngày mới tràn đầy nhiệt huyết.', practicalAction: 'Đầu giường quay về hướng Đông, dùng ga gối màu be nhạt hoặc hồng phấn.' },
      { title: 'Phương Vị Kích Hoạt Đào Hoa & Quý Nhân', direction: 'Nam', element: 'Fire', significance: 'Tăng cường sức hút cá nhân, thu hút đối tác và khách hàng lớn.', practicalAction: 'Đặt bình hoa tươi màu đỏ hoặc quả cầu thạch anh hồng tại góc Nam phòng làm việc.' }
    );
  } else if (primaryFav === 'Earth') {
    spatialDirections.push(
      { title: 'Hướng Bàn Làm Việc (Tích Tụ Tài Sản & Điềm Đạm)', direction: 'Đông Bắc & Tây Nam', element: 'Earth', significance: 'Khí Thổ vững chãi, giúp quản trị dòng tiền chặt chẽ và giữ vững thành quả.', practicalAction: 'Bàn làm việc tựa lưng vào tường vững chãi, nhìn về hướng Đông Bắc hoặc Tây Nam.' },
      { title: 'Hướng Giường Ngủ (Ổn Định Thân Tâm)', direction: 'Nam (Hỏa sinh Thổ)', element: 'Fire', significance: 'Hỏa sinh Thổ dưỡng tỳ vị, tiêu trừ âu lo và mệt mỏi thể chất.', practicalAction: 'Đầu giường quay về hướng Nam hoặc Tây Nam, giữ sàn phòng ngủ sạch sẽ, ấm áp.' },
      { title: 'Phương Vị Tụ Tài & Điền Sản', direction: 'Đông Bắc', element: 'Earth', significance: 'Cung Cấn Thổ chủ về tích lũy bất động sản và tài sản dài hạn.', practicalAction: 'Đặt đĩa thạch anh vàng hoặc tượng gốm phong thủy tinh xảo tại góc Đông Bắc.' }
    );
  } else if (primaryFav === 'Metal') {
    spatialDirections.push(
      { title: 'Hướng Bàn Làm Việc (Quyền Lực & Kỷ Luật Thép)', direction: 'Tây & Tây Bắc', element: 'Metal', significance: 'Khí Càn Kim mang lại sự sắc bén, quyết đoán trong đàm phán và chỉ huy.', practicalAction: 'Bàn làm việc nhìn về hướng Tây/Tây Bắc, sắp xếp tài liệu ngăn nắp, gọn gàng.' },
      { title: 'Hướng Giường Ngủ (Thanh Nhuận Hô Hấp)', direction: 'Tây Nam (Thổ sinh Kim)', element: 'Earth', significance: 'Thổ sinh Kim giúp nuôi dưỡng phế quản, tái tạo sức khỏe sau ngày dài làm việc.', practicalAction: 'Đầu giường quay về hướng Tây Nam hoặc Tây Bắc, không để đồ kim loại sắc nhọn gần giường.' },
      { title: 'Phương Vị Quý Nhân Lãnh Đạo', direction: 'Tây Bắc', element: 'Metal', significance: 'Cung Càn đại diện cho người đứng đầu, hỗ trợ gặp gỡ người đỡ đầu quyền lực.', practicalAction: 'Treo chuông gió kim loại 6 thanh hoặc đồng hồ quả lắc bằng đồng tại góc Tây Bắc.' }
    );
  } else {
    // Water
    spatialDirections.push(
      { title: 'Hướng Bàn Làm Việc (Trí Tuệ Đột Phá & Lưu Thông)', direction: 'Bắc (Chính Bắc)', element: 'Water', significance: 'Khí Thủy thông tuệ, giúp ứng biến linh hoạt và khơi thông các bế tắc kinh doanh.', practicalAction: 'Bàn làm việc nhìn về hướng Bắc, đặt một quả cầu thủy tinh hoặc đồng hồ cát nhỏ.' },
      { title: 'Hướng Giường Ngủ (Dưỡng Thận & Thư Thái Não Bộ)', direction: 'Tây Bắc (Kim sinh Thủy)', element: 'Metal', significance: 'Kim sinh dưỡng Thủy, giúp hệ thần kinh và thận khí được hồi phục tối đa.', practicalAction: 'Đầu giường quay về hướng Bắc hoặc Tây Bắc, sử dụng chăn gối lụa mềm mại màu xanh lam.' },
      { title: 'Phương Vị Tài Vận Lưu Thông', direction: 'Bắc', element: 'Water', significance: 'Cung Khảm Thủy chủ về dòng chảy tiền tệ và mạng lưới ngoại giao rộng mở.', practicalAction: 'Đặt bể cá mini cảnh quan hoặc phong thủy luân nước chảy róc rách tại góc Bắc.' }
    );
  }

  // Career Alignment
  const CAREER_MAP: Record<FiveElement, { title: string; element: FiveElement; description: string }[]> = {
    Wood: [
      { title: 'Giáo dục, Đào tạo & Khởi nghiệp Xanh', element: 'Wood', description: 'Trồng người, truyền thụ tri thức, nông nghiệp công nghệ cao, lâm nghiệp, xuất bản.' },
      { title: 'Y dược, Thảo dược & Chăm sóc Sức khỏe', element: 'Wood', description: 'Dược liệu tự nhiên, đông y dưỡng sinh, trị liệu tâm lý, làm vườn trị liệu.' },
      { title: 'Thiết kế, Nghệ thuật & Nội thất Gỗ', element: 'Wood', description: 'Kiến trúc xanh, thiết kế cảnh quan, sản xuất đồ gỗ mỹ nghệ và thời trang sợi tự nhiên.' }
    ],
    Fire: [
      { title: 'Công nghệ AI, Bán dẫn & Viễn thông', element: 'Fire', description: 'Trí tuệ nhân tạo, năng lượng mặt trời, viễn thông, mạng internet và công nghệ bán dẫn.' },
      { title: 'Truyền thông, Giải trí & Thương hiệu Cá nhân', element: 'Fire', description: 'Quan hệ công chúng (PR), tổ chức sự kiện, diễn giả, điện ảnh, nghệ thuật biểu diễn.' },
      { title: 'Nhà hàng, Ẩm thực & Khách sạn Cao cấp', element: 'Fire', description: 'Chế biến ẩm thực bếp lửa, dịch vụ ánh sáng sân khấu và khách sạn nghỉ dưỡng.' }
    ],
    Earth: [
      { title: 'Bất động sản, Điền sản & Xây dựng Cơ bản', element: 'Earth', description: 'Đầu tư địa ốc, quản lý tài sản hạ tầng, quy hoạch đô thị, vật liệu xây dựng, khai khoáng.' },
      { title: 'Nông sản, Gốm sứ & Lưu kho Logistics', element: 'Earth', description: 'Chuỗi cung ứng kho bãi, sản xuất gốm sứ nghệ thuật, bảo hiểm nhân thọ và trung tâm dữ liệu.' },
      { title: 'Tài chính Bảo chứng & Quản lý Quỹ Tín thác', element: 'Earth', description: 'Định giá tài sản, quản lý quỹ phòng hộ, trọng tài kinh tế và dịch vụ pháp lý bảo đảm.' }
    ],
    Metal: [
      { title: 'Tài chính Ngân hàng, Đầu tư & Chứng khoán', element: 'Metal', description: 'Giao dịch ngoại hối, phân tích tài chính vĩ mô, ngân hàng thương mại, bảo hiểm tài sản.' },
      { title: 'Cơ khí Chính xác, Hàng không & Tự động hóa', element: 'Metal', description: 'Chế tạo robot, công nghệ hàng không vũ trụ, gia công kim hoàn, vũ khí và công nghiệp ô tô.' },
      { title: 'Luật pháp, Quân đội & Giám định Chất lượng', element: 'Metal', description: 'Thẩm phán, luật sư tranh tụng, kiểm toán độc lập, an ninh quốc gia và tiêu chuẩn ISO.' }
    ],
    Water: [
      { title: 'Thương mại Quốc tế, Ngoại giao & Hàng hải', element: 'Water', description: 'Vận tải biển, xuất nhập khẩu đa quốc gia, quan hệ quốc tế, logistics toàn cầu.' },
      { title: 'Công nghệ Thông tin, Dữ liệu Số & Viễn thông', element: 'Water', description: 'Big Data, kỹ thuật điện toán đám mây, an ninh mạng, truyền dẫn số hóa.' },
      { title: 'Du lịch, Dịch vụ Lưu chuyển & Nước giải khát', element: 'Water', description: 'Lữ hành quốc tế, kinh doanh chuỗi cà phê/đồ uống, thủy sản và spa trị liệu nước.' }
    ]
  };

  const careerSectors = CAREER_MAP[primaryFav] || CAREER_MAP.Wood;

  // Feng Shui Materials
  const FENG_SHUI_MATERIALS: Record<FiveElement, { material: string; role: string; placement: string }[]> = {
    Wood: [
      { material: 'Cây xanh phong thủy (Kim Ngân, Trầu Bà, Trúc Phát Tài)', role: 'Tạo sinh khí Mộc tự nhiên, lọc sạch không khí và kích hoạt sáng tạo.', placement: 'Bàn làm việc hoặc cung Đông Nam phòng khách.' },
      { material: 'Vòng tay Trầm hương hoặc Gỗ Sưa đỏ', role: 'Mùi hương định tâm, trừ tà khí và thu hút tài lộc hanh thông.', placement: 'Đeo tay trái khi tham gia ký kết đối tác quan trọng.' }
    ],
    Fire: [
      { material: 'Đá thạch anh tím / đỏ hoặc Đèn đá muối Himalaya', role: 'Phát xạ ion âm và năng lượng ấm áp, nâng cao tần số thu hút danh vọng.', placement: 'Đặt tại góc Nam phòng làm việc hoặc kệ sách trang trọng.' },
      { material: 'Tranh Mã Đáo Thành Công hoặc Bình minh rực rỡ', role: 'Kích hoạt chí tiến thủ, lan tỏa hào quang và uy tín cá nhân.', placement: 'Treo trên tường phòng làm việc đối diện tầm mắt.' }
    ],
    Earth: [
      { material: 'Đá thạch anh vàng (Citrine) hoặc Thạch anh mắt hổ', role: 'Thu hút của cải, bảo vệ tài sản và tăng cường sự kiên định.', placement: 'Đặt trên két sắt hoặc góc Đông Bắc bàn làm việc.' },
      { material: 'Bình hoa gốm mộc tráng men tro cổ truyền', role: 'Tụ khí điền sản, đem lại sự hòa thuận và vững bền cho gia đạo.', placement: 'Trưng bày tại phòng khách hoặc sảnh chính.' }
    ],
    Metal: [
      { material: 'Chuông gió kim loại 6 thanh bằng đồng thanh khiết', role: 'Hóa giải các hung tinh, tạo âm vang đánh thức sự tập trung cao độ.', placement: 'Treo tại cung Tây Bắc hoặc cửa sổ có gió thoáng nhẹ.' },
      { material: 'Quả cầu kim loại hoặc tượng Tỳ Hưu bằng đồng mạ vàng', role: 'Chiêu tài nạp phúc, củng cố uy quyền lãnh đạo và tư duy sắc sảo.', placement: 'Đặt tại góc Tây hoặc trên bàn làm việc cá nhân.' }
    ],
    Water: [
      { material: 'Phong thủy luân (Thác nước tuần hoàn phong thủy mini)', role: 'Tạo dòng luân chuyển sinh tài khí, tiêu tán bế tắc năng lượng.', placement: 'Đặt tại cung Bắc phòng khách hoặc khu vực tiền sảnh.' },
      { material: 'Đá Obsidian đen hoặc Thạch anh tóc đen tự nhiên', role: 'Hấp thụ độc tố trường năng lượng tiêu cực, tăng cường trực giác sắc sảo.', placement: 'Mang theo người hoặc đặt góc bên trái bàn máy tính.' }
    ]
  };

  const fengShuiMaterials = FENG_SHUI_MATERIALS[primaryFav] || FENG_SHUI_MATERIALS.Wood;

  // Spiritual Virtues
  const spiritualVirtues = [
    `Tri mệnh để tạo mệnh: Nắm rõ điểm vượng khuyết của bản mệnh để không kiêu ngạo khi đắc thời và không nản lòng khi gặp khúc quanh.`,
    `Tích thiện dĩ phúc: Dành ít nhất một phần nhỏ tài lực và công sức mỗi tháng để giúp đỡ người yếu thế; phúc đức chính là lớp áo giáp phong thủy vững chắc nhất.`,
    `Tĩnh tâm dưỡng tuệ: Mỗi ngày dành 15-20 phút rời xa màn hình số để quán chiếu tâm mình, duy trì trạng thái cảm xúc an lạc và bao dung.`
  ];

  return {
    primaryFavorable: primaryFav,
    secondaryFavorable: secondaryFav,
    unfavorableElement: primaryUnfav,
    dayMasterSummary: `Nhật Chủ ${dmInfo.nameVi} (${dmInfo.nameEn}) ở trạng thái ${dmStrength}. Thể tạng và tinh thần cần được tiếp sức bởi hành ${ELEMENT_RELATIONS[primaryFav].vi}.`,
    whyThisRemedy: `Bát Tự của bạn có sự ưu tiên lớn nhất cho hành 【${ELEMENT_RELATIONS[primaryFav].vi}】 làm Dụng Thần điều hòa toàn bộ tứ trụ. Bổ sung năng lượng hành này giúp hóa giải áp lực của hành kỵ 【${ELEMENT_RELATIONS[primaryUnfav].vi}】, khơi thông dòng chảy tài lộc, nâng cao sức đề kháng và giữ gìn gia đạo bình an.`,
    luckyNumbers,
    recommendedColors: colorData.good,
    avoidColors: avoidData.avoid,
    spatialDirections,
    careerSectors,
    organCare,
    spiritualVirtues,
    fengShuiMaterials
  };
}
