// ==========================================================
// AURORA DESTINY AI — CÁC KÊNH TRUYỀN THÔNG & MẠNG XÃ HỘI CHÍNH THỨC
// Kênh: Huyền Phong Phật Đạo — Giáo Sư - Prof.TOAN
// ==========================================================

export interface SocialChannelConfig {
  id: 'tiktok' | 'youtube' | 'facebook';
  platform: 'TikTok' | 'YouTube' | 'Facebook';
  name: string;
  handle: string;
  url: string;
  cleanUrl: string;
  tagline: string;
  description: string;
  badge: string;
  actionText: string;
  colorClass: {
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    buttonBg: string;
    buttonHover: string;
    glowColor: string;
    accentGradient: string;
    iconColor: string;
  };
  highlights: string[];
}

export const OFFICIAL_SOCIAL_CHANNELS: SocialChannelConfig[] = [
  {
    id: 'tiktok',
    platform: 'TikTok',
    name: 'TikTok Huyền Phong Phật Đạo',
    handle: '@huyenphongphatdao',
    url: 'https://www.tiktok.com/@huyenphongphatdao?_r=1&_t=ZS-99tKd9rlln3',
    cleanUrl: 'tiktok.com/@huyenphongphatdao',
    tagline: 'Video Ngắn Luận Mệnh, Bát Tự & Tri Thức Nhân Quả',
    description: 'Kênh video ngắn chính thức chia sẻ tinh hoa Tử Vi Đẩu Số 108 Tinh Bàn, Bát Tự Hà Lạc, giải mã nhân quả vận mệnh và phong thủy chân truyền ngắn gọn, dễ hiểu mỗi ngày.',
    badge: 'Kênh TikTok Chính Thức',
    actionText: 'Theo Dõi Trên TikTok',
    colorClass: {
      badgeBg: 'bg-cyan-500/10',
      badgeBorder: 'border-cyan-400/30',
      badgeText: 'text-cyan-300',
      buttonBg: 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-cyan-500/20',
      buttonHover: 'hover:brightness-110',
      glowColor: 'rgba(6, 182, 212, 0.25)',
      accentGradient: 'from-cyan-500/20 via-pink-500/15 to-transparent',
      iconColor: 'text-cyan-400'
    },
    highlights: [
      'Giải mã vận mệnh, hạn năm & 12 cung số',
      'Luận giải Bát Tự Tứ Trụ ứng dụng đời sống',
      'Định hướng tâm thức, tích đức cải số'
    ]
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    name: 'YouTube Huyền Phong Phật Đạo',
    handle: '@huyenphongphatdao',
    url: 'https://youtube.com/@huyenphongphatdao?si=fBAV3wdv2oyEJY69',
    cleanUrl: 'youtube.com/@huyenphongphatdao',
    tagline: 'Bài Giảng Chuyên Sâu, Khóa Học Mệnh Lý & Livestream',
    description: 'Kho tư liệu video bài giảng chuyên sâu của Giáo Sư - Prof.TOAN về học thuật thiên văn cổ học, phương pháp an sao 108 Tinh Bàn, Dụng Thần Bát Tự và các buổi Livestream đàm đạo học thuật.',
    badge: 'Kênh YouTube Chính Thức',
    actionText: 'Đăng Ký Kênh YouTube',
    colorClass: {
      badgeBg: 'bg-red-500/10',
      badgeBorder: 'border-red-400/30',
      badgeText: 'text-red-300',
      buttonBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25',
      buttonHover: 'hover:bg-red-500',
      glowColor: 'rgba(239, 68, 68, 0.25)',
      accentGradient: 'from-red-500/20 via-amber-500/15 to-transparent',
      iconColor: 'text-red-400'
    },
    highlights: [
      'Bài giảng kinh điển Tử Vi & Bát Tự Hà Lạc',
      'Livestream phân tích lá số & giải đáp trực tiếp',
      'Nền tảng tri thức thiên văn học VSOP87'
    ]
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    name: 'Facebook Huyền Phong Phật Đạo',
    handle: 'Huyền Phong Phật Đạo',
    url: 'https://www.facebook.com/share/19RTAaNKPS/',
    cleanUrl: 'facebook.com/share/19RTAaNKPS',
    tagline: 'Cộng Đồng Đạo Hữu, Thông Cáo Học Thuật & Đàm Đạo',
    description: 'Trang Facebook cộng đồng kết nối quý đạo hữu, học giả và người hữu duyên. Nơi cập nhật các thông cáo học thuật, bản tin cập nhật hệ thống Aurora Destiny AI và giao lưu chia sẻ chiêm nghiệm.',
    badge: 'Cộng Đồng Facebook Chính Thức',
    actionText: 'Tham Gia Trên Facebook',
    colorClass: {
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-400/30',
      badgeText: 'text-blue-300',
      buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25',
      buttonHover: 'hover:bg-blue-500',
      glowColor: 'rgba(59, 130, 246, 0.25)',
      accentGradient: 'from-blue-500/20 via-indigo-500/15 to-transparent',
      iconColor: 'text-blue-400'
    },
    highlights: [
      'Thông báo cập nhật thuật toán & tính năng mới',
      'Giao lưu đàm đạo cùng Giáo Sư - Prof.TOAN',
      'Lan tỏa thông điệp thiện lành & tri thức mệnh lý'
    ]
  }
];

export const SOCIAL_HUB_META = {
  channelName: 'Huyền Phong Phật Đạo',
  founder: 'Giáo Sư - Prof.TOAN',
  founderContact: 'havantoancntt@gmail.com',
  mission: 'Hội tụ tinh hoa mệnh lý cổ học phương Đông cùng Siêu Trí Tuệ Nhân Tạo đa tác tử để phụng sự cộng đồng, khai phóng nhân sinh, tuyệt đối vô vụ lợi và bài trừ mê tín dị đoan.',
  slogan: 'Vận Mệnh Có Thể Hiểu - Nghiệp Lực Có Thể Chuyển'
};
