import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, getFontFamily, lineHeightFor, spacing, text } from '@/constants/theme';
import { TypewriterText } from './TypewriterText';

interface SuggestionsBlockProps {
  advice: string;
  reasons: string[];
  animate?: boolean;
}

function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <View style={styles.reasonList}>
      {reasons.map((reason, index) => (
        <View key={`${index}-${reason}`} style={styles.reasonItem}>
          <View style={styles.bullet} />
          <AppText style={styles.reasonText}>{reason}</AppText>
        </View>
      ))}
    </View>
  );
}

export function SuggestionsBlock({
  advice,
  reasons,
  animate = false,
}: SuggestionsBlockProps) {
  const [whatToDoDone, setWhatToDoDone] = useState(!animate);
  const [adviceDone, setAdviceDone] = useState(!animate);
  const [whyHeaderDone, setWhyHeaderDone] = useState(!animate);

  const handleWhatToDoComplete = useCallback(() => setWhatToDoDone(true), []);
  const handleAdviceComplete = useCallback(() => setAdviceDone(true), []);
  const handleWhyHeaderComplete = useCallback(() => setWhyHeaderDone(true), []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <TypewriterText
          text="What to do"
          animate={animate}
          style={styles.sectionLabel}
          speedMs={10}
          onComplete={handleWhatToDoComplete}
        />

        {(whatToDoDone || !animate) && (
          <TypewriterText
            text={advice}
            animate={animate}
            style={styles.body}
            speedMs={8}
            onComplete={handleAdviceComplete}
          />
        )}
      </View>

      {reasons.length > 0 && (adviceDone || !animate) ? (
        <View style={styles.section}>
          <TypewriterText
            text="Why we flagged this"
            animate={animate}
            style={styles.sectionLabel}
            speedMs={10}
            onComplete={handleWhyHeaderComplete}
          />

          {(whyHeaderDone || !animate) && <ReasonList reasons={reasons} />}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.lg,
  },
  section: {
    width: '100%',
    gap: spacing.xs,
  },
  sectionLabel: {
    ...text('lg', 'medium', 'normal'),
    fontSize: 18,
    lineHeight: lineHeightFor(18, 'normal'),
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    width: '100%',
  },
  body: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
    width: '100%',
  },
  reasonList: {
    width: '100%',
    gap: spacing.md,
  },
  reasonItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginTop: 10,
    flexShrink: 0,
  },
  reasonText: {
    flex: 1,
    fontFamily: getFontFamily('regular'),
    fontSize: 18,
    lineHeight: lineHeightFor(18, 'relaxed'),
    color: colors.textPrimary,
  },
});
