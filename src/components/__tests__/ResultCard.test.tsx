import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ResultCard will be created in T20.
import { ResultCard } from '../ResultCard';

const mockResult = {
  score: 85,
  category: 'manipulation',
  label: 'Proceed at your own detriment',
  advice: 'This situation shows concerning patterns. Consider setting boundaries.',
  reasons: [
    'Detected love-bombing language patterns',
    'High incidence of deflection and blame-shifting',
    'Contains controlling ultimatum phrasing',
  ],
};

// ─── Test Suite ─────────────────────────────────────────

describe('ResultCard', () => {
  // ── Render ──────────────────────────────────────────

  it('renders without crashing', () => {
    const { unmount } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );
    expect(() => unmount()).not.toThrow();
  });

  // ── Content display ──────────────────────────────────

  it('displays the score label', () => {
    const { getByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );
    expect(getByText('Proceed at your own detriment')).toBeTruthy();
  });

  it('displays the advice text', () => {
    const { getByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );
    expect(
      getByText(
        'This situation shows concerning patterns. Consider setting boundaries.',
      ),
    ).toBeTruthy();
  });

  // ── Check Another button ─────────────────────────────

  it('renders a Check Another button', () => {
    const { getByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );
    expect(getByText('Check Another')).toBeTruthy();
  });

  it('calls onTryAgain when Check Another is pressed', () => {
    const onTryAgain = jest.fn();
    const { getByText } = render(
      <ResultCard {...mockResult} onTryAgain={onTryAgain} />,
    );
    fireEvent.press(getByText('Check Another'));
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  // ── Why? toggle ──────────────────────────────────────

  it('shows a Why? toggle button', () => {
    const { getByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );
    expect(getByText(/Why\?/)).toBeTruthy();
  });

  it('shows reasons when Why? is pressed (toggled on)', () => {
    const { getByText, queryByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );

    // Reasons should be hidden initially
    expect(queryByText('Detected love-bombing language patterns')).toBeNull();

    // Press Why?
    fireEvent.press(getByText(/Why\?/));

    // Reasons should now be visible
    expect(
      getByText('Detected love-bombing language patterns'),
    ).toBeTruthy();
    expect(
      getByText('High incidence of deflection and blame-shifting'),
    ).toBeTruthy();
    expect(
      getByText('Contains controlling ultimatum phrasing'),
    ).toBeTruthy();
  });

  it('hides reasons when Why? is pressed again (toggled off)', () => {
    const { getByText, queryByText } = render(
      <ResultCard {...mockResult} onTryAgain={jest.fn()} />,
    );

    // Show
    fireEvent.press(getByText(/Why\?/));
    expect(
      getByText('Detected love-bombing language patterns'),
    ).toBeTruthy();

    // Hide
    fireEvent.press(getByText(/Why\?/));
    expect(queryByText('Detected love-bombing language patterns')).toBeNull();
  });

  // ── Edge cases ───────────────────────────────────────

  it('renders with an empty reasons array', () => {
    const { unmount } = render(
      <ResultCard
        score={10}
        category="safe"
        label="This is actually sweet"
        advice="Looks fine."
        reasons={[]}
        onTryAgain={jest.fn()}
      />,
    );
    expect(() => unmount()).not.toThrow();
  });
});
