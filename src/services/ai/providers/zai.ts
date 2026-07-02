import type { AIProvider } from '../types';
import type { AnalyzeOptions } from '../types';
import type { AnalysisResult } from '@/types';
import { buildSystemPrompt, buildUserMessage, parseAnalysisResponse } from '../message-builder';

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash';

/** Z.ai (GLM) provider — OpenAI-compatible chat completions API. */
export class ZaiProvider implements AIProvider {
  readonly name = 'Z.ai (GLM)';

  constructor(private readonly apiKey: string) {}

  async analyzeExperience(
    text: string,
    previousContext?: string[],
    options?: AnalyzeOptions,
  ): Promise<AnalysisResult> {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: buildSystemPrompt(options) },
      { role: 'user', content: buildUserMessage(text, previousContext) },
    ];

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
        max_tokens: 800,
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
    return parseAnalysisResponse(content);
  }
}
