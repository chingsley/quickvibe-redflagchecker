import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  type TextInputContentSizeChangeEventData,
  TouchableOpacity,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { CHAT_CONTENT_MAX_WIDTH } from './chatLayout';
import {
  colors,
  getFontFamily,
  lineHeightFor,
  radii,
  spacing,
  text,
  typography,
  primaryButton,
  primaryButtonText,
} from '@/constants/theme';

const KEYBOARD_GAP = 4;
const SEND_BUTTON_SIZE = 36;
/** Space reserved on the right so text does not run under the send button. */
const INPUT_SEND_INSET = SEND_BUTTON_SIZE + spacing.sm;

const INPUT_LINE_HEIGHT = lineHeightFor(typography.sizes.base, 'relaxed');
const INPUT_PADDING_TOP = spacing.xs;
const INPUT_PADDING_BOTTOM = spacing.xs;
const MIN_INPUT_HEIGHT = Math.max(
  36,
  INPUT_LINE_HEIGHT + INPUT_PADDING_TOP + INPUT_PADDING_BOTTOM,
);
const MAX_INPUT_HEIGHT = 120;

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
  const [contentHeight, setContentHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  /** RN 0.79+ only re-triggers onContentSizeChange after the first typed character. */
  const contentSizePrimedRef = useRef(false);

  const isAtMaxHeight = contentHeight >= MAX_INPUT_HEIGHT;

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      setContentHeight(event.nativeEvent.contentSize.height);
    },
    [],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);

      if (
        Platform.OS !== 'web' &&
        !contentSizePrimedRef.current &&
        text.trim().length > 0
      ) {
        contentSizePrimedRef.current = true;
        inputRef.current?.setNativeProps({ text });
      }
    },
    [onChangeText],
  );

  useEffect(() => {
    if (!collapsed) {
      contentSizePrimedRef.current = false;
      setContentHeight(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [collapsed]);

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

  const canSubmit = value.trim().length > 0 && !disabled && !submitDisabled;

  /**
   * iOS (RN 0.79+): never set height/minHeight on the TextInput while growing —
   * that stops onContentSizeChange and freezes the box at one line. Lock the
   * container height only once content reaches the max, then enable scrolling.
   */
  const inputGrowthStyle =
    Platform.OS === 'web'
      ? isAtMaxHeight
        ? { height: MAX_INPUT_HEIGHT }
        : { minHeight: MIN_INPUT_HEIGHT, maxHeight: MAX_INPUT_HEIGHT }
      : null;

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
          <View
            style={[
              styles.container,
              isAtMaxHeight && styles.containerAtMaxHeight,
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                inputGrowthStyle,
                Platform.OS === 'web' && isAtMaxHeight && styles.inputScrollableWeb,
              ]}
              value={value}
              onChangeText={handleChangeText}
              onContentSizeChange={handleContentSizeChange}
              onBlur={() => onCollapse?.()}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              multiline
              scrollEnabled={isAtMaxHeight}
              maxLength={4000}
              editable={!disabled}
              allowFontScaling
              maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
              textAlignVertical="top"
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
    ...primaryButton,
  },
  newExperienceDisabled: {
    opacity: 0.45,
  },
  newExperienceText: primaryButtonText,
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    minHeight: 52,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  containerAtMaxHeight: {
    height: MAX_INPUT_HEIGHT + spacing.sm * 2,
  },
  input: {
    width: '100%',
    fontFamily: getFontFamily('regular'),
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    paddingLeft: spacing.md,
    paddingRight: INPUT_SEND_INSET,
    paddingTop: INPUT_PADDING_TOP,
    paddingBottom: INPUT_PADDING_BOTTOM,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web'
      ? ({
          lineHeight: INPUT_LINE_HEIGHT,
          direction: 'rtl',
          textAlign: 'left',
          resize: 'none',
        } as const)
      : null),
  },
  inputScrollableWeb: {
    overflow: 'scroll',
  },
  sendButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: SEND_BUTTON_SIZE,
    height: SEND_BUTTON_SIZE,
    borderRadius: SEND_BUTTON_SIZE / 2,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
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
