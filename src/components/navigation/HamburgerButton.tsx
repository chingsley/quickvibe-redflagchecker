import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface HamburgerButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export function HamburgerButton({
  onPress,
  accessibilityLabel = 'Open menu',
}: HamburgerButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    padding: spacing.sm,
  },
  bar: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.navy,
  },
});
