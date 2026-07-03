import { fireEvent, render } from '@testing-library/react-native';
import { DeleteExperienceDialog } from '../DeleteExperienceDialog';

describe('DeleteExperienceDialog', () => {
  it('calls onConfirm when Delete is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <DeleteExperienceDialog
        visible
        experiencePreview="She talks ill of people"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.press(getByText('Delete'));
    expect(onConfirm).toHaveBeenCalled();
  });
});
