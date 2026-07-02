import type { AIProvider } from '../types';
import type { AnalyzeOptions } from '../types';
import type { AnalysisResult } from '@/types';
import { buildSystemPrompt, buildUserMessage, parseAnalysisResponse } from '../message-builder';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

/** DeepSeek V3 provider — OpenAI-compatible chat completions API. */
export class DeepSeekProvider implements AIProvider {
  readonly name = 'DeepSeek (V3)';

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
      console.error('[QuickVibe] DeepSeek API error', response.status, body);
      throw new Error(
        `DeepSeek API error ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    const data = await response.json();

    if (!data.choices?.length) {
      throw new Error('DeepSeek returned no choices');
    }

    const content = data.choices[0].message.content;
    return parseAnalysisResponse(content);
  }
}
