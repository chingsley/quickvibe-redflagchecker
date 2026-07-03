import type { ChatMessage } from '@/api/types';
import { mergeChatMessages } from '@/lib/mergeChatMessages';
import { removeMessagesById } from '@/lib/experienceDelete';
import type { EditExperienceResult } from '@/api/types';

export function applyEditExperienceResult(
  messages: ChatMessage[],
  result: EditExperienceResult,
): ChatMessage[] {
  const withoutRemoved = removeMessagesById(messages, result.removedMessageIds);
  const withUpdated = withoutRemoved.map((message) =>
    message.id === result.updatedUserMessage.id ? result.updatedUserMessage : message,
  );
  return mergeChatMessages(withUpdated, { append: result.messages });
}
