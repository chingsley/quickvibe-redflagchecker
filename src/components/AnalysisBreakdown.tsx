import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/constants/theme';

interface AnalysisBreakdownProps {
  label: string;
  advice: string;
  reasons: string[];
  onBack: () => void;
}

/** Detailed analysis view — advice and detected patterns. */
export function AnalysisBreakdown({
  label,
  advice,
  reasons,
  onBack,
}: AnalysisBreakdownProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Suggestions</Text>
        <Text style={styles.subtitle}>{label}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to do</Text>
          <Text style={styles.bodyText}>{advice}</Text>
        </View>

        {reasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why we flagged this</Text>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <Text style={styles.reasonBullet}>•</Text>
                <Text style={styles.bodyText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back to result</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.gray50,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 24,
    flex: 1,
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
  backButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray500,
    textDecorationLine: 'underline',
  },
});
