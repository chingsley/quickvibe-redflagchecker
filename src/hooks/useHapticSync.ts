import { useRef } from 'react';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { hapticThresholds } from '@/constants/theme';

/**
 * Listens to a Reanimated shared value (0–100 progress) and fires
 * haptic pulses at threshold crossings with escalating intensity:
 *   Light  (0–35) → Medium (36–65) → Heavy (66–100)
 *
 * @param progress - Animated shared value driven by the CircularLoader.
 */
export function useHapticSync(progress: SharedValue<number>): void {
  const lastFiredRef = useRef(-1);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current) => {
      // Find the highest threshold that's been crossed but not yet fired
      for (let i = hapticThresholds.length - 1; i >= 0; i--) {
        const threshold = hapticThresholds[i];
        if (current >= threshold.at && lastFiredRef.current < threshold.at) {
          lastFiredRef.current = threshold.at;

          runOnJS(fireHaptic)(threshold.style);
          break;
        }
      }

      // Reset when progress drops back to 0
      if (current === 0) {
        lastFiredRef.current = -1;
      }
    },
    [progress],
  );
}

function fireHaptic(style: string): void {
  switch (style) {
    case 'light':
      impactAsync(ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      impactAsync(ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      impactAsync(ImpactFeedbackStyle.Heavy);
      break;
  }
}
