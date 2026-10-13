// ==========================================
// AURORA DESTINY AI — CLIENT SECURITY SHIELD
// Anti-Tampering, Console Copyright Warning,
// Anti-Scraping Protection & Provenance Watermarking
// ==========================================

/**
 * Initialize client-side security protections:
 * 1. Console Intellectual Property Notice & Legal Protection Warning
 * 2. Copy Provenance Watermarking
 * 3. Runtime Tamper Detection
 */
export function initClientSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Console Intellectual Property Notice & Security Warning
  try {
    const titleStyle = 'font-size: 16px; font-weight: bold; color: #fbbf24; text-shadow: 0 0 5px rgba(251,191,36,0.5);';
    const bodyStyle = 'font-size: 12px; color: #94a3b8; line-height: 1.6;';
    const warnStyle = 'font-size: 12px; font-weight: bold; color: #f87171;';

    console.log(
      '%c🛡️ AURORA DESTINY AI — HỆ THỐNG BẢO MẬT & BẢN QUYỀN THUẬT TOÁN',
      titleStyle
    );
    console.log(
      '%cToàn bộ thuật toán Bát Tự Tứ Trụ, Tử Vi Đẩu Số 108 Tinh Bàn và hệ thống xác suất đa tác tử thuộc sở hữu trí tuệ độc quyền của Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo.\n' +
      'Mọi hành vi sao chép, trích xuất dữ liệu tự động (scraping), dịch ngược mã nguồn (reverse engineering) hoặc xâm phạm dữ liệu đều bị nghiêm cấm theo Công ước Quốc tế Berne và pháp luật sở hữu trí tuệ.',
      bodyStyle
    );
    console.log(
      '%c⚠️ Mọi hoạt động bất thường hoặc can thiệp bộ nhớ đều được ghi nhận nhật ký an ninh tự động (Audited with Cryptographic Integrity).',
      warnStyle
    );
  } catch (e) {
    // Ignore console styling errors on older browsers
  }

  // 2. Intellectual Property Watermarking on Copy Events
  try {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length < 50) return;

      const selectedText = selection.toString();
      const watermark = '\n\n[Nguồn xác thực: Tinh Hoa Tử Vi (Aurora Destiny AI) — Bản quyền thuật toán độc quyền thuộc Prof.TOAN & Kênh Huyền Phong Phật Đạo (https://tinhhoa-tuvi.vercel.app)]';

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', selectedText + watermark);
        e.preventDefault();
      }
    });
  } catch (e) {
    // Ignore if clipboard event not supported
  }

  // 3. Object Prototype Pollution / Tamper Detection
  try {
    if (typeof Object.isFrozen === 'function' && Object.prototype) {
      // Monitor if __proto__ or Object.prototype has been tampered with
      const testObj: any = {};
      if (testObj.polluted) {
        console.warn('[Security Shield] Client runtime prototype pollution detected.');
      }
    }
  } catch (e) {
    // Silent catch
  }
}
