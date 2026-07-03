import { StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, text } from '@/constants/theme';
import { ANALYZING_LABEL, useAnalyzingEllipsis } from './useAnalyzingEllipsis';

interface AnalyzingExperienceLabelProps {
  active?: boolean;
}

export function AnalyzingExperienceLabel({ active = true }: AnalyzingExperienceLabelProps) {
  const ellipsis = useAnalyzingEllipsis(active);

  return (
    <AppText style={styles.title}>
      {ANALYZING_LABEL}
      {ellipsis}
    </AppText>
  );
}

const styles = StyleSheet.create({
  title: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
    width: '100%',
  },
});
