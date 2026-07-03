import type { ChatMessage } from '@/api/types';

export function mergeChatMessages(
  prev: ChatMessage[],
  options: {
    removeIds?: string[];
    append?: ChatMessage[];
  },
): ChatMessage[] {
  const removeSet = new Set(options.removeIds ?? []);
  const filtered = prev.filter((message) => !removeSet.has(message.id));
  const ids = new Set(filtered.map((message) => message.id));
  const merged = [...filtered];

  for (const message of options.append ?? []) {
    if (!ids.has(message.id)) {
      merged.push(message);
      ids.add(message.id);
    }
  }

  return merged.sort((a, b) => a.sequence - b.sequence);
}
