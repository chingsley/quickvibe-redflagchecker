import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
} from '@/constants/theme';

interface QuestionPromptProps {
  /** The follow-up question text. */
  question: string;
  /** 2–3 answer choices. */
  choices: string[];
  /** Called when the user picks an answer. */
  onSelect: (answer: string) => void;
}

/**
 * Follow-up question card with animated entry (fade + slide up).
 * Used when the AI needs more context to resolve an ambiguous score.
 */
export function QuestionPrompt({
  question,
  choices,
  onSelect,
}: QuestionPromptProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: animation.questionEntry,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: animation.questionEntry,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.choices}>
        {choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={styles.choiceButton}
            onPress={() => onSelect(choice)}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
});
