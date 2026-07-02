import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MorphIcon } from './MorphIcon';
import { HeroMicIcon } from './HeroMicIcon';
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
  /** Visual style — hero matches the VibeCheck home screen design. */
  variant?: 'default' | 'hero';
  /** When true, the button is visible but not tappable. */
  disabled?: boolean;
}

const HERO_RING_SCALE = [1, 0.78, 0.56];

function HeroMicRings({ size }: { size: number }) {
  return (
    <>
      {HERO_RING_SCALE.map((scale, index) => {
        const ringSize = size * scale;
        return (
          <View
            key={scale}
            style={[
              styles.heroRing,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                opacity: 1 - index * 0.12,
              },
            ]}
          />
        );
      })}
    </>
  );
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
  const buttonSize = isHero ? size * 0.42 : size * 0.55;
  const iconSize = isHero ? size * 0.2 : size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {isHero ? (
        <>
          <HeroMicRings size={size} />
          {isActive && (
            <AudioSpectrum
              isActive
              audioLevel={audioLevel}
              ringCount={3}
              size={size}
              ringColor={colors.heroRing}
            />
          )}
        </>
      ) : (
        <AudioSpectrum
          isActive={isActive}
          audioLevel={audioLevel}
          size={size * 1.2}
        />
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
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
        {isHero ? (
          <HeroMicIcon size={iconSize} />
        ) : (
          <MorphIcon
            state="mic"
            size={iconSize}
            fillColor={colors.black}
            accessibilityLabel={undefined}
          />
        )}
      </TouchableOpacity>

      {isActive && !isHero && <View style={styles.activeDot} />}
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
    borderWidth: 1.5,
    borderColor: colors.heroRing,
    backgroundColor: 'transparent',
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
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
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
