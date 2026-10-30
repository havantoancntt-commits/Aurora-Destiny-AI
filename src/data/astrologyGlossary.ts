// ==========================================
// AURORA DESTINY AI — CẨM NANG & TỪ ĐIỂN THUẬT NGỮ TINH HOA
// Comprehensive Metaphysical Glossary & Practical Life Guide
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================

export type GlossaryCategory = 'bazi' | 'ziwei_palaces' | 'ziwei_stars' | 'astronomy_rules';

export interface LifeMeaning {
  general: string;
  careerAndWealth: string;
  relationshipAndFamily: string;
}

export interface GlossaryItem {
  id: string;
  termVi: string;
  termEn: string;
  category: GlossaryCategory;
  categoryLabelVi: string;
  shortDefinition: string;
  lifeMeaning: LifeMeaning;
  actionableAdvice: string;
  example: string;
  keywords: string[];
  relatedTermIds?: string[];
}

export const ASTROLOGY_GLOSSARY: GlossaryItem[] = [
  {
    "id": "nhat_chu",
    "termVi": "Nhật Chủ (Thân Mệnh / Bản Thể)",
    "termEn": "Day Master (Core Self)",
    "category": "bazi",
    "categoryLabelVi": "Tứ Trụ Bát Tự",
    "shortDefinition": "Thiên Can của ngày sinh, đại diện cho bản thể cốt lõi, cái tôi sâu kín, tính cách và năng lượng nội tại của chính bạn.",
    "lifeMeaning": {
      "general": "Giống như hạt giống gốc rễ của một cái cây. Nếu Nhật Chủ là Mộc, bạn thích phát triển, nhân từ; nếu là Hỏa, bạn nhiệt huyết, sáng tạo; nếu là Thổ, bạn trầm tĩnh, bao dung; nếu là Kim, bạn sắc bén, kỷ luật; nếu là Thủy, bạn linh hoạt, thông tuệ.",
      "careerAndWealth": "Độ Vượng/Nhược của Nhật Chủ quyết định bạn có khả năng gánh vác các dự án khổng lồ và giữ được tài sản lớn hay cần mượn sức người khác (đồng đội, quý nhân).",
      "relationshipAndFamily": "Thể hiện cách bạn đối thoại với chính mình và bản ngã khi tương tác với người bạn đời."
    },
    "actionableAdvice": "Nếu Nhật Chủ Nhược: Cần bổ trợ ngũ hành của Ấn (học tập, giữ sức khỏe) và Tỷ Kiên (hợp tác bạn bè). Nếu Nhật Chủ Vượng: Cần xả bớt năng lượng qua Thực Thương (sáng tạo, cống hiến) và gánh Tài Quan.",
    "example": "Người có Nhật Chủ Đinh Hỏa vượng là người sáng rực rỡ, ấm áp, truyền cảm hứng cho người xung quanh, thích công việc nghệ thuật hoặc diễn thuyết.",
    "keywords": [
      "nhat chu",
      "day master",
      "than menh",
      "nguyen than",
      "ban the",
      "banh than"
    ]
  },
  {
    "id": "chinh_quan",
    "termVi": "Chính Quan",
    "termEn": "Direct Officer (Integrity & Governance)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của kỷ luật, danh tiếng, danh dự, trách nhiệm xã hội và đường quan lộ chính trực.",
    "lifeMeaning": {
      "general": "Đại diện cho tư cách đạo đức ngay thẳng, sự tôn trọng pháp luật và quy chuẩn xã hội.",
      "careerAndWealth": "Phù hợp làm nhà quản lý, công chức nhà nước, chuyên gia pháp chế, lãnh đạo doanh nghiệp đề cao uy tín và phát triển bền vững.",
      "relationshipAndFamily": "Với nữ mệnh, Chính Quan là người chồng đàng hoàng, có trách nhiệm, yêu thương và bảo bọc gia đình."
    },
    "actionableAdvice": "Phát huy tính kỷ luật và chữ tín. Tránh quá bảo thủ, câu nệ khuôn mẫu cũ khiến bỏ lỡ các cơ hội đổi mới.",
    "example": "Lá số có Chính Quan sáng sủa thường có lộ trình thăng tiến rõ ràng, được cấp trên tin cậy và cấp dưới kính trọng.",
    "keywords": [
      "chinh quan",
      "quan chuc",
      "danh tieng",
      "ky luat",
      "chong",
      "thang tien"
    ]
  },
  {
    "id": "that_sat",
    "termVi": "Thất Sát (Thiên Quan)",
    "termEn": "Seven Killings / Indirect Officer (Dynamic Authority)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của uy quyền thép, tinh thần tiên phong, sự can đảm, đột phá và khả năng vượt qua nghịch cảnh hiểm nghèo.",
    "lifeMeaning": {
      "general": "Tính cách mạnh mẽ, quyết đoán, dám nghĩ dám làm, không ngại đối đầu và luôn muốn tự mình làm chủ cục diện.",
      "careerAndWealth": "Thích hợp với khởi nghiệp, quân đội, công an, tư pháp, giải quyết khủng hoảng hoặc điều hành các doanh nghiệp trong giai đoạn sóng gió.",
      "relationshipAndFamily": "Cá tính độc lập đôi khi dễ lấn át đối phương, cần học cách lắng nghe và mềm mỏng hơn trong gia đình."
    },
    "actionableAdvice": "Cần có \"Ấn\" (trí tuệ) hoặc \"Thực Thần\" (sự khéo léo) để \"chế Sát\" — biến năng lượng xung kích thành uy quyền lãnh đạo, tránh nóng vội cực đoan.",
    "example": "Một vị tướng xông pha chiến trận hoặc một CEO sáng lập startup công nghệ đối mặt với nhiều rủi ro nhưng luôn lội ngược dòng thành công.",
    "keywords": [
      "that sat",
      "thien quan",
      "uy quyen",
      "quyet doan",
      "tien phong",
      "dot pha"
    ]
  },
  {
    "id": "chinh_tai",
    "termVi": "Chính Tài",
    "termEn": "Direct Wealth (Stable Assets & Hard Work)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Nguồn tài chính có được nhờ lao động chân chính, lương bổng đều đặn, tích lũy kiên trì và quản trị dòng tiền chặt chẽ.",
    "lifeMeaning": {
      "general": "Tượng trưng cho sự cần cù, thực tế, quý trọng đồng tiền và tôn trọng sự an toàn tài chính.",
      "careerAndWealth": "Kiếm tiền từ chuyên môn, kinh doanh truyền thống, tích lũy tài sản dài hạn qua bất động sản hoặc tiết kiệm định kỳ.",
      "relationshipAndFamily": "Với nam mệnh, Chính Tài đại diện cho người vợ hiền thục, chu đáo, biết vun vén chi tiêu cho tổ ấm."
    },
    "actionableAdvice": "Duy trì kỷ luật tài chính nhưng đừng quá tiết kiệm đến mức khắt khe với bản thân hoặc bỏ lỡ cơ hội đầu tư tái sinh lợi nhuận.",
    "example": "Chuyên gia nhận mức lương cao ổn định cùng các khoản thu nhập định kỳ từ cổ tức, không ham lướt sóng may rủi.",
    "keywords": [
      "chinh tai",
      "tien luong",
      "tich luy",
      "vo",
      "tai san on dinh"
    ]
  },
  {
    "id": "thien_tai",
    "termVi": "Thiên Tài",
    "termEn": "Indirect Wealth (Windfall & Entrepreneurship)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Tài lộc bất ngờ, nguồn tiền từ đầu tư, kinh doanh nhạy bén, thương mại lớn và các cơ hội ngoài dự kiến.",
    "lifeMeaning": {
      "general": "Con người hào sảng, mắt nhìn nhạy bén với cơ hội thị trường, có máu kinh doanh và giao thiệp rộng rãi.",
      "careerAndWealth": "Phù hợp đầu tư tài chính, chứng khoán, bất động sản thương mại, thương mại quốc tế hoặc các dự án có quy mô bùng nổ.",
      "relationshipAndFamily": "Hào phóng, thích chiêu đãi bạn bè, đôi khi cần giữ ranh giới tài chính để bảo toàn ngân sách gia đình."
    },
    "actionableAdvice": "Khi gặp vận Thiên Tài tốt cần biết điểm dừng để chốt lời, chuyển hóa một phần lợi nhuận sang Chính Tài (tài sản kiên cố).",
    "example": "Một nhà đầu tư nhạy bén chớp thời cơ mua vào tài sản lúc đáy thị trường và thu về khoản lợi nhuận lớn sau đó.",
    "keywords": [
      "thien tai",
      "dau tu",
      "kinh doanh",
      "tai loc bat ngo",
      "co hoi"
    ]
  },
  {
    "id": "chinh_an",
    "termVi": "Chính Ấn",
    "termEn": "Direct Resource (Wisdom, Protection & Learning)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của phúc đức tổ tiên, học vấn uyên thâm, lòng từ bi, sự chở che bảo bọc và quý nhân phù trợ.",
    "lifeMeaning": {
      "general": "Người có tâm tính thiện lành, thích đọc sách, ham học hỏi, sống hướng thiện và luôn được người đi trước giúp đỡ.",
      "careerAndWealth": "Rất tốt cho nghiên cứu, giảng dạy, học thuật, y tế, văn hóa, xuất bản và các vị trí cố vấn chiến lược.",
      "relationshipAndFamily": "Đại diện cho người mẹ hiền từ, dòng họ gia phong nề nếp, luôn mang lại chỗ dựa tinh thần bình an."
    },
    "actionableAdvice": "Biến tri thức thành hành động thực tế. Đừng chỉ thu nạp kiến thức mà quên áp dụng vào tạo dựng giá trị cuộc sống.",
    "example": "Giáo sư, bác sĩ hoặc học giả được xã hội tôn kính, thường được cấp bằng khen, học vị và danh tiếng cao quý.",
    "keywords": [
      "chinh an",
      "hoc van",
      "tri tue",
      "me",
      "quy nhan",
      "tu bi"
    ]
  },
  {
    "id": "kieu_than",
    "termVi": "Thiên Ấn (Kiêu Thần)",
    "termEn": "Indirect Resource (Intuition & Metaphysics)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của trực giác thiên bẩm, tư duy dị biệt, trí tưởng tượng phong phú, nghệ thuật và huyền học.",
    "lifeMeaning": {
      "general": "Tư duy độc đáo, có năng khiếu sâu sắc về tâm linh, triết học, chiêm tinh, nghệ thuật trừu tượng hoặc công nghệ sáng tạo.",
      "careerAndWealth": "Thành công rực rỡ trong các ngành nghề phi truyền thống: AI, thiết kế độc bản, nghiên cứu chuyên sâu, tâm lý học trị liệu.",
      "relationshipAndFamily": "Thích không gian riêng tư, đôi khi khép kín nội tâm, cần người đồng điệu thấu hiểu chiều sâu suy nghĩ."
    },
    "actionableAdvice": "Tin tưởng vào linh cảm và trực giác của mình nhưng cần kiểm chứng lại bằng số liệu thực tế trước khi ra quyết định lớn.",
    "example": "Nhà phát minh sáng tạo giải pháp công nghệ chưa từng có, hoặc chuyên gia tâm lý thấu suốt nội tâm người khác chỉ qua ánh mắt.",
    "keywords": [
      "thien an",
      "kieu than",
      "truc giac",
      "sang tao",
      "tam linh",
      "nghe thuat"
    ]
  },
  {
    "id": "thuc_than",
    "termVi": "Thực Thần",
    "termEn": "Eating God (Prosperity, Joy & Eloquence)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của phúc lộc tự nhiên, sự thư thái, năng khiếu ẩm thực, tài ăn nói duyên dáng và tận hưởng cuộc sống.",
    "lifeMeaning": {
      "general": "Người hiền hòa, phúc hậu, yêu cái đẹp, giỏi giao tiếp, luôn mang lại tiếng cười và niềm vui cho mọi người.",
      "careerAndWealth": "Phù hợp ngành dịch vụ ẩm thực, giải trí, truyền thông, marketing, sáng tạo nội dung và chăm sóc khách hàng.",
      "relationshipAndFamily": "Gia đạo êm ấm, con cái hiếu thảo thông minh, cuộc sống thường no ấm và không phải lo lắng thái quá về cái ăn cái mặc."
    },
    "actionableAdvice": "Thực Thần sinh Tài — hãy dùng tài năng ăn nói, sự sáng tạo và phong cách hòa nhã để mở rộng mạng lưới kinh doanh.",
    "example": "Chủ nhà hàng nổi tiếng hoặc chuyên gia tư vấn thương hiệu được mọi người yêu mến vì sự thân thiện và khẩu vị tinh tế.",
    "keywords": [
      "thuc than",
      "phuc loc",
      "khau tai",
      "am thuc",
      "an lac",
      "con cai"
    ]
  },
  {
    "id": "thuong_quan",
    "termVi": "Thương Quan",
    "termEn": "Hurting Officer (Expressive Talent & Revolution)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Ngôi sao của tài năng vượt trội, tài ứng biến siêu phàm, tư duy phản biện, tinh thần đổi mới và khát vọng tự do.",
    "lifeMeaning": {
      "general": "Thông minh kiệt xuất, phản xạ cực nhanh, không chấp nhận sự rập khuôn, luôn tìm kiếm cách làm đột phá hơn.",
      "careerAndWealth": "Rất tỏa sáng trong biểu diễn nghệ thuật, tranh biện, luật sư, thiết kế đồ họa, marketing sắc bén hoặc lãnh đạo cách tân.",
      "relationshipAndFamily": "Lời nói sắc bén đôi khi dễ làm tổn thương người thân nếu không kiềm chế cảm xúc trong lúc nóng giận."
    },
    "actionableAdvice": "Uốn lưỡi bảy lần trước khi nói. Dùng tài năng để nâng đỡ người khác thay vì chỉ trích sai sót của họ.",
    "example": "Nhạc sĩ sáng tác những bản hit lay động lòng người, hoặc diễn giả nổi tiếng với những bài diễn thuyết bùng nổ năng lượng.",
    "keywords": [
      "thuong quan",
      "tai nang",
      "phan bien",
      "ung bien",
      "nghe si",
      "tu do"
    ]
  },
  {
    "id": "ty_kien_kiep_tai",
    "termVi": "Tỷ Kiên & Kiếp Tài",
    "termEn": "Friend & Rob Wealth (Peers & Competitive Drive)",
    "category": "bazi",
    "categoryLabelVi": "Thập Thần Bát Tự",
    "shortDefinition": "Tỷ Kiên là bạn bè đồng chí, ý chí độc lập; Kiếp Tài là sự cạnh tranh, liều lĩnh, sẵn sàng tranh đoạt mục tiêu lớn.",
    "lifeMeaning": {
      "general": "Tỷ Kiên giúp bạn kiên định, tự đứng trên đôi chân mình. Kiếp Tài mang lại bản lĩnh dấn thân, không sợ thất bại.",
      "careerAndWealth": "Giúp xây dựng đội ngũ hùng hậu. Tuy nhiên nếu Kiếp Tài quá mạnh có thể dễ bị bạn bè vay mượn mất tiền hoặc chia sẻ lợi nhuận.",
      "relationshipAndFamily": "Anh chị em gắn bó nhưng cần minh bạch về mặt tiền bạc và tài sản chung để tránh tranh chấp."
    },
    "actionableAdvice": "Minh bạch hợp đồng bằng văn bản khi hợp tác kinh doanh với bạn bè hoặc người thân trong gia đình.",
    "example": "Hợp tác mở công ty cùng nhóm bạn thân, trong đó mỗi người phụ trách một mảng chuyên môn và cùng nhau vượt qua khó khăn.",
    "keywords": [
      "ty kien",
      "kiep tai",
      "ban be",
      "dong nghiep",
      "canh tranh",
      "y chi"
    ]
  },
  {
    "id": "dung_than_hy_than",
    "termVi": "Dụng Thần & Hỷ Thần",
    "termEn": "Useful God & Favorable Element (Balancing Factor)",
    "category": "bazi",
    "categoryLabelVi": "Tứ Trụ Bát Tự",
    "shortDefinition": "Hành ngũ hành mang tính chìa khóa giải cứu, giúp cân bằng lại sự lệch pha năng lượng của 8 chữ trong lá số.",
    "lifeMeaning": {
      "general": "Giống như liều thuốc giải đúng bệnh. Ví dụ lá số quá lạnh (nhiều Thủy/Kim) cần Dụng Thần Hỏa để sưởi ấm; lá số quá khô cháy cần Thủy để tưới tắm.",
      "careerAndWealth": "Chọn đúng ngành nghề, đối tác và thời điểm tương ứng với Dụng Thần sẽ giúp công việc hanh thông gấp nhiều lần.",
      "relationshipAndFamily": "Màu sắc trang phục, phương hướng nhà ở, chế độ ăn uống bổ trợ hành Dụng Thần giúp tăng cường sinh khí và tài lộc."
    },
    "actionableAdvice": "Tập trung kích hoạt Dụng Thần hàng ngày thông qua phương vị làm việc (Đông/Tây/Nam/Bắc), màu sắc trang phục và lối sống lành mạnh.",
    "example": "Người có Dụng Thần Mộc nên trồng cây xanh, mặc màu xanh lá, làm việc ở hướng Đông và duy trì lối sống thiện lương, bao dung.",
    "keywords": [
      "dung than",
      "hy than",
      "can bang",
      "ngu hanh",
      "phong thuy",
      "bo khuyet"
    ]
  },
  {
    "id": "cung_menh",
    "termVi": "Cung Mệnh",
    "termEn": "Life Palace (Essence & Destiny)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Cung quan trọng số 1 trên lá số, quản lý tính cách gốc, diện mạo, tư chất bẩm sinh, tiềm năng và quỹ đạo cuộc đời.",
    "lifeMeaning": {
      "general": "Là hạt nhân phản ánh \"Bạn là ai\" trong vũ trụ này. Các sao tọa thủ ở cung Mệnh định hình cách bạn tư duy, phản ứng và cảm nhận hạnh phúc.",
      "careerAndWealth": "Quyết định bạn là nhà lãnh đạo chỉ huy, học giả nghiên cứu, nghệ sĩ sáng tạo hay thương gia nhạy bén.",
      "relationshipAndFamily": "Tâm thế đối đãi với cuộc đời, sức bền tinh thần khi đối mặt với nghịch cảnh."
    },
    "actionableAdvice": "Hiểu rõ các sao cung Mệnh để sống đúng với bản chất thật của mình, không gồng ép bản thân trở thành khuôn mẫu của người khác.",
    "example": "Mệnh có sao Tử Vi thì có cốt cách uy nghiêm, thích tự chủ; Mệnh có Thiên Cơ thì đầu óc tính toán mưu lược khôn lường.",
    "keywords": [
      "cung menh",
      "life palace",
      "ban menh",
      "tinh cach",
      "cot cach"
    ]
  },
  {
    "id": "cung_than",
    "termVi": "Cung Thân (Hậu Vận & Hành Động)",
    "termEn": "Body Palace (Post-30 Destiny & Action)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Chi phối giai đoạn từ sau tuổi 30 trở đi, phản ánh hành động thực tế, thói quen và nơi bạn dốc trọn tâm sức cuộc đời.",
    "lifeMeaning": {
      "general": "Mệnh sinh ra là trời định, nhưng Thân là do bạn nỗ lực tu dưỡng và lựa chọn. Cung Thân ký gửi vào đâu, tâm niệm cả đời bạn sẽ hướng về đó.",
      "careerAndWealth": "Thân cư Quan Lộc: Coi sự nghiệp là lẽ sống. Thân cư Tài Bạch: Rất giỏi kiếm tiền và nhạy cảm dòng tiền. Thân cư Thiên Di: Thích đi xa, ngoại giao bôn ba.",
      "relationshipAndFamily": "Thân cư Phu Thê: Rất yêu thương và xem trọng người bạn đời. Thân cư Phúc Đức: Tìm kiếm sự bình an trong tâm hồn và thờ cúng tổ tiên."
    },
    "actionableAdvice": "Quan sát cung Thân để biết hướng đi chuyển biến của nửa sau cuộc đời nhằm chủ động chuẩn bị kỹ năng và tài chính tích lũy.",
    "example": "Mệnh hiền hòa nhưng Thân cư Tài Bạch có Vũ Khúc: Càng về sau càng trở nên quyết đoán, thực tế và giàu có nhờ kinh doanh.",
    "keywords": [
      "cung than",
      "body palace",
      "hau van",
      "sau 30 tuoi",
      "tam niem"
    ]
  },
  {
    "id": "cung_tai_bach",
    "termVi": "Cung Tài Bạch",
    "termEn": "Wealth Palace (Money Flow & Cash Management)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Phản ánh dòng tiền, cách thức bạn kiếm tiền, thái độ đối với của cải vật chất và năng lực quản lý tài chính.",
    "lifeMeaning": {
      "general": "Không chỉ cho biết bạn có giàu hay không, mà quan trọng hơn là tiền đến từ con đường nào (lương, kinh doanh, đầu tư, nghề tay trái).",
      "careerAndWealth": "Sao tài tinh đắc địa (Vũ Khúc, Thiên Phủ, Thái Âm) cho thấy tài vận hưng vượng, tích lũy vững chắc; gặp Kỵ tinh hoặc sát tinh thì tiền vào ra liên tục.",
      "relationshipAndFamily": "Cách bạn chi tiêu cho người thân và việc quản lý ngân sách trong gia đình."
    },
    "actionableAdvice": "Nếu Tài Bạch có sao biến động, hãy tập thói quen chuyển tiền mặt thành tài sản cố định (nhà đất, vàng) ngay khi có lợi nhuận để tránh tiêu hao.",
    "example": "Cung Tài có sao Hóa Lộc thì lộc tiền tài tự tìm đến; có Thiên Phủ thì như két sắt giữ tiền vững chãi không bị thất thoát.",
    "keywords": [
      "cung tai bach",
      "wealth palace",
      "kiem tien",
      "dong tien",
      "tai san",
      "giau co"
    ]
  },
  {
    "id": "cung_quan_loc",
    "termVi": "Cung Quan Lộc",
    "termEn": "Career Palace (Vocation & Public Status)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Phản ánh con đường học vấn, chức vụ, sự nghiệp, môi trường làm việc và danh vị xã hội của bạn.",
    "lifeMeaning": {
      "general": "Thể hiện bạn phù hợp làm việc trong cơ quan nhà nước, tập đoàn đa quốc gia, làm việc tự do (freelance) hay làm chủ doanh nghiệp.",
      "careerAndWealth": "Chính tinh sáng sủa (Thái Dương, Tử Vi, Thiên Tướng) báo hiệu danh vọng cao, được cấp dưới kính nể và có vị trí lãnh đạo then chốt.",
      "relationshipAndFamily": "Tác động gián tiếp đến thời gian bạn dành cho gia đình so với công việc ngoài xã hội."
    },
    "actionableAdvice": "Chọn nghề nghiệp đúng theo tính chất của các sao trong cung Quan Lộc để công việc giống như cá gặp nước, thuận theo sở trường.",
    "example": "Quan Lộc có Cự Môn Hóa Khoa: Rất giỏi làm luật sư, giảng viên đại học hoặc chuyên gia quan hệ công chúng (PR).",
    "keywords": [
      "cung quan loc",
      "career palace",
      "su nghiep",
      "chuc vu",
      "hoc van",
      "thang tien"
    ]
  },
  {
    "id": "cung_phu_the",
    "termVi": "Cung Phu Thê",
    "termEn": "Spouse Palace (Marriage & Partnership)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Phản ánh đặc điểm của người bạn đời, duyên nợ hôn nhân, sự hòa hợp trong tình cảm và cách đối xử giữa vợ chồng.",
    "lifeMeaning": {
      "general": "Cho thấy tính cách, diện mạo và hoàn cảnh gia đình của nửa kia, cũng như những giai đoạn thử thách hay mặn nồng trong hôn nhân.",
      "careerAndWealth": "Người bạn đời có thể là quý nhân trợ lực lớn cho sự nghiệp của bạn nếu cung Phu Thê có cát tinh hội chiếu.",
      "relationshipAndFamily": "Biết trước những điểm bất đồng để nhường nhịn, thấu hiểu và cùng nhau xây đắp tổ ấm bền vững."
    },
    "actionableAdvice": "Hôn nhân là sự bù trừ. Nếu cung Phu Thê có sao nóng nảy (Thất Sát, Hỏa Tinh), hãy lấy sự dịu dàng và lắng nghe để dung hòa.",
    "example": "Phu Thê có Thiên Cơ Hóa Lộc: Người bạn đời rất thông minh, hoạt bát và mang lại nhiều may mắn tài lộc cho gia đình.",
    "keywords": [
      "cung phu the",
      "spouse palace",
      "hon nhan",
      "vo chong",
      "tinh duyen"
    ]
  },
  {
    "id": "cung_phuc_duc",
    "termVi": "Cung Phúc Đức",
    "termEn": "Ancestral Blessing Palace (Mental Peace & Longevity)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Cung linh hồn của lá số, phản ánh phúc ấm dòng họ, đời sống nội tâm, sự thanh thản, tuổi thọ và khả năng hóa giải tai ách.",
    "lifeMeaning": {
      "general": "Cung Mệnh tốt không bằng Cung Phúc tốt. Phúc Đức đẹp giúp bạn dù gặp hoạn nạn cũng có quý nhân cứu trợ, đầu óc luôn lạc quan an yên.",
      "careerAndWealth": "Quyết định việc bạn có được hưởng thành quả lao động của mình trong thanh thản hay giàu mà luôn lo âu, stress.",
      "relationshipAndFamily": "Mối liên kết tâm linh với tổ tiên, mồ mả ông bà và sự thịnh vượng của toàn bộ gia tộc."
    },
    "actionableAdvice": "Tích cực làm việc thiện, hiếu kính cha mẹ và giữ tâm an lạc là cách tốt nhất để bồi đắp năng lượng cho cung Phúc Đức.",
    "example": "Phúc Đức có Thiên Đồng, Thiên Lương: Cả đời tâm hồn thư thái, không lo cơm áo, tuổi thọ cao và con cháu hiếu thảo.",
    "keywords": [
      "cung phuc duc",
      "phuc bao",
      "to tien",
      "tam an",
      "tuoi tho",
      "binh an"
    ]
  },
  {
    "id": "cung_thien_di",
    "termVi": "Cung Thiên Di",
    "termEn": "Travel & Migration Palace (Outward Social Matrix)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Xung chiếu trực tiếp với cung Mệnh, phản ánh vận may khi đi xa, khả năng giao tiếp xã hội, xuất ngoại và môi trường bên ngoài.",
    "lifeMeaning": {
      "general": "Cho biết bạn ở quê nhà tốt hơn hay đi xa lập nghiệp, định cư nước ngoài sẽ phát huy tối đa tài năng.",
      "careerAndWealth": "Thiên Di có quý tinh chiếu Mệnh: Ra ngoài bước chân là gặp quý nhân nâng đỡ, làm ăn buôn bán với người ngoài rất thuận lợi.",
      "relationshipAndFamily": "Các chuyến công tác, du lịch và cách xã hội bên ngoài nhìn nhận, đánh giá về bạn."
    },
    "actionableAdvice": "Nếu Thiên Di đẹp hơn Mệnh, đừng ngần ngại bước ra khỏi vùng an toàn, đi xa lập nghiệp để mở ra chân trời mới.",
    "example": "Thiên Di có Tả Phù, Hữu Bật, Hóa Lộc: Ra nước ngoài du học hoặc làm việc cho công ty đa quốc gia gặt hái thành công vang dội.",
    "keywords": [
      "cung thien di",
      "travel palace",
      "di xa",
      "xuat ngoai",
      "ngoai giao",
      "quy nhan"
    ]
  },
  {
    "id": "cung_dien_trach",
    "termVi": "Cung Điền Trạch",
    "termEn": "Property Palace (Real Estate & Sanctuary)",
    "category": "ziwei_palaces",
    "categoryLabelVi": "12 Cung Tử Vi",
    "shortDefinition": "Quản lý đất đai, nhà ở, bất động sản, cơ ngơi tích lũy dài hạn và phong thủy không gian sống.",
    "lifeMeaning": {
      "general": "Cho biết khả năng mua nhà, kế thừa tài sản của tổ tiên để lại và không khí hòa thuận trong ngôi nhà bạn ở.",
      "careerAndWealth": "Cát tinh (Vũ Khúc, Thiên Phủ, Hóa Lộc) ở Điền Trạch báo hiệu sở hữu nhiều bất động sản, đất đai gia tăng giá trị theo thời gian.",
      "relationshipAndFamily": "Ngôi nhà là nơi tái tạo năng lượng; phong thủy nhà ở an lành giúp gia đạo ấm êm và các thành viên khỏe mạnh."
    },
    "actionableAdvice": "Đầu tư vào không gian sống gọn gàng, đón ánh sáng tự nhiên để tăng vượng khí cho gia đình.",
    "example": "Điền Trạch có Thái Âm miếu địa: Sở hữu nhà đất khang trang, có duyên kinh doanh nhà xưởng hoặc cho thuê căn hộ sinh lời.",
    "keywords": [
      "cung dien trach",
      "property palace",
      "nha o",
      "bat dong san",
      "dat dai",
      "co ngoi"
    ]
  },
  {
    "id": "sao_tu_vi",
    "termVi": "Sao Tử Vi (Đế Tinh)",
    "termEn": "Zi Wei (The Emperor Star)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Chúa tể của muôn sao, đại diện cho phẩm chất đế vương, uy quyền lãnh đạo, sự tự tôn cao quý và năng lực điều hành.",
    "lifeMeaning": {
      "general": "Người có sao Tử Vi thường có phong thái đĩnh đạc, đàng hoàng, có lòng tự trọng cao và khát khao đứng ở vị trí dẫn đầu.",
      "careerAndWealth": "Rất thích hợp làm lãnh đạo, người đứng đầu tổ chức, chủ tịch hội đồng quản trị hoặc các ngành quản lý cấp cao.",
      "relationshipAndFamily": "Có xu hướng che chở, bao bọc cho người thân nhưng đôi khi gia trưởng nếu không biết lắng nghe."
    },
    "actionableAdvice": "Tử Vi cần có \"Tả Phù - Hữu Bật\" (quần thần phò tá) — hãy xây dựng đội ngũ cộng sự đắc lực thay vì ôm đồm đơn độc.",
    "example": "Một nhà lãnh đạo có tầm nhìn xa trông rộng, luôn bình tĩnh đưa ra quyết sách sáng suốt dẫn dắt cả tập đoàn.",
    "keywords": [
      "tu vi",
      "de tinh",
      "lanh dao",
      "uy quyen",
      "tu ton",
      "emperor"
    ]
  },
  {
    "id": "sao_thien_phu",
    "termVi": "Sao Thiên Phủ (Lệnh Tinh / Kho Tàng)",
    "termEn": "Tian Fu (The Treasury Star)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Sao của ngân khố vũ trụ, quản lý kho tàng của cải, sự thận trọng, bao dung, tích lũy bền vững và an định.",
    "lifeMeaning": {
      "general": "Tính tình điềm đạm, hào hoa, cẩn trọng, giỏi giữ tiền, ghét sự mạo hiểm liều lĩnh và rất biết cách tận hưởng cuộc sống phong lưu.",
      "careerAndWealth": "Thích hợp với tài chính ngân hàng, kế toán trưởng, kiểm toán, quản lý tài sản, kho bãi hoặc chủ doanh nghiệp phát triển ổn định.",
      "relationshipAndFamily": "Tổ ấm gia đình luôn đủ đầy, sung túc; là chỗ dựa tài chính và tình cảm vững chắc cho con cháu."
    },
    "actionableAdvice": "Đừng quá an phận thủ thường; đôi khi cần linh hoạt thích nghi với cái mới để kho tàng không bị đình trệ.",
    "example": "Giám đốc tài chính (CFO) quản lý dòng tiền hàng nghìn tỷ một cách minh bạch, an toàn và sinh lời bền vững.",
    "keywords": [
      "thien phu",
      "kho tang",
      "tich luy",
      "ngan sach",
      "bao dung",
      "treasury"
    ]
  },
  {
    "id": "sao_thai_duong",
    "termVi": "Sao Thái Dương (Mặt Trời)",
    "termEn": "Tai Yang (The Sun Star)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Ánh sáng rực rỡ của mặt trời, tượng trưng cho sự quang minh chính đại, hào phóng, danh tiếng lan tỏa và phụ thân (cha/chồng).",
    "lifeMeaning": {
      "general": "Tính cách nhiệt tình, thẳng thắn, thích giúp đỡ mọi người vô điều kiện, không để bụng và luôn hướng về sự công bằng.",
      "careerAndWealth": "Tỏa sáng trong ngoại giao, truyền thông, chính trị, công tác xã hội và các vị trí đòi hỏi sức ảnh hưởng trước công chúng.",
      "relationshipAndFamily": "Đại diện cho hình bóng người cha hoặc người chồng; gia đình luôn tràn ngập năng lượng tích cực."
    },
    "actionableAdvice": "Hào phóng là tốt nhưng cần chọn đúng người để giúp đỡ, tránh để kẻ xấu lợi dụng lòng tốt của mình.",
    "example": "Nhà hoạt động xã hội hoặc chính khách uy tín, luôn cống hiến hết mình vì sự phát triển của cộng đồng.",
    "keywords": [
      "thai duong",
      "mat troi",
      "quang minh",
      "danh tieng",
      "hao phong",
      "sun"
    ]
  },
  {
    "id": "sao_thai_am",
    "termVi": "Sao Thái Âm (Mặt Trăng / Phú Tinh)",
    "termEn": "Tai Yin (The Moon Star)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Vẻ đẹp dịu dàng của mặt trăng, chủ về phú quý dài lâu, điền sản đất đai, trực giác tinh tế và mẫu thân (mẹ/vợ).",
    "lifeMeaning": {
      "general": "Tâm hồn lãng mạn, tinh tế, thích sự yên bình, giỏi lắng nghe, có năng khiếu nghệ thuật và thẩm mỹ cao.",
      "careerAndWealth": "Rất có duyên với kinh doanh bất động sản, tài chính, mỹ thuật, thiết kế, du lịch nghỉ dưỡng và dịch vụ cao cấp.",
      "relationshipAndFamily": "Đại diện cho người mẹ hiền thục hoặc người vợ dịu dàng; mang lại sự ấm cúng và an yên cho mái ấm gia đình."
    },
    "actionableAdvice": "Rèn luyện sự quyết đoán khi ra quyết định kinh doanh để không bị cảm xúc chi phối quá mức.",
    "example": "Chủ sở hữu chuỗi khách sạn nghỉ dưỡng sang trọng với gu thẩm mỹ tinh tế và sự chu đáo tuyệt vời với khách hàng.",
    "keywords": [
      "thai am",
      "mat trang",
      "phu quy",
      "dat dai",
      "tinh te",
      "moon"
    ]
  },
  {
    "id": "sao_that_sat",
    "termVi": "Sao Thất Sát (Dũng Tướng)",
    "termEn": "Qi Sha (The Fierce Commander)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Đại tướng tiên phong nơi sa trường, tượng trưng cho lòng dũng cảm phi thường, sự quyết liệt, độc lập và chuyển biến lớn.",
    "lifeMeaning": {
      "general": "Cá tính thép, không bao giờ chịu khuất phục trước khó khăn, thích tự mình mở đường và có khí phách anh hùng.",
      "careerAndWealth": "Thích hợp với việc mở thị trường mới, quản lý khủng hoảng, kỹ thuật công nghệ cao, y khoa phẫu thuật hoặc thể thao thành tích cao.",
      "relationshipAndFamily": "Yêu ghét phân minh, ghét sự giả tạo; cần kiên nhẫn hơn với người thân."
    },
    "actionableAdvice": "Học cách hòa hoãn và nuôi dưỡng sự từ bi; sức mạnh lớn nhất của dũng tướng là biết khi nào cần thu kiếm vào bao.",
    "example": "Vị bác sĩ ngoại khoa bản lĩnh trong các ca mổ khó giành giật sự sống cho bệnh nhân từ tay tử thần.",
    "keywords": [
      "that sat",
      "dung tuong",
      "quyet liet",
      "tien phong",
      "ban linh"
    ]
  },
  {
    "id": "sao_pha_quan",
    "termVi": "Sao Phá Quân (Tiên Phong Cách Tân)",
    "termEn": "Po Jun (The Revolutionary Pioneer)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Ngôi sao của sự phá cũ xây mới, đổi mới sáng tạo toàn diện, không ngại đập tan rào cản lỗi thời để kiến tạo tương lai.",
    "lifeMeaning": {
      "general": "Tư duy cách mạng, dám mạo hiểm, ghét sự nhàm chán, luôn muốn tạo ra những đột phá chưa từng có.",
      "careerAndWealth": "Rất thành công trong khởi nghiệp đổi mới sáng tạo, công nghệ cao, kiến trúc sư tạo xu hướng hoặc cải tổ doanh nghiệp.",
      "relationshipAndFamily": "Cuộc đời nhiều biến động thăng trầm nhưng sau mỗi lần tái sinh lại càng mạnh mẽ và giàu kinh nghiệm hơn."
    },
    "actionableAdvice": "Trước khi \"phá bỏ cái cũ\", hãy tính toán kỹ phương án \"xây dựng cái mới\" để không lãng phí nguồn lực.",
    "example": "Nhà sáng lập công nghệ tiên phong tạo ra một ứng dụng đột phá làm thay đổi thói quen tiêu dùng của hàng triệu người.",
    "keywords": [
      "pha quan",
      "cai cach",
      "doi moi",
      "dot pha",
      "sang tao"
    ]
  },
  {
    "id": "sao_tham_lang",
    "termVi": "Sao Tham Lang (Đào Hoa & Đa Tài)",
    "termEn": "Tan Lang (The Charismatic Polymath)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Chính Tinh Tử Vi",
    "shortDefinition": "Ngôi sao của sức hút cá nhân, tài ngoại giao khéo léo, dục vọng vươn lên, năng khiếu nghệ thuật và huyền học.",
    "lifeMeaning": {
      "general": "Rất thông minh, đa tài đa nghệ, giỏi nắm bắt tâm lý người khác, có sức hấp dẫn đặc biệt và ham thích học hỏi nhiều lĩnh vực.",
      "careerAndWealth": "Thành công lớn trong giải trí, nghệ thuật, kinh doanh ẩm thực, quan hệ công chúng, đàm phán hợp đồng thương mại.",
      "relationshipAndFamily": "Đào hoa vượng; cần giữ gìn sự chung thủy và ranh giới rõ ràng trong các mối quan hệ xã giao."
    },
    "actionableAdvice": "Tham Lang tu đạo: Chuyển hóa dục vọng vật chất thành khát vọng tu dưỡng tâm linh và cống hiến tri thức cho đời.",
    "example": "Nghệ sĩ tài hoa hoặc nhà đàm phán thương mại quốc tế với nụ cười duyên dáng ký kết thành công những thương vụ hàng triệu đô.",
    "keywords": [
      "tham lang",
      "dao hoa",
      "da tai",
      "ngoai giao",
      "nghe thuat"
    ]
  },
  {
    "id": "tu_hoa",
    "termVi": "Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ)",
    "termEn": "The Four Transformations (Mutational Catalysts)",
    "category": "ziwei_stars",
    "categoryLabelVi": "Tứ Hóa Tử Vi",
    "shortDefinition": "4 luồng năng lượng biến hóa mạnh nhất trong Tử Vi, là đòn bẩy kích hoạt may mắn hoặc thử thách cho từng cung vị.",
    "lifeMeaning": {
      "general": "• Hóa Lộc: Mùa xuân sinh sôi, tài lộc, cơ hội may mắn tự nhiên đến.\n• Hóa Quyền: Mùa hạ bừng nở, nắm bắt thực quyền, quyết đoán và năng lực hành động.\n• Hóa Khoa: Mùa thu thu hoạch, danh tiếng, trí tuệ học thuật, quý nhân giải trừ tai họa.\n• Hóa Kỵ: Mùa đông giá lạnh, vướng mắc, trăn trở, bài học nghiệp lực giúp con người trưởng thành.",
      "careerAndWealth": "Hóa Lộc/Hóa Quyền tại Tài Quan: Tiền bạc dồi dào, sự nghiệp thăng tiến mạnh mẽ. Hóa Kỵ tại đâu cần thận trọng quản lý rủi ro tại đó.",
      "relationshipAndFamily": "Hóa Kỵ đóng ở đâu là nơi bạn dồn nhiều tâm tư trăn trở nhất cuộc đời — hãy bao dung để chuyển hóa thành trí tuệ."
    },
    "actionableAdvice": "Đừng sợ Hóa Kỵ! Hóa Kỵ chính là \"người thầy nghiêm khắc\" thúc đẩy bạn hoàn thiện điểm yếu để vươn tới tầm cao mới.",
    "example": "Năm có Hóa Lộc chiếu cung Tài: Dòng tiền bùng nổ; Năm có Hóa Kỵ chiếu: Cần tập trung củng cố nội lực, tránh đầu tư mạo hiểm.",
    "keywords": [
      "tu hoa",
      "hoa loc",
      "hoa quyen",
      "hoa khoa",
      "hoa ky",
      "bien hoa"
    ]
  },
  {
    "id": "chan_gio_mat_troi",
    "termVi": "Chân Giờ Mặt Trời Thực (Equation of Time)",
    "termEn": "True Solar Time (Astronavigation Precision)",
    "category": "astronomy_rules",
    "categoryLabelVi": "Quy Tắc Thiên Văn",
    "shortDefinition": "Giờ thiên văn thực tế dựa trên vị trí của mặt trời trên kinh độ nơi bạn sinh ra, khác với giờ đồng hồ hành chính quy ước.",
    "lifeMeaning": {
      "general": "Trái Đất quay quanh Mặt Trời theo quỹ đạo hình elip và trục nghiêng, khiến giờ đồng hồ quy ước (GMT+7) và giờ mặt trời thực tế tại Hà Nội, Đà Nẵng, TP.HCM có thể chênh lệch từ 5 đến 30 phút.",
      "careerAndWealth": "Giúp xác định chính xác trụ Giờ sinh khi bạn sinh vào thời điểm giao thời giữa 2 giờ (ví dụ sinh lúc 10h55 hoặc 11h05) — quyết định hoàn toàn sự chuẩn xác của lá số.",
      "relationshipAndFamily": "Tránh việc an sai các sao cung Tử Tức, Nô Bộc và trụ Giờ chỉ vì sai lệch múi giờ hành chính."
    },
    "actionableAdvice": "Ứng dụng Aurora Destiny AI tự động tính toán Chân giờ mặt trời theo tọa độ kinh độ và phương trình thời gian (Equation of Time) chuẩn NASA.",
    "example": "Một người sinh lúc 11h05 sáng tại TP.HCM theo đồng hồ hành chính, nhưng Chân giờ mặt trời thực tế là 10h52 (vẫn thuộc giờ Tỵ chứ chưa sang giờ Ngọ).",
    "keywords": [
      "chan gio mat troi",
      "equation of time",
      "true solar time",
      "kinh do",
      "gio sinh",
      "thien van"
    ]
  },
  {
    "id": "mieu_vuong_dac_binh_ham",
    "termVi": "Độ Sáng Của Sao (Miếu - Vượng - Đắc - Bình - Hãm)",
    "termEn": "Star Brightness Spectrum (Exaltation to Detriment)",
    "category": "astronomy_rules",
    "categoryLabelVi": "Quy Tắc Thiên Văn",
    "shortDefinition": "Thước đo năng lượng sáng - tối của các ngôi sao khi an vào từng cung vị chi khác nhau.",
    "lifeMeaning": {
      "general": "• Miếu (M): Sáng rực rỡ nhất, phát huy 100% tính cát lợi tốt đẹp.\n• Vượng (V): Rất sáng, nhiều năng lượng tích cực.\n• Đắc (D): Thuận vị, phát huy tốt sở trường.\n• Bình (B): Bình hòa, không tốt không xấu, cần sao phụ tá trợ lực.\n• Hãm (H): Bị che khuất ánh sáng, năng lượng bị hạn chế hoặc dễ bộc lộ tính nóng nảy, bất an.",
      "careerAndWealth": "Sao Hãm Địa không phải là dấu chấm hết! Nếu gặp \"Tuần / Triệt\" hoặc \"Hóa Quyền / Hóa Khoa\", sao hãm có thể \"phản vi kỳ cách\" — bùng nổ thành tựu phi thường sau gian khó.",
      "relationshipAndFamily": "Biết độ sáng của sao giúp bạn kiên nhẫn hơn trong những giai đoạn khó khăn để chờ thời cơ chín muồi."
    },
    "actionableAdvice": "Khi cung có sao Hãm Địa: Chú trọng tu tâm dưỡng tính, cẩn trọng trong lời ăn tiếng nói và tích lũy kiến thức bền bỉ.",
    "example": "Thái Dương hãm ở cung Tý (nửa đêm) như mặt trời chưa mọc, nhưng nếu có Hóa Khoa hoặc Triệt đóng thì trở thành người có tài năng ẩn dật chờ ngày xuất lộ.",
    "keywords": [
      "mieu dia",
      "vuong dia",
      "dac dia",
      "binh hoa",
      "ham dia",
      "do sang"
    ]
  },
  {
    "id": "tuan_triet_khong_vong",
    "termVi": "Tuần Không & Triệt Không (Tuần Triệt)",
    "termEn": "Void & Severance (Cosmic Filtering)",
    "category": "astronomy_rules",
    "categoryLabelVi": "Quy Tắc Thiên Văn",
    "shortDefinition": "Hai luồng cản trở và thanh lọc của vũ trụ: Triệt phá vỡ mạnh mẽ ở tiền vận (dưới 30 tuổi), Tuần bao bọc kìm hãm êm đềm ở hậu vận.",
    "lifeMeaning": {
      "general": "Gặp sao tốt thì làm giảm bớt tính tốt; nhưng gặp sao xấu (sát tinh) thì Tuần Triệt lại như bức tường thành che chắn, giải trừ hung hiểm kỳ diệu.",
      "careerAndWealth": "Cung vô chính diệu (không có chính tinh) gặp Tuần Triệt đắc cách lại trở nên sáng sủa, thu hút ánh sáng của các cung xung chiếu.",
      "relationshipAndFamily": "Giúp con người rèn luyện tính kiên nhẫn, khiêm tốn và vượt qua nghịch cảnh tuổi trẻ để xây dựng cơ nghiệp vững bền."
    },
    "actionableAdvice": "Đừng nản lòng khi thấy cung có Tuần Triệt. Hãy xem đó là trường học rèn luyện ý chí và bản lĩnh kiên cường của vũ trụ dành cho bạn.",
    "example": "Tuổi trẻ gặp Triệt ở cung Mệnh phải trải qua nhiều gian nan lập nghiệp, nhưng sau 30 tuổi năng lực của Triệt giảm dần và công danh nở rộ.",
    "keywords": [
      "tuan khong",
      "triet khong",
      "tuan triet",
      "khong vong",
      "giai han"
    ]
  },
  {
    "id": "tam_phuong_tu_chinh",
    "termVi": "Tam Phương Tứ Chính",
    "termEn": "Trines & Opposite Axis (Aspecting Network)",
    "category": "astronomy_rules",
    "categoryLabelVi": "Quy Tắc Thiên Văn",
    "shortDefinition": "Mạng lưới liên kết năng lượng giữa Cung Bản Tọa với 1 cung Xung Chiếu và 2 cung Tam Hợp tạo thành thế chân vạc tương hỗ.",
    "lifeMeaning": {
      "general": "Khi luận giải một cung (ví dụ cung Mệnh), không bao giờ chỉ nhìn vào cung đó đơn độc, mà phải hội tụ đủ các sao từ cung Thiên Di (đối chiếu) và cung Quan Lộc, Tài Bạch (tam hợp).",
      "careerAndWealth": "Giống như một dự án kinh doanh: Cần sản phẩm tốt (Mệnh), thị trường chấp nhận (Thiên Di), quy trình chuyên nghiệp (Quan Lộc) và dòng tiền dồi dào (Tài Bạch).",
      "relationshipAndFamily": "Sự tương tác mật thiết giữa bản thân với môi trường và gia đình xã hội."
    },
    "actionableAdvice": "Nếu cung bản tọa của bạn có ít sao tốt, hãy mượn lực từ các sao tốt ở cung Tam Phương Tứ Chính chiếu về để bù đắp năng lượng.",
    "example": "Cung Mệnh không có sao lớn nhưng được cung Quan Lộc và Tài Bạch có Tử Vi, Thiên Phủ tam hợp chiếu về: Vẫn thành công rực rỡ nhờ đối tác và cơ hội công việc tốt.",
    "keywords": [
      "tam phuong tu chinh",
      "xung chieu",
      "tam hop",
      "hoi chieu",
      "lien ket"
    ]
  },
  {
    "id": "dai_van_luu_nien",
    "termVi": "Đại Vận (10 Năm) & Lưu Niên (Từng Năm)",
    "termEn": "Decennial Phase & Annual Transit",
    "category": "astronomy_rules",
    "categoryLabelVi": "Quy Tắc Thiên Văn",
    "shortDefinition": "Dòng chảy thời gian của số mệnh: Đại Vận là thời kỳ 10 năm chuyển cung, Lưu Niên là khí vận cụ thể của từng năm một.",
    "lifeMeaning": {
      "general": "Lá số tĩnh là bản đồ tiềm năng, còn Đại Vận và Lưu Niên là chiếc xe đang lăn bánh trên từng chặng đường gập ghềnh hay bằng phẳng.",
      "careerAndWealth": "Gặp Đại Vận tốt (thuận lợi): Hãy mạnh dạn mở rộng đầu tư, bung hết sức. Gặp Đại Vận xấu: Nên phòng thủ, tích lũy kiến thức, học hỏi và bảo toàn vốn.",
      "relationshipAndFamily": "Biết trước năm nào vận đào hoa nở để lập gia đình, năm nào gia đạo dễ có xung khắc để nhường nhịn yêu thương."
    },
    "actionableAdvice": "Biết thời thế để thuận theo tự nhiên: \"Đắc thời thì làm tướng, thất thời thì ẩn nhẫn tu thân\".",
    "example": "Người có số mệnh bình thường nhưng bước vào Đại Vận 10 năm gặp Thái Dương Hóa Lộc: Sự nghiệp phất lên như diều gặp gió.",
    "keywords": [
      "dai van",
      "luu nien",
      "10 nam",
      "tung nam",
      "thoi van",
      "van trinh"
    ]
  }
];

export function removeVietnameseTones(str?: string | null): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'))
    .toLowerCase();
}

export function searchGlossary(query?: string | null, category?: GlossaryCategory): GlossaryItem[] {
  const cleanQuery = (query ?? '').trim().toLowerCase();
  const unaccentedQuery = removeVietnameseTones(cleanQuery);

  return ASTROLOGY_GLOSSARY.filter((item) => {
    if (category && item.category !== category) return false;
    if (!cleanQuery) return true;

    const termVi = item.termVi.toLowerCase();
    const termViUnaccented = removeVietnameseTones(item.termVi);
    const termEn = item.termEn.toLowerCase();
    const shortDef = item.shortDefinition.toLowerCase();
    const shortDefUnaccented = removeVietnameseTones(item.shortDefinition);

    const matchName = termVi.includes(cleanQuery) || termViUnaccented.includes(unaccentedQuery);
    const matchEn = termEn.includes(cleanQuery);
    const matchDef = shortDef.includes(cleanQuery) || shortDefUnaccented.includes(unaccentedQuery);
    const matchKeywords = item.keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      const kwUnaccented = removeVietnameseTones(kw);
      return kwLower.includes(cleanQuery) || kwUnaccented.includes(unaccentedQuery);
    });

    return matchName || matchEn || matchDef || matchKeywords;
  });
}

export function getGlossaryItemById(id: string): GlossaryItem | undefined {
  return ASTROLOGY_GLOSSARY.find((item) => item.id === id);
}

export const RELATED_TERMS_MAP: Record<string, string[]> = {
  nhat_chu: ['dung_than_hy_than', 'chinh_quan', 'chinh_tai', 'thuc_than'],
  chinh_quan: ['that_sat', 'chinh_an', 'nhat_chu', 'cung_quan_loc'],
  that_sat: ['chinh_quan', 'sao_that_sat', 'dung_than_hy_than'],
  chinh_tai: ['thien_tai', 'cung_tai_bach', 'thuc_than', 'nhat_chu'],
  thien_tai: ['chinh_tai', 'thuong_quan', 'cung_tai_bach'],
  chinh_an: ['kieu_than', 'chinh_quan', 'nhat_chu'],
  kieu_than: ['chinh_an', 'thuong_quan', 'sao_tham_lang'],
  thuc_than: ['thuong_quan', 'chinh_tai', 'nhat_chu'],
  thuong_quan: ['thuc_than', 'that_sat', 'sao_pha_quan'],
  ty_kien_kiep_tai: ['nhat_chu', 'chinh_tai', 'dung_than_hy_than'],
  dung_than_hy_than: ['nhat_chu', 'chan_gio_mat_troi', 'thuc_than'],
  cung_menh: ['cung_than', 'sao_tu_vi', 'tam_phuong_tu_chinh', 'tuan_triet_khong_vong'],
  cung_than: ['cung_menh', 'cung_quan_loc', 'cung_tai_bach', 'dai_van_luu_nien'],
  cung_tai_bach: ['cung_quan_loc', 'chinh_tai', 'sao_thien_phu', 'cung_dien_trach'],
  cung_quan_loc: ['cung_tai_bach', 'cung_menh', 'chinh_quan', 'sao_tu_vi'],
  cung_phu_the: ['cung_menh', 'cung_phuc_duc', 'sao_thai_duong', 'sao_thai_am'],
  cung_phuc_duc: ['cung_menh', 'cung_phu_the', 'cung_dien_trach'],
  cung_thien_di: ['cung_menh', 'tam_phuong_tu_chinh', 'cung_quan_loc'],
  cung_dien_trach: ['cung_tai_bach', 'sao_thien_phu', 'sao_thai_am'],
  sao_tu_vi: ['sao_thien_phu', 'cung_menh', 'tu_hoa', 'sao_that_sat'],
  sao_thien_phu: ['sao_tu_vi', 'cung_tai_bach', 'cung_dien_trach'],
  sao_thai_duong: ['sao_thai_am', 'cung_quan_loc', 'tu_hoa'],
  sao_thai_am: ['sao_thai_duong', 'cung_tai_bach', 'cung_dien_trach'],
  sao_that_sat: ['sao_pha_quan', 'sao_tham_lang', 'that_sat'],
  sao_pha_quan: ['sao_that_sat', 'sao_tham_lang', 'tu_hoa'],
  sao_tham_lang: ['sao_that_sat', 'sao_pha_quan', 'tu_hoa'],
  tu_hoa: ['sao_tu_vi', 'cung_quan_loc', 'cung_tai_bach', 'dai_van_luu_nien'],
  chan_gio_mat_troi: ['cung_menh', 'dung_than_hy_than', 'dai_van_luu_nien'],
  mieu_vuong_dac_binh_ham: ['sao_tu_vi', 'tuan_triet_khong_vong', 'cung_menh'],
  tuan_triet_khong_vong: ['mieu_vuong_dac_binh_ham', 'cung_menh', 'dai_van_luu_nien'],
  tam_phuong_tu_chinh: ['cung_menh', 'cung_thien_di', 'cung_quan_loc', 'cung_tai_bach'],
  dai_van_luu_nien: ['cung_than', 'tu_hoa', 'tuan_triet_khong_vong']
};

export function getRelatedGlossaryItems(item?: GlossaryItem | null): GlossaryItem[] {
  if (!item) return [];
  const relatedIds = item.relatedTermIds || RELATED_TERMS_MAP[item.id] || [];
  if (relatedIds.length > 0) {
    const list = relatedIds
      .map((id) => ASTROLOGY_GLOSSARY.find((i) => i.id === id))
      .filter((i): i is GlossaryItem => Boolean(i));
    if (list.length > 0) return list;
  }
  // Fallback: return 3 other items in same category
  return ASTROLOGY_GLOSSARY.filter((i) => i.id !== item.id && i.category === item.category).slice(0, 3);
}
