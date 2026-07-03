import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { AppDrawer, HamburgerButton } from '@/components/navigation';
import { resolveDefaultChatPath } from '@/lib/resolveDefaultChat';
import { colors, spacing, text } from '@/constants/theme';

export default function LandingScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const chatPath = await resolveDefaultChatPath();
        if (cancelled) return;

        if (chatPath) {
          router.replace(chatPath);
          return;
        }
      } catch {
        // No friends or API error — show empty home
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.navy} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <HamburgerButton onPress={() => setDrawerOpen(true)} />
      </View>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <View style={styles.center}>
        <AppText style={styles.subtitle}>
          Add someone to start checking vibes together.
        </AppText>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/onboard')}
        >
          <AppText style={styles.primaryButtonText}>Vibe New Friend</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  subtitle: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.navy,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  primaryButtonText: {
    ...text('lg', 'semibold', 'normal'),
    color: colors.white,
  },
});
