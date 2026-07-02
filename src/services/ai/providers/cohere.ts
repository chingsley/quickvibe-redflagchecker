import type { AIProvider } from '../types';
import type { AnalyzeOptions } from '../types';
import type { AnalysisResult } from '@/types';
import { buildSystemPrompt, buildUserMessage, parseAnalysisResponse } from '../message-builder';

const API_URL = 'https://api.cohere.ai/v2/chat';
const MODEL = 'command-r-plus';

export class CohereProvider implements AIProvider {
  readonly name = 'Cohere (Command R)';

  constructor(private readonly apiKey: string) {}

  async analyzeExperience(
    text: string,
    previousContext?: string[],
    options?: AnalyzeOptions,
  ): Promise<AnalysisResult> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        message: buildUserMessage(text, previousContext),
        preamble: buildSystemPrompt(options),
        temperature: 0.3,
        max_tokens: 800,
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

    return parseAnalysisResponse(content);
  }
}
