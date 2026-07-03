import type { ChatMessage } from '@/api/types';
import {
  isExperienceAnswerMessage,
  isExperienceRequestMessage,
} from '@/lib/clarificationIntent';

/**
 * When follow-ups are hidden from the chat UI, strip clarifying questions and
 * the user's answers while keeping the initial experience and final verdict.
 * Experience-request prompts and the user's real experience reply stay visible.
 */
export function filterChatMessagesForDisplay(
  messages: ChatMessage[],
  showFollowUpsInChat: boolean,
): ChatMessage[] {
  if (showFollowUpsInChat) {
    return messages;
  }

  const hiddenIds = new Set<string>();
  const firstUserMessageByAnalysis = new Map<string, string>();

  for (const message of messages) {
    if (message.kind === 'clarifying_question') {
      if (isExperienceRequestMessage(message.metadata)) {
        continue;
      }
      hiddenIds.add(message.id);
      continue;
    }

    if (
      message.role === 'user' &&
      message.kind === 'text' &&
      message.analysisId
    ) {
      if (isExperienceAnswerMessage(message.metadata)) {
        continue;
      }

      const firstId = firstUserMessageByAnalysis.get(message.analysisId);
      if (firstId) {
        hiddenIds.add(message.id);
      } else {
        firstUserMessageByAnalysis.set(message.analysisId, message.id);
      }
    }
  }

  return messages.filter((message) => !hiddenIds.has(message.id));
}
