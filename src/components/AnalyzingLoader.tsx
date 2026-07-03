import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, spacing, text } from '@/constants/theme';

interface AnalyzingLoaderProps {
  /** Status message shown below the dots. */
  message?: string;
}

function useDotBounce(delayMs: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(value, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(Math.max(0, 560 - delayMs)),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delayMs, value]);

  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
}

function BounceDot({ delay }: { delay: number }) {
  const translateY = useDotBounce(delay);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

/**
 * Minimal loading indicator for analysis in progress.
 * Floating ellipsis — no score ring or verdict text.
 */
export function AnalyzingLoader({ message = 'Analysing' }: AnalyzingLoaderProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <View style={styles.dotsRow}>
        <BounceDot delay={0} />
        <BounceDot delay={140} />
        <BounceDot delay={280} />
      </View>
      <AppText style={styles.message}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 32,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy,
  },
  message: {
    ...text('base', 'medium', 'relaxed'),
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});
