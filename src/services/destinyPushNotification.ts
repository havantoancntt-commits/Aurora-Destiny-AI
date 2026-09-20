// ==========================================================
// AURORA DESTINY AI — PERSONALIZED CAN-CHI PUSH NOTIFICATION
// Sacred Astrological Hourly Guidance & Real-Time Alert Engine
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { calculateRealtimeSnapshot, HourlySlotInsight } from '../engine/realtimeEngine';
import { sacredSound } from './soundService';

export interface CanChiNotificationConfig {
  enabled: boolean;
  notifyAuspiciousHours: boolean; // Báo giờ Hoàng Đạo, Quý Nhân, Tam Hợp (Đại Cát / Tiểu Cát)
  notifyInauspiciousHours: boolean; // Cảnh báo giờ Hắc Đạo, Lục Xung, Xung Sát (Đại Hung / Tiểu Hung)
  morningBriefing: boolean; // Điểm tin vận khí đầu ngày (07:00 sáng)
  eveningReflection: boolean; // Nhắc nhở tĩnh tâm & định thần (21:00 tối)
  advanceNoticeMinutes: number; // 0 (đúng giờ) hoặc 10 (trước 10 phút)
  soundEnabled: boolean;
  vibrate: boolean;
}

export interface CanChiNotificationLog {
  id: string;
  timestamp: number;
  timeFormatted: string;
  slotBranch: string;
  slotStem: string;
  type: 'AUSPICIOUS' | 'INAUSPICIOUS' | 'MORNING_BRIEFING' | 'EVENING_REFLECTION' | 'TEST';
  title: string;
  body: string;
  resonanceScore: number;
  zodiacStarName: string;
}

export interface UpcomingAlertItem {
  slot: HourlySlotInsight;
  alertType: 'AUSPICIOUS' | 'INAUSPICIOUS' | 'BALANCED';
  scheduledTime: string; // e.g. "07:00"
  timeRange: string; // e.g. "07:00 - 08:59"
  title: string;
  previewMessage: string;
  isToday: boolean;
  isPassed: boolean;
  willTrigger: boolean;
}

const CONFIG_STORAGE_KEY = 'aurora_canchi_notification_config';
const LAST_NOTIFIED_KEY = 'aurora_canchi_last_notified_slot';
const HISTORY_STORAGE_KEY = 'aurora_canchi_notification_history';

export const DEFAULT_NOTIFICATION_CONFIG: CanChiNotificationConfig = {
  enabled: true,
  notifyAuspiciousHours: true,
  notifyInauspiciousHours: true,
  morningBriefing: true,
  eveningReflection: false,
  advanceNoticeMinutes: 10,
  soundEnabled: true,
  vibrate: true
};

// 1. Get stored preferences
export function getNotificationConfig(): CanChiNotificationConfig {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_CONFIG;
    return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG;
  }
}

// 2. Save preferences
export function saveNotificationConfig(config: CanChiNotificationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving notification config:', e);
  }
}

// 3. Check browser notification permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// 4. Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Auto register service worker when granted
      registerDestinyServiceWorker().catch(() => {});
    }
    return permission;
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return Notification.permission;
  }
}

// 5. Register Service Worker for system-level notifications
export async function registerDestinyServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (e) {
    console.warn('Service worker registration error (falling back to Window Notification):', e);
    return null;
  }
}

// 6. Core Dispatch Notification helper
export async function dispatchPushNotification(
  title: string,
  options: NotificationOptions & { vibrate?: number[] },
  soundEnabled: boolean = true,
  isHarmonic: boolean = true
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Sound feedback
  if (soundEnabled) {
    if (isHarmonic) {
      sacredSound.playTibetanBowl(528);
    } else {
      sacredSound.playTibetanBowl(396);
    }
  }

  // 1. Try Service Worker showNotification (preferred on Android & Chrome)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          icon: '/og-image.svg',
          badge: '/og-image.svg',
          tag: options.tag || 'aurora-canchi-alert',
          renotify: true,
          vibrate: (options as any).vibrate || [200, 100, 200],
          ...options
        } as any);
        return true;
      }
    } catch {
      // Fallback to standard window Notification
    }
  }

  // 2. Fallback to Window Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/og-image.svg',
        badge: '/og-image.svg',
        ...options
      });
      return true;
    } catch (e) {
      console.warn('Window Notification error:', e);
    }
  }

  return false;
}

// 7. Append log to notification history
function recordNotificationLog(log: Omit<CanChiNotificationLog, 'id' | 'timestamp' | 'timeFormatted'>): void {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const randomSuffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
    const fullLog: CanChiNotificationLog = {
      ...log,
      id: `log_${Date.now()}_${randomSuffix}`,
      timestamp: Date.now(),
      timeFormatted: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`
    };

    const history = getNotificationHistory();
    history.unshift(fullLog);
    // Keep last 25 items
    const trimmed = history.slice(0, 25);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving notification history:', e);
  }
}

export function getNotificationHistory(): CanChiNotificationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearNotificationHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {}
}

// 8. Generate rich personalized text for a slot
export function buildSlotNotificationContent(
  slot: HourlySlotInsight,
  profile: UserProfile,
  isAdvance: boolean = false
): { title: string; body: string; isHarmonic: boolean; type: 'AUSPICIOUS' | 'INAUSPICIOUS' } {
  const isAuspicious = slot.alertLevel === 'GOLDEN_WINDOW' || slot.luckCategory === 'DAI_CAT' || slot.luckCategory === 'TIEU_CAT';
  const prefix = isAdvance ? `⏰ Sắp Đến (10 phút): ` : `✨ Khai Mở: `;

  let title = '';
  let body = '';
  const isHarmonic = isAuspicious;

  const userHonorific = profile.name || 'Quý Bạn';

  if (isAuspicious) {
    const starLabel = slot.zodiacStarName ? `[${slot.zodiacStarName}]` : '[Hoàng Đạo]';
    title = `${prefix}Giờ Hoàng Đạo ${slot.stemNameVi} ${slot.branchNameVi} ${starLabel}`;
    
    const specialBlessings: string[] = [];
    if (slot.isGuiRen) specialBlessings.push('★ Thiên Ất Quý Nhân trợ lực');
    if (slot.isSanHe) specialBlessings.push('★ Tam Hợp cát khí');
    if (slot.isLiuHe) specialBlessings.push('★ Lục Hợp tương sinh');

    const blessingStr = specialBlessings.length > 0 ? ` (${specialBlessings.join(', ')})` : '';
    const advice = slot.bestForActivities[0] || 'Vượng khí thích hợp triển khai kế hoạch quan trọng, ký kết hoặc xuất hành';

    body = `Chào ${userHonorific}! Canh giờ này đắc sinh khí (${slot.resonanceScore}% hên)${blessingStr}. Lời khuyên: ${advice}.`;
  } else {
    const alertPrefix = isAdvance ? `⚠️ Sắp Vào Khung Giờ Cần Thận Trọng: ` : `⚠️ Cảnh Báo Canh Giờ Xung Khắc: `;
    title = `${alertPrefix}${slot.stemNameVi} ${slot.branchNameVi} (${slot.zodiacStarName || 'Hắc Đạo'})`;

    const warnings: string[] = [];
    if (slot.isClash) warnings.push('Lục Xung trực diện với Chi bản mệnh');
    if (slot.isLucHai) warnings.push('Lục Hại tiết khí');

    const warningStr = warnings.length > 0 ? `[${warnings.join(' • ')}] ` : '';
    const avoidAdvice = slot.avoidActivities[0] || 'Tránh tranh cãi, không vội vàng quyết định tài chính mạo hiểm';

    body = `${userHonorific} lưu ý: ${warningStr}Tỷ lệ rủi ro ${slot.riskPercentage}%. Lời khuyên: ${avoidAdvice}. Giữ tâm bình lặng để hóa giải.`;
  }

  return {
    title,
    body,
    isHarmonic,
    type: isAuspicious ? 'AUSPICIOUS' : 'INAUSPICIOUS'
  };
}

// 9. Evaluate whether to trigger hourly notification right now
export async function evaluateAndTriggerHourlyAlert(
  calculation: CalculationResult | null,
  profile: UserProfile | null,
  forcedTest: boolean = false
): Promise<{ triggered: boolean; title?: string; body?: string; message?: string }> {
  if (!calculation || !profile) {
    return { triggered: false, message: 'Chưa có thông tin lá số để phân tích' };
  }

  const config = getNotificationConfig();
  if (!config.enabled && !forcedTest) {
    return { triggered: false, message: 'Thông báo đẩy Can Chi đang tắt trong cài đặt' };
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted' && !forcedTest) {
    return { triggered: false, message: 'Chưa được cấp quyền thông báo trình duyệt' };
  }

  const now = new Date();
  const snapshot = calculateRealtimeSnapshot(calculation, now);
  const currentSlot = snapshot.currentSlot;

  // Check advance notice vs exact start
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  // Is this near the end of a slot (advance notice for next slot)?
  // Can-Chi slots change at odd hours: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
  // 10 minutes before odd hours means e.g. 00:50, 02:50, 04:50, 06:50...
  const currentHour = now.getHours();
  const isOddHour = currentHour % 2 !== 0;
  const isAdvanceWindow = !isOddHour && currentMinutes >= (60 - config.advanceNoticeMinutes);

  // Determine target slot to notify
  let targetSlot = currentSlot;
  let isAdvance = false;

  if (isAdvanceWindow && config.advanceNoticeMinutes > 0) {
    // Find next slot in allSlots
    const nextHour = (currentHour + 1) % 24;
    const testDate = new Date(now.getTime() + 15 * 60 * 1000);
    const futureSnapshot = calculateRealtimeSnapshot(calculation, testDate);
    targetSlot = futureSnapshot.currentSlot;
    isAdvance = true;
  }

  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const notificationTag = `${dateStr}_${targetSlot.branchKey}_${isAdvance ? 'advance' : 'start'}`;

  // If already notified for this slot tag and not a forced test, skip
  if (!forcedTest && typeof window !== 'undefined') {
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
    if (lastNotified === notificationTag) {
      return { triggered: false, message: 'Đã gửi thông báo cho canh giờ này' };
    }
  }

  // Check if targetSlot qualifies for user's alert filters
  const isAuspicious = targetSlot.alertLevel === 'GOLDEN_WINDOW' || targetSlot.luckCategory === 'DAI_CAT' || targetSlot.luckCategory === 'TIEU_CAT';
  const isClash = targetSlot.alertLevel === 'CLASH_ANOMALY' || targetSlot.luckCategory === 'DAI_HUNG' || targetSlot.isClash;

  let shouldSend = forcedTest;

  if (!forcedTest) {
    if (isAuspicious && config.notifyAuspiciousHours) {
      shouldSend = true;
    } else if (isClash && config.notifyInauspiciousHours) {
      shouldSend = true;
    }
  }

  if (!shouldSend) {
    return { triggered: false, message: 'Canh giờ này thuộc trạng thái Bình Hòa (không cần cảnh báo)' };
  }

  const { title, body, isHarmonic, type } = buildSlotNotificationContent(targetSlot, profile, isAdvance);

  const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean; data?: any } = {
    body,
    icon: '/og-image.svg',
    badge: '/og-image.svg',
    tag: notificationTag,
    renotify: true,
    vibrate: config.vibrate ? (isHarmonic ? [200, 100, 200] : [300, 150, 300, 150, 300]) : undefined,
    data: {
      url: '/?tab=daily',
      slotBranch: targetSlot.branchKey,
      timestamp: Date.now()
    }
  };

  const success = await dispatchPushNotification(title, options, config.soundEnabled, isHarmonic);

  if (success) {
    if (typeof window !== 'undefined' && !forcedTest) {
      localStorage.setItem(LAST_NOTIFIED_KEY, notificationTag);
    }

    recordNotificationLog({
      slotBranch: targetSlot.branchNameVi,
      slotStem: targetSlot.stemNameVi,
      type: forcedTest ? 'TEST' : type,
      title,
      body,
      resonanceScore: targetSlot.resonanceScore,
      zodiacStarName: targetSlot.zodiacStarName
    });

    return { triggered: true, title, body };
  }

  return { triggered: false, message: 'Trình duyệt không thể kích hoạt thông báo' };
}

// 10. Send an immediate rich test notification
export async function sendTestNotification(
  calculation: CalculationResult | null,
  profile: UserProfile | null
): Promise<{ success: boolean; message: string }> {
  if (!calculation || !profile) {
    return { success: false, message: 'Vui lòng chọn hoặc lập lá số trước khi thử nghiệm' };
  }

  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    return {
      success: false,
      message: 'Quyền thông báo chưa được cấp phép. Vui lòng nhấn "Cho phép" trên trình duyệt để trải nghiệm.'
    };
  }

  const result = await evaluateAndTriggerHourlyAlert(calculation, profile, true);
  if (result.triggered) {
    return {
      success: true,
      message: `Đã gửi thông báo đẩy mẫu: "${result.title}"`
    };
  } else {
    return {
      success: false,
      message: result.message || 'Không thể gửi thông báo mẫu'
    };
  }
}

// 11. Calculate entire schedule of upcoming alerts for today & tomorrow
export function getUpcomingAlertSchedule(
  calculation: CalculationResult | null,
  profile: UserProfile | null
): UpcomingAlertItem[] {
  if (!calculation || !profile) return [];

  const config = getNotificationConfig();
  const now = new Date();
  const todaySnapshot = calculateRealtimeSnapshot(calculation, now);
  const currentHour = now.getHours();

  const items: UpcomingAlertItem[] = [];

  todaySnapshot.hourlySlots.forEach((slot) => {
    const isAuspicious = slot.alertLevel === 'GOLDEN_WINDOW' || slot.luckCategory === 'DAI_CAT' || slot.luckCategory === 'TIEU_CAT';
    const isClash = slot.alertLevel === 'CLASH_ANOMALY' || slot.luckCategory === 'DAI_HUNG' || slot.isClash;
    
    const alertType = isAuspicious ? 'AUSPICIOUS' : isClash ? 'INAUSPICIOUS' : 'BALANCED';
    const willTrigger = config.enabled && ((isAuspicious && config.notifyAuspiciousHours) || (isClash && config.notifyInauspiciousHours));

    const isPassed = slot.endHour < currentHour && !(slot.endHour === 0 && currentHour >= 23);

    const { title, body } = buildSlotNotificationContent(slot, profile, false);

    items.push({
      slot,
      alertType,
      scheduledTime: `${slot.startHour.toString().padStart(2, '0')}:00`,
      timeRange: slot.timeRangeStr,
      title,
      previewMessage: body,
      isToday: true,
      isPassed,
      willTrigger
    });
  });

  return items;
}
