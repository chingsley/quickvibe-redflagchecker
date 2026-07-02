import React, { forwardRef } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { KEYBOARD_DONE_ACCESSORY_ID } from './KeyboardDoneAccessory';

export type AppTextInputProps = TextInputProps & {
  /** Use the standard bordered multiline field style. */
  variant?: 'default' | 'plain';
};

/**
 * Text input with keyboard Done accessory (iOS), web outline fix,
 * and sensible defaults for forms across the app.
 */
export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  function AppTextInput(
    {
      variant = 'default',
      multiline,
      returnKeyType,
      blurOnSubmit,
      submitBehavior,
      style,
      placeholderTextColor = colors.textSecondary,
      ...rest
    },
    ref,
  ) {
    return (
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColor={placeholderTextColor}
        returnKeyType={returnKeyType ?? (multiline ? 'default' : 'done')}
        blurOnSubmit={blurOnSubmit ?? !multiline}
        submitBehavior={
          submitBehavior ?? (multiline ? 'blurAndSubmit' : undefined)
        }
        inputAccessoryViewID={
          Platform.OS === 'ios' ? KEYBOARD_DONE_ACCESSORY_ID : undefined
        }
        style={[
          variant === 'default' && styles.default,
          Platform.OS === 'web' && styles.webOutline,
          style,
        ]}
        {...rest}
      />
    );
  },
);

const styles = StyleSheet.create({
  default: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
  webOutline: {
    outlineStyle: 'none',
  } as const,
});
