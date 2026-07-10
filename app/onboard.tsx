import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { AppTextInput, KeyboardAwareScreen } from '@/components/keyboard';
import { AppDrawer, ScreenHeader } from '@/components/navigation';
import { RelationshipPicker } from '@/components/onboard/RelationshipPicker';
import { api } from '@/api/client';
import type { RelationshipType } from '@/api/types';
import { setLastFriendId } from '@/lib/lastFriend';
import { colors, spacing, text, primaryButton, primaryButtonText } from '@/constants/theme';

export default function OnboardScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(null);
  const [relationshipOther, setRelationshipOther] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canStart =
    displayName.trim().length > 0 &&
    relationshipType !== null &&
    (relationshipType !== 'other' || relationshipOther.trim().length > 0);

  const handleStart = async () => {
    if (!canStart || !relationshipType) return;
    Keyboard.dismiss();
    setSubmitting(true);
    setError(null);

    try {
      const { friend } = await api.createFriend({
        displayName: displayName.trim(),
        relationshipType,
        relationshipOther:
          relationshipType === 'other' ? relationshipOther.trim() : undefined,
      });
      await setLastFriendId(friend.id);
      router.replace(`/chat/${friend.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create friend');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader
          onMenuPress={() => setDrawerOpen(true)}
          title="New friend"
          showBorder
        />

        <KeyboardAwareScreen
          edges={['bottom']}
          contentContainerStyle={styles.scrollContent}
        >
          <AppText style={styles.subtitle}>
            Add a name or alias — it doesn&apos;t have to be their real name.
          </AppText>

          <AppText style={styles.label}>Friend&apos;s name</AppText>
          <AppTextInput
            variant="default"
            placeholder="e.g. Alex, Coworker Sam…"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.nameInput}
          />

          <RelationshipPicker
            value={relationshipType}
            otherText={relationshipOther}
            onChange={setRelationshipType}
            onOtherTextChange={setRelationshipOther}
          />

          {error && <AppText style={styles.error}>{error}</AppText>}

          <TouchableOpacity
            style={[styles.startButton, (!canStart || submitting) && styles.startDisabled]}
            onPress={handleStart}
            disabled={!canStart || submitting}
          >
            <AppText style={styles.startText}>
              {submitting ? 'Starting…' : 'Start'}
            </AppText>
          </TouchableOpacity>
        </KeyboardAwareScreen>
      </SafeAreaView>
    </AppDrawer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  label: {
    ...text('base', 'semibold', 'normal'),
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  nameInput: {
    minHeight: 52,
  },
  error: {
    ...text('sm', 'medium', 'normal'),
    color: colors.red,
    marginTop: spacing.md,
  },
  startButton: {
    ...primaryButton,
    marginTop: spacing.xl,
  },
  startDisabled: {
    opacity: 0.4,
  },
  startText: primaryButtonText,
});
