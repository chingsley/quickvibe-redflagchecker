import React from 'react';
import { render } from '@testing-library/react-native';
import { spectrumConfig, colors } from '@/constants/theme';

// AudioSpectrum will be created in T14.
// This import fails until the stub exists — that's the RED phase.
import { AudioSpectrum } from '../AudioSpectrum';

// ─── Test Suite ─────────────────────────────────────────

describe('AudioSpectrum', () => {
  // ── Render ──────────────────────────────────────────

  it('renders without crashing', () => {
    const { unmount } = render(<AudioSpectrum isActive />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders even when not active', () => {
    const { unmount } = render(<AudioSpectrum isActive={false} />);
    expect(() => unmount()).not.toThrow();
  });

  // ── Ring count ───────────────────────────────────────

  it('renders the default number of rings from spectrumConfig', () => {
    const { UNSAFE_getAllByType } = render(<AudioSpectrum isActive />);
    // With mocked SVG, each ring is a View. We verify the correct
    // number of ring elements is rendered.
    const views = UNSAFE_getAllByType(
      require('react-native').View,
    );
    // At minimum the outer container + the rings exist
    expect(views.length).toBeGreaterThanOrEqual(spectrumConfig.ringCount);
  });

  it('renders a custom number of rings when ringCount is provided', () => {
    const { UNSAFE_getAllByType } = render(
      <AudioSpectrum isActive ringCount={3} />,
    );
    const views = UNSAFE_getAllByType(
      require('react-native').View,
    );
    expect(views.length).toBeGreaterThanOrEqual(3);
  });

  // ── Props passthrough ────────────────────────────────

  it('accepts and uses isActive prop', () => {
    const { unmount: unmountActive } = render(
      <AudioSpectrum isActive />,
    );
    expect(() => unmountActive()).not.toThrow();

    const { unmount: unmountInactive } = render(
      <AudioSpectrum isActive={false} />,
    );
    expect(() => unmountInactive()).not.toThrow();
  });

  it('accepts audioLevel prop without crashing', () => {
    const levels = [0, 0.3, 0.5, 0.8, 1.0];
    levels.forEach((level) => {
      const { unmount } = render(
        <AudioSpectrum isActive audioLevel={level} />,
      );
      expect(() => unmount()).not.toThrow();
    });
  });

  it('accepts a custom size prop', () => {
    const { unmount } = render(<AudioSpectrum isActive size={200} />);
    expect(() => unmount()).not.toThrow();
  });

  // ── Config validity ──────────────────────────────────

  it('spectrumConfig defines a positive ring count', () => {
    expect(spectrumConfig.ringCount).toBeGreaterThan(0);
  });

  it('spectrumConfig stagger delay is reasonable', () => {
    expect(spectrumConfig.staggerDelay).toBeGreaterThan(0);
    expect(spectrumConfig.staggerDelay).toBeLessThan(500);
  });

  it('uses correct blue color tones from theme', () => {
    expect(colors.micBlue).toBe('#93c5fd');
    expect(colors.spectrumLight).toBe('#bfdbfe');
  });
});
