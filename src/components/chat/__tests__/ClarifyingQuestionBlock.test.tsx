import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ClarifyingQuestionBlock } from '../ClarifyingQuestionBlock';

describe('ClarifyingQuestionBlock', () => {
  it('submits choice answers on tap', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <ClarifyingQuestionBlock
        question="Did they apologize?"
        type="choice"
        choices={['Yes', 'No']}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.press(getByText('Yes'));
    expect(onSubmit).toHaveBeenCalledWith('Yes');
  });

  it('renders open question with input', () => {
    const { getByPlaceholderText } = render(
      <ClarifyingQuestionBlock
        question="What happened next?"
        type="open"
        onSubmit={jest.fn()}
      />,
    );

    expect(getByPlaceholderText('Your answer…')).toBeTruthy();
  });

  it('submits open answers via the inline send button', () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(
      <ClarifyingQuestionBlock
        question="What happened next?"
        type="open"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.changeText(getByPlaceholderText('Your answer…'), 'They left early');
    fireEvent.press(getByLabelText('Send answer'));
    expect(onSubmit).toHaveBeenCalledWith('They left early');
  });

  it('hides open input when using main chat input', () => {
    const { queryByPlaceholderText } = render(
      <ClarifyingQuestionBlock
        question="What specific experience would you like me to analyze?"
        type="open"
        onSubmit={jest.fn()}
        useMainChatInput
      />,
    );

    expect(queryByPlaceholderText('Your answer…')).toBeNull();
  });
});
