// ─── Analysis ────────────────────────────────────────────

/** Result returned by any AI provider after analyzing an experience. */
export interface AnalysisResult {
  /** 0 (completely harmless) to 100 (major red flag). */
  score: number;
  /** High-level category, e.g. "love-bombing", "gaslighting", "controlling". */
  category: string;
  /** Human-readable verdict label, e.g. "Proceed at Your Own Detriment". */
  label: string;
  /** Actionable advice on how to proceed. */
  advice: string;
  /** 3–5 specific behavioral patterns the AI detected (used by the "Why?" toggle). */
  reasons: string[];
  /** Optional follow-up questions when the score is ambiguous (40–60). */
  followUpQuestions?: string[];
}

// ─── Animation States ────────────────────────────────────

/** Which shape the central icon is currently displaying. */
export type MorphState = 'mic' | 'ring';

/** Steps in the recording lifecycle. */
export type RecordingState = 'idle' | 'listening' | 'processing';

/** Full lifecycle of a red-flag check from start to finish. */
export type AnalysisState =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'morphing'
  | 'analyzing'
  | 'followUp'
  | 'complete';
