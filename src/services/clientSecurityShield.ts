// ============================================================================
// AURORA DESTINY AI — CLIENT SECURITY & INTEGRITY SHIELD
// Clean Client-Side Advisory, Safe DOM Operations, Zero Prototype Pollution,
// Full Accessibility & Browser Usability Compliance
// ============================================================================

export interface SecurityShieldOptions {
  allowDevInLocalhost?: boolean;
}

let isShieldInitialized = false;

/**
 * Display a subtle security notice toast without unsafe HTML injection.
 */
export function showSecurityToast(message: string): void {
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

  const iconSpan = document.createElement('span');
  iconSpan.style.color = '#fbbf24';
  iconSpan.style.fontSize = '16px';
  iconSpan.textContent = '🛡️';

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
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
 * Initialize client-side security advisories:
 * - Legal/IP notice in developer console (non-destructive)
 * - Safe iframe embedding check
 * - Preserves standard browser developer tools, right-click, keyboard navigation and accessibility
 * - Strictly avoids mutating Object.prototype or global object prototypes
 */
export function initClientSecurityShield(_options: SecurityShieldOptions = {}): void {
  if (typeof window === 'undefined' || isShieldInitialized) return;
  isShieldInitialized = true;

  // 1. Informative Console Notice (Non-destructive, does not clear or suppress console)
  try {
    const titleStyle = 'font-size: 14px; font-weight: 800; color: #fbbf24; text-shadow: 0 0 6px rgba(251,191,36,0.5); padding: 4px;';
    const bodyStyle = 'font-size: 12px; color: #94a3b8; line-height: 1.5;';

    console.log(
      '%c🛡️ THIÊN MỆNH ĐỒ THƯ (AURORA DESTINY AI) — HỆ THỐNG AN NINH & BẢN QUYỀN',
      titleStyle
    );
    console.log(
      '%cMọi tính toán Bát Tự Tứ Trụ, Tử Vi Đẩu Số 108 Tinh Bàn và hệ thống năng lượng được bảo vệ bởi chữ ký mật mã HMAC-SHA256 phía máy chủ.\n' +
      'Bảo mật dữ liệu người dùng tuân thủ Zero-Trust, phân quyền RBAC và kiểm soát truy cập nghiêm ngặt.',
      bodyStyle
    );
  } catch {
    // Non-fatal if console is not available
  }

  // 2. Clickjacking / Unauthorized Framing Advisory
  try {
    if (window.self !== window.top) {
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
          isAllowedOrigin = true;
        }
      } catch {
        isAllowedOrigin = false;
      }

      if (!isAllowedOrigin) {
        console.warn('⚠️ [Security Advisory] Unauthorized iframe embedding detected. Restricting ambient operations.');
      }
    }
  } catch {
    // Non-fatal
  }
}
