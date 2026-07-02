import type { AnalysisResult, FollowUpQuestion } from '@/types';

export interface AnalyzeOptions {
  /** When true, produce a final score using clarifications — no follow-up questions. */
  isFinal?: boolean;
}

const SYSTEM_PROMPT = `You are a red flag detector. Analyze the following experience and rate it on a scale of 0 (completely harmless / sweet) to 100 (major red flag).

Consider: manipulation, dishonesty, boundary violations, controlling behavior, love bombing, gaslighting, passive-aggressive language, deflection, blame-shifting, and other concerning behavioral patterns.

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{
  "score": number (0-100),
  "category": string,
  "label": string,
  "advice": string,
  "reasons": string[] (3-5 specific behavioral patterns detected),
  "followUpQuestions": [
    {
      "question": string,
      "type": "choice" | "open",
      "choices": string[] (required when type is "choice" — 2-5 options that logically answer the question)
    }
  ] (optional, 1-3 clarifying questions when more context is needed)
}`;

const FINAL_ANALYSIS_ADDENDUM = `

The user has answered clarifying questions about their experience. Produce the FINAL analysis using the original experience and every clarifying answer. The score must reflect the full picture. Do NOT include followUpQuestions.`;

const INITIAL_ANALYSIS_ADDENDUM = `

If you need more context before scoring, return followUpQuestions (1-3 questions tailored to the user's specific experience) and set score to 0. Only return a non-zero score when you have enough context for a confident verdict.

Follow-up question rules:
- Use type "choice" ONLY when a fixed set of options makes sense (yes/no, frequency, severity, etc.).
- The choices MUST match the question. Examples:
  - "How often does he...?" → ["Never", "Rarely", "Sometimes", "Often", "Always"]
  - "Did he apologize?" → ["Yes", "No", "Not sure"]
  - "How severe was it?" → ["Mild", "Moderate", "Severe"]
- NEVER use Yes/No/Not sure for frequency, "how", or "what" questions.
- Use type "open" for descriptive questions (e.g. "How does he react when...", "What did he say...").
- Do not include choices when type is "open".`;

export function buildSystemPrompt(options?: AnalyzeOptions): string {
  if (options?.isFinal) {
    return SYSTEM_PROMPT + FINAL_ANALYSIS_ADDENDUM;
  }
  return SYSTEM_PROMPT + INITIAL_ANALYSIS_ADDENDUM;
}

export function buildUserMessage(
  text: string,
  previousContext?: string[],
): string {
  if (previousContext && previousContext.length > 0) {
    return `Clarifying Q&A:\n${previousContext.join('\n\n')}\n\nOriginal experience:\n${text}`;
  }
  return text;
}

function normalizeFollowUpQuestion(raw: unknown): FollowUpQuestion {
  if (typeof raw === 'string') {
    return { question: raw, type: 'open' };
  }

  if (raw && typeof raw === 'object' && 'question' in raw) {
    const item = raw as {
      question?: string;
      type?: string;
      choices?: string[];
    };
    const question = item.question?.trim() ?? '';
    const choices = Array.isArray(item.choices)
      ? item.choices.filter((choice) => typeof choice === 'string' && choice.trim())
      : [];

    if (
      item.type === 'choice' &&
      choices.length >= 2 &&
      question.length > 0
    ) {
      return { question, type: 'choice', choices };
    }

    if (question.length > 0) {
      return { question, type: 'open' };
    }
  }

  return { question: String(raw), type: 'open' };
}

/** Normalize AI response — ensures follow-up questions have valid types and choices. */
export function normalizeAnalysisResult(result: AnalysisResult): AnalysisResult {
  if (!result.followUpQuestions?.length) {
    return result;
  }

  return {
    ...result,
    followUpQuestions: result.followUpQuestions.map(normalizeFollowUpQuestion),
  };
}

/** Parse and validate a JSON analysis response from the AI. */
export function parseAnalysisResponse(content: string): AnalysisResult {
  const result: AnalysisResult = JSON.parse(content);

  if (typeof result.score !== 'number') {
    throw new Error('AI response missing score');
  }

  return normalizeAnalysisResult(result);
}
