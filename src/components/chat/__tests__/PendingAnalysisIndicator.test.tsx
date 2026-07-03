import React from 'react';
import { render } from '@testing-library/react-native';
import { PendingAnalysisIndicator } from '../PendingAnalysisIndicator';

describe('PendingAnalysisIndicator', () => {
  it('shows the analyzing label while waiting for a response', () => {
    const { getByText } = render(<PendingAnalysisIndicator />);
    expect(getByText('Analyzing your experience')).toBeTruthy();
  });
});
