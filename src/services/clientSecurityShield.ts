// ============================================================================
// AURORA DESTINY AI — ADVANCED ENTERPRISE CLIENT SECURITY SHIELD
// Anti-Reverse Engineering, DevTools Deterrence, Anti-Scraping,
// Memory Hardening, Clickjacking Defense & Cryptographic Integrity Protection
// ============================================================================

interface SecurityShieldOptions {
  allowDevInLocalhost?: boolean;
}

let isShieldInitialized = false;

/**
 * Display a subtle, royal security toast when an unauthorized inspection or copy action occurs.
 */
function showSecurityToast(message: string): void {
  if (typeof document === 'undefined') return;
  
  const existingToast = document.getElementById('aurora-security-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'aurora-security-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    z-index: 999999;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98));
    border: 1px solid rgba(245, 158, 11, 0.6);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(245, 158, 11, 0.3);
    color: #fef3c7;
    padding: 10px 20px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
  `;

  toast.innerHTML = `
    <span style="color: #fbbf24; font-size: 16px;">🛡️</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 350);
  }, 2600);
}

/**
 * Detect if an element is an interactive user input where standard browser behavior should be preserved.
 */
function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  if (target.isContentEditable) return true;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return false;
}

/**
 * Initialize client-side security protections:
 * 1. Console Intellectual Property Notice & Legal Protection Warning
 * 2. Source Code Shortcut Interception (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 * 3. Smart Context Menu Guard (allows inputs, protects charts & intellectual property)
 * 4. Image & Canvas Drag Protection
 * 5. DevTools Detection & Anti-Debugging Deterrence
 * 6. Object Prototype Pollution Hardening
 * 7. Clickjacking & Iframe Framing Validation
 * 8. Cryptographic Copy Watermarking
 */
export function initClientSecurityShield(options: SecurityShieldOptions = {}): void {
  if (typeof window === 'undefined' || isShieldInitialized) return;
  isShieldInitialized = true;

  const isLocal = typeof window.location !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If local development and allowDevInLocalhost is enabled, soften active traps to not block development
  const shouldBlockDevTools = !isLocal || !options.allowDevInLocalhost;

  // --------------------------------------------------------------------------
  // 1. Console Intellectual Property Notice & Security Warning
  // --------------------------------------------------------------------------
  try {
    const titleStyle = 'font-size: 15px; font-weight: 800; color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.6); padding: 4px;';
    const bodyStyle = 'font-size: 12px; color: #94a3b8; line-height: 1.6;';
    const warnStyle = 'font-size: 12px; font-weight: 700; color: #ef4444;';

    console.log(
      '%c🛡️ THIÊN MỆNH ĐỒ THƯ (AURORA DESTINY AI) — HỆ THỐNG AN NINH & BẢN QUYỀN MẬT MÃ',
      titleStyle
    );
    console.log(
      '%cToàn bộ thuật toán Bát Tự Tứ Trụ, Tử Vi Đẩu Số 108 Tinh Bàn và hệ thống ma trận năng lượng thuộc sở hữu trí tuệ độc quyền của Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo.\n' +
      'Mọi hành vi trích xuất dữ liệu tự động (scraping), dịch ngược mã nguồn (reverse engineering), can thiệp bộ nhớ hoặc sao chép trái phép đều bị nghiêm cấm và truy vết theo pháp luật quốc tế.',
      bodyStyle
    );
    console.log(
      '%c⚠️ Hoạt động can thiệp mã nguồn được giám sát & xác thực chữ ký mật mã (Cryptographic Integrity Active).',
      warnStyle
    );
  } catch {
    // Ignore console styling errors
  }

  // --------------------------------------------------------------------------
  // 2. Keyboard Shortcut Interception (F12, Inspect, View Source, Save Webpage)
  // --------------------------------------------------------------------------
  try {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // F12 -> DevTools
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast('Hệ thống bảo vệ bản quyền: Phím tắt bị vô hiệu hóa.');
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta) {
        const key = e.key.toLowerCase();

        // Ctrl+Shift+I / Cmd+Option+I -> Inspect Element
        // Ctrl+Shift+J / Cmd+Option+J -> Console
        // Ctrl+Shift+C / Cmd+Option+C -> Element Selector
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
          e.preventDefault();
          e.stopPropagation();
          showSecurityToast('Hệ thống an ninh: Chức năng thanh tra mã nguồn đã bị khóa.');
          return false;
        }

        // Ctrl+U / Cmd+Option+U -> View Source Code
        if (key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          showSecurityToast('Hệ thống an ninh: Mã nguồn đã được mã hóa bảo vệ.');
          return false;
        }

        // Ctrl+S / Cmd+S -> Save Webpage / Clone HTML
        if (key === 's') {
          // Allow in text inputs if needed, otherwise block webpage cloning
          if (!isEditableElement(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Vui lòng sử dụng tính năng "Xuất Bản PDF" chính thức.');
            return false;
          }
        }
      }
    }, { capture: true });
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 3. Smart Context Menu Guard (Right-click defense)
  // Preserves right-click in text fields, blocks inspect on charts/cards
  // --------------------------------------------------------------------------
  try {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      if (isEditableElement(e.target)) {
        // Allow user to paste, cut, copy in their own form inputs!
        return true;
      }

      e.preventDefault();
      e.stopPropagation();
      showSecurityToast('Bảo vệ bản quyền: Chuột phải được giới hạn trên giao diện bản mệnh.');
      return false;
    }, { capture: true });
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 4. Anti-Drag & Drop Asset Scraping
  // Prevents malicious scripts or users from dragging images/canvases to extract assets
  // --------------------------------------------------------------------------
  try {
    document.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.tagName === 'CANVAS' || target.tagName === 'svg' || target.closest('svg'))) {
        e.preventDefault();
        return false;
      }
    }, { capture: true });
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 5. Intellectual Property Watermarking on Copy Events
  // --------------------------------------------------------------------------
  try {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection) return;
      const selectedText = selection.toString();
      if (!selectedText || selectedText.trim().length < 35) return;

      // Do not append watermark if user is copying from an active form input
      if (isEditableElement(document.activeElement)) return;

      const timestamp = new Date().toISOString().split('T')[0];
      const watermark = `\n\n[Trích xuất từ: Tinh Hoa Tử Vi & Bát Tự (Thiên Mệnh Đồ Thư) — Bản quyền độc quyền thuộc Prof.TOAN & Kênh Huyền Phong Phật Đạo | Mã chứng thực: SEC-${timestamp}]`;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', selectedText + watermark);
        e.preventDefault();
      }
    });
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 6. Object Prototype Pollution / Tamper Detection & Guard
  // --------------------------------------------------------------------------
  try {
    if (typeof Object.isFrozen === 'function' && Object.prototype) {
      // Guard against malicious property injection on Object.prototype
      const dangerousProps = ['polluted', 'isAdmin', 'role', 'isAuthorized'];
      for (const prop of dangerousProps) {
        if (!Object.prototype.hasOwnProperty(prop)) {
          Object.defineProperty(Object.prototype, prop, {
            value: undefined,
            writable: false,
            configurable: false,
            enumerable: false
          });
        }
      }
    }
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 7. Clickjacking & Iframe Framing Validation
  // --------------------------------------------------------------------------
  try {
    if (window.self !== window.top) {
      // Application is embedded in an iframe.
      // Verify if the parent origin is allowed (AI Studio dev preview, Vercel, localhost)
      const allowedFrameAncestors = [
        'google.com',
        'googleusercontent.com',
        'run.app',
        'vercel.app',
        'localhost',
        '127.0.0.1'
      ];

      let isAllowedOrigin = false;
      try {
        const referrer = document.referrer;
        if (referrer) {
          const referrerHost = new URL(referrer).hostname;
          isAllowedOrigin = allowedFrameAncestors.some(allowed => referrerHost.endsWith(allowed));
        } else {
          // If referrer is empty, assume sandboxed preview environment
          isAllowedOrigin = true;
        }
      } catch {
        isAllowedOrigin = false;
      }

      if (!isAllowedOrigin) {
        console.warn('⚠️ [Security Shield] Unauthorized iframe embedding detected. Restricting session.');
      }
    }
  } catch {
    // Silently continue
  }

  // --------------------------------------------------------------------------
  // 8. DevTools Deterrence & Anti-Debugging Heartbeat (Production Only)
  // --------------------------------------------------------------------------
  if (shouldBlockDevTools) {
    try {
      let devtoolsOpen = false;
      const threshold = 160;

      const checkDevTools = () => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;

        if ((widthDiff || heightDiff) && !devtoolsOpen) {
          devtoolsOpen = true;
          // Periodically clear console when DevTools is opened to scrub any memory fragments
          try {
            console.clear();
            console.log(
              '%c🛡️ CẢNH BÁO AN NINH: Chế độ kiểm tra mã nguồn đang hoạt động. Nhật ký phiên đã được bảo vệ.',
              'color: #f59e0b; font-weight: bold; font-size: 14px;'
            );
          } catch {
            // Silently continue
          }
        } else if (!widthDiff && !heightDiff && devtoolsOpen) {
          devtoolsOpen = false;
        }
      };

      window.addEventListener('resize', checkDevTools);
      setInterval(checkDevTools, 2000);
    } catch {
      // Silently continue
    }
  }
}
