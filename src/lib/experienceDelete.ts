import type { ChatMessage } from '@/api/types';

/** Messages for one analysis, in display order. */
export function messagesForAnalysis(
  messages: ChatMessage[],
  analysisId: string,
): ChatMessage[] {
  return messages.filter((message) => message.analysisId === analysisId);
}

/**
 * Selects message ids to remove when deleting from a user bubble.
 * - Anchor (first user message): entire experience thread for that analysis.
 * - Other user messages: only that exchange (user + following assistant until next user).
 */
export function selectMessagesToDelete(
  messages: ChatMessage[],
  analysisId: string,
  clickedUserMessageId: string,
): string[] {
  const analysisMessages = messagesForAnalysis(messages, analysisId);
  const clickedIndex = analysisMessages.findIndex(
    (message) => message.id === clickedUserMessageId,
  );

  if (clickedIndex === -1) {
    return [];
  }

  const clicked = analysisMessages[clickedIndex];
  if (clicked.role !== 'user') {
    return [];
  }

  const firstUserIndex = analysisMessages.findIndex((message) => message.role === 'user');
  if (clickedIndex === firstUserIndex) {
    return analysisMessages.map((message) => message.id);
  }

  const ids = [clicked.id];
  for (let index = clickedIndex + 1; index < analysisMessages.length; index += 1) {
    if (analysisMessages[index].role === 'user') {
      break;
    }
    ids.push(analysisMessages[index].id);
  }

  return ids;
}

export function removeMessagesById(
  messages: ChatMessage[],
  deletedMessageIds: string[],
): ChatMessage[] {
  if (deletedMessageIds.length === 0) {
    return messages;
  }

  const removeIds = new Set(deletedMessageIds);
  return messages.filter((message) => !removeIds.has(message.id));
}
