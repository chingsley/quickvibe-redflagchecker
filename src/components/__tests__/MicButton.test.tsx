import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// MicButton will be created in T16.
// This import fails until the stub exists — that's the RED phase.
import { MicButton } from '../MicButton';

// ─── Test Suite ─────────────────────────────────────────

describe('MicButton', () => {
  // ── Render ──────────────────────────────────────────

  it('renders without crashing', () => {
    const { unmount } = render(<MicButton />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders with an accessibility label', () => {
    const { getByLabelText } = render(
      <MicButton accessibilityLabel="Record your experience" />,
    );
    expect(getByLabelText('Record your experience')).toBeTruthy();
  });

  // ── Press handler ────────────────────────────────────

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <MicButton
        onPress={onPress}
        accessibilityLabel="Record your experience"
      />,
    );

    fireEvent.press(getByLabelText('Record your experience'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders in idle state by default', () => {
    const { unmount } = render(<MicButton />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders in listening state without crashing', () => {
    const { unmount } = render(<MicButton recordingState="listening" />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders in processing state without crashing', () => {
    const { unmount } = render(<MicButton recordingState="processing" />);
    expect(() => unmount()).not.toThrow();
  });

  // ── Audio level ──────────────────────────────────────

  it('accepts audioLevel prop without crashing', () => {
    const { unmount } = render(
      <MicButton recordingState="listening" audioLevel={0.7} />,
    );
    expect(() => unmount()).not.toThrow();
  });

  // ── Size prop ────────────────────────────────────────

  it('accepts a custom size prop', () => {
    const { unmount } = render(<MicButton size={180} />);
    expect(() => unmount()).not.toThrow();
  });
});
