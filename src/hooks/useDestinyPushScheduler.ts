// ==============================================================================
// AURORA DESTINY AI — CAN-CHI & MULTI-PROFILE PUSH NOTIFICATION SCHEDULER HOOK
// Periodic 12-Hour True Solar Time Shift Alerts & Classical Metaphysical Watchdog
// Curated by Giáo Sư - Prof.TOAN & Kênh Huyền Phong Phật Đạo
// ==============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  registerDestinyServiceWorker,
  evaluateAndTriggerHourlyAlert,
  evaluateAndTriggerWatchdogAlerts,
  evaluateAndTrigger12hTrueSolarShiftAlert,
  send12hTrueSolarTestPush,
  sendTestNotification,
  sendMultiProfileTestPush,
  getNext12hTrueSolarMilestones,
  getNotificationPermission,
  TrueSolarMilestonesInfo
} from '../services/destinyPushNotification';

export interface UseDestinyPushSchedulerReturn {
  permission: NotificationPermission | 'unsupported';
  nextMilestones: TrueSolarMilestonesInfo | null;
  trigger12hSolarNow: (forced?: boolean) => Promise<{ triggered: boolean; title?: string; body?: string; message?: string }>;
  test12hSolarPush: () => Promise<{ success: boolean; message: string }>;
  testHourlyPush: () => Promise<{ success: boolean; message: string }>;
  testWatchdogPush: () => Promise<{ success: boolean; message: string }>;
}

export function useDestinyPushScheduler(
  profiles: UserProfile[],
  activeProfile: UserProfile | null,
  calculation: CalculationResult | null
): UseDestinyPushSchedulerReturn {
  const isRunningRef = useRef<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [nextMilestones, setNextMilestones] = useState<TrueSolarMilestonesInfo | null>(() =>
    getNext12hTrueSolarMilestones(calculation, activeProfile)
  );

  // 1. Register service worker once on startup
  useEffect(() => {
    registerDestinyServiceWorker().catch(() => {});
  }, []);

  // Update milestone info whenever profile or calculation changes
  useEffect(() => {
    setNextMilestones(getNext12hTrueSolarMilestones(calculation, activeProfile));
    setPermission(getNotificationPermission());
  }, [calculation, activeProfile]);

  // 2. Periodic check function
  const checkSchedule = useCallback(async () => {
    if (isRunningRef.current) return;
    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);
    if (currentPerm !== 'granted') return;

    try {
      isRunningRef.current = true;

      // A. Check active profile hourly Can-Chi transit
      if (calculation && activeProfile) {
        await evaluateAndTriggerHourlyAlert(calculation, activeProfile);
      }

      // B. Check multi-profile major celestial watchdog alerts
      const calcsMap: Record<string, CalculationResult | null> = {};
      if (activeProfile && calculation) {
        calcsMap[activeProfile.id] = calculation;
      }
      await evaluateAndTriggerWatchdogAlerts(profiles, calcsMap);

      // C. Check periodic 12-Hour True Solar Time Shift Alert (Giờ Sinh Chân Mặt Trời & Đối Xung)
      if (calculation && activeProfile) {
        await evaluateAndTrigger12hTrueSolarShiftAlert(calculation, activeProfile);
        setNextMilestones(getNext12hTrueSolarMilestones(calculation, activeProfile));
      }
    } catch (e) {
      console.error('Error during push notification evaluation:', e);
    } finally {
      isRunningRef.current = false;
    }
  }, [profiles, activeProfile, calculation]);

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;

    // Initial check after 3 seconds
    const initialTimer = setTimeout(() => {
      checkSchedule();
    }, 3000);

    // Run check every 45 seconds to catch transitions accurately
    const intervalTimer = setInterval(() => {
      checkSchedule();
    }, 45000);

    // Also check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSchedule();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profiles, activeProfile, calculation, checkSchedule]);

  // Public imperative trigger helpers
  const trigger12hSolarNow = useCallback(
    async (forced: boolean = true) => {
      return await evaluateAndTrigger12hTrueSolarShiftAlert(calculation, activeProfile, forced);
    },
    [calculation, activeProfile]
  );

  const test12hSolarPush = useCallback(async () => {
    return await send12hTrueSolarTestPush(calculation, activeProfile);
  }, [calculation, activeProfile]);

  const testHourlyPush = useCallback(async () => {
    return await sendTestNotification(calculation, activeProfile);
  }, [calculation, activeProfile]);

  const testWatchdogPush = useCallback(async () => {
    const calcsMap: Record<string, CalculationResult | null> = {};
    if (activeProfile && calculation) {
      calcsMap[activeProfile.id] = calculation;
    }
    return await sendMultiProfileTestPush(profiles, calcsMap);
  }, [profiles, activeProfile, calculation]);

  return {
    permission,
    nextMilestones,
    trigger12hSolarNow,
    test12hSolarPush,
    testHourlyPush,
    testWatchdogPush
  };
}

export {
  evaluateAndTrigger12hTrueSolarShiftAlert,
  send12hTrueSolarTestPush,
  getNext12hTrueSolarMilestones
};

