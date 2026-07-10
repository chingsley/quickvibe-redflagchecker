import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
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
import { MoreMenuIcon } from '@/components/navigation/MoreMenuIcon';
import { SettingsBottomSheet } from '@/components/navigation/SettingsBottomSheet';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import type { Friend } from '@/api/types';
import { colors, radii, spacing, text, gestalt, SCORE_BANDS, primaryButton, primaryButtonText } from '@/constants/theme';

/** How much of the screen width the main view shifts right when the drawer opens. */
const DRAWER_REVEAL_RATIO = 0.78;

/** Max width for all sidebar menu content (brand, actions, friends, settings, footer). */
const DRAWER_MENU_MAX_WIDTH = 280;

/** Friend row background bleeds this far past the content column; list negative margin keeps the dot aligned. */
const FRIEND_ROW_INSET = spacing.sml;

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
  children: ReactNode;
  currentFriendId?: string;
  showFollowUpsInChat?: boolean;
  onShowFollowUpsInChatChange?: (value: boolean) => void;
}

export function AppDrawer({
  visible,
  onClose,
  children,
  currentFriendId,
  showFollowUpsInChat = false,
  onShowFollowUpsInChatChange,
}: AppDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const shiftAmount = screenWidth * DRAWER_REVEAL_RATIO;

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const shiftAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const isAnimatingClosed = useRef(false);

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

  const animateDrawer = useCallback(
    (open: boolean, onComplete?: () => void) => {
      Animated.parallel([
        Animated.timing(shiftAnim, {
          toValue: open ? shiftAmount : 0,
          duration: open ? 250 : 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: open ? 1 : 0,
          duration: open ? 250 : 200,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete?.());
    },
    [overlayAnim, shiftAmount, shiftAnim],
  );

  useEffect(() => {
    if (visible) {
      loadFriends();
      animateDrawer(true);
      return;
    }

    if (!isAnimatingClosed.current) {
      animateDrawer(false);
    }
  }, [visible, loadFriends, animateDrawer]);

  const closeWithAnimation = useCallback(
    (afterClose?: () => void) => {
      if (!visible) {
        afterClose?.();
        return;
      }

      isAnimatingClosed.current = true;
      animateDrawer(false, () => {
        isAnimatingClosed.current = false;
        onClose();
        afterClose?.();
      });
    },
    [animateDrawer, onClose, visible],
  );

  useEffect(() => {
    if (!visible) {
      setSettingsOpen(false);
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (settingsOpen) {
        setSettingsOpen(false);
        return true;
      }
      closeWithAnimation();
      return true;
    });

    return () => subscription.remove();
  }, [visible, settingsOpen, closeWithAnimation]);

  const openSettings = () => {
    setSettingsOpen(true);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      setSettingsOpen(false);
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

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

  return (
    <View style={styles.shell}>
      <View
        style={styles.drawerLayer}
        pointerEvents={visible ? 'auto' : 'none'}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      >
        <SafeAreaView
          style={[styles.panelInner, { paddingTop: safeTop, paddingBottom: safeBottom }]}
          edges={[]}
        >
          <View style={styles.menuColumn}>
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
                  contentContainerStyle={styles.friendListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {friends.map((friend) => {
                    const active = friend.id === currentFriendId;
                    const dotColor = getVibeDotColor(friend.latestScore);
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        style={[styles.friendItemContainer, active && styles.friendRowActive]}
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

            {user?.email ? (
              <Pressable
                style={({ pressed }) => [styles.accountFooter, pressed && styles.accountFooterPressed]}
                onPress={openSettings}
                accessibilityRole="button"
                accessibilityLabel="Open settings"
              >
                <AppText style={styles.email} numberOfLines={1}>
                  {user.email}
                </AppText>
                <MoreMenuIcon />
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </View>

      <SettingsBottomSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userEmail={user?.email}
        showFollowUpsInChat={onShowFollowUpsInChatChange ? showFollowUpsInChat : undefined}
        onShowFollowUpsInChatChange={onShowFollowUpsInChatChange}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      <Animated.View
        style={[
          styles.contentLayer,
          visible && styles.contentLayerOpen,
          { transform: [{ translateX: shiftAnim }] },
        ]}
      >
        <View style={[styles.contentSurface, visible && styles.contentSurfaceOpen]}>
          {children}

          <Animated.View
            pointerEvents={visible ? 'auto' : 'none'}
            style={[styles.contentOverlay, { opacity: overlayAnim }]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => closeWithAnimation()}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray50,
    zIndex: 0,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
  contentLayerOpen: {
    shadowColor: colors.black,
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  contentSurface: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentSurfaceOpen: {
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
    overflow: 'hidden',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  panelInner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  menuColumn: {
    flex: 1,
    width: '100%',
    maxWidth: DRAWER_MENU_MAX_WIDTH,
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
    flex: 1,
  },
  accountFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    minHeight: 48,
    borderRadius: radii.md,
  },
  accountFooterPressed: {
    opacity: 0.7,
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
    marginHorizontal: -FRIEND_ROW_INSET,
  },
  friendListContent: {
    gap: gestalt.itemGap,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sml,
    paddingHorizontal: FRIEND_ROW_INSET,
    borderRadius: radii.xl,
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: colors.gray300,
  },
  friendRowActive: {
    // active state indicated by name color only
    backgroundColor: colors.gray300,
  },
  vibeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
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
  actionButton: {
    alignSelf: 'flex-start',
    ...primaryButton,
    marginBottom: gestalt.groupGap,
  },
  actionButtonText: primaryButtonText,
});
