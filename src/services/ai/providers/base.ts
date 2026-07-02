import type { AIProvider } from '../types';
import type { AnalysisResult } from '@/types';

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

interface ChatConfig {
  endpoint: string;
  model: string;
  name: string;
}

/**
 * Shared logic for OpenAI-compatible chat completion APIs
 * (OpenAI, DeepSeek, Z.ai all use the same request/response shape).
 */
export abstract class BaseChatProvider implements AIProvider {
  abstract readonly name: string;
  protected abstract readonly config: ChatConfig;

  constructor(protected readonly apiKey: string) { }

  async analyzeExperience(
    text: string,
    previousContext?: string[],
  ): Promise<AnalysisResult> {
    const messages: { role: string; content: string; }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (previousContext && previousContext.length > 0) {
      messages.push({
        role: 'user',
        content: `Previous answers: ${previousContext.join(' | ')}`,
      });
    }

    messages.push({ role: 'user', content: text });

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `${this.name} API error ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error(`${this.name} returned no choices`);
    }

    const content = data.choices[0].message.content;
    const result: AnalysisResult = JSON.parse(content);

    if (typeof result.score !== 'number') {
      throw new Error(`${this.name} response missing score`);
    }

    return result;
  }
}
