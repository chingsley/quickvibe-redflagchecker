import type { AIProvider } from '../types';
import type { AnalysisResult } from '@/types';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

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

/**
 * OpenAI / ChatGPT (GPT-4o-mini) provider implementation.
 *
 * Uses the standard chat completions API to analyse experiences
 * and return a structured red-flag verdict.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI (ChatGPT)';

  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeExperience(
    text: string,
    previousContext?: string[],
  ): Promise<AnalysisResult> {
    const messages: { role: string; content: string; }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Include previous Q&A context if follow-ups were asked
    if (previousContext && previousContext.length > 0) {
      messages.push({
        role: 'user',
        content: `Previous answers: ${previousContext.join(' | ')}`,
      });
    }

    messages.push({ role: 'user', content: text });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('[QuickVibe] OpenAI API error', response.status, body);
      throw new Error(
        `OpenAI API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI returned no choices in response');
    }

    const content = data.choices[0].message.content;
    const result: AnalysisResult = JSON.parse(content);

    // Validate the parsed result
    if (typeof result.score !== 'number') {
      throw new Error('OpenAI response missing score');
    }

    return result;
  }
}
