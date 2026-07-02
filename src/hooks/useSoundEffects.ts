import { useEffect, useRef } from 'react';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';
import type { AnalysisState } from '@/types';

/**
 * Plays subtle feedback at key state transitions using haptic notifications.
 *
 *   - morphing → Warning (subtle "whoosh" feel)
 *   - complete → Success (satisfying "ding" feel)
 */
export function useSoundEffects(status: AnalysisState): void {
  const prevRef = useRef<AnalysisState>('idle');

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = status;

    if (status === 'morphing' && prev !== 'morphing') {
      notificationAsync(NotificationFeedbackType.Warning);
    }

    if (status === 'complete' && prev !== 'complete') {
      notificationAsync(NotificationFeedbackType.Success);
    }
  }, [status]);
}
