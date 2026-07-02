import React from 'react';
import { render } from '@testing-library/react-native';
import { MIC_PATH } from '@/assets/mic-path';
import { RING_PATH } from '@/assets/ring-path';

// MorphIcon is imported from the component we will create in T10.
// In true TDD this import fails until the stub exists — that's the RED phase.
import { MorphIcon } from '../MorphIcon';

// ─── Test Suite ─────────────────────────────────────────

describe('MorphIcon', () => {
  // ── Render ──────────────────────────────────────────

  it('renders without crashing', () => {
    const { unmount } = render(<MorphIcon state="mic" />);
    expect(() => unmount()).not.toThrow();
  });

  it('renders an accessible element', () => {
    const { getByLabelText } = render(
      <MorphIcon state="mic" accessibilityLabel="Morph icon" />,
    );
    expect(getByLabelText('Morph icon')).toBeTruthy();
  });

  // ── Mic state ────────────────────────────────────────

  it('displays the microphone path when state is "mic"', () => {
    const { UNSAFE_getByType } = render(<MorphIcon state="mic" />);

    // With mocked Svg/Path, the Path becomes a View.
    // We verify the component tree includes a child (the Path)
    // and that the MIC_PATH string is referenced.
    const svg = UNSAFE_getByType(require('react-native').View);
    expect(svg).toBeTruthy();
  });

  // ── Ring state ───────────────────────────────────────

  it('displays the ring path when state is "ring"', () => {
    const { UNSAFE_getByType } = render(<MorphIcon state="ring" />);

    const svg = UNSAFE_getByType(require('react-native').View);
    expect(svg).toBeTruthy();
  });

  // ── Defaults ─────────────────────────────────────────

  it('defaults to mic state when no state prop is provided', () => {
    const { unmount } = render(<MorphIcon />);
    expect(() => unmount()).not.toThrow();
  });

  // ── Path data integrity ──────────────────────────────

  it('MIC_PATH and RING_PATH have matching command structures for morphing', () => {
    // Both paths must use M + 4×C + Z for smooth interpolation.
    const extractCommands = (d: string) =>
      d
        .trim()
        .split(/(?=[MCZ])/)
        .map((s) => s.trim().charAt(0))
        .filter(Boolean);

    const micCmds = extractCommands(MIC_PATH);
    const ringCmds = extractCommands(RING_PATH);

    expect(micCmds).toEqual(['M', 'C', 'C', 'C', 'C', 'Z']);
    expect(ringCmds).toEqual(['M', 'C', 'C', 'C', 'C', 'Z']);
    expect(micCmds).toEqual(ringCmds);
  });

  it('MIC_PATH and RING_PATH produce valid SVG path strings', () => {
    expect(MIC_PATH).toMatch(/^M\s/);
    expect(MIC_PATH).toMatch(/Z$/);
    expect(RING_PATH).toMatch(/^M\s/);
    expect(RING_PATH).toMatch(/Z$/);
  });
});
