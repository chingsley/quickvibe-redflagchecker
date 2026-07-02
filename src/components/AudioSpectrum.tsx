import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spectrumConfig, animation } from '@/constants/theme';

interface AudioSpectrumProps {
  /** Whether the mic is actively recording — drives ring animation. */
  isActive: boolean;
  /** Audio amplitude 0–1. Higher = rings scale out further. */
  audioLevel?: number;
  /** Number of concentric rings. Defaults to spectrumConfig.ringCount (4). */
  ringCount?: number;
  /** Width / height of the container in points. */
  size?: number;
}

const { ringCount: defaultRingCount, staggerDelay, maxScale } = spectrumConfig;

/**
 * Concentric expanding rings that pulse outward from a central point.
 * Each ring scales and fades independently with staggered timing,
 * creating a sound-wave visualization effect.
 */
export function AudioSpectrum({
  isActive,
  audioLevel = 0.5,
  ringCount = defaultRingCount,
  size = 120,
}: AudioSpectrumProps) {
  // Create one animated value per ring
  const ringAnimations = useMemo(
    () => Array.from({ length: ringCount }, () => useSharedValue(0)),
    [ringCount],
  );

  useEffect(() => {
    if (isActive) {
      ringAnimations.forEach((anim, index) => {
        anim.value = withDelay(
          index * staggerDelay,
          withRepeat(
            withTiming(1, {
              duration: animation.spectrumPulse,
              easing: Easing.out(Easing.ease),
            }),
            -1, // infinite
            true, // reverse
          ),
        );
      });
    } else {
      // Reset all to 0 when not active
      ringAnimations.forEach((anim) => {
        anim.value = withTiming(0, { duration: 300 });
      });
    }
  }, [isActive, ringAnimations]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {ringAnimations.map((anim, index) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => {
          const progress = anim.value;
          const scale = 1 + progress * maxScale * (0.6 + audioLevel * 0.4);
          const opacity = 1 - progress * 0.85;
          return {
            transform: [{ scale }],
            opacity,
          };
        });

        const ringSize = size * (0.35 + index * 0.08);
        const color =
          index % 2 === 0 ? colors.micBlue : colors.spectrumLight;

        return (
          <Animated.View
            key={index}
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderColor: color,
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
});
