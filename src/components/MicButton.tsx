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
}: MicButtonProps) {
  const isActive = recordingState === 'listening';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Spectrum rings (behind the mic) */}
      <AudioSpectrum
        isActive={isActive}
        audioLevel={audioLevel}
        size={size * 1.2}
      />

      {/* Mic icon (tappable) */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel ?? 'Record experience'}
        accessibilityRole="button"
        accessibilityState={{
          disabled: recordingState === 'processing',
        }}
        disabled={recordingState === 'processing'}
        style={[styles.button, { width: size * 0.55, height: size * 0.55 }]}
      >
        <MorphIcon
          state="mic"
          size={size * 0.5}
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 9999,
    // Subtle shadow for depth
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
