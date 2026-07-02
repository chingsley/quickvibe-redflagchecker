import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
} from '@/constants/theme';
import { AppTextInput } from '@/components/keyboard';
import { HeroMicIcon } from './HeroMicIcon';
import type { FollowUpQuestion } from '@/types';

interface QuestionPromptProps {
  question: FollowUpQuestion;
  onSubmit: (answer: string) => void;
  speechAvailable?: boolean;
  onVoicePress?: () => void;
}

/**
 * Follow-up question card — multiple-choice or open text (with optional mic).
 */
export function QuestionPrompt({
  question,
  onSubmit,
  speechAvailable = false,
  onVoicePress,
}: QuestionPromptProps) {
  const [textAnswer, setTextAnswer] = useState('');
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    setTextAnswer('');
    opacity.value = 0;
    translateY.value = 40;
    opacity.value = withTiming(1, {
      duration: animation.questionEntry,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: animation.questionEntry,
      easing: Easing.out(Easing.ease),
    });
  }, [question.question, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleOpenSubmit = () => {
    const trimmed = textAnswer.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    onSubmit(trimmed);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text style={styles.question}>{question.question}</Text>

      {question.type === 'choice' && question.choices ? (
        <View style={styles.choices}>
          {question.choices.map((choice, index) => (
            <TouchableOpacity
              key={`${choice}-${index}`}
              style={styles.choiceButton}
              onPress={() => onSubmit(choice)}
              activeOpacity={0.7}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.openAnswer}>
          <View style={styles.inputRow}>
            <AppTextInput
              style={styles.textInput}
              placeholder="Type your answer..."
              multiline
              value={textAnswer}
              onChangeText={setTextAnswer}
              onSubmitEditing={handleOpenSubmit}
            />
            {speechAvailable && onVoicePress && (
              <TouchableOpacity
                style={styles.micButton}
                accessibilityLabel="Answer with voice"
                activeOpacity={0.7}
                onPress={onVoicePress}
              >
                <HeroMicIcon size={22} color={colors.navy} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.submitButton, !textAnswer.trim() && styles.submitDisabled]}
            onPress={handleOpenSubmit}
            disabled={!textAnswer.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  question: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  choices: {
    gap: spacing.sm,
  },
  choiceButton: {
    backgroundColor: colors.gray100,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  openAnswer: {
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 100,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.navy,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
