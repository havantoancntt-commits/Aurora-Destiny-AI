// ==========================================================
// AURORA DESTINY AI — CAN-CHI PUSH NOTIFICATION SCHEDULER HOOK
// Automatically monitors and triggers hourly push notifications
// ==========================================================

import { useEffect, useRef } from 'react';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  registerDestinyServiceWorker,
  evaluateAndTriggerHourlyAlert,
  getNotificationPermission
} from '../services/destinyPushNotification';

export function useDestinyPushScheduler(
  calculation: CalculationResult | null,
  profile: UserProfile | null
) {
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Register service worker once on startup
    registerDestinyServiceWorker().catch(() => {});
  }, []);

  useEffect(() => {
    if (!calculation || !profile) return;

    // 2. Periodic check function
    const checkSchedule = async () => {
      if (isRunningRef.current) return;
      if (getNotificationPermission() !== 'granted') return;

      try {
        isRunningRef.current = true;
        await evaluateAndTriggerHourlyAlert(calculation, profile);
      } catch (e) {
        console.error('Error during hourly notification evaluation:', e);
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
  }, [calculation, profile]);
}
