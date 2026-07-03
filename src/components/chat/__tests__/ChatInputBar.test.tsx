import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ChatInputBar } from '../ChatInputBar';

describe('ChatInputBar', () => {
  it('disables submit when empty', () => {
    const { getByLabelText } = render(
      <ChatInputBar value="" onChangeText={() => { }} onSubmit={jest.fn()} />,
    );

    const button = getByLabelText('Send message');
    fireEvent.press(button);
    expect(button).toBeTruthy();
  });

  it('calls onSubmit when text is entered', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(
      <ChatInputBar
        value="Hello"
        onChangeText={() => { }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.press(getByLabelText('Send message'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(
      <ChatInputBar
        value="Hello"
        onChangeText={() => { }}
        onSubmit={onSubmit}
        disabled
      />,
    );

    fireEvent.press(getByLabelText('Send message'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows New Vibe button when collapsed', () => {
    const onExpand = jest.fn();
    const { getByLabelText } = render(
      <ChatInputBar
        value=""
        onChangeText={() => { }}
        onSubmit={jest.fn()}
        collapsed
        onExpand={onExpand}
      />,
    );

    fireEvent.press(getByLabelText('New Vibe'));
    expect(onExpand).toHaveBeenCalled();
  });

  it('shows text input when not collapsed', () => {
    const { getByPlaceholderText } = render(
      <ChatInputBar
        value=""
        onChangeText={() => { }}
        onSubmit={jest.fn()}
        collapsed={false}
      />,
    );

    expect(getByPlaceholderText('Share your experience…')).toBeTruthy();
  });

  it('calls onCollapse when the input loses focus', () => {
    const onCollapse = jest.fn();
    const { getByPlaceholderText } = render(
      <ChatInputBar
        value=""
        onChangeText={() => { }}
        onSubmit={jest.fn()}
        collapsed={false}
        onCollapse={onCollapse}
      />,
    );

    fireEvent(getByPlaceholderText('Share your experience…'), 'blur');
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it('keeps submit disabled when submitDisabled is true', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = render(
      <ChatInputBar
        value="Hello"
        onChangeText={() => { }}
        onSubmit={onSubmit}
        submitDisabled
      />,
    );

    fireEvent.press(getByLabelText('Send message'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
