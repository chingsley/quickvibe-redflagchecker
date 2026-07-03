import React from 'react';
import { act, render } from '@testing-library/react-native';
import { VerdictLoadingBar } from '../VerdictLoadingBar';
import { animation } from '@/constants/theme';

describe('VerdictLoadingBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows oscillating ellipsis while analyzing', () => {
    const { getByText, queryByText } = render(<VerdictLoadingBar targetScore={65} />);

    expect(getByText('Analyzing your experience')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(getByText('Analyzing your experience.')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(getByText('Analyzing your experience..')).toBeTruthy();
    expect(queryByText('Analyzing your experience')).toBeNull();
  });

  it('hides the analyzing label after the loader finishes but keeps the score', () => {
    const { getByText, queryByText } = render(<VerdictLoadingBar targetScore={65} />);

    act(() => {
      jest.advanceTimersByTime(animation.loaderDuration);
    });

    expect(queryByText(/Analyzing your experience/)).toBeNull();
    expect(getByText('65')).toBeTruthy();
  });
});
