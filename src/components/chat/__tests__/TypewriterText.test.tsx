import React from 'react';
import { render, act } from '@testing-library/react-native';
import { TypewriterText } from '../TypewriterText';

describe('TypewriterText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows full text immediately when animate is false', () => {
    const { getByText } = render(
      <TypewriterText text="Hello world" animate={false} />,
    );
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('reveals text gradually when animate is true', () => {
    const { getByText, queryByText } = render(
      <TypewriterText text="Hi" animate speedMs={10} />,
    );

    expect(queryByText('Hi')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(getByText('H')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(getByText('Hi')).toBeTruthy();
  });

  it('does not restart animation when parent re-renders with a new onComplete callback', () => {
    const { getByText, rerender } = render(
      <TypewriterText
        text="Hello"
        animate
        speedMs={10}
        onComplete={() => {}}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(30);
    });
    expect(getByText('Hel')).toBeTruthy();

    rerender(
      <TypewriterText
        text="Hello"
        animate
        speedMs={10}
        onComplete={() => {}}
      />,
    );

    expect(getByText('Hel')).toBeTruthy();
  });
});
