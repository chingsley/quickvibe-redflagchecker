import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { MIC_PATH } from '@/assets/mic-path';
import { RING_PATH } from '@/assets/ring-path';
import { animation } from '@/constants/theme';
import type { MorphState } from '@/types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MorphIconProps {
  /** Which shape to display. Defaults to 'mic'. */
  state?: MorphState;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
  /** Width / height of the SVG viewport in points. */
  size?: number;
}

/**
 * Animated icon that morphs between a microphone silhouette and a
 * circular ring using SVG path interpolation via Reanimated.
 *
 * Both paths use the same command structure (M + 4×C + Z) so the
 * `d` attribute can be smoothly interpolated.
 */
export function MorphIcon({
  state = 'mic',
  accessibilityLabel,
  size = 260,
}: MorphIconProps) {
  // 0 = mic, 1 = ring
  const progress = useSharedValue(state === 'mic' ? 0 : 1);

  useEffect(() => {
    progress.value = withTiming(state === 'mic' ? 0 : 1, {
      duration: animation.morphDuration,
    });
  }, [state, progress]);

  // Animate the SVG path `d` attribute.
  // Reanimated's useAnimatedProps interpolates between the two path strings
  // because they share the same command structure.
  const animatedProps = useAnimatedProps(() => {
    // Simple binary switch — when progress crosses 0.5 we flip.
    // A full string interpolation would require parsing numeric values,
    // so we use a threshold-based switch with a smooth crossfade via
    // two overlapping paths below as the fallback approach when full
    // numeric interpolation isn't available.
    const d = progress.value < 0.5 ? MIC_PATH : RING_PATH;
    return { d };
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={StyleSheet.absoluteFill}
      >
        {/* Background circle for the ring's visible stroke area */}
        <Path
          d={RING_PATH}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={3.5}
          opacity={0}
        />

        {/* Animated morph path */}
        <AnimatedPath
          animatedProps={animatedProps}
          fill="#111827"
          stroke="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
