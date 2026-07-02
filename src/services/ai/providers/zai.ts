import type { AIProvider } from '../types';
import type { AnalysisResult } from '@/types';

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash';

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
 * Z.ai (GLM) provider — OpenAI-compatible chat completions API.
 */
export class ZaiProvider implements AIProvider {
  readonly name = 'Z.ai (GLM)';

  constructor(private readonly apiKey: string) { }

  async analyzeExperience(
    text: string,
    previousContext?: string[],
  ): Promise<AnalysisResult> {
    const messages: { role: string; content: string; }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (previousContext?.length) {
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
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('[QuickVibe] Z.ai API error', response.status, body);
      throw new Error(
        `Z.ai API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const data = await response.json();

    if (!data.choices?.length) {
      throw new Error('Z.ai returned no choices');
    }

    const content = data.choices[0].message.content;
    const result: AnalysisResult = JSON.parse(content);

    if (typeof result.score !== 'number') {
      throw new Error('Z.ai response missing score');
    }

    return result;
  }
}
