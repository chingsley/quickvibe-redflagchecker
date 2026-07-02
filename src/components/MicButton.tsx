import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MorphIcon } from './MorphIcon';
import { AudioSpectrum } from './AudioSpectrum';
import { colors } from '@/constants/theme';
import type { RecordingState } from '@/types';

interface MicButtonProps {
  /** Called when the user taps the mic. */
  onPress?: () => void;
  /** Current recording phase. Drives visual state. */
  recordingState?: RecordingState;
  /** Audio amplitude 0–1 (used when recordingState === 'listening'). */
  audioLevel?: number;
  /** Diameter of the mic button area. */
  size?: number;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
  /** Visual style — hero matches the FlagCheck home screen design. */
  variant?: 'default' | 'hero';
  /** When true, the button is visible but not tappable. */
  disabled?: boolean;
}

/**
 * The central microphone button — the primary interaction point on
 * the home screen. Displays a mic icon with pulsing spectrum rings
 * when recording.
 */
export function MicButton({
  onPress,
  recordingState = 'idle',
  audioLevel = 0.5,
  size = 200,
  accessibilityLabel,
  variant = 'default',
  disabled = false,
}: MicButtonProps) {
  const isActive = recordingState === 'listening';
  const isHero = variant === 'hero';
  const isProcessing = recordingState === 'processing';
  const isDisabled = disabled || isProcessing;
  const buttonSize = isHero ? size * 0.58 : size * 0.55;
  const iconSize = isHero ? size * 0.28 : size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {isHero && (
        <View
          style={[
            styles.heroRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      )}

      {/* Spectrum rings (behind the mic) */}
      {!isHero && (
        <AudioSpectrum
          isActive={isActive}
          audioLevel={audioLevel}
          size={size * 1.2}
        />
      )}

      {/* Mic icon (tappable) */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel ?? 'Record experience'}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
        }}
        disabled={isDisabled}
        style={[
          styles.button,
          isHero && styles.heroButton,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          isDisabled && styles.disabled,
        ]}
      >
        <MorphIcon
          state="mic"
          size={iconSize}
          fillColor={isHero ? colors.white : colors.black}
          accessibilityLabel={undefined}
        />
      </TouchableOpacity>

      {/* Status indicator dot */}
      {isActive && <View style={styles.activeDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#e8ecf0',
    backgroundColor: '#fafbfc',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 9999,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroButton: {
    backgroundColor: colors.navy,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  activeDot: {
    position: 'absolute',
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
});
