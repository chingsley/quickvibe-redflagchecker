import type { AIProvider } from '../types';
import type { AnalyzeOptions } from '../types';
import type { AnalysisResult } from '@/types';
import { buildSystemPrompt, buildUserMessage, parseAnalysisResponse } from '../message-builder';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

/**
 * OpenAI / ChatGPT (GPT-4o-mini) provider implementation.
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
    return parseAnalysisResponse(content);
  }
}
