import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AnalyzingExperienceLabel } from './AnalyzingExperienceLabel';
import { colors, radii, spacing } from '@/constants/theme';

export function PendingAnalysisIndicator() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const width = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['20%', '70%'],
  });

  return (
    <View style={styles.container}>
      <AnalyzingExperienceLabel />
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  track: {
    width: '100%',
    height: 12,
    backgroundColor: colors.gray100,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gray400,
    borderRadius: radii.full,
  },
});
