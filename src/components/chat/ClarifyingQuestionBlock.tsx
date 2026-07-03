import { useCallback, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/keyboard';
import { colors, radii, spacing, text } from '@/constants/theme';
import { TypewriterText } from './TypewriterText';

interface ClarifyingQuestionBlockProps {
  question: string;
  type: 'choice' | 'open';
  choices?: string[];
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  animate?: boolean;
  /** When true, only show the question — answer via the main chat input. */
  useMainChatInput?: boolean;
}

export function ClarifyingQuestionBlock({
  question,
  type,
  choices,
  onSubmit,
  disabled = false,
  animate = false,
  useMainChatInput = false,
}: ClarifyingQuestionBlockProps) {
  const [openAnswer, setOpenAnswer] = useState('');
  const [questionDone, setQuestionDone] = useState(!animate);
  const handleQuestionComplete = useCallback(() => setQuestionDone(true), []);

  const showChoices =
    !useMainChatInput && type === 'choice' && choices?.length && (questionDone || !animate);
  const showOpenInput =
    !useMainChatInput && type === 'open' && (questionDone || !animate);

  return (
    <View style={styles.container}>
      <TypewriterText
        text={question}
        animate={animate}
        style={styles.question}
        onComplete={handleQuestionComplete}
      />

      {showChoices && (
        <View style={styles.choices}>
          {choices!.map((choice) => (
            <TouchableOpacity
              key={choice}
              style={[styles.choice, disabled && styles.disabled]}
              onPress={() => !disabled && onSubmit(choice)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <AppText style={styles.choiceText}>{choice}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showOpenInput && (
        <View style={styles.openInputContainer}>
          <AppTextInput
            variant="plain"
            placeholder="Your answer…"
            value={openAnswer}
            onChangeText={setOpenAnswer}
            style={styles.openInput}
            editable={!disabled}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!openAnswer.trim() || disabled) && styles.sendDisabled]}
            onPress={() => {
              const trimmed = openAnswer.trim();
              if (trimmed && !disabled) {
                onSubmit(trimmed);
                setOpenAnswer('');
              }
            }}
            disabled={!openAnswer.trim() || disabled}
            accessibilityLabel="Send answer"
          >
            <AppText style={styles.sendButtonText}>↑</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  question: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
    width: '100%',
  },
  choices: {
    gap: spacing.sm,
    width: '100%',
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  choiceText: {
    ...text('base', 'medium', 'normal'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  openInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    minHeight: 52,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  openInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendButtonText: {
    ...text('base', 'bold', 'normal'),
    color: colors.white,
    marginTop: -2,
  },
});
