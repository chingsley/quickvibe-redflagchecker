import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { backgroundGradientStops } from '@/constants/theme';

interface BackgroundGradientProps {
  /** Current red-flag score 0–100. Drives the background color shift. */
  score: number;
  /** Content to render above the gradient. */
  children: React.ReactNode;
}

/**
 * Score-driven background color continuum.
 *
 * Shifts subtly from neutral white (0) → warm amber (50) → deep rose (100),
 * creating a visceral "feel the mood before the result" effect.
 */
export function BackgroundGradient({
  score,
  children,
}: BackgroundGradientProps) {
  // Interpolate gradient colors based on score.
  // Linear interpolation between the three key stops.
  const colors = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, score));

    // Find which segment we're in
    let fromStop = backgroundGradientStops[0];
    let toStop = backgroundGradientStops[backgroundGradientStops.length - 1];

    for (let i = 0; i < backgroundGradientStops.length - 1; i++) {
      if (
        clamped >= backgroundGradientStops[i][0] &&
        clamped <= backgroundGradientStops[i + 1][0]
      ) {
        fromStop = backgroundGradientStops[i];
        toStop = backgroundGradientStops[i + 1];
        break;
      }
    }

    // Linear interpolation factor
    const range = toStop[0] - fromStop[0];
    const t = range === 0 ? 0 : (clamped - fromStop[0]) / range;

    // Interpolate hex colors (simple approach: use the dominant color)
    // For a gradient we use the from color at top, interpolated at bottom
    const midColor = interpolateHex(fromStop[1], toStop[1], t);

    return [fromStop[1], midColor] as [string, string];
  }, [score]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        locations={[0, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

/**
 * Simple hex color linear interpolation.
 * Assumes both colors are 6-digit hex strings prefixed with #.
 */
function interpolateHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);

  return `#${rr.toString(16).padStart(2, '0')}${rg.toString(16).padStart(2, '0')}${rb.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
