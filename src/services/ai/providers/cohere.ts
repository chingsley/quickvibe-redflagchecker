import type { AIProvider } from '../types';
import type { AnalysisResult } from '@/types';

const API_URL = 'https://api.cohere.ai/v2/chat';
const MODEL = 'command-r-plus';

const SYSTEM_PROMPT = `You are a red flag detector. Analyze the following experience and rate it on a scale of 0 (completely harmless / sweet) to 100 (major red flag).

Consider: manipulation, dishonesty, boundary violations, controlling behavior, love bombing, gaslighting, passive-aggressive language, deflection, blame-shifting, and other concerning behavioral patterns.

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{
  "score": number (0-100),
  "category": string,
  "label": string,
  "advice": string,
  "reasons": string[] (3-5 specific behavioral patterns detected),
  "followUpQuestions": string[] (optional, 2-3 clarifying questions if score is ambiguous 40-60)
}`;

export class CohereProvider implements AIProvider {
  readonly name = 'Cohere (Command R)';

  constructor(private readonly apiKey: string) { }

  async analyzeExperience(
    text: string,
    previousContext?: string[],
  ): Promise<AnalysisResult> {
    let message = text;
    if (previousContext?.length) {
      message = `Previous answers: ${previousContext.join(' | ')}\n\n${text}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        message,
        preamble: SYSTEM_PROMPT,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('[QuickVibe] Cohere API error', response.status, body);
      throw new Error(
        `Cohere API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const data = await response.json();
    const content = data.text;

    if (!content) {
      throw new Error('Cohere returned empty response');
    }

    const result: AnalysisResult = JSON.parse(content);

    if (typeof result.score !== 'number') {
      throw new Error('Cohere response missing score');
    }

    return result;
  }
}
