import { StyleSheet, View } from 'react-native';
import { ClarifyingQuestionBlock } from './ClarifyingQuestionBlock';
import { chatLayout } from './chatLayout';
import { colors, spacing } from '@/constants/theme';
import type { PendingClarification } from '@/api/types';

interface PendingClarificationBarProps {
  pending: PendingClarification;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

/** Active follow-up prompt shown above the input when Q&A is hidden from the transcript. */
export function PendingClarificationBar({
  pending,
  onSubmit,
  disabled = false,
}: PendingClarificationBarProps) {
  const { question } = pending;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <ClarifyingQuestionBlock
          question={question.question}
          type={question.type}
          choices={question.choices}
          onSubmit={onSubmit}
          disabled={disabled}
          animate
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray300,
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  inner: {
    ...chatLayout.column,
    paddingHorizontal: spacing.lg,
  },
});
