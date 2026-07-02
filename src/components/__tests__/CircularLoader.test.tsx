import React from 'react';
import { render } from '@testing-library/react-native';
import { getScoreColor, getScoreLabel } from '@/constants/theme';

// CircularLoader will be created in T12.
// This import fails until the stub exists — that's the RED phase.
import { CircularLoader } from '../CircularLoader';

// ─── Test Suite ─────────────────────────────────────────

describe('CircularLoader', () => {
  // ── Render ──────────────────────────────────────────

  it('renders without crashing', () => {
    const { unmount } = render(<CircularLoader progress={50} />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders with accessibility label', () => {
    const { getByLabelText } = render(
      <CircularLoader progress={50} accessibilityLabel="Red flag score" />,
    );
    expect(getByLabelText('Red flag score')).toBeTruthy();
  });

  // ── Score display ────────────────────────────────────

  it('displays the score percentage when showScore is true', () => {
    const { getByText } = render(
      <CircularLoader progress={75} showScore />,
    );
    expect(getByText('75')).toBeTruthy();
  });

  it('does not display score when showScore is false', () => {
    const { queryByText } = render(
      <CircularLoader progress={75} showScore={false} />,
    );
    expect(queryByText('75')).toBeNull();
  });

  // ── Label display ────────────────────────────────────

  it('displays the label text when showLabel is true', () => {
    const { getByText } = render(
      <CircularLoader progress={85} showLabel label="Proceed at your own detriment" />,
    );
    expect(getByText('Proceed at your own detriment')).toBeTruthy();
  });

  // ── Edge-case scores ─────────────────────────────────

  it('handles progress 0 (minimum)', () => {
    const { unmount } = render(<CircularLoader progress={0} />);
    expect(() => unmount()).not.toThrow();
  });

  it('handles progress 100 (maximum)', () => {
    const { unmount } = render(<CircularLoader progress={100} />);
    expect(() => unmount()).not.toThrow();
  });

  it('clamps progress below 0 to 0', () => {
    const { getByText } = render(
      <CircularLoader progress={-10} showScore />,
    );
    // Should clamp to 0
    expect(getByText('0')).toBeTruthy();
  });

  it('clamps progress above 100 to 100', () => {
    const { getByText } = render(
      <CircularLoader progress={150} showScore />,
    );
    // Should clamp to 100
    expect(getByText('100')).toBeTruthy();
  });
});

// ─── Theme helpers ──────────────────────────────────────

describe('getScoreColor', () => {
  it('returns green for scores 0–35', () => {
    expect(getScoreColor(0)).toBe('#22c55e');
    expect(getScoreColor(20)).toBe('#22c55e');
    expect(getScoreColor(35)).toBe('#22c55e');
  });

  it('returns yellow for scores 36–50', () => {
    expect(getScoreColor(36)).toBe('#eab308');
    expect(getScoreColor(45)).toBe('#eab308');
    expect(getScoreColor(50)).toBe('#eab308');
  });

  it('returns orange for scores 51–65', () => {
    expect(getScoreColor(51)).toBe('#f97316');
    expect(getScoreColor(60)).toBe('#f97316');
    expect(getScoreColor(65)).toBe('#f97316');
  });

  it('returns red for scores 66–100', () => {
    expect(getScoreColor(66)).toBe('#ef4444');
    expect(getScoreColor(85)).toBe('#ef4444');
    expect(getScoreColor(100)).toBe('#ef4444');
  });
});

describe('getScoreLabel', () => {
  it('returns the correct label for each band', () => {
    expect(getScoreLabel(10)).toBe('This is actually sweet');
    expect(getScoreLabel(42)).toBe('Proceed with caution');
    expect(getScoreLabel(58)).toBe('Proceed at your own discretion');
    expect(getScoreLabel(90)).toBe('Proceed at your own detriment');
  });
});
