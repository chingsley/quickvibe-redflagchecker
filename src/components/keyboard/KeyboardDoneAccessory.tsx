import {
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, spacing, text } from '@/constants/theme';

/** Shared native ID — all AppTextInput fields attach to this toolbar. */
export const KEYBOARD_DONE_ACCESSORY_ID = 'vibecheck-keyboard-done';

/** iOS keyboard toolbar with a Done button to dismiss the keyboard. */
export function KeyboardDoneAccessory() {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ACCESSORY_ID}>
      <View style={styles.bar}>
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          style={styles.doneButton}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <AppText style={styles.doneText}>Done</AppText>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray300,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  doneButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  doneText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.navy,
  },
});
