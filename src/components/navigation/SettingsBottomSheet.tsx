import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import {
  getShowFollowUpsInChat,
  setShowFollowUpsInChat as persistShowFollowUpsInChat,
} from '@/lib/chatPreferences';
import { colors, gestalt, radii, spacing, text } from '@/constants/theme';

/** Gap between the top of the sheet and the safe area (status bar), matching full-height settings modals. */
const SETTINGS_SHEET_TOP_GAP = spacing.sm;
const SETTINGS_SHEET_TOP_RADIUS = 32;
const CLOSE_BUTTON_SIZE = 48;
const SETTINGS_HEADER_HEIGHT = spacing.lg + spacing.md + CLOSE_BUTTON_SIZE;
const CLOSE_ICON_SIZE = 18;
const CLOSE_BAR_THICKNESS = 2.5;
const OVERLAY_FADE_MS = 160;
const SHEET_SLIDE_MS = 300;
const ROW_ICON_SIZE = 22;
const ROW_HORIZONTAL_PADDING = spacing.lg;
const ROW_DIVIDER_INSET = ROW_HORIZONTAL_PADDING + ROW_ICON_SIZE + spacing.md;

/** Native screens lose hairlines easily — nudge borders/separators up just a touch. */
const SETTINGS_BORDER_COLOR = Platform.OS === 'web' ? colors.gray300 : '#bcc2cc';
const SETTINGS_DIVIDER_HEIGHT = Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth;

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  showFollowUpsInChat?: boolean;
  onShowFollowUpsInChatChange?: (value: boolean) => void;
  onSignOut: () => void;
  signingOut?: boolean;
}

type SettingsIconName = 'account' | 'data' | 'chat' | 'analysis' | 'logout';

function SettingsGlyph({ name }: { name: SettingsIconName }) {
  const stroke = colors.textPrimary;

  switch (name) {
    case 'account':
      return (
        <View style={styles.glyphBox}>
          <View style={[styles.glyphHead, { borderColor: stroke }]} />
          <View style={[styles.glyphShoulders, { borderColor: stroke }]} />
        </View>
      );
    case 'data':
      return (
        <View style={styles.glyphBox}>
          <View style={[styles.glyphDisk, { borderColor: stroke }]} />
          <View style={[styles.glyphDisk, styles.glyphDiskMiddle, { borderColor: stroke }]} />
          <View style={[styles.glyphDisk, styles.glyphDiskBottom, { borderColor: stroke }]} />
        </View>
      );
    case 'chat':
      return (
        <View style={styles.glyphBox}>
          <View style={[styles.glyphBubble, { borderColor: stroke }]}>
            <View style={[styles.glyphBubbleTail, { borderColor: stroke }]} />
          </View>
        </View>
      );
    case 'analysis':
      return (
        <View style={styles.glyphBox}>
          <View style={[styles.glyphChartBar, styles.glyphChartBarShort, { backgroundColor: stroke }]} />
          <View style={[styles.glyphChartBar, styles.glyphChartBarMid, { backgroundColor: stroke }]} />
          <View style={[styles.glyphChartBar, styles.glyphChartBarTall, { backgroundColor: stroke }]} />
        </View>
      );
    case 'logout':
      return (
        <View style={styles.glyphBox}>
          <View style={[styles.glyphDoor, { borderColor: stroke }]} />
          <View style={[styles.glyphArrowStem, { backgroundColor: stroke }]} />
          <View style={[styles.glyphArrowHead, { borderColor: stroke }]} />
        </View>
      );
    default:
      return <View style={styles.glyphBox} />;
  }
}

function ChevronIcon() {
  return <AppText style={styles.chevron}>›</AppText>;
}

function CloseIcon() {
  return (
    <View style={styles.closeIcon}>
      <View style={styles.closeBar} />
      <View style={[styles.closeBar, styles.closeBarReverse]} />
    </View>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SettingsDivider() {
  return <View style={styles.rowDivider} />;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  right,
  showChevron = false,
}: {
  icon?: SettingsIconName;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  showChevron?: boolean;
}) {
  const trailing = (
    <View style={styles.rowTrailing}>
      {value ? (
        <AppText style={styles.rowValue} numberOfLines={1}>
          {value}
        </AppText>
      ) : null}
      {right}
      {showChevron ? <ChevronIcon /> : null}
    </View>
  );

  const content = (
    <>
      <View style={styles.rowLeading}>
        {icon ? <SettingsGlyph name={icon} /> : null}
        <AppText style={styles.rowLabel} numberOfLines={1}>
          {label}
        </AppText>
      </View>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

export function SettingsBottomSheet({
  visible,
  onClose,
  userEmail,
  showFollowUpsInChat,
  onShowFollowUpsInChatChange,
  onSignOut,
  signingOut = false,
}: SettingsBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const sheetHeight = windowHeight - safeTop - SETTINGS_SHEET_TOP_GAP;
  const [localFollowUps, setLocalFollowUps] = useState(false);
  const [mounted, setMounted] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetHeight)).current;

  const isFollowUpsControlled = showFollowUpsInChat !== undefined;
  const followUpsValue = isFollowUpsControlled ? showFollowUpsInChat : localFollowUps;

  useEffect(() => {
    if (!visible) return;

    setMounted(true);
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(sheetHeight);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: OVERLAY_FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SHEET_SLIDE_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, sheetHeight, overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    if (visible || !mounted) return;

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: OVERLAY_FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: sheetHeight,
        duration: SHEET_SLIDE_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, sheetHeight, overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    if (!visible || isFollowUpsControlled) return;
    getShowFollowUpsInChat()
      .then(setLocalFollowUps)
      .catch(() => {});
  }, [visible, isFollowUpsControlled]);

  const handleFollowUpsChange = useCallback(
    async (value: boolean) => {
      if (!isFollowUpsControlled) {
        setLocalFollowUps(value);
      }
      await persistShowFollowUpsInChat(value).catch(() => {});
      onShowFollowUpsInChatChange?.(value);
    },
    [isFollowUpsControlled, onShowFollowUpsInChatChange],
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close settings"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: Math.max(safeBottom, spacing.lg),
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: SETTINGS_HEADER_HEIGHT + spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {userEmail ? (
              <SettingsSection title="Profile">
                <SettingsCard>
                  <SettingsRow
                    icon="account"
                    label="Account settings"
                    value={userEmail}
                    showChevron
                  />
                  <SettingsDivider />
                  <SettingsRow icon="data" label="Data controls" showChevron />
                </SettingsCard>
              </SettingsSection>
            ) : null}

            <SettingsSection title="Chat">
              <SettingsCard>
                <SettingsRow
                  icon="chat"
                  label="Show follow-up Q&A in chat"
                  right={
                    <ToggleSwitch
                      value={followUpsValue}
                      onValueChange={handleFollowUpsChange}
                      accessibilityLabel="Show follow-up Q&A in chat"
                    />
                  }
                />
                <SettingsDivider />
                <SettingsRow
                  icon="analysis"
                  label="Analysis details"
                  value="In verdict"
                  showChevron
                />
              </SettingsCard>
              <AppText style={styles.hint}>
                Answers still count toward the verdict when hidden
              </AppText>
            </SettingsSection>

            <View style={styles.standaloneCardWrap}>
              <SettingsCard>
                <SettingsRow
                  icon="logout"
                  label={signingOut ? 'Signing out…' : 'Sign out'}
                  onPress={signingOut ? undefined : onSignOut}
                />
              </SettingsCard>
            </View>
          </ScrollView>

          <View pointerEvents="box-none" style={styles.headerShell}>
            <View style={styles.headerGlass} />
            <View style={styles.header}>
              <View style={styles.headerSide} />
              <AppText style={styles.headerTitle}>Settings</AppText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    backgroundColor: colors.gray50,
    borderTopLeftRadius: SETTINGS_SHEET_TOP_RADIUS,
    borderTopRightRadius: SETTINGS_SHEET_TOP_RADIUS,
    overflow: 'hidden',
  },
  headerShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    height: SETTINGS_HEADER_HEIGHT,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(209, 213, 219, 0.55)',
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'web' ? 'rgba(249, 250, 251, 0.68)' : 'rgba(249, 250, 251, 0.82)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        } as object)
      : null),
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  headerSide: {
    width: CLOSE_BUTTON_SIZE,
  },
  headerTitle: {
    ...text('lg', 'semibold', 'tight'),
    color: colors.textPrimary,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  closeIcon: {
    width: CLOSE_ICON_SIZE,
    height: CLOSE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBar: {
    position: 'absolute',
    width: CLOSE_ICON_SIZE,
    height: CLOSE_BAR_THICKNESS,
    borderRadius: 0,
    backgroundColor: colors.black,
    transform: [{ rotate: '45deg' }],
  },
  closeBarReverse: {
    transform: [{ rotate: '-45deg' }],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    gap: gestalt.groupGap,
  },
  section: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  standaloneCardWrap: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...text('sm', 'medium', 'normal'),
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  cardOuter: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        // RN Web can drop shadow when overflow clips on the same node — keep it on the outer shell.
        boxShadow: '0 2px 12px rgba(17, 24, 39, 0.08)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: ROW_HORIZONTAL_PADDING,
    minHeight: 54,
  },
  rowLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
    maxWidth: '58%',
  },
  rowDivider: {
    height: SETTINGS_DIVIDER_HEIGHT,
    backgroundColor: SETTINGS_BORDER_COLOR,
    marginLeft: ROW_DIVIDER_INSET,
    marginRight: ROW_DIVIDER_INSET,
  },
  rowLabel: {
    ...text('base', 'regular', 'normal'),
    color: colors.textPrimary,
    flexShrink: 1,
  },
  rowValue: {
    ...text('sm', 'regular', 'normal'),
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
  },
  chevron: {
    ...text('xl', 'regular', 'tight'),
    color: colors.gray300,
    marginTop: -2,
    marginLeft: spacing.xs,
  },
  hint: {
    ...text('xs', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  glyphBox: {
    width: ROW_ICON_SIZE,
    height: ROW_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  glyphShoulders: {
    width: 15,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    marginTop: 1,
  },
  glyphDisk: {
    position: 'absolute',
    width: 14,
    height: 5,
    borderRadius: 3,
    borderWidth: 1.5,
    top: 3,
  },
  glyphDiskMiddle: {
    top: 8,
  },
  glyphDiskBottom: {
    top: 13,
  },
  glyphBubble: {
    width: 16,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glyphBubbleTail: {
    position: 'absolute',
    bottom: -3,
    left: 4,
    width: 5,
    height: 5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: colors.white,
  },
  glyphChartBar: {
    position: 'absolute',
    bottom: 3,
    width: 3,
    borderRadius: 1,
  },
  glyphChartBarShort: {
    left: 4,
    height: 7,
  },
  glyphChartBarMid: {
    left: 9,
    height: 11,
  },
  glyphChartBarTall: {
    left: 14,
    height: 15,
  },
  glyphDoor: {
    position: 'absolute',
    left: 3,
    width: 10,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  glyphArrowStem: {
    position: 'absolute',
    right: 3,
    width: 8,
    height: 1.5,
    top: 11,
  },
  glyphArrowHead: {
    position: 'absolute',
    right: 2,
    width: 6,
    height: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
    top: 8,
  },
});
