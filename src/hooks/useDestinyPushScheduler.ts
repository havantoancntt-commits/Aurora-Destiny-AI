// ==============================================================================
// AURORA DESTINY AI — CAN-CHI & MULTI-PROFILE PUSH NOTIFICATION SCHEDULER HOOK
// Automatically monitors and triggers hourly push notifications & watchdog alerts
// ==============================================================================

import { useEffect, useRef } from 'react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  registerDestinyServiceWorker,
  evaluateAndTriggerHourlyAlert,
  evaluateAndTriggerWatchdogAlerts,
  getNotificationPermission
} from '../services/destinyPushNotification';

export function useDestinyPushScheduler(
  profiles: UserProfile[],
  activeProfile: UserProfile | null,
  calculation: CalculationResult | null
) {
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Register service worker once on startup
    registerDestinyServiceWorker().catch(() => {});
  }, []);

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;

    // 2. Periodic check function
    const checkSchedule = async () => {
      if (isRunningRef.current) return;
      if (getNotificationPermission() !== 'granted') return;

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
      } catch (e) {
        console.error('Error during push notification evaluation:', e);
      } finally {
        isRunningRef.current = false;
      }
    };

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
  }, [profiles, activeProfile, calculation]);
}
