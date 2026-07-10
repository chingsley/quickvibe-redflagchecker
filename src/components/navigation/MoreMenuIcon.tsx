import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface MoreMenuIconProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function MoreMenuIcon({ color = colors.gray500, style }: MoreMenuIconProps) {
  return (
    <View style={[styles.container, style]} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
