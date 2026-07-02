import React from 'react';
import { render } from '@testing-library/react-native';
import { AnalyzingLoader } from '../AnalyzingLoader';

describe('AnalyzingLoader', () => {
  it('renders without crashing', () => {
    const { unmount } = render(<AnalyzingLoader />);
    expect(() => unmount()).not.toThrow();
  });

  it('displays the default message', () => {
    const { getByText } = render(<AnalyzingLoader />);
    expect(getByText('Analysing')).toBeTruthy();
  });

  it('displays a custom message', () => {
    const { getByText } = render(<AnalyzingLoader message="Transcribing" />);
    expect(getByText('Transcribing')).toBeTruthy();
  });
});
