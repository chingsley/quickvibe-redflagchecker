import { Feather } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme';

interface ExperienceEditButtonProps {
  onEdit: () => void;
  disabled?: boolean;
}

export function ExperienceEditButton({
  onEdit,
  disabled = false,
}: ExperienceEditButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.editButton, disabled && styles.editDisabled]}
      onPress={onEdit}
      disabled={disabled}
      accessibilityLabel="Edit vibe"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Feather name="edit-2" size={18} color={colors.gray500} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray300,
  },
  editDisabled: {
    opacity: 0.45,
  },
});
