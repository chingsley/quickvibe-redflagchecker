import React from 'react';
import {
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { colors, typography, text } from '@/constants/theme';

type AppTextVariant =
  | 'display'
  | 'title'
  | 'headline'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'button'
  | 'link';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
}

const variants: Record<AppTextVariant, TextStyle> = {
  display: {
    ...text('hero', 'bold', 'tight'),
    color: colors.navy,
  },
  title: {
    ...text('xxl', 'bold', 'tight'),
    color: colors.navy,
  },
  headline: {
    ...text('xl', 'bold', 'tight'),
    color: colors.navy,
  },
  body: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
  },
  bodyMedium: {
    ...text('base', 'medium', 'relaxed'),
    color: colors.textPrimary,
  },
  label: {
    ...text('lg', 'semibold', 'normal'),
    color: colors.textPrimary,
  },
  caption: {
    ...text('sm', 'medium', 'relaxed'),
    color: colors.textSecondary,
  },
  button: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  link: {
    ...text('sm', 'medium', 'normal'),
    color: colors.gray500,
    textDecorationLine: 'underline',
  },
};

/**
 * Accessible text with Roboto applied by default.
 * Prefer semantic variants; override with `style` when needed.
 */
export function AppText({
  variant = 'body',
  style,
  maxFontSizeMultiplier = typography.maxFontSizeMultiplier,
  ...props
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[variants[variant], style]}
      {...props}
    />
  );
}

/** Re-export for StyleSheet definitions that need raw text tokens. */
export { text };
