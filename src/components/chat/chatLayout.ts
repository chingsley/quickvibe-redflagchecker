import { colors, spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

/** Shared chat column width — matches ChatGPT-style centered content. */
export const CHAT_CONTENT_MAX_WIDTH = 768;

export const chatLayout = StyleSheet.create({
  column: {
    width: '100%',
    maxWidth: CHAT_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  userRow: {
    width: '100%',
    alignItems: 'flex-end',
    paddingVertical: spacing.sm,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.gray100,
    borderRadius: 24,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
  },
  assistantBlock: {
    width: '100%',
    paddingVertical: spacing.md,
  },
});
