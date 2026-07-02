import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

describe('ResultCard', () => {
  it('renders without crashing', () => {
    const { unmount } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={jest.fn()}
        onViewSuggestions={jest.fn()}
      />,
    );
    expect(() => unmount()).not.toThrow();
  });

  it('displays the score label', () => {
    const { getByText } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={jest.fn()}
        onViewSuggestions={jest.fn()}
      />,
    );
    expect(getByText('Proceed at your own detriment')).toBeTruthy();
  });

  it('renders a Check Another button', () => {
    const { getByText } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={jest.fn()}
        onViewSuggestions={jest.fn()}
      />,
    );
    expect(getByText('Check Another')).toBeTruthy();
  });

  it('calls onTryAgain when Check Another is pressed', () => {
    const onTryAgain = jest.fn();
    const { getByText } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={onTryAgain}
        onViewSuggestions={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Check Another'));
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  it('shows View suggestions link when reasons exist', () => {
    const { getByText } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={jest.fn()}
        onViewSuggestions={jest.fn()}
      />,
    );
    expect(getByText('View suggestions')).toBeTruthy();
  });

  it('calls onViewSuggestions when link is pressed', () => {
    const onViewSuggestions = jest.fn();
    const { getByText } = render(
      <ResultCard
        {...mockResult}
        onTryAgain={jest.fn()}
        onViewSuggestions={onViewSuggestions}
      />,
    );
    fireEvent.press(getByText('View suggestions'));
    expect(onViewSuggestions).toHaveBeenCalledTimes(1);
  });

  it('renders with an empty reasons array', () => {
    const { unmount } = render(
      <ResultCard
        score={10}
        category="safe"
        label="This is actually sweet"
        advice="Looks fine."
        reasons={[]}
        onTryAgain={jest.fn()}
        onViewSuggestions={jest.fn()}
      />,
    );
    expect(() => unmount()).not.toThrow();
  });
});
