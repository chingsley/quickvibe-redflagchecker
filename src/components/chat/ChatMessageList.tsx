import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ClarifyingQuestionBlock } from './ClarifyingQuestionBlock';
import { ExperienceDeleteButton } from './ExperienceDeleteButton';
import { ExperienceEditButton } from './ExperienceEditButton';
import { VerdictLoadingBar } from './VerdictLoadingBar';
import { PendingAnalysisIndicator } from './PendingAnalysisIndicator';
import { SuggestionsBlock } from './SuggestionsBlock';
import { TypewriterText } from './TypewriterText';
import { useAnimateMessageIds } from './useAnimateMessageIds';
import { chatLayout } from './chatLayout';
import { colors, spacing, text, getScoreColor } from '@/constants/theme';
import { filterChatMessagesForDisplay } from '@/lib/filterChatMessages';
import {
  getExperienceAnchorMessage,
  groupExperienceMessages,
} from '@/lib/groupExperienceMessages';
import {
  isExperienceRequestMessage,
  usesMainChatInputForClarification,
} from '@/lib/clarificationIntent';
import {
  analysisHasVerdict,
  isVibeDescriptionMessage,
} from '@/lib/vibeDescription';
import type { ChatMessage, PendingClarification } from '@/api/types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  friendName: string;
  onClarificationSubmit: (answer: string) => void;
  clarificationDisabled?: boolean;
  activeClarificationMessageId?: string | null;
  showFollowUpsInChat?: boolean;
  pendingClarification?: PendingClarification | null;
  onDeleteExperience?: (
    analysisId: string,
    userMessageId: string,
    preview: string,
  ) => void;
  onEditExperience?: (
    analysisId: string,
    userMessageId: string,
    content: string,
  ) => void;
  deleteDisabled?: boolean;
  editDisabled?: boolean;
  showPendingAnalysis?: boolean;
}

function UserBubble({ content }: { content: string; }) {
  return (
    <View style={chatLayout.userRow}>
      <View style={chatLayout.userBubble}>
        <AppText style={styles.userText}>{content}</AppText>
      </View>
    </View>
  );
}

function AssistantBlock({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[chatLayout.assistantBlock, style]}>{children}</View>;
}

export function ChatMessageList({
  messages,
  friendName,
  onClarificationSubmit,
  clarificationDisabled = false,
  activeClarificationMessageId,
  showFollowUpsInChat = false,
  pendingClarification = null,
  onDeleteExperience,
  deleteDisabled = false,
  onEditExperience,
  editDisabled = false,
  showPendingAnalysis = false,
}: ChatMessageListProps) {
  const visibleMessages = filterChatMessagesForDisplay(messages, showFollowUpsInChat);
  const groups = groupExperienceMessages(visibleMessages);
  const animateIds = useAnimateMessageIds(visibleMessages);

  if (visibleMessages.length === 0 && !showPendingAnalysis) {
    return (
      <View style={styles.empty}>
        <AppText style={styles.emptyText}>
          Tell me about an experience you had with {friendName}
        </AppText>
      </View>
    );
  }

  const renderAssistantMessage = (message: ChatMessage, previousMessage?: ChatMessage) => {
    const animate = animateIds.has(message.id);

    switch (message.kind) {
      case 'clarifying_question': {
        const meta = message.metadata ?? {};
        const isActive =
          Boolean(activeClarificationMessageId) &&
          activeClarificationMessageId === message.id;
        const useMainChatInput =
          isExperienceRequestMessage(meta) ||
          (pendingClarification !== null &&
            usesMainChatInputForClarification(pendingClarification));
        return (
          <AssistantBlock key={message.id}>
            <ClarifyingQuestionBlock
              question={message.content}
              type={(meta.type as 'choice' | 'open') ?? 'open'}
              choices={meta.choices as string[] | undefined}
              onSubmit={onClarificationSubmit}
              disabled={clarificationDisabled || !isActive}
              animate={animate}
              useMainChatInput={useMainChatInput}
            />
          </AssistantBlock>
        );
      }
      case 'verdict_loading': {
        const targetScore = Number(message.metadata?.targetScore ?? 0);
        return (
          <AssistantBlock key={message.id} style={styles.verdictLoadingBlock}>
            <VerdictLoadingBar targetScore={targetScore} />
          </AssistantBlock>
        );
      }
      case 'verdict': {
        const score = Number(message.metadata?.score ?? 0);
        const followsLoadingBar = previousMessage?.kind === 'verdict_loading';
        return (
          <AssistantBlock
            key={message.id}
            style={followsLoadingBar ? styles.verdictAfterLoadingBlock : undefined}
          >
            <TypewriterText
              text={message.content}
              animate={animate}
              style={[styles.verdictLabel, { color: getScoreColor(score) }]}
            />
          </AssistantBlock>
        );
      }
      case 'suggestions': {
        const meta = message.metadata ?? {};
        return (
          <AssistantBlock key={message.id}>
            <SuggestionsBlock
              advice={String(meta.advice ?? message.content)}
              reasons={(meta.reasons as string[]) ?? []}
              animate={animate}
            />
          </AssistantBlock>
        );
      }
      case 'error':
        return (
          <AssistantBlock key={message.id}>
            <AppText style={styles.errorText}>{message.content}</AppText>
          </AssistantBlock>
        );
      default:
        return (
          <AssistantBlock key={message.id}>
            <TypewriterText
              text={message.content}
              animate={animate}
              style={styles.assistantText}
            />
          </AssistantBlock>
        );
    }
  };

  return (
    <View style={chatLayout.column}>
      <View style={styles.list}>
        {groups.map((group) => {
          const anchor = getExperienceAnchorMessage(group);
          const canDelete = Boolean(group.analysisId && onDeleteExperience && anchor);
          const canEditVibe = Boolean(
            group.analysisId &&
              onEditExperience &&
              analysisHasVerdict(group.messages),
          );

          return (
            <View
              key={`${group.analysisId ?? 'orphan'}-${group.messages[0]?.id}`}
              style={styles.thread}
            >
              {group.messages.map((message, index) => {
                if (message.role === 'user') {
                  const showEdit =
                    canEditVibe &&
                    isVibeDescriptionMessage(message, group.messages);

                  return (
                    <View key={message.id}>
                      <UserBubble content={message.content} />
                      {showEdit ? (
                        <View style={styles.editRow}>
                          <ExperienceEditButton
                            onEdit={() =>
                              onEditExperience!(
                                group.analysisId!,
                                message.id,
                                message.content,
                              )
                            }
                            disabled={editDisabled}
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                }

                return renderAssistantMessage(message, group.messages[index - 1]);
              })}
              {canDelete ? (
                <View style={styles.deleteRow}>
                  <ExperienceDeleteButton
                    onDelete={() =>
                      onDeleteExperience!(
                        group.analysisId!,
                        anchor!.id,
                        anchor!.content,
                      )
                    }
                    disabled={deleteDisabled}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
        {showPendingAnalysis ? (
          <AssistantBlock>
            <PendingAnalysisIndicator />
          </AssistantBlock>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  thread: {
    width: '100%',
  },
  editRow: {
    width: '100%',
    alignItems: 'flex-end',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  deleteRow: {
    width: '100%',
    alignItems: 'flex-start',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    minHeight: 200,
  },
  emptyText: {
    ...text('lg', 'medium', 'relaxed'),
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: chatLayout.column.maxWidth,
  },
  userText: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
  },
  assistantText: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textPrimary,
    width: '100%',
  },
  verdictLoadingBlock: {
    paddingBottom: 0,
  },
  verdictAfterLoadingBlock: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  verdictLabel: {
    ...text('lg', 'medium', 'tight'),
    width: '100%',
  },
  errorText: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.red,
    width: '100%',
  },
});
