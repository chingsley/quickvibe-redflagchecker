import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors, spacing, radii, text } from '@/constants/theme';

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
        <AppText style={styles.title}>Suggestions</AppText>
        <AppText style={styles.subtitle}>{label}</AppText>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>What to do</AppText>
          <AppText style={styles.bodyText}>{advice}</AppText>
        </View>

        {reasons.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Why we flagged this</AppText>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <AppText style={styles.reasonBullet}>•</AppText>
                <AppText style={styles.bodyText}>{reason}</AppText>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <AppText style={styles.backButtonText}>Back to result</AppText>
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
    ...text('xxl', 'bold', 'tight'),
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...text('lg', 'medium', 'normal'),
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
    ...text('lg', 'semibold', 'normal'),
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bodyText: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    flex: 1,
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  reasonBullet: {
    ...text('base', 'bold', 'normal'),
    color: colors.red,
    marginRight: spacing.sm,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  backButtonText: {
    ...text('base', 'medium', 'normal'),
    color: colors.gray500,
    textDecorationLine: 'underline',
  },
});
