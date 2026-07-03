import { fireEvent, render } from '@testing-library/react-native';
import { AbandonAnalysisDialog } from '../AbandonAnalysisDialog';

describe('AbandonAnalysisDialog', () => {
  it('calls onConfirm when Continue is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <AbandonAnalysisDialog
        visible
        friendName="Amber"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.press(getByText('Continue'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <AbandonAnalysisDialog
        visible
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows an error message when provided', () => {
    const { getByText } = render(
      <AbandonAnalysisDialog
        visible
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        error="Request timed out. Check your connection and try again."
      />,
    );

    expect(getByText('Request timed out. Check your connection and try again.')).toBeTruthy();
  });
});
