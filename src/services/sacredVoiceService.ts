// ==========================================================
// SACRED EMOTIONAL VOICE ENGINE — HUYỀN PHONG PHẬT ĐẠO
// Trợ lý âm thanh giọng đọc truyền cảm, trang nghiêm & tinh tế
// Kết hợp chuông ngân Bát Nhã 432Hz/528Hz & giọng đọc tiếng Việt ấm áp
// ==========================================================

import { sacredSound } from './soundService';

export type VoicePersona = 'zen_calm' | 'gentle_compassion';

export interface SacredVoiceScript {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  chimeType: 'tibetan' | 'chime' | 'coin';
}

export const SACRED_VOICE_SCRIPTS: Record<string, SacredVoiceScript> = {
  // LỜI THỈNH MỆNH MỞ ĐẦU (KÊU GỌI TRUYỀN CẢM, CHUYỂN ĐỔI CAO)
  welcome_invitation: {
    id: 'welcome_invitation',
    title: 'Lời Thỉnh Mệnh Khai Tâm',
    subtitle: 'Huyền Phong Phật Đạo • Duyên Lành Khởi Phúc',
    text: 'Kính chào Quý Thiện Nam Tín Nữ và Quý Cô Bác thân thương! Vạn sự trên đời đều do duyên khởi. Lá số Tử Vi không phải là sự định sẵn của số phận, mà chính là tấm bản đồ thiên văn định hướng phúc đức để Quý Vị thấu hiểu chính mình, đón lành tránh dữ, an dưỡng thân tâm và tạo phúc cho con cháu đời sau. Kính mời Quý Vị dành một phút trang nghiêm, hoan hỷ điền ngày giờ sinh để AI Huyền Phong Phật Đạo khai mở tường tận bản mệnh cho Quý Vị ngay hôm nay.',
    chimeType: 'tibetan'
  },

  // HỌ VÀ TÊN
  field_name: {
    id: 'field_name',
    title: 'Ý Nghĩa Họ Và Tên',
    subtitle: 'Năng Lượng Danh Xưng & Phúc Dòng Tộc',
    text: 'Họ và Tên chính là mật mã âm thanh mang theo hồng phước của tổ tiên và cha mẹ trao tặng. Xin Quý Vị hoan hỷ nhập đầy đủ họ tên để hệ thống khắc ghi vào tâm điểm của đồ hình Tử Vi.',
    chimeType: 'chime'
  },

  // GIỚI TÍNH
  field_gender: {
    id: 'field_gender',
    title: 'Âm Dương Bản Thể',
    subtitle: 'Dương Nam Âm Nữ • Vòng Đại Vận 10 Năm',
    text: 'Trong dịch lý trời đất, giới tính Nam hay Nữ sẽ quyết định chiều quay của vòng Đại Vận mười năm theo chiều thuận hay nghịch kim đồng hồ. Xin hãy chọn Nam mạng hoặc Nữ mạng phù hợp.',
    chimeType: 'chime'
  },

  // NGÀY THÁNG SINH
  field_date: {
    id: 'field_date',
    title: 'Giao Hòa Âm Dương Lịch',
    subtitle: 'Thuật Toán Thiên Văn 100 Năm Cổ Bản',
    text: 'Dù Quý Vị nhớ ngày Âm lịch cổ truyền của các cụ hay ngày Dương lịch trên giấy tờ căn cước, hệ thống thiên văn chuẩn xác sẽ tự động quy đổi và định vị chính xác ngày sinh của Quý Vị.',
    chimeType: 'tibetan'
  },

  // GIỜ SINH
  field_hour: {
    id: 'field_hour',
    title: 'Thời Khắc Thiên Địa Giao Hòa',
    subtitle: 'Trụ Giờ Mệnh Chủ & Ký Ức Xưa',
    text: 'Giờ sinh quyết định cung Thân an mệnh. Nếu Quý Vị nhớ lúc gà gáy, rạng đông hay chính trưa, hãy chọn theo ký ức dân gian xưa. Nếu hoàn toàn không nhớ, hệ thống sẽ lấy giờ Chính Ngọ để bảo toàn nguyên vẹn vận mệnh cho Quý Vị.',
    chimeType: 'chime'
  },

  // NƠI SINH & NGẬY TỌA ĐỘ
  field_location: {
    id: 'field_location',
    title: 'Địa Linh Nhân Kiệt',
    subtitle: 'Kinh Độ & Giờ Mặt Trời Thực',
    text: 'Nơi Quý Vị cất tiếng khóc chào đời lưu giữ từ trường mảnh đất quê hương. Tọa độ kinh tuyến sẽ giúp AI tinh chỉnh Giờ Mặt Trời Chân Thực tới từng giây.',
    chimeType: 'chime'
  },

  // TÂM NGUYỆN TRỌNG TÂM
  field_priority: {
    id: 'field_priority',
    title: 'Tâm Nguyện Gửi Gắm',
    subtitle: 'Hướng Tâm Về Bình An & Phúc Đức',
    text: 'Tâm khởi thì duyên sinh. Điều Quý Vị trăn trở nhất như Sức Khỏe, Gia Đạo, Phúc Cho Con Cháu hay Tu Tâm Dưỡng Tính sẽ là trọng tâm bài luận giải sâu sắc nhất.',
    chimeType: 'tibetan'
  },

  // LỜI KÊU GỌI HOÀN TẤT & KHAI MỞ LÁ SỐ (CTA FINAL)
  cta_complete: {
    id: 'cta_complete',
    title: 'Khai Mở Bản Mệnh',
    subtitle: 'Chúc Nguyện Vạn Sự Bình An',
    text: 'Bản đồ thiên văn vận mệnh của Quý Vị đã kết tụ đủ duyên lành. Kính mời Quý Vị bấm nút Khai Mở để chiêm bái trọn vẹn luận giải Tử Vi Đẩu Số và Tứ Trụ Bát Tự ngay bây giờ.',
    chimeType: 'tibetan'
  }
};

type VoiceStateListener = (state: {
  isPlaying: boolean;
  currentScriptId: string | null;
  persona: VoicePersona;
  isMuted: boolean;
}) => void;

class SacredVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private currentScriptId: string | null = null;
  private persona: VoicePersona = 'zen_calm';
  private isMuted: boolean = false;
  private listeners: Set<VoiceStateListener> = new Set();
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('aurora_voice_muted');
        if (savedMute === 'true') {
          this.isMuted = true;
        }
        const savedPersona = localStorage.getItem('aurora_voice_persona') as VoicePersona;
        if (savedPersona === 'zen_calm' || savedPersona === 'gentle_compassion') {
          this.persona = savedPersona;
        }
      } catch {}

      // Pre-load voices on browser ready
      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  // Find best Vietnamese voice
  private getVietnameseVoice(): SpeechSynthesisVoice | null {
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.loadVoices();
    
    // Priority 1: Vietnamese natural voices (Google Tiếng Việt, Microsoft HoaiMy, etc.)
    const viNatural = voices.find(v => 
      (v.lang === 'vi-VN' || v.lang.startsWith('vi')) && 
      (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'))
    );
    if (viNatural) return viNatural;

    // Priority 2: Any Vietnamese voice
    const viAny = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
    if (viAny) return viAny;

    // Fallback: Default system voice
    return voices.find(v => v.default) || voices[0] || null;
  }

  // Subscribe to changes (for UI animated waveforms & golden aura)
  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentScriptId: this.currentScriptId,
      persona: this.persona,
      isMuted: this.isMuted
    };
  }

  public setPersona(persona: VoicePersona) {
    this.persona = persona;
    try {
      localStorage.setItem('aurora_voice_persona', persona);
    } catch {}
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('aurora_voice_muted', this.isMuted ? 'true' : 'false');
    } catch {}

    if (this.isMuted) {
      this.stop();
    }
    this.notify();
    return this.isMuted;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.currentScriptId = null;
    this.currentUtterance = null;
    this.notify();
  }

  // Play Sacred Script with Sacred Chime Intro
  public async speak(
    scriptId: string, 
    customText?: string, 
    overridePersona?: VoicePersona
  ): Promise<void> {
    if (this.isMuted) return;

    const script = SACRED_VOICE_SCRIPTS[scriptId];
    const textToSpeak = customText || (script ? script.text : scriptId);
    if (!textToSpeak) return;

    // Stop ongoing speech
    this.stop();

    // Sacred Sound Chime Preludium (Tibetan Bowl / Celestial Chime)
    const chime = script ? script.chimeType : 'tibetan';
    if (chime === 'tibetan') {
      sacredSound.playTibetanBowl(432);
    } else if (chime === 'coin') {
      sacredSound.playCoinToss();
    } else {
      sacredSound.playCelestialChime(864);
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Small respectful pause (400ms) for sacred chime resonance to embrace the mind
    await new Promise(res => setTimeout(res, 420));

    // Check if cancelled during pause
    if (this.isMuted) return;

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voice = this.getVietnameseVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'vi-VN';
      }

      const activePersona = overridePersona || this.persona;

      if (activePersona === 'zen_calm') {
        // Trầm ấm, trang nghiêm, thiền định
        utterance.rate = 0.88;
        utterance.pitch = 0.94;
        utterance.volume = 0.95;
      } else {
        // Dịu dàng, thanh thoát, truyền cảm
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 0.95;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        this.currentScriptId = scriptId;
        this.notify();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentScriptId = null;
        this.currentUtterance = null;
        this.notify();
      };

      utterance.onerror = (e) => {
        console.warn('Sacred Voice SpeechSynthesis error:', e);
        this.isPlaying = false;
        this.currentScriptId = null;
        this.currentUtterance = null;
        this.notify();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Sacred Voice exception:', err);
      this.isPlaying = false;
      this.currentScriptId = null;
      this.notify();
    }
  }
}

export const sacredVoice = new SacredVoiceService();
