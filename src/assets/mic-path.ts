/**
 * SVG path data for a microphone silhouette.
 *
 * Rendered in a 100×100 viewBox. The shape has a rounded capsule top
 * that tapers down to a narrow base — a simplified microphone icon.
 *
 * Command structure: M + 4×C + Z  (6 commands — matches ring-path.ts
 * for smooth SVG path morphing via Reanimated useAnimatedProps).
 */

/** Full SVG `d` attribute string for the microphone icon. */
export const MIC_PATH =
  'M 50,17 ' +
  'C 66,17 75,30 75,43 ' +
  'C 75,54 62,72 52,72 ' +
  'C 48,72 38,54 25,43 ' +
  'C 25,30 34,17 50,17 Z';

/**
 * Alternative mic path using only straight / arc segments.
 * Used by the fallback crossfade approach if bezier morphing
 * doesn't produce acceptable results on a given platform.
 */
export const MIC_PATH_SIMPLE =
  'M 38,22 ' +
  'A 12,12 0 1,1 62,22 ' +
  'A 12,12 0 1,1 38,22 Z ' +
  'M 35,38 L 65,38 ' +
  'L 65,55 A 15,15 0 0,1 35,55 Z';
