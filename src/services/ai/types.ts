import type { AnalysisResult } from '@/types';

export interface AnalyzeOptions {
  /** When true, produce a final score using clarifications — no follow-up questions. */
  isFinal?: boolean;
}

/**
 * Contract that every AI provider must implement.
 *
 * New providers only need to:
 * 1. Create a class implementing this interface
 * 2. Register it in `provider-factory.ts`
 *
 * No consumer code changes required — the Strategy Pattern isolates
 * provider selection to the factory.
 */
export interface AIProvider {
  /** Human-readable name for logging / debugging. */
  readonly name: string;

  /**
   * Analyse an experience and return a red-flag score (0–100).
   *
   * @param text - The user's experience, transcribed from voice or typed.
   * @param previousContext - Previous Q&A pairs if follow-up questions were asked.
   * @returns A structured analysis with score, label, advice, and detected reasons.
   */
  analyzeExperience(
    text: string,
    previousContext?: string[],
    options?: AnalyzeOptions,
  ): Promise<AnalysisResult>;
}
