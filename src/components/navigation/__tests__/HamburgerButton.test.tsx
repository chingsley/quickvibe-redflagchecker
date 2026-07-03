import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HamburgerButton } from '../HamburgerButton';

describe('HamburgerButton', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<HamburgerButton onPress={onPress} />);
    fireEvent.press(getByLabelText('Open menu'));
    expect(onPress).toHaveBeenCalled();
  });
});
