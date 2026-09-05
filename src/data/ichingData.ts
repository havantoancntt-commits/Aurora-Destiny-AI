// ==========================================================
// 64 HEXAGRAMS OF I CHING (CHU DỊCH KINH & KHAI QUẺ TÂM LINH)
// Classical Oracle Data for Daily Celestial Divination
// ==========================================================

export interface IChingHexagram {
  id: number;
  nameVi: string;
  nameHan: string;
  pinyin: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string; // Thoán từ
  image: string; // Tượng từ
  fortuneLevel: 'Đại Cát' | 'Thượng Cát' | 'Trung Cát' | 'Bình Hòa' | 'Thận Trọng';
  summary: string;
  careerAdvice: string;
  wealthAdvice: string;
  relationshipAdvice: string;
  spiritualRemedy: string; // Lời khuyên tu dưỡng, tích đức khai vận
  favorableDirection: string;
  favorableHours: string;
  element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
}

export const SACRED_HEXAGRAMS: IChingHexagram[] = [
  {
    id: 1,
    nameVi: 'Thuần Càn (Càn Vi Thiên)',
    nameHan: '乾為天',
    pinyin: 'Qián',
    upperTrigram: 'Càn (Trời)',
    lowerTrigram: 'Càn (Trời)',
    judgment: 'Nguyên hanh lợi trinh. Rồng bay trên trời, thời vận đại hanh thông, chính trực ắt thành đại nghiệp.',
    image: 'Trời chuyển động mạnh mẽ, người quân tử noi theo đó mà tự cường không ngừng nghỉ.',
    fortuneLevel: 'Đại Cát',
    summary: 'Thời vận rực rỡ như rồng gặp mây, quý khí sung mãn, mọi quyết sách lớn đều được quý nhân tương trợ.',
    careerAdvice: 'Nắm bắt quyền lãnh đạo, mạnh dạn triển khai các dự án quy mô lớn, giữ vững uy tín và phong thái quân tử.',
    wealthAdvice: 'Tài chính thăng hoa, dòng tiền lưu thông dồi dào, thuận lợi ký kết các hợp đồng chiến lược.',
    relationshipAdvice: 'Gia đạo quang minh, nhân duyên tương kính như tân, được mọi người vị nể.',
    spiritualRemedy: 'Tùy hỷ cúng dường, phát tâm làm việc thiện, giữ lòng khiêm cung trước thời vận đỉnh cao.',
    favorableDirection: 'Tây Bắc (Cung Càn)',
    favorableHours: 'Giờ Thìn (07:00 - 09:00), Giờ Thân (15:00 - 17:00)',
    element: 'Kim'
  },
  {
    id: 11,
    nameVi: 'Địa Thiên Thái',
    nameHan: '地天泰',
    pinyin: 'Tài',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Càn (Trời)',
    judgment: 'Tiểu vãng đại lai, cát hanh. Tam dương khai thái, âm dương giao hòa, vạn vật tốt tươi.',
    image: 'Trời đất giao cảm sinh muôn loài, quân tử hòa hợp, tiểu nhân lui bước.',
    fortuneLevel: 'Đại Cát',
    summary: 'Quẻ Thái là quẻ thái bình thịnh vượng bậc nhất trong 64 quẻ, phúc khí ngập tràn, mưu sự tất thành.',
    careerAdvice: 'Thời cơ vàng để thăng tiến, mở rộng quan hệ đối tác và củng cố nền tảng vững chắc.',
    wealthAdvice: 'Tài lộc vào nhà từ nhiều nguồn, đầu tư thuận lợi, có của ăn của để.',
    relationshipAdvice: 'Tình cảm mặn nồng thấu hiểu, gia đình yên ấm hòa thuận, đón tin vui hỷ sự.',
    spiritualRemedy: 'Gieo duyên lộc phước, giúp đỡ người khó khăn, phóng sinh cầu an dưỡng đức.',
    favorableDirection: 'Tây Nam hoặc Tây Bắc',
    favorableHours: 'Giờ Tỵ (09:00 - 11:00), Giờ Mùi (13:00 - 15:00)',
    element: 'Thổ'
  },
  {
    id: 14,
    nameVi: 'Hỏa Thiên Đại Hữu',
    nameHan: '火天大有',
    pinyin: 'Dà Yǒu',
    upperTrigram: 'Ly (Lửa)',
    lowerTrigram: 'Càn (Trời)',
    judgment: 'Nguyên hanh. Ánh lửa rạng ngời trên bầu trời cao, sở hữu muôn sự tốt lành, dồi dào phúc đức.',
    image: 'Mặt trời chiếu soi muôn phương, phân định rõ thiện ác, đức độ bao trùm thiên hạ.',
    fortuneLevel: 'Đại Cát',
    summary: 'Ánh sáng trí tuệ và tài sản phong túc, được bề trên nâng đỡ, thanh danh vang dội.',
    careerAdvice: 'Tỏa sáng trong lĩnh vực chuyên môn, thích hợp công bố các thành quả nghiên cứu hoặc ra mắt sản phẩm.',
    wealthAdvice: 'Tích lũy tài sản chiến lược, bội thu từ những thương vụ đầu tư dài hạn.',
    relationshipAdvice: 'Được nhiều người mến mộ, tri âm tri kỷ hội ngộ, nhân duyên bền chặt.',
    spiritualRemedy: 'Chia sẻ ánh sáng tri thức, ủng hộ các công trình nghiên cứu và văn hóa tinh hoa.',
    favorableDirection: 'Chính Nam (Cung Ly)',
    favorableHours: 'Giờ Ngọ (11:00 - 13:00)',
    element: 'Hỏa'
  },
  {
    id: 15,
    nameVi: 'Địa Sơn Khiêm',
    nameHan: '地山謙',
    pinyin: 'Qiān',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Cấn (Núi)',
    judgment: 'Hanh, quân tử hữu chung. Núi cao nằm dưới lòng đất mẹ, lấy đức khiêm nhường làm gốc.',
    image: 'Đất bao bọc núi cao, người quân tử bớt chỗ thừa bù chỗ thiếu, phúc lộc tự nhiên tìm đến.',
    fortuneLevel: 'Thượng Cát',
    summary: 'Quẻ Khiêm là quẻ duy nhất trong Kinh Dịch cả 6 hào đều cát lợi! Càng khiêm nhường phúc khí càng sâu dày.',
    careerAdvice: 'Thành công lớn không tự phụ, lắng nghe ý kiến cộng sự, tích lũy nội lực bền bỉ.',
    wealthAdvice: 'Tài chính vững như bàn thạch, không màng danh lợi ảo, tiền tài tích tiểu thành đại.',
    relationshipAdvice: 'Nhẫn nhịn tạo nên hòa khí, nhân ái xoa dịu mọi xung đột, người người tôn kính.',
    spiritualRemedy: 'Hành thiện âm thầm không cầu khen ngợi, giữ tâm thanh tịnh bình an.',
    favorableDirection: 'Đông Bắc (Cung Cấn)',
    favorableHours: 'Giờ Dần (03:00 - 05:00), Giờ Thân (15:00 - 17:00)',
    element: 'Thổ'
  },
  {
    id: 42,
    nameVi: 'Phong Lôi Ích',
    nameHan: '風雷益',
    pinyin: 'Yì',
    upperTrigram: 'Tốn (Gió)',
    lowerTrigram: 'Chấn (Sấm)',
    judgment: 'Lợi hữu du vãng, lợi thiệp đại xuyên. Gió thổi sấm vang, tăng ích sinh sôi không ngừng.',
    image: 'Gió và sấm hỗ trợ lẫn nhau sinh dưỡng vạn vật, thấy điều thiện thì làm, thấy lỗi thì sửa.',
    fortuneLevel: 'Thượng Cát',
    summary: 'Khí vượng tăng trưởng mạnh mẽ, cơ hội gia tăng tài lộc và uy tín đang mở rộng cửa đón chào.',
    careerAdvice: 'Chủ động khởi xướng kế hoạch mới, hợp tác win-win, đón nhận sự trợ lực từ cấp trên.',
    wealthAdvice: 'Lợi nhuận gia tăng, các khoản đầu tư trước đây bắt đầu đơm hoa kết trái.',
    relationshipAdvice: 'Bạn bè quý nhân tương trợ, tình yêu nảy nở đơm hoa kết trái hạnh phúc.',
    spiritualRemedy: 'Gieo hạt mầm phước đức, bảo trợ tri thức thiện nguyện để phước lộc sinh sôi trường tồn.',
    favorableDirection: 'Đông Nam (Cung Tốn)',
    favorableHours: 'Giờ Mão (05:00 - 07:00), Giờ Thìn (07:00 - 09:00)',
    element: 'Mộc'
  },
  {
    id: 24,
    nameVi: 'Địa Lôi Phục',
    nameHan: '地雷復',
    pinyin: 'Fù',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Chấn (Sấm)',
    judgment: 'Hanh. Xuất nhập vô tật, bằng hữu lai vô cữu. Dương khí phục hồi sau đông tàn, xuân sắc tươi mới.',
    image: 'Sấm động trong lòng đất, một luồng sinh khí mới khởi sắc, kiên nhẫn từng bước đi lên.',
    fortuneLevel: 'Trung Cát',
    summary: 'Chuyển bại thành thắng, năng lượng tiêu cực dần tan biến, chu kỳ may mắn mới bắt đầu.',
    careerAdvice: 'Từng bước khởi động lại các dự án tạm hoãn, lắng nghe nhịp điệu tự nhiên, không nên nóng vội.',
    wealthAdvice: 'Dòng tiền có dấu hiệu hồi phục tích cực, hạn chế tiêu hoang để đón sóng lớn sắp tới.',
    relationshipAdvice: 'Gương vỡ lại lành, hóa giải hiểu lầm cũ, mở rộng lòng khoan dung.',
    spiritualRemedy: 'Thanh lọc không gian sống, thiền định thắp hương cầu an, tái tạo nguồn năng lượng tích cực.',
    favorableDirection: 'Chính Đông (Cung Chấn)',
    favorableHours: 'Giờ Tý (23:00 - 01:00), Giờ Mão (05:00 - 07:00)',
    element: 'Mộc'
  },
  {
    id: 8,
    nameVi: 'Thủy Địa Tỷ',
    nameHan: '水地比',
    pinyin: 'Bǐ',
    upperTrigram: 'Khảm (Nước)',
    lowerTrigram: 'Khôn (Đất)',
    judgment: 'Cát. Nguyên phệ, nguyên vĩnh trinh, vô cữu. Nước thấm đẫm vào lòng đất, tương thân tương ái.',
    image: 'Nước nằm trên đất tạo nên sự sống trù phú, gắn kết đồng tâm hiệp lực tạo kỳ tích.',
    fortuneLevel: 'Thượng Cát',
    summary: 'Quẻ Tỷ tượng trưng cho tình thân hữu, liên minh chiến lược và sự đoàn kết vững chắc.',
    careerAdvice: 'Tìm kiếm đối tác chung chí hướng, mở rộng mạng lưới quan hệ xã hội uy tín.',
    wealthAdvice: 'Cùng hợp tác kinh doanh có lời, chia sẻ lợi ích công bằng minh bạch.',
    relationshipAdvice: 'Tình cảm gắn kết keo sơn, tìm được bạn đồng hành đáng tin cậy trọn đời.',
    spiritualRemedy: 'Tùy hỷ cúng dường, thắt chặt mối lương duyên với các bậc thiện tri thức.',
    favorableDirection: 'Chính Bắc (Cung Khảm)',
    favorableHours: 'Giờ Hợi (21:00 - 23:00), Giờ Thìn (07:00 - 09:00)',
    element: 'Thủy'
  },
  {
    id: 63,
    nameVi: 'Thủy Hỏa Ký Tế',
    nameHan: '水火既濟',
    pinyin: 'Jì Jì',
    upperTrigram: 'Khảm (Nước)',
    lowerTrigram: 'Ly (Lửa)',
    judgment: 'Hanh tiểu, lợi trinh. Sơ cát chung loạn. Việc lớn đã thành, cần cẩn trọng gìn giữ trật tự.',
    image: 'Nước trên lửa dưới, nấu chín thức ăn nuôi dưỡng muôn loài, cần đề phòng lửa tàn nước cạn.',
    fortuneLevel: 'Trung Cát',
    summary: 'Giai đoạn thành tựu viên mãn, mọi việc đã vào quỹ đạo nhưng cần phòng ngừa sự buông lơi cảnh giác.',
    careerAdvice: 'Duy trì quy trình kiểm soát chất lượng nghiêm ngặt, bảo vệ thành quả đã đạt được.',
    wealthAdvice: 'Bảo toàn vốn, hạn chế đầu cơ mạo hiểm, trích lập quỹ dự phòng khẩn cấp.',
    relationshipAdvice: 'Duy trì sự quan tâm thường nhật, không để sự quen thuộc làm nhạt nhòa tình cảm.',
    spiritualRemedy: 'Tụng kinh niệm Phật, thiền định hồi hướng công đức, giữ tâm tĩnh lặng.',
    favorableDirection: 'Bắc và Nam',
    favorableHours: 'Giờ Ngọ (11:00 - 13:00), Giờ Tý (23:00 - 01:00)',
    element: 'Thủy'
  }
];

export const getRandomHexagram = (userSeed?: string): IChingHexagram => {
  const seedNum = userSeed
    ? Array.from(userSeed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : Date.now();
  const index = Math.floor(Math.abs(Math.sin(seedNum) * SACRED_HEXAGRAMS.length)) % SACRED_HEXAGRAMS.length;
  return SACRED_HEXAGRAMS[index] || SACRED_HEXAGRAMS[0];
};
