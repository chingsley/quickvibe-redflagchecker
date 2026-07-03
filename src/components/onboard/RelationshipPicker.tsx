import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/keyboard';
import { colors, radii, spacing, text } from '@/constants/theme';
import type { RelationshipType } from '@/api/types';

const OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'business', label: 'Business' },
  { value: 'not_sure', label: 'Not sure yet' },
  { value: 'other', label: 'Other' },
];

interface RelationshipPickerProps {
  value: RelationshipType | null;
  otherText: string;
  onChange: (value: RelationshipType) => void;
  onOtherTextChange: (text: string) => void;
}

export function RelationshipPicker({
  value,
  otherText,
  onChange,
  onOtherTextChange,
}: RelationshipPickerProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Type of relationship</AppText>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <AppText style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
      {value === 'other' && (
        <AppTextInput
          variant="default"
          placeholder="Describe the relationship"
          value={otherText}
          onChangeText={onOtherTextChange}
          style={styles.otherInput}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.lg,
  },
  label: {
    ...text('base', 'semibold', 'normal'),
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.navy,
    backgroundColor: colors.gray50,
  },
  optionText: {
    ...text('base', 'medium', 'normal'),
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.navy,
  },
  otherInput: {
    marginTop: spacing.md,
    minHeight: 52,
  },
});
