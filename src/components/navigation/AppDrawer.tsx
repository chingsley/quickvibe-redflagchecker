import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import type { Friend } from '@/api/types';
import { colors, radii, spacing, text, gestalt, SCORE_BANDS } from '@/constants/theme';

const DRAWER_WIDTH = 300;

function formatRelationship(type: string): string {
  return type.replace(/_/g, ' ');
}

function getVibeDotColor(score: number | null): string {
  if (score === null) return colors.gray300;
  for (const band of SCORE_BANDS) {
    if (score >= band.min && score <= band.max) return band.color;
  }
  return colors.gray300;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentFriendId?: string;
  showFollowUpsInChat?: boolean;
  onShowFollowUpsInChatChange?: (value: boolean) => void;
}

export function AppDrawer({
  visible,
  onClose,
  currentFriendId,
  showFollowUpsInChat = false,
  onShowFollowUpsInChatChange,
}: AppDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const panelWidth = Math.min(DRAWER_WIDTH, screenWidth * 0.85);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(-panelWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { friends: list } = await api.listFriends();
      setFriends(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadFriends();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(-panelWidth);
      fadeAnim.setValue(0);
    }
  }, [visible, loadFriends, slideAnim, fadeAnim, panelWidth]);

  const closeWithAnimation = useCallback(
    (afterClose?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -panelWidth,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
        afterClose?.();
      });
    },
    [slideAnim, fadeAnim, panelWidth, onClose],
  );

  const selectFriend = (id: string) => {
    if (id === currentFriendId) {
      closeWithAnimation();
      return;
    }
    closeWithAnimation(() => router.replace(`/chat/${id}`));
  };

  const addFriend = () => {
    closeWithAnimation(() => router.push('/onboard'));
  };

  const goHome = () => {
    closeWithAnimation(() => router.replace('/'));
  };

  const handleLogout = () => {
    closeWithAnimation(() => logout());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => closeWithAnimation()}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeWithAnimation()} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            { width: panelWidth, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView
            style={[styles.panelInner, { paddingTop: safeTop, paddingBottom: safeBottom }]}
            edges={[]}
          >
            <View style={styles.brandGroup}>
              <AppText style={styles.brand}>VibeMeter</AppText>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={addFriend} activeOpacity={0.7}>
              <AppText style={styles.actionButtonText}>+ Vibe New Friend</AppText>
            </TouchableOpacity>

            <View style={styles.friendsGroup}>
              <AppText style={styles.sectionTitle}>Your friends</AppText>

              {loading ? (
                <ActivityIndicator color={colors.navy} style={styles.loader} />
              ) : error ? (
                <AppText style={styles.error}>{error}</AppText>
              ) : friends.length === 0 ? (
                <AppText style={styles.empty}>No friends yet</AppText>
              ) : (
                <ScrollView
                  style={styles.friendList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {friends.map((friend) => {
                    const active = friend.id === currentFriendId;
                    const dotColor = getVibeDotColor(friend.latestScore);
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        style={[styles.friendRow, active && styles.friendRowActive]}
                        onPress={() => selectFriend(friend.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.vibeDot, { backgroundColor: dotColor }]} />
                        <View style={styles.friendContent}>
                          <AppText
                            style={[styles.friendName, active && styles.friendNameActive]}
                            numberOfLines={1}
                          >
                            {friend.displayName}
                          </AppText>
                          <AppText style={styles.friendPipe}>|</AppText>
                          <AppText style={styles.friendMeta} numberOfLines={1}>
                            {formatRelationship(friend.relationshipType)}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {onShowFollowUpsInChatChange && (
              <View style={styles.toggleRow}>
                <View style={styles.toggleCopy}>
                  <AppText style={styles.toggleLabel}>Show follow-up Q&A in chat</AppText>
                  <AppText style={styles.toggleHint}>
                    Answers still count toward the verdict when hidden
                  </AppText>
                </View>
                <ToggleSwitch
                  value={showFollowUpsInChat}
                  onValueChange={onShowFollowUpsInChatChange}
                  accessibilityLabel="Show follow-up Q&A in chat"
                />
              </View>
            )}

            <View style={styles.actions}>
              {user?.email && (
                <AppText style={styles.email} numberOfLines={1}>
                  {user.email}
                </AppText>
              )}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    height: '100%',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  panelInner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brandGroup: {
    gap: gestalt.itemGap,
    marginBottom: gestalt.groupGap,
  },
  brand: {
    ...text('xl', 'bold', 'tight'),
    fontSize: 22,
    color: colors.navy,
  },
  email: {
    ...text('sm', 'regular', 'normal'),
    color: colors.textSecondary,
  },
  friendsGroup: {
    flex: 1,
    gap: gestalt.itemGap,
  },
  sectionTitle: {
    ...text('sm', 'semibold', 'normal'),
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  error: {
    ...text('sm', 'medium', 'normal'),
    color: colors.red,
    marginBottom: spacing.md,
  },
  empty: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  friendList: {
    flex: 1,
    marginBottom: spacing.md,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  friendRowActive: {
    // active state indicated by name color only
  },
  vibeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  friendContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    ...text('base', 'semibold', 'normal'),
    color: colors.textPrimary,
  },
  friendNameActive: {
    color: colors.navy,
  },
  friendMeta: {
    ...text('sm', 'regular', 'normal'),
    color: colors.textSecondary,
    textTransform: 'capitalize',
    flexShrink: 1,
  },
  friendPipe: {
    ...text('sm', 'regular', 'normal'),
    color: colors.gray300,
    marginHorizontal: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray300,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleLabel: {
    ...text('sm', 'medium', 'normal'),
    color: colors.textPrimary,
  },
  toggleHint: {
    ...text('xs', 'regular', 'normal'),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.navy,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: gestalt.groupGap,
  },
  actionButtonText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  actionLink: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionLinkText: {
    ...text('base', 'medium', 'normal'),
    color: colors.navy,
  },
  logoutText: {
    ...text('base', 'medium', 'normal'),
    color: colors.gray500,
  },
});
