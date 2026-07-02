import { StyleSheet, View, Text } from 'react-native';
import { CircularLoader } from '@/components/CircularLoader';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { colors, spacing, typography } from '@/constants/theme';

// This screen is a simplified view; the main flow lives in index.tsx.
export default function AnalyzingScreen() {
  return (
    <BackgroundGradient score={50}>
      <View style={styles.center}>
        <CircularLoader progress={50} showScore showLabel />
        <Text style={styles.hint}>Analysing your experience…</Text>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.gray500,
    marginTop: spacing.xl,
  },
});
