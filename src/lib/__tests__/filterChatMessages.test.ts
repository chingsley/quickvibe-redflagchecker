import { filterChatMessagesForDisplay } from '@/lib/filterChatMessages';
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

describe('filterChatMessagesForDisplay', () => {
  const analysisId = 'analysis-1';

  it('returns all messages when follow-ups are shown in chat', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'They yelled at the waitress',
        analysisId,
      }),
      msg({
        id: 'q1',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'How did they react?',
        analysisId,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'They doubled down',
        analysisId,
      }),
    ];

    expect(filterChatMessagesForDisplay(messages, true)).toEqual(messages);
  });

  it('hides clarifying questions and follow-up answers when toggle is off', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'They yelled at the waitress',
        analysisId,
      }),
      msg({
        id: 'q1',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'How did they react?',
        analysisId,
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'They doubled down',
        analysisId,
      }),
      msg({
        id: 'v1',
        role: 'assistant',
        kind: 'verdict',
        content: 'Red flag',
        analysisId,
        metadata: { score: 80 },
      }),
    ];

    const visible = filterChatMessagesForDisplay(messages, false);

    expect(visible.map((m) => m.id)).toEqual(['u1', 'v1']);
  });

  it('keeps experience-request prompts and answers visible when follow-ups are hidden', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'okay',
        analysisId,
      }),
      msg({
        id: 'q1',
        role: 'assistant',
        kind: 'clarifying_question',
        content: 'What specific experience would you like me to analyze?',
        analysisId,
        metadata: { intent: 'experience_request', type: 'open' },
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'They yelled at the waitress',
        analysisId,
        metadata: { clarificationRole: 'experience' },
      }),
    ];

    const visible = filterChatMessagesForDisplay(messages, false);

    expect(visible.map((m) => m.id)).toEqual(['u1', 'q1', 'u2']);
  });

  it('keeps user messages without an analysis id', () => {
    const messages: ChatMessage[] = [
      msg({
        id: 'u1',
        role: 'user',
        kind: 'text',
        content: 'General note',
      }),
      msg({
        id: 'u2',
        role: 'user',
        kind: 'text',
        content: 'Another note',
      }),
    ];

    expect(filterChatMessagesForDisplay(messages, false)).toEqual(messages);
  });
});
