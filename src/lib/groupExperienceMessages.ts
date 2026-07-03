import type { ChatMessage } from '@/api/types';

export interface ExperienceMessageGroup {
  analysisId: string | null;
  messages: ChatMessage[];
}

/** Groups consecutive chat messages that belong to the same analysis / experience. */
export function groupExperienceMessages(messages: ChatMessage[]): ExperienceMessageGroup[] {
  const groups: ExperienceMessageGroup[] = [];
  let current: ExperienceMessageGroup | null = null;

  for (const message of messages) {
    const analysisId = message.analysisId;

    if (analysisId) {
      if (!current || current.analysisId !== analysisId) {
        if (current) groups.push(current);
        current = { analysisId, messages: [message] };
      } else {
        current.messages.push(message);
      }
      continue;
    }

    if (current) {
      groups.push(current);
      current = null;
    }

    groups.push({ analysisId: null, messages: [message] });
  }

  if (current) {
    groups.push(current);
  }

  return groups;
}

export function getExperienceAnchorMessage(group: ExperienceMessageGroup): ChatMessage | null {
  return group.messages.find((message) => message.role === 'user') ?? null;
}
