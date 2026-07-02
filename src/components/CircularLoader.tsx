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
  /** Current progress 0–100. Clamped automatically. */
  progress: number;
  /** Show a pulsing loading state instead of fixed progress. */
  loading?: boolean;
  /** Show the numeric score percentage in the center. Defaults to true. */
  showScore?: boolean;
  /** Show the verdict label below the ring. */
  showLabel?: boolean;
  /** Override the auto-derived label. Falls back to getScoreLabel(progress). */
  label?: string;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
}

const { size, strokeWidth, radius, circumference } = loaderConfig;

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
}: CircularLoaderProps) {
  // When loading, show indeterminate 50% ring with pulsing appearance
  const progress = loading
    ? 50
    : Math.max(0, Math.min(100, Math.round(rawProgress)));

  const ringColor = getScoreColor(progress);
  const displayLabel =
    label ?? (showLabel ? getScoreLabel(progress) : undefined);

  // Dash offset: full circumference when progress is 0, 0 when progress is 100.
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <View
      style={styles.container}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: progress, min: 0, max: 100 }}
    >
      {/* SVG Ring */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.gray100}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.center}>
        {showScore && (
          <Text style={[styles.score, { color: ringColor }]}>
            {loading ? '…' : progress}
          </Text>
        )}
        {displayLabel && (
          <Text style={styles.label}>{displayLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
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
    paddingHorizontal: 24,
  },
});
