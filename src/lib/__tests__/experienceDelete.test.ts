import {
  removeMessagesById,
  selectMessagesToDelete,
} from '@/lib/experienceDelete';
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

describe('selectMessagesToDelete', () => {
  it('removes only the targeted experience when deleting the anchor among three experiences', () => {
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
        content: 'Verdict one',
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
      msg({
        id: 'v2',
        role: 'assistant',
        kind: 'verdict',
        content: 'Verdict two',
        analysisId: 'a2',
        sequence: 4,
      }),
      msg({
        id: 'u3',
        role: 'user',
        kind: 'text',
        content: 'Experience three',
        analysisId: 'a3',
        sequence: 5,
      }),
      msg({
        id: 'v3',
        role: 'assistant',
        kind: 'verdict',
        content: 'Verdict three',
        analysisId: 'a3',
        sequence: 6,
      }),
    ];

    const deletedIds = selectMessagesToDelete(messages, 'a2', 'u2');
    const remaining = removeMessagesById(messages, deletedIds);

    expect(deletedIds).toEqual(['u2', 'v2']);
    expect(remaining.map((message) => message.id)).toEqual(['u1', 'v1', 'u3', 'v3']);
  });

  it('does not remove experiences above or below the deleted one', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'First',
        analysisId: 'a1',
        sequence: 1,
      }),
      msg({
        id: 'v1',
        role: 'assistant',
        kind: 'verdict',
        content: 'First verdict',
        analysisId: 'a1',
        sequence: 2,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'Second',
        analysisId: 'a2',
        sequence: 3,
      }),
      msg({
        id: 'v2',
        role: 'assistant',
        kind: 'verdict',
        content: 'Second verdict',
        analysisId: 'a2',
        sequence: 4,
      }),
    ];

    const deletedIds = selectMessagesToDelete(messages, 'a2', 'u2');
    const remaining = removeMessagesById(messages, deletedIds);

    expect(remaining.some((message) => message.analysisId === 'a1')).toBe(true);
    expect(remaining.some((message) => message.analysisId === 'a2')).toBe(false);
    expect(remaining.map((message) => message.id)).toEqual(['u1', 'v1']);
  });

  it('removes only a follow-up user exchange within the same analysis', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'hello',
        analysisId: 'a1',
        sequence: 1,
      }),
      msg({
        id: 'q1',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'What experience would you like analyzed?',
        analysisId: 'a1',
        sequence: 2,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'saljl alkflj ajjlalkjlajla',
        analysisId: 'a1',
        sequence: 3,
      }),
      msg({
        id: 'q2',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'Can you describe a specific situation?',
        analysisId: 'a1',
        sequence: 4,
      }),
    ];

    const deletedIds = selectMessagesToDelete(messages, 'a1', 'u2');
    const remaining = removeMessagesById(messages, deletedIds);

    expect(deletedIds).toEqual(['u2', 'q2']);
    expect(remaining.map((message) => message.id)).toEqual(['u1', 'q1']);
  });

  it('removes the entire analysis thread when deleting the anchor user message', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'hello',
        analysisId: 'a1',
        sequence: 1,
      }),
      msg({
        id: 'q1',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'What experience would you like analyzed?',
        analysisId: 'a1',
        sequence: 2,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'They yelled at staff',
        analysisId: 'a1',
        sequence: 3,
      }),
      msg({
        id: 'v1',
        role: 'assistant',
        kind: 'verdict',
        content: 'Red flag',
        analysisId: 'a1',
        sequence: 4,
      }),
    ];

    const deletedIds = selectMessagesToDelete(messages, 'a1', 'u1');
    const remaining = removeMessagesById(messages, deletedIds);

    expect(deletedIds).toEqual(['u1', 'q1', 'u2', 'v1']);
    expect(remaining).toEqual([]);
  });
});
