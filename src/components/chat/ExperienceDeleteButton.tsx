import { Feather } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface ExperienceDeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
}

export function ExperienceDeleteButton({
  onDelete,
  disabled = false,
}: ExperienceDeleteButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.deleteButton, disabled && styles.deleteDisabled]}
      onPress={onDelete}
      disabled={disabled}
      accessibilityLabel="Delete experience"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Feather name="trash-2" size={18} color={colors.gray500} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray300,
  },
  deleteDisabled: {
    opacity: 0.45,
  },
});
