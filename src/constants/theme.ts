import { Platform } from 'react-native';

// ─── Palette ────────────────────────────────────────────

export const colors = {
  // Score continuum
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',

  // Mic / spectrum
  micBlue: '#93c5fd',
  spectrumLight: '#bfdbfe',

  // Background continuum
  bgNeutral: '#ffffff',
  bgWarm: '#fef3c7',
  bgRose: '#fee2e2',

  // UI neutrals
  white: '#ffffff',
  black: '#111827',
  navy: '#1a2744',
  heroRing: '#c8daf0',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',

  // Semantic
  textPrimary: '#111827',
  textSecondary: '#6b7280',
} as const;

// ─── Score Bands (mirrors types/index.ts to avoid circular imports) ───

interface ScoreBand {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  { min: 0, max: 35, color: colors.green, label: "This is actually sweet" },
  { min: 36, max: 50, color: colors.yellow, label: 'Proceed with caution' },
  { min: 51, max: 65, color: colors.orange, label: 'Proceed at your own discretion' },
  { min: 66, max: 100, color: colors.red, label: 'Proceed at your own detriment' },
];

// ─── Gradient Stops ─────────────────────────────────────

/** Background continuum: white → warm amber → rose. Used by BackgroundGradient. */
export const backgroundGradientStops: [number, string][] = [
  [0, colors.bgNeutral],
  [50, colors.bgWarm],
  [100, colors.bgRose],
];

/** Loader ring: green → yellow → orange → red. Used by CircularLoader. */
export const loaderRingStops: [number, string][] = [
  [0, colors.green],
  [35, colors.yellow],
  [65, colors.orange],
  [100, colors.red],
];

// ─── Typography ─────────────────────────────────────────
// Roboto via @expo-google-fonts/roboto — use fontFamily, not fontWeight,
// for reliable rendering on iOS and Android.

export const fonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
} as const;

export type FontRole = keyof typeof fonts;

/** Map semantic weights to Roboto font files (Roboto has no 600 face). */
export function getFontFamily(
  weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
): string {
  switch (weight) {
    case 'medium':
    case 'semibold':
      return fonts.medium;
    case 'bold':
      return fonts.bold;
    default:
      return fonts.regular;
  }
}

/** Web sizes — compact for desktop layouts. */
const webTypeSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

/** Native sizes — larger for phone readability at arm's length. */
const mobileTypeSizes = {
  xs: 13,
  sm: 16,
  base: 18,
  lg: 20,
  xl: 28,
  xxl: 36,
  hero: 56,
} as const;

export type TextSize = keyof typeof webTypeSizes;

export const typography = {
  sizes: Platform.select({
    web: webTypeSizes,
    default: mobileTypeSizes,
  }) ?? mobileTypeSizes,
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.5,
  },
  /** Max scale when user enables larger system text. */
  maxFontSizeMultiplier: 2,
} as const;

export function lineHeightFor(
  fontSize: number,
  scale: keyof typeof typography.lineHeight = 'normal',
): number {
  return Math.round(fontSize * typography.lineHeight[scale]);
}

/** Build accessible text styles — always sets fontFamily + lineHeight. */
export function text(
  size: TextSize,
  weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
  lineScale: keyof typeof typography.lineHeight = 'normal',
) {
  const fontSize = typography.sizes[size];
  return {
    fontFamily: getFontFamily(weight),
    fontSize,
    lineHeight: lineHeightFor(fontSize, lineScale),
  };
}

// ─── Spacing (4px base) ─────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  sml: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Gestalt Grouping ───────────────────────────────────

/** Proximity spacing for the gestalt grouping system. */
export const gestalt = {
  /** Vertical gap between adjacent groups (e.g. one section to the next). */
  groupGap: spacing.xxl,
  /** Vertical gap between items inside a group, including the group header. */
  itemGap: spacing.md,
} as const;

// ─── Radii ──────────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Animation ──────────────────────────────────────────

export const animation = {
  /** Morph animation duration in ms. */
  morphDuration: 600,
  /** Loader spin to target duration in ms. */
  loaderDuration: 2500,
  /** Spectrum ring pulse interval in ms. */
  spectrumPulse: 800,
  /** Follow-up card entry duration in ms. */
  questionEntry: 400,
  /** "Why?" expand / collapse duration in ms. */
  whyToggle: 350,
  /** Stagger delay between reason bullets in ms. */
  whyStagger: 100,
} as const;

// ─── Haptic Thresholds ──────────────────────────────────

/** Score thresholds where haptic pulses fire during loader animation. */
export const hapticThresholds = [
  { at: 10, style: 'light' as const },
  { at: 20, style: 'light' as const },
  { at: 30, style: 'light' as const },
  { at: 40, style: 'medium' as const },
  { at: 50, style: 'medium' as const },
  { at: 60, style: 'medium' as const },
  { at: 70, style: 'heavy' as const },
  { at: 80, style: 'heavy' as const },
  { at: 90, style: 'heavy' as const },
  { at: 100, style: 'heavy' as const },
] as const;

// ─── Loader Config ──────────────────────────────────────

export const loaderConfig = {
  /** Outer diameter of the circular ring. */
  size: 260,
  /** Stroke width of the ring. */
  strokeWidth: 10,
  /** Radius of the ring (derived: (size - strokeWidth) / 2). */
  get radius() {
    return (this.size - this.strokeWidth) / 2;
  },
  /** Full circumference of the ring. */
  get circumference() {
    return 2 * Math.PI * this.radius;
  },
} as const;

// ─── Spectrum Config ────────────────────────────────────

export const spectrumConfig = {
  /** Number of concentric rings. */
  ringCount: 4,
  /** Maximum scale factor for the outer ring. */
  maxScale: 2.5,
  /** Delay stagger between rings in ms. */
  staggerDelay: 150,
} as const;

// ─── Score Helpers ──────────────────────────────────────

export function getScoreLabel(score: number): string {
  const band = SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
  return band?.label ?? 'Unknown';
}

export function getScoreColor(score: number): string {
  const band = SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
  return band?.color ?? colors.gray500;
}
