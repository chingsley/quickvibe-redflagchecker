import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, radii, spacing, text } from '@/constants/theme';

interface DeleteExperienceDialogProps {
  visible: boolean;
  experiencePreview?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean;
  error?: string | null;
}

export function DeleteExperienceDialog({
  visible,
  experiencePreview,
  onCancel,
  onConfirm,
  confirming = false,
  error = null,
}: DeleteExperienceDialogProps) {
  const preview = experiencePreview?.trim();
  const previewLine =
    preview && preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={confirming ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <AppText style={styles.title}>Delete this experience?</AppText>
          <AppText style={styles.body}>
            This will permanently remove the experience
            {previewLine ? ` "${previewLine}"` : ''} and every response tied to it.
          </AppText>

          {error ? <AppText style={styles.error}>{error}</AppText> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={confirming}
              activeOpacity={0.8}
            >
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, confirming && styles.confirmDisabled]}
              onPress={onConfirm}
              disabled={confirming}
              activeOpacity={0.85}
            >
              <AppText style={styles.confirmText}>
                {confirming ? 'Deleting…' : 'Delete'}
              </AppText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...text('lg', 'semibold', 'tight'),
    color: colors.textPrimary,
  },
  body: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
  },
  error: {
    ...text('sm', 'medium', 'normal'),
    color: colors.red,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  cancelText: {
    ...text('base', 'medium', 'normal'),
    color: colors.navy,
  },
  confirmButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.red,
  },
  confirmDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
});
