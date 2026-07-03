import type { ChatMessage } from '@/api/types';

export function isVibeDescriptionMessage(
  message: ChatMessage,
  analysisMessages: ChatMessage[],
): boolean {
  if (message.role !== 'user' || message.kind !== 'text') {
    return false;
  }

  const meta = message.metadata;
  if (meta?.rejectedExperience) {
    return false;
  }
  if (meta?.clarificationRole === 'experience') {
    return true;
  }

  const firstUser = analysisMessages.find(
    (entry) => entry.role === 'user' && entry.kind === 'text',
  );
  return firstUser?.id === message.id;
}

export function analysisHasVerdict(messages: ChatMessage[]): boolean {
  return messages.some(
    (message) => message.kind === 'verdict' || message.kind === 'verdict_loading',
  );
}
