import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { CHAT_CONTENT_MAX_WIDTH } from './chatLayout';
import { colors, radii, spacing, text, typography } from '@/constants/theme';

const KEYBOARD_GAP = 4;

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** When true, show the "New Vibe" button instead of the text field. */
  collapsed?: boolean;
  onExpand?: () => void;
  /** Called when the text field loses focus (e.g. to collapse back to the button). */
  onCollapse?: () => void;
  collapsedLabel?: string;
  /** When true, keep the send button disabled even if there is text. */
  submitDisabled?: boolean;
  submitAccessibilityLabel?: string;
}

export function ChatInputBar({
  value,
  onChangeText,
  onSubmit,
  disabled = false,
  placeholder = 'Share your experience…',
  collapsed = false,
  onExpand,
  onCollapse,
  collapsedLabel = 'New Vibe',
  submitDisabled = false,
  submitAccessibilityLabel = 'Send message',
}: ChatInputBarProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!collapsed) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [collapsed]);

  const canSubmit = value.trim().length > 0 && !disabled && !submitDisabled;

  const keyboardPadding =
    Platform.OS === 'web' && keyboardHeight > 0
      ? { paddingBottom: keyboardHeight + KEYBOARD_GAP }
      : undefined;

  return (
    <View style={[styles.wrapper, keyboardPadding]}>
      <View style={styles.inner}>
        {collapsed ? (
          <TouchableOpacity
            style={[styles.newExperienceButton, disabled && styles.newExperienceDisabled]}
            onPress={onExpand}
            disabled={disabled}
            accessibilityLabel={collapsedLabel}
            activeOpacity={0.85}
          >
            <AppText style={styles.newExperienceText}>{collapsedLabel}</AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.container}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              onBlur={() => onCollapse?.()}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={4000}
              editable={!disabled}
              allowFontScaling
              maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
            />
            <TouchableOpacity
              style={[styles.sendButton, !canSubmit && styles.sendDisabled]}
              onPress={onSubmit}
              disabled={!canSubmit}
              accessibilityLabel={submitAccessibilityLabel}
            >
              <AppText style={styles.sendIcon}>↑</AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray300,
  },
  inner: {
    width: '100%',
    maxWidth: CHAT_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  newExperienceButton: {
    minHeight: 52,
    borderRadius: radii.xl,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  newExperienceDisabled: {
    opacity: 0.45,
  },
  newExperienceText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    minHeight: 52,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    paddingBottom: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendIcon: {
    ...text('base', 'bold', 'normal'),
    color: colors.white,
    marginTop: -2,
  },
});
