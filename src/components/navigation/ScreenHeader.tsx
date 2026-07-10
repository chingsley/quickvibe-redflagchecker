import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, lineHeightFor, spacing, text } from '@/constants/theme';
import { HamburgerButton } from './HamburgerButton';

interface ScreenHeaderProps {
  onMenuPress: () => void;
  title?: string;
  showBorder?: boolean;
}

export function ScreenHeader({
  onMenuPress,
  title,
  showBorder = false,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, showBorder && styles.headerBorder]}>
      <View style={styles.headerSide}>
        <HamburgerButton onPress={onMenuPress} />
      </View>
      {title ? (
        <AppText style={styles.headerTitle} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerSide} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray300,
  },
  headerSide: {
    width: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    ...text('lg', 'semibold', 'tight'),
    fontSize: 18,
    lineHeight: lineHeightFor(18, 'tight'),
    color: colors.navy,
    flex: 1,
    textAlign: 'center',
  },
});
