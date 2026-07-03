import { mergeChatMessages } from '@/lib/mergeChatMessages';
import type { ChatMessage } from '@/api/types';

function msg(
  overrides: Partial<ChatMessage> & Pick<ChatMessage, 'id' | 'role' | 'kind' | 'content'>,
): ChatMessage {
  return {
    friendId: 'f1',
    analysisId: null,
    metadata: null,
    sequence: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('mergeChatMessages', () => {
  it('replaces an optimistic message with server messages in one merge', () => {
    const prev = [
      msg({
        id: 'u-old',
        role: 'user',
        kind: 'text',
        content: 'Earlier',
        sequence: 1,
      }),
      msg({
        id: 'optimistic-1',
        role: 'user',
        kind: 'text',
        content: 'Destiny to load is working',
        sequence: 2,
      }),
    ];

    const merged = mergeChatMessages(prev, {
      removeIds: ['optimistic-1'],
      append: [
        msg({
          id: 'u-new',
          role: 'user',
          kind: 'text',
          content: 'Destiny to load is working',
          analysisId: 'a1',
          sequence: 2,
        }),
        msg({
          id: 'q1',
          role: 'assistant',
          kind: 'clarifying_question',
          content: 'Tell me more',
          analysisId: 'a1',
          sequence: 3,
        }),
      ],
    });

    expect(merged.map((message) => message.id)).toEqual(['u-old', 'u-new', 'q1']);
  });
});
