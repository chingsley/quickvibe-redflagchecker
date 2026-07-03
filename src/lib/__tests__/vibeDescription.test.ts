import type { ChatMessage } from '@/api/types';
import { applyEditExperienceResult } from '@/lib/experienceEdit';
import {
  analysisHasVerdict,
  isVibeDescriptionMessage,
} from '@/lib/vibeDescription';

function message(
  overrides: Partial<ChatMessage> & Pick<ChatMessage, 'id'>,
): ChatMessage {
  return {
    friendId: 'friend-1',
    analysisId: 'analysis-1',
    role: 'user',
    kind: 'text',
    content: 'hello',
    metadata: null,
    sequence: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isVibeDescriptionMessage', () => {
  it('identifies the anchor user message', () => {
    const messages = [
      message({ id: 'u1', role: 'user', kind: 'text' }),
      message({ id: 'q1', role: 'assistant', kind: 'clarifying_question' }),
    ];

    expect(isVibeDescriptionMessage(messages[0], messages)).toBe(true);
  });
});

describe('analysisHasVerdict', () => {
  it('returns true when a verdict or loader exists', () => {
    const messages = [
      message({ id: 'u1' }),
      message({ id: 'l1', role: 'assistant', kind: 'verdict_loading' }),
    ];

    expect(analysisHasVerdict(messages)).toBe(true);
  });
});

describe('applyEditExperienceResult', () => {
  it('replaces removed messages and appends new analysis output', () => {
    const existing = [
      message({ id: 'u1', content: 'old text', sequence: 1 }),
      message({
        id: 'v1',
        role: 'assistant',
        kind: 'verdict',
        content: 'Proceed with caution',
        sequence: 2,
      }),
    ];

    const result = {
      updatedUserMessage: message({ id: 'u1', content: 'new text', sequence: 1 }),
      removedMessageIds: ['v1'],
      messages: [
        message({
          id: 'l1',
          role: 'assistant',
          kind: 'verdict_loading',
          content: 'Analyzing your experience…',
          sequence: 3,
        }),
        message({
          id: 'v2',
          role: 'assistant',
          kind: 'verdict',
          content: 'This is actually sweet',
          sequence: 4,
        }),
      ],
      pendingClarification: null,
      isAnalyzing: false,
    };

    const next = applyEditExperienceResult(existing, result);

    expect(next.map((entry) => entry.id)).toEqual(['u1', 'l1', 'v2']);
    expect(next.find((entry) => entry.id === 'u1')?.content).toBe('new text');
  });
});
