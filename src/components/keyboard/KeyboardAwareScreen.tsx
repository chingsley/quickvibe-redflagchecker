import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface KeyboardAwareScreenProps {
  children: React.ReactNode;
  /** Extra padding at the bottom so buttons stay above the keyboard. */
  bottomInset?: number;
  /** When true, vertically centers content when the keyboard is hidden. */
  centerContent?: boolean;
  /** Safe area edges to respect. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

/**
 * Scrollable screen wrapper that keeps inputs and buttons reachable when
 * the keyboard is open. Pair with AppTextInput for the iOS Done accessory.
 *
 * Use this for any screen with text fields and submit buttons.
 */
export function KeyboardAwareScreen({
  children,
  bottomInset = spacing.xxl * 2,
  centerContent = false,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
  scrollViewProps,
}: KeyboardAwareScreenProps) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          {...scrollViewProps}
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            centerContent && styles.centerContent,
            { paddingBottom: bottomInset },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            scrollViewProps?.keyboardDismissMode ?? 'interactive'
          }
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  centerContent: {
    justifyContent: 'center',
  },
});
