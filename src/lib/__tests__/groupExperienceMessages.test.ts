import {
  getExperienceAnchorMessage,
  groupExperienceMessages,
} from '@/lib/groupExperienceMessages';
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

describe('groupExperienceMessages', () => {
  it('groups messages by analysis id', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'Experience one',
        analysisId: 'a1',
        sequence: 1,
      }),
      msg({
        id: 'v1',
        role: 'assistant',
        kind: 'verdict',
        content: 'Verdict',
        analysisId: 'a1',
        sequence: 2,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'Experience two',
        analysisId: 'a2',
        sequence: 3,
      }),
    ];

    const groups = groupExperienceMessages(messages);

    expect(groups).toHaveLength(2);
    expect(groups[0].analysisId).toBe('a1');
    expect(groups[0].messages.map((m) => m.id)).toEqual(['u1', 'v1']);
    expect(groups[1].analysisId).toBe('a2');
  });

  it('returns the first user message as the experience anchor', () => {
    const group = {
      analysisId: 'a1',
      messages: [
        msg({
          id: 'u1',
          role: 'user',
          kind: 'text',
          content: 'She talks ill of people',
          analysisId: 'a1',
        }),
        msg({
          id: 'v1',
          role: 'assistant',
          kind: 'verdict',
          content: 'Flag',
          analysisId: 'a1',
        }),
      ],
    };

    expect(getExperienceAnchorMessage(group)?.id).toBe('u1');
  });
});
