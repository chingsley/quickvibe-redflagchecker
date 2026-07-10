import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { DeleteExperienceDialog } from '@/components/chat/DeleteExperienceDialog';
import { AbandonAnalysisDialog } from '@/components/chat/AbandonAnalysisDialog';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { PendingClarificationBar } from '@/components/chat/PendingClarificationBar';
import { AppDrawer, ScreenHeader } from '@/components/navigation';
import { useChatSession } from '@/hooks/useChatSession';
import { api } from '@/api/client';
import type { Friend } from '@/api/types';
import { colors, spacing, text } from '@/constants/theme';
import {
  getShowFollowUpsInChat,
  setShowFollowUpsInChat as persistShowFollowUpsInChat,
} from '@/lib/chatPreferences';
import { usesMainChatInputForClarification } from '@/lib/clarificationIntent';
import { setLastFriendId } from '@/lib/lastFriend';

export default function ChatScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string; }>();
  const scrollRef = useRef<ScrollView>(null);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [draft, setDraft] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showFollowUpsInChat, setShowFollowUpsInChat] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(false);
  const [abandonDialogVisible, setAbandonDialogVisible] = useState(false);
  const [abandonError, setAbandonError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    analysisId: string;
    userMessageId: string;
    preview: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{
    analysisId: string;
    userMessageId: string;
    content: string;
  } | null>(null);

  const {
    messages,
    pendingClarification,
    isLoading,
    isSending,
    isAbandoning,
    deletingAnalysisId,
    editingAnalysisId,
    inputDisabled,
    hasOngoingAnalysis,
    error,
    sendMessage,
    submitClarification,
    abandonActiveAnalysis,
    deleteExperience,
    editExperience,
  } = useChatSession(friendId ?? '');

  useEffect(() => {
    getShowFollowUpsInChat()
      .then(setShowFollowUpsInChat)
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!friendId) return;
    setLastFriendId(friendId).catch(() => { });
    api
      .getFriend(friendId)
      .then(({ friend: f }) => setFriend(f))
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : 'Friend not found'),
      );
  }, [friendId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, pendingClarification?.questionIndex, isSending]);

  const showPendingAnalysis = isSending;

  const activeClarificationMessageId = useMemo(() => {
    if (!showFollowUpsInChat || !pendingClarification) return null;
    const clarifying = [...messages]
      .reverse()
      .find((m) => m.kind === 'clarifying_question');
    return clarifying?.id ?? null;
  }, [messages, pendingClarification, showFollowUpsInChat]);

  const usesMainInput = useMemo(
    () =>
      pendingClarification
        ? usesMainChatInputForClarification(pendingClarification)
        : false,
    [pendingClarification],
  );

  const inputCollapsed = !inputExpanded && !usesMainInput && !editTarget;

  useEffect(() => {
    if (usesMainInput) {
      setInputExpanded(true);
    }
  }, [usesMainInput]);

  useEffect(() => {
    if (editTarget) {
      setInputExpanded(true);
    }
  }, [editTarget]);

  useEffect(() => {
    if (pendingClarification && !usesMainInput) {
      setInputExpanded(false);
      setDraft('');
    }
  }, [pendingClarification, usesMainInput]);

  const handleRequestNewExperience = useCallback(() => {
    if (isSending || isLoading || isAbandoning) return;
    if (editTarget) {
      setEditTarget(null);
      setDraft('');
    }
    if (hasOngoingAnalysis) {
      setAbandonError(null);
      setAbandonDialogVisible(true);
      return;
    }
    setInputExpanded(true);
  }, [editTarget, hasOngoingAnalysis, isSending, isLoading, isAbandoning]);

  const handleCollapseInput = useCallback(() => {
    if (usesMainInput || editingAnalysisId) return;
    if (editTarget) {
      setEditTarget(null);
      setDraft('');
    }
    setInputExpanded(false);
  }, [usesMainInput, editTarget, editingAnalysisId]);

  const handleCancelAbandon = useCallback(() => {
    if (isAbandoning) return;
    setAbandonError(null);
    setAbandonDialogVisible(false);
  }, [isAbandoning]);

  const handleConfirmAbandon = useCallback(async () => {
    setAbandonError(null);
    try {
      await abandonActiveAnalysis();
      setAbandonDialogVisible(false);
      Keyboard.dismiss();
      setDraft('');
      setInputExpanded(true);
    } catch (err) {
      setAbandonError(
        err instanceof Error ? err.message : 'Failed to discard analysis',
      );
    }
  }, [abandonActiveAnalysis]);

  const handleRequestDeleteExperience = useCallback(
    (analysisId: string, userMessageId: string, preview: string) => {
      if (isSending || isLoading || isAbandoning || deletingAnalysisId) return;
      setDeleteError(null);
      setDeleteTarget({ analysisId, userMessageId, preview });
      setDeleteDialogVisible(true);
    },
    [isSending, isLoading, isAbandoning, deletingAnalysisId],
  );

  const handleCancelDeleteExperience = useCallback(() => {
    if (deletingAnalysisId) return;
    setDeleteError(null);
    setDeleteTarget(null);
    setDeleteDialogVisible(false);
  }, [deletingAnalysisId]);

  const handleConfirmDeleteExperience = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteExperience(deleteTarget.analysisId, deleteTarget.userMessageId);
      setDeleteDialogVisible(false);
      setDeleteTarget(null);
      if (pendingClarification?.analysisId === deleteTarget.analysisId) {
        setInputExpanded(false);
        setDraft('');
      }
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete experience',
      );
    }
  }, [deleteTarget, deleteExperience, pendingClarification?.analysisId]);

  const handleRequestEditExperience = useCallback(
    (analysisId: string, userMessageId: string, content: string) => {
      if (isSending || isLoading || isAbandoning || deletingAnalysisId || editingAnalysisId) {
        return;
      }
      setEditTarget({ analysisId, userMessageId, content });
      setDraft(content);
      setInputExpanded(true);
    },
    [isSending, isLoading, isAbandoning, deletingAnalysisId, editingAnalysisId],
  );

  const handleShowFollowUpsChange = useCallback(async (value: boolean) => {
    setShowFollowUpsInChat(value);
    await persistShowFollowUpsInChat(value).catch(() => {});
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (editTarget) {
      if (trimmed === editTarget.content.trim()) return;
      const target = editTarget;
      setDraft('');
      setEditTarget(null);
      Keyboard.dismiss();
      setInputExpanded(false);
      try {
        await editExperience(target.analysisId, target.userMessageId, trimmed);
      } catch {
        // Error surfaced via useChatSession.error
      }
      return;
    }

    const answeringExperienceRequest = Boolean(pendingClarification && usesMainInput);
    setDraft('');
    Keyboard.dismiss();
    if (answeringExperienceRequest) {
      await submitClarification(trimmed);
    } else {
      await sendMessage(trimmed);
      setInputExpanded(false);
    }
  }, [
    draft,
    editTarget,
    editExperience,
    sendMessage,
    submitClarification,
    pendingClarification,
    usesMainInput,
  ]);

  const handleClarification = useCallback(
    async (answer: string) => {
      Keyboard.dismiss();
      await submitClarification(answer);
    },
    [submitClarification],
  );

  if (!friendId) {
    return null;
  }

  if (loadError) {
    return (
      <AppDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentFriendId={friendId}
        showFollowUpsInChat={showFollowUpsInChat}
        onShowFollowUpsInChatChange={handleShowFollowUpsChange}
      >
        <SafeAreaView style={styles.screen} edges={['top']}>
          <ScreenHeader
            onMenuPress={() => setDrawerOpen(true)}
            title="Chat"
            showBorder
          />
          <View style={styles.center}>
            <AppText style={styles.error}>{loadError}</AppText>
          </View>
        </SafeAreaView>
      </AppDrawer>
    );
  }

  return (
    <AppDrawer
      visible={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      currentFriendId={friendId}
      showFollowUpsInChat={showFollowUpsInChat}
      onShowFollowUpsInChatChange={handleShowFollowUpsChange}
    >
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader
          onMenuPress={() => setDrawerOpen(true)}
          title={friend?.displayName ?? 'Chat'}
          showBorder
        />

        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.navy} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            <ChatMessageList
              messages={messages}
              friendName={friend?.displayName ?? 'your friend'}
              onClarificationSubmit={handleClarification}
              clarificationDisabled={isSending}
              activeClarificationMessageId={activeClarificationMessageId}
              showFollowUpsInChat={showFollowUpsInChat}
              pendingClarification={pendingClarification}
              onDeleteExperience={handleRequestDeleteExperience}
              onEditExperience={handleRequestEditExperience}
              showPendingAnalysis={showPendingAnalysis}
              deleteDisabled={
                Boolean(isSending || isLoading || isAbandoning || deletingAnalysisId || editingAnalysisId)
              }
              editDisabled={
                Boolean(isSending || isLoading || isAbandoning || deletingAnalysisId || editingAnalysisId)
              }
            />
            {error && <AppText style={styles.error}>{error}</AppText>}
          </ScrollView>
        )}

        {!showFollowUpsInChat &&
          pendingClarification &&
          !usesMainInput && (
            <PendingClarificationBar
              pending={pendingClarification}
              onSubmit={handleClarification}
              disabled={isSending}
            />
          )}

        <ChatInputBar
          value={draft}
          onChangeText={setDraft}
          onSubmit={handleSubmit}
          collapsed={inputCollapsed}
          onExpand={handleRequestNewExperience}
          onCollapse={handleCollapseInput}
          disabled={
            inputCollapsed
              ? isSending || isLoading || isAbandoning || Boolean(editingAnalysisId)
              : usesMainInput
                ? isSending || isLoading || isAbandoning || Boolean(editingAnalysisId)
                : editTarget
                  ? isSending || isLoading || isAbandoning || Boolean(editingAnalysisId)
                  : inputDisabled || isAbandoning
          }
          submitDisabled={
            editTarget ? draft.trim() === editTarget.content.trim() : false
          }
          submitAccessibilityLabel={editTarget ? 'Re-analyze vibe' : 'Send message'}
          placeholder={
            editTarget
              ? 'Edit your vibe…'
              : pendingClarification
                ? usesMainInput
                  ? 'Share your experience…'
                  : 'Answer above to continue…'
                : 'Share your experience…'
          }
        />

        <AbandonAnalysisDialog
          visible={abandonDialogVisible}
          friendName={friend?.displayName}
          onCancel={handleCancelAbandon}
          onConfirm={handleConfirmAbandon}
          confirming={isAbandoning}
          error={abandonError}
        />

        <DeleteExperienceDialog
          visible={deleteDialogVisible}
          experiencePreview={deleteTarget?.preview}
          onCancel={handleCancelDeleteExperience}
          onConfirm={handleConfirmDeleteExperience}
          confirming={Boolean(deletingAnalysisId)}
          error={deleteError}
        />
      </KeyboardAvoidingView>
      </SafeAreaView>
    </AppDrawer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...text('sm', 'medium', 'normal'),
    color: colors.red,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
