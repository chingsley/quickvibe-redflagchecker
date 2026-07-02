import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { CircularLoader } from './CircularLoader';
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
} from '@/constants/theme';

interface ResultCardProps {
  /** Final red-flag score 0–100. */
  score: number;
  /** High-level category, e.g. "love-bombing". */
  category: string;
  /** Human-readable verdict label. */
  label: string;
  /** Actionable advice. */
  advice: string;
  /** 3–5 specific behavioral patterns detected by AI. */
  reasons: string[];
  /** Called when user wants to check another experience. */
  onTryAgain: () => void;
}

/**
 * Final verdict display: frozen loader ring, score label, advice,
 * and an expandable "Why?" section with AI-detected reasons.
 */
export function ResultCard({
  score,
  category: _category,
  label,
  advice,
  reasons,
  onTryAgain,
}: ResultCardProps) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Loader ring at final position */}
      <CircularLoader progress={score} showScore showLabel label={label} />

      {/* Advice */}
      <View style={styles.adviceContainer}>
        <Text style={styles.adviceTitle}>What to do</Text>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      {/* Why? toggle */}
      <TouchableOpacity
        style={styles.whyToggle}
        onPress={() => setShowWhy((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.whyToggleText}>{showWhy ? '▲  Why?' : '▼  Why?'}</Text>
      </TouchableOpacity>

      {/* Expandable reasons */}
      {showWhy && reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          {reasons.map((reason, index) => (
            <View key={index} style={styles.reasonRow}>
              <Text style={styles.reasonBullet}>•</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Check Another */}
      <TouchableOpacity
        style={styles.tryAgainButton}
        onPress={onTryAgain}
        activeOpacity={0.7}
      >
        <Text style={styles.tryAgainText}>Check Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  adviceContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    width: '100%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  adviceTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  adviceText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  whyToggle: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  whyToggleText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray500,
  },
  reasonsContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
    width: '100%',
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  reasonBullet: {
    fontSize: typography.sizes.base,
    color: colors.red,
    marginRight: spacing.sm,
    fontWeight: typography.weights.bold,
  },
  reasonText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  tryAgainButton: {
    backgroundColor: colors.black,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  tryAgainText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
