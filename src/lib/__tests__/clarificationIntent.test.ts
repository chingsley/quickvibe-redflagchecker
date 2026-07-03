import { usesMainChatInputForClarification } from '@/lib/clarificationIntent';
import type { PendingClarification } from '@/api/types';

describe('usesMainChatInputForClarification', () => {
  const base: PendingClarification = {
    analysisId: 'a1',
    questionIndex: 0,
    totalQuestions: 1,
    question: {
      question: 'What specific experience would you like me to analyze?',
      type: 'open',
    },
  };

  it('returns true for server-tagged experience requests', () => {
    expect(
      usesMainChatInputForClarification({
        ...base,
        question: { ...base.question, intent: 'experience_request' },
      }),
    ).toBe(true);
  });

  it('returns true for heuristic experience-request phrasing', () => {
    expect(usesMainChatInputForClarification(base)).toBe(true);
  });

  it('returns false for real follow-up questions', () => {
    expect(
      usesMainChatInputForClarification({
        ...base,
        question: {
          question: 'How did they react when you responded?',
          type: 'open',
        },
      }),
    ).toBe(false);
  });
});
