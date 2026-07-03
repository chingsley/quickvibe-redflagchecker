import type { PendingClarification } from '@/api/types';

const EXPERIENCE_REQUEST_PATTERNS = [
  /what (specific )?experience/i,
  /share (a |an )?experience/i,
  /describe (the |a |an )?experience/i,
  /tell me about (a |an |the )?experience/i,
  /would you like me to analyze/i,
  /what (interaction|situation) would you like/i,
  /can you describe a specific situation/i,
  /felt concerning or off/i,
  /can you (share|describe|tell me)/i,
  /please (share|describe|tell)/i,
  /need (more )?(context|detail|information)/i,
  /what (happened|occurred)/i,
  /haven'?t shared/i,
  /not enough (to|information)/i,
];

export function isExperienceRequestQuestion(question: string): boolean {
  const trimmed = question.trim();
  if (!trimmed) return false;
  return EXPERIENCE_REQUEST_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Prompts that ask for the experience itself should use the main chat input, not a nested field. */
export function usesMainChatInputForClarification(
  pending: PendingClarification,
): boolean {
  if (pending.question.intent === 'experience_request') {
    return true;
  }

  return (
    pending.questionIndex === 0 &&
    pending.question.type === 'open' &&
    isExperienceRequestQuestion(pending.question.question)
  );
}

export function isExperienceRequestMessage(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  return metadata?.intent === 'experience_request';
}

export function isExperienceAnswerMessage(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  return metadata?.clarificationRole === 'experience';
}
