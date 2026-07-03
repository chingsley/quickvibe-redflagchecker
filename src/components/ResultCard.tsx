import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularLoader } from './CircularLoader';
import { AppText } from '@/components/AppText';
import {
  colors,
  spacing,
  radii,
  loaderConfig,
  text,
} from '@/constants/theme';

interface ResultCardProps {
  score: number;
  category: string;
  label: string;
  advice: string;
  reasons: string[];
  onTryAgain: () => void;
  onViewSuggestions: () => void;
}

/**
 * Final verdict: loader ring, score, one-liner label, and link to detailed suggestions.
 */
export function ResultCard({
  score,
  category: _category,
  label,
  advice: _advice,
  reasons,
  onTryAgain,
  onViewSuggestions,
}: ResultCardProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <CircularLoader
          progress={score}
          showScore
          showLabel
          label={label}
          size={loaderConfig.size}
        />

        <View style={styles.actions}>
          {reasons.length > 0 && (
            <TouchableOpacity
              style={styles.suggestionsLink}
              onPress={onViewSuggestions}
              activeOpacity={0.7}
            >
              <AppText style={styles.suggestionsLinkText}>View suggestions</AppText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={onTryAgain}
            activeOpacity={0.7}
          >
            <AppText style={styles.tryAgainText}>Check Another</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  suggestionsLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  suggestionsLinkText: {
    ...text('base', 'medium', 'normal'),
    color: colors.navy,
    textDecorationLine: 'underline',
  },
  tryAgainButton: {
    backgroundColor: colors.navy,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  tryAgainText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
});
