import React from 'react';
import { render } from '@testing-library/react-native';
import { AppTextInput } from '../AppTextInput';

describe('AppTextInput', () => {
  it('renders without crashing', () => {
    const { unmount } = render(
      <AppTextInput placeholder="Type here" value="" onChangeText={() => {}} />,
    );
    expect(() => unmount()).not.toThrow();
  });
});
