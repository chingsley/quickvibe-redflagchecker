import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  getScoreColor,
  getScoreLabel,
  loaderConfig,
  typography,
  colors,
} from '@/constants/theme';

interface CircularLoaderProps {
  progress: number;
  loading?: boolean;
  showScore?: boolean;
  showLabel?: boolean;
  label?: string;
  accessibilityLabel?: string;
  /** Override ring diameter — defaults to loaderConfig.size. */
  size?: number;
}

/**
 * Animated circular progress ring that sweeps from green (0) through
 * yellow / orange to red (100). Displays a centered percentage and a
 * verdict label.
 */
export function CircularLoader({
  progress: rawProgress,
  loading = false,
  showScore = true,
  showLabel = false,
  label,
  accessibilityLabel,
  size: ringSize = loaderConfig.size,
}: CircularLoaderProps) {
  const strokeWidth = loaderConfig.strokeWidth;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = loading
    ? 50
    : Math.max(0, Math.min(100, Math.round(rawProgress)));

  const ringColor = getScoreColor(progress);
  const displayLabel =
    label ?? (showLabel ? getScoreLabel(progress) : undefined);

  const dashOffset = circumference * (1 - progress / 100);

  return (
    <View
      style={[styles.container, { width: ringSize, height: ringSize }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: progress, min: 0, max: 100 }}
    >
      <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={colors.gray100}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${ringSize / 2}, ${ringSize / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        {showScore && (
          <Text style={[styles.score, { color: ringColor }]}>
            {loading ? '…' : progress}
          </Text>
        )}
        {displayLabel && (
          <Text style={[styles.label, { maxWidth: ringSize * 0.75 }]}>
            {displayLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
