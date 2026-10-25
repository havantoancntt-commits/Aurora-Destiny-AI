// ==========================================================
// AURORA DESTINY AI — PERSONALIZED CAN-CHI PUSH NOTIFICATION
// Sacred Astrological Hourly Guidance & Real-Time Alert Engine
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==========================================================

import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { calculateRealtimeSnapshot, HourlySlotInsight } from '../engine/realtimeEngine';
import { sacredSound } from './soundService';
import { scanMajorEventsForProfiles, MajorDestinyEvent } from '../engine/destinyAlertWatchdog';
import { resolveEffectiveBirthTime } from '../engine/temporalCorrection';
import { getSolarTerm } from '../engine/lunarSolar';
import { STEMS, BRANCHES } from '../engine/canchi';

export interface CanChiNotificationConfig {
  enabled: boolean;
  notifyAuspiciousHours: boolean; // Báo giờ Hoàng Đạo, Quý Nhân, Tam Hợp (Đại Cát / Tiểu Cát)
  notifyInauspiciousHours: boolean; // Cảnh báo giờ Hắc Đạo, Lục Xung, Xung Sát (Đại Hung / Tiểu Hung)
  morningBriefing: boolean; // Điểm tin vận khí đầu ngày (07:00 sáng)
  eveningReflection: boolean; // Nhắc nhở tĩnh tâm & định thần (21:00 tối)
  advanceNoticeMinutes: number; // 0 (đúng giờ) hoặc 10 (trước 10 phút)
  soundEnabled: boolean;
  vibrate: boolean;
  notifyMultiProfiles: boolean; // Giám sát đa hồ sơ: cảnh báo cho tất cả người thân & đối tác đã lưu
  notifyMajorClashes: boolean; // Cảnh báo Thiên Khắc Địa Xung & Lục Xung bản mệnh theo ngày
  notifyQuyNhanLocThan: boolean; // Cảnh báo Giờ/Ngày Quý Nhân & Lộc Thần
  notifySolarTerms: boolean; // Cảnh báo chuyển giao 24 Tiết Khí thiên văn
  notify12hTrueSolarShift: boolean; // Cảnh báo chuyển vận định kỳ 12 giờ một lần theo giờ sinh chân mặt trời
  quietHoursEnabled: boolean; // Chế độ yên lặng ban đêm
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string; // "06:00"
}

export interface CanChiNotificationLog {
  id: string;
  timestamp: number;
  timeFormatted: string;
  slotBranch: string;
  slotStem: string;
  type: 'AUSPICIOUS' | 'INAUSPICIOUS' | 'MORNING_BRIEFING' | 'EVENING_REFLECTION' | 'TEST' | 'WATCHDOG_EVENT' | 'SOLAR_12H_SHIFT';
  title: string;
  body: string;
  resonanceScore: number;
  zodiacStarName: string;
  profileName?: string;
  severity?: string;
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
const WATCHDOG_NOTIFIED_PREFIX = 'aurora_watchdog_notified_';
const LAST_12H_SOLAR_NOTIFIED_PREFIX = 'aurora_12h_solar_last_notified_';

export const DEFAULT_NOTIFICATION_CONFIG: CanChiNotificationConfig = {
  enabled: true,
  notifyAuspiciousHours: true,
  notifyInauspiciousHours: true,
  morningBriefing: true,
  eveningReflection: false,
  advanceNoticeMinutes: 10,
  soundEnabled: true,
  vibrate: true,
  notifyMultiProfiles: true,
  notifyMajorClashes: true,
  notifyQuyNhanLocThan: true,
  notifySolarTerms: true,
  notify12hTrueSolarShift: true,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '06:00'
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

// 12. Helper to check if current time is within Quiet Hours
function isWithinQuietHours(config: CanChiNotificationConfig, now: Date = new Date()): boolean {
  if (!config.quietHoursEnabled) return false;
  try {
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = config.quietHoursStart.split(':').map(Number);
    const [endH, endM] = config.quietHoursEnd.split(':').map(Number);
    const startMin = startH * 60 + (startM || 0);
    const endMin = endH * 60 + (endM || 0);

    if (startMin > endMin) {
      // Overnight (e.g. 23:00 to 06:00)
      return currentMin >= startMin || currentMin < endMin;
    } else {
      return currentMin >= startMin && currentMin < endMin;
    }
  } catch {
    return false;
  }
}

// 13. Multi-profile Watchdog Alert Evaluator (Checks All Profiles for Major Events)
export async function evaluateAndTriggerWatchdogAlerts(
  profiles: UserProfile[],
  calculations: Record<string, CalculationResult | null> = {},
  forcedTest: boolean = false
): Promise<{ triggered: boolean; event?: MajorDestinyEvent; message?: string }> {
  if (!profiles || profiles.length === 0) {
    return { triggered: false, message: 'Chưa có hồ sơ nào được lưu trong hệ thống' };
  }

  const config = getNotificationConfig();
  if (!config.enabled && !forcedTest) {
    return { triggered: false, message: 'Hệ thống thông báo đẩy đang tắt' };
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted' && !forcedTest) {
    return { triggered: false, message: 'Chưa được cấp quyền thông báo trình duyệt' };
  }

  const now = new Date();
  if (!forcedTest && isWithinQuietHours(config, now)) {
    return { triggered: false, message: 'Đang trong khung giờ tĩnh tâm (Chế độ Không làm phiền)' };
  }

  // Target profiles: All profiles if notifyMultiProfiles is true, else only primary
  const targetProfiles = config.notifyMultiProfiles
    ? profiles
    : profiles.filter((p) => p.isPrimary || profiles.indexOf(p) === 0);

  // Scan all major celestial events
  const events = scanMajorEventsForProfiles(targetProfiles, calculations, now);
  if (events.length === 0) {
    return { triggered: false, message: 'Không có biến động thiên văn bất thường vào thời điểm này' };
  }

  // Pick top priority event
  for (const event of events) {
    // Filter by user preference toggles
    if (!forcedTest) {
      if (
        (event.eventType === 'THIEN_KHAC_DIA_XUNG' || event.eventType === 'LUC_XUNG_NATAL') &&
        !config.notifyMajorClashes
      ) {
        continue;
      }
      if (
        (event.eventType === 'THIEN_AT_QUY_NHAN' || event.eventType === 'LOC_THAN_TAI_BACH') &&
        !config.notifyQuyNhanLocThan
      ) {
        continue;
      }
      if (event.eventType === 'SOLAR_TERM_INGRESS' && !config.notifySolarTerms) {
        continue;
      }

      // De-duplicate: check if already notified today
      const storageKey = `${WATCHDOG_NOTIFIED_PREFIX}${event.id}`;
      if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
        continue; // Already notified for this exact event today
      }
    }

    const isHarmonic = event.severity === 'CRITICAL_POSITIVE' || event.severity === 'HIGH_POSITIVE' || event.severity === 'NEUTRAL_INFO';

    const notificationOptions: NotificationOptions & { vibrate?: number[]; data?: any; renotify?: boolean } = {
      body: `${event.summary}\n💡 Lời khuyên: ${event.actionableDos[0] || event.detailedAdvice.slice(0, 80)}`,
      icon: '/og-image.svg',
      badge: '/og-image.svg',
      tag: event.id,
      renotify: true,
      vibrate: config.vibrate ? (isHarmonic ? [250, 100, 250] : [400, 150, 400, 150, 400]) : undefined,
      data: {
        url: '/?tab=daily',
        eventId: event.id,
        profileId: event.profileId,
        eventType: event.eventType
      }
    };

    const success = await dispatchPushNotification(
      event.title,
      notificationOptions,
      config.soundEnabled,
      isHarmonic
    );

    if (success || forcedTest) {
      if (typeof window !== 'undefined' && !forcedTest) {
        localStorage.setItem(`${WATCHDOG_NOTIFIED_PREFIX}${event.id}`, Date.now().toString());
      }

      recordNotificationLog({
        slotBranch: event.targetTime,
        slotStem: event.relationshipTag || 'Bản mệnh',
        type: 'WATCHDOG_EVENT',
        title: event.title,
        body: event.summary,
        resonanceScore: event.urgency,
        zodiacStarName: event.eventType,
        profileName: event.profileName,
        severity: event.severity
      });

      // Dispatch in-app celestial alert event for luxury floating HUD
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aurora:celestial-alert', {
            detail: {
              ...event,
              timestamp: Date.now()
            }
          })
        );
      }

      return { triggered: true, event, message: `Đã gửi thông báo: ${event.title}` };
    }
  }

  return { triggered: false, message: 'Các sự kiện hôm nay đã được thông báo trước đó' };
}

// 14. Send Multi-Profile Test Push Notification
export async function sendMultiProfileTestPush(
  profiles: UserProfile[],
  calculations: Record<string, CalculationResult | null> = {}
): Promise<{ success: boolean; message: string; event?: MajorDestinyEvent }> {
  if (!profiles || profiles.length === 0) {
    return { success: false, message: 'Vui lòng lập ít nhất một lá số trước khi thử nghiệm' };
  }

  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    return {
      success: false,
      message: 'Quyền thông báo chưa được cấp phép. Vui lòng bấm "Cho phép" trên trình duyệt.'
    };
  }

  const result = await evaluateAndTriggerWatchdogAlerts(profiles, calculations, true);
  if (result.triggered && result.event) {
    return {
      success: true,
      message: `Đã phát thông báo đẩy thành công cho ${result.event.profileName}: "${result.event.title}"`,
      event: result.event
    };
  } else {
    // If no specific event was synthesized, fallback to standard slot push test
    const standardTest = await sendTestNotification(
      calculations[profiles[0].id] || null,
      profiles[0]
    );
    return standardTest;
  }
}

// ==============================================================================
// 15. CALCULATE NEXT 12-HOUR TRUE SOLAR MILESTONES
// ==============================================================================
export interface TrueSolarMilestonesInfo {
  trueSolarBirthTimeStr: string;
  milestone1TimeStr: string;
  milestone2TimeStr: string;
  nextMilestoneDate: Date;
  nextPhase: 1 | 2;
  minutesUntilNext: number;
  timeRemainingFormatted: string;
}

export function getNext12hTrueSolarMilestones(
  calculation: CalculationResult | null,
  profile: UserProfile | null,
  now: Date = new Date()
): TrueSolarMilestonesInfo | null {
  if (!profile) return null;
  const eff = calculation?.effectiveBirthTime || resolveEffectiveBirthTime(profile.birthData);
  const birthH = eff.effectiveHour;
  const birthM = eff.effectiveMinute;

  const m1TotalMin = birthH * 60 + birthM;
  const m2TotalMin = (m1TotalMin + 720) % 1440;

  const m1H = Math.floor(m1TotalMin / 60);
  const m1M = m1TotalMin % 60;
  const m2H = Math.floor(m2TotalMin / 60);
  const m2M = m2TotalMin % 60;

  const milestone1TimeStr = `${m1H.toString().padStart(2, '0')}:${m1M.toString().padStart(2, '0')}`;
  const milestone2TimeStr = `${m2H.toString().padStart(2, '0')}:${m2M.toString().padStart(2, '0')}`;

  // Candidate dates for m1 and m2
  const candidate1 = new Date(now);
  candidate1.setHours(m1H, m1M, 0, 0);
  if (candidate1.getTime() <= now.getTime()) {
    candidate1.setDate(candidate1.getDate() + 1);
  }

  const candidate2 = new Date(now);
  candidate2.setHours(m2H, m2M, 0, 0);
  if (candidate2.getTime() <= now.getTime()) {
    candidate2.setDate(candidate2.getDate() + 1);
  }

  const nextDate = candidate1.getTime() < candidate2.getTime() ? candidate1 : candidate2;
  const nextPhase: 1 | 2 = candidate1.getTime() < candidate2.getTime() ? 1 : 2;

  const diffMs = nextDate.getTime() - now.getTime();
  const diffTotalMin = Math.max(0, Math.round(diffMs / 60000));
  const diffH = Math.floor(diffTotalMin / 60);
  const diffM = diffTotalMin % 60;

  const timeRemainingFormatted = diffH > 0
    ? `${diffH} giờ ${diffM.toString().padStart(2, '0')} phút`
    : `${diffM} phút`;

  return {
    trueSolarBirthTimeStr: milestone1TimeStr,
    milestone1TimeStr,
    milestone2TimeStr,
    nextMilestoneDate: nextDate,
    nextPhase,
    minutesUntilNext: diffTotalMin,
    timeRemainingFormatted
  };
}

// ==============================================================================
// 16. BUILD RICH ASTROLOGICAL CONTENT FOR 12-HOUR TRUE SOLAR TIME SHIFT
// ==============================================================================
export function build12hTrueSolarShiftContent(
  calculation: CalculationResult,
  profile: UserProfile,
  phase: 1 | 2,
  now: Date = new Date()
): { title: string; body: string; summary: string; isHarmonic: boolean } {
  const eff = calculation.effectiveBirthTime || resolveEffectiveBirthTime(profile.birthData);
  const birthH = eff.effectiveHour;
  const birthM = eff.effectiveMinute;
  const m1TotalMin = birthH * 60 + birthM;
  const m2TotalMin = (m1TotalMin + 720) % 1440;

  const phaseH = phase === 1 ? Math.floor(m1TotalMin / 60) : Math.floor(m2TotalMin / 60);
  const phaseM = phase === 1 ? (m1TotalMin % 60) : (m2TotalMin % 60);
  const phaseTimeStr = `${phaseH.toString().padStart(2, '0')}:${phaseM.toString().padStart(2, '0')}`;

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const timezoneOffset = profile.birthData.timezoneOffset !== undefined ? profile.birthData.timezoneOffset : 7;
  const solarTerm = getSolarTerm(currentYear, currentMonth, currentDay, timezoneOffset, now.getHours(), now.getMinutes());

  const snapshot = calculateRealtimeSnapshot(calculation, now);
  const currentSlot = snapshot.currentSlot;

  // Decade Cycle (Đại Vận) Shift Status
  let decadeStatus = '';
  const currentDecade = calculation.decades?.find((d) => currentYear >= d.startYear && currentYear <= d.endYear);
  if (currentDecade) {
    const stemName = STEMS[currentDecade.stem]?.nameVi || currentDecade.stem;
    const branchName = BRANCHES[currentDecade.branch]?.nameVi || currentDecade.branch;
    const decadeCanChi = `${stemName} ${branchName}`;
    const palaceMap: Record<string, string> = {
      life: 'Mệnh',
      siblings: 'Huynh Đệ',
      spouse: 'Phu Thê',
      children: 'Tử Tức',
      wealth: 'Tài Bạch',
      health: 'Tật Ách',
      travel: 'Thiên Di',
      friends: 'Nô Bộc',
      career: 'Quan Lộc',
      property: 'Điền Trạch',
      karma: 'Phúc Đức',
      parents: 'Phụ Mẫu'
    };
    const palaceNameVi = palaceMap[currentDecade.focalPalace] || 'Mệnh';
    const yearsLeft = currentDecade.endYear - currentYear + 1;
    if (yearsLeft <= 2) {
      decadeStatus = `Đang ở giai đoạn chuyển vận cuối Đại Vận ${decadeCanChi} (${yearsLeft} năm nữa chuyển sang Đại Vận mới)`;
    } else {
      decadeStatus = `Đại Vận ${decadeCanChi} (${currentDecade.startAge}-${currentDecade.endAge} tuổi, Cung ${palaceNameVi})`;
    }
  }

  // Next 12 Hours Auspicious Slots
  const favorableSlots = snapshot.hourlySlots.filter(
    (s) => s.alertLevel === 'GOLDEN_WINDOW' || s.luckCategory === 'DAI_CAT' || s.luckCategory === 'TIEU_CAT'
  );
  const goldenStr = favorableSlots.length > 0
    ? favorableSlots.slice(0, 3).map((s) => `${s.branchNameVi} (${s.timeRangeStr})`).join(', ')
    : 'Bình hòa, nên giữ định tâm';

  // Favorable Elements (Dụng Thần)
  const favElements = calculation.bazi?.favorableElements?.join(', ') || 'Cân bằng ngũ hành';

  const phaseLabel = phase === 1 ? 'Giờ Sinh Chân Mặt Trời' : 'Trục Đối Xung Âm Dương (12h)';
  const title = phase === 1
    ? `🔔 [12H CHÂN MẶT TRỜI] Chuyển Vận Bản Mệnh • ${profile.name} [${phaseTimeStr}]`
    : `🔔 [12H ĐỐI CỰC] Chuyển Vận Trục Đối Xung • ${profile.name} [${phaseTimeStr}]`;

  const body =
    `☀️ Thời khắc ${phaseLabel} | Canh giờ: ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (Tiết ${solarTerm})\n` +
    `🌀 ${decadeStatus ? decadeStatus + '\n' : ''}` +
    `⭐ 12h tới: Giờ cát [${goldenStr}]. Dụng thần bổ trợ: [${favElements}].\n` +
    `💡 Lời khuyên: Giữ tâm sáng định tĩnh, khởi sự vào giờ hoàng đạo để chiêu cát tị hung.`;

  const summary = `Cảnh báo chuyển vận định kỳ 12 giờ theo giờ sinh chân mặt trời (${phaseTimeStr}) cho hồ sơ ${profile.name}.`;

  const isHarmonic = currentSlot.alertLevel !== 'CLASH_ANOMALY';

  return { title, body, summary, isHarmonic };
}

// ==============================================================================
// 17. EVALUATE AND TRIGGER 12-HOUR TRUE SOLAR TIME SHIFT PUSH ALERT
// ==============================================================================
export async function evaluateAndTrigger12hTrueSolarShiftAlert(
  calculation: CalculationResult | null,
  profile: UserProfile | null,
  forcedTest: boolean = false
): Promise<{ triggered: boolean; title?: string; body?: string; message?: string }> {
  if (!calculation || !profile) {
    return { triggered: false, message: 'Chưa có thông tin hồ sơ hoặc lá số để phân tích' };
  }

  const config = getNotificationConfig();
  if (!config.enabled && !forcedTest) {
    return { triggered: false, message: 'Hệ thống thông báo đẩy đang tắt trong cài đặt' };
  }

  if (!config.notify12hTrueSolarShift && !forcedTest) {
    return { triggered: false, message: 'Thông báo chuyển vận 12h theo giờ sinh chân mặt trời đang tắt' };
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted' && !forcedTest) {
    return { triggered: false, message: 'Chưa được cấp quyền thông báo trình duyệt' };
  }

  const now = new Date();
  if (!forcedTest && isWithinQuietHours(config, now)) {
    return { triggered: false, message: 'Đang trong khung giờ tĩnh tâm (Không làm phiền)' };
  }

  const eff = calculation.effectiveBirthTime || resolveEffectiveBirthTime(profile.birthData);
  const birthH = eff.effectiveHour;
  const birthM = eff.effectiveMinute;

  const m1TotalMin = birthH * 60 + birthM;
  const m2TotalMin = (m1TotalMin + 720) % 1440;

  const currentTotalMin = now.getHours() * 60 + now.getMinutes();

  // Calculate circular distance (0-720 min)
  let diff1 = Math.abs(currentTotalMin - m1TotalMin);
  if (diff1 > 720) diff1 = 1440 - diff1;

  let diff2 = Math.abs(currentTotalMin - m2TotalMin);
  if (diff2 > 720) diff2 = 1440 - diff2;

  const phase: 1 | 2 = diff1 <= diff2 ? 1 : 2;
  const minDiff = Math.min(diff1, diff2);

  // Check if we are within the +/- 25 minute window, OR if >= 11.5 hours elapsed since last alert
  const storageKey = `${LAST_12H_SOLAR_NOTIFIED_PREFIX}${profile.id}`;
  let lastSentTime = 0;
  let lastCycleTag = '';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        lastSentTime = parsed.timestamp || 0;
        lastCycleTag = parsed.cycleTag || '';
      }
    } catch {}
  }

  const hoursSinceLast = (now.getTime() - lastSentTime) / (3600 * 1000);
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const currentCycleTag = `${dateStr}_phase${phase}`;

  let shouldTrigger = forcedTest;

  if (!forcedTest) {
    const isInsideWindow = minDiff <= 25;
    const isDueByTime = hoursSinceLast >= 11.5;

    if ((isInsideWindow || isDueByTime) && lastCycleTag !== currentCycleTag) {
      shouldTrigger = true;
    }
  }

  if (!shouldTrigger) {
    return {
      triggered: false,
      message: `Chưa tới mốc 12 giờ chân mặt trời tiếp theo (còn khoảng ${minDiff} phút hoặc đã gửi trong chu kỳ này)`
    };
  }

  const { title, body, summary, isHarmonic } = build12hTrueSolarShiftContent(calculation, profile, phase, now);

  const notificationOptions: NotificationOptions & { vibrate?: number[]; data?: any; renotify?: boolean } = {
    body,
    icon: '/og-image.svg',
    badge: '/og-image.svg',
    tag: `aurora-12h-solar-${profile.id}-${currentCycleTag}`,
    renotify: true,
    vibrate: config.vibrate ? [250, 100, 200, 100, 250, 100, 400] : undefined,
    data: {
      url: '/?tab=daily&source=12h_solar_push',
      profileId: profile.id,
      phase,
      type: 'SOLAR_12H_SHIFT',
      timestamp: Date.now()
    }
  };

  const dispatched = await dispatchPushNotification(
    title,
    notificationOptions,
    config.soundEnabled,
    isHarmonic
  );

  if (dispatched) {
    if (typeof window !== 'undefined' && !forcedTest) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            timestamp: Date.now(),
            cycleTag: currentCycleTag,
            phase
          })
        );
      } catch {}
    }

    recordNotificationLog({
      slotBranch: phase === 1 ? 'Giờ Sinh' : 'Đối Xung 12h',
      slotStem: 'Chân Mặt Trời',
      type: 'SOLAR_12H_SHIFT',
      title,
      body,
      resonanceScore: 98,
      zodiacStarName: '12h_True_Solar_Shift',
      profileName: profile.name,
      severity: isHarmonic ? 'HIGH_POSITIVE' : 'CAUTION_WARNING'
    });

    // In-app celestial alert event for floating banner
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aurora:celestial-alert', {
          detail: {
            id: `12h_solar_${profile.id}_${Date.now()}`,
            profileId: profile.id,
            profileName: profile.name,
            eventType: 'SOLAR_TERM_INGRESS',
            severity: isHarmonic ? 'HIGH_POSITIVE' : 'CAUTION_WARNING',
            title,
            summary,
            timestamp: Date.now()
          }
        })
      );
    }

    return { triggered: true, title, body };
  }

  return { triggered: false, message: 'Trình duyệt không thể kích hoạt thông báo đẩy' };
}

// ==============================================================================
// 18. SEND 12-HOUR TRUE SOLAR TEST PUSH NOTIFICATION
// ==============================================================================
export async function send12hTrueSolarTestPush(
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
      message: 'Quyền thông báo chưa được cấp phép. Vui lòng bấm "Cho phép" trên trình duyệt.'
    };
  }

  const result = await evaluateAndTrigger12hTrueSolarShiftAlert(calculation, profile, true);
  if (result.triggered) {
    return {
      success: true,
      message: `Đã phát thông báo đẩy chuyển vận 12h: "${result.title}"`
    };
  } else {
    return {
      success: false,
      message: result.message || 'Không thể kích hoạt thông báo đẩy'
    };
  }
}

