// OpenAIProvider will be created in T24.
// This import fails until the stub exists — that's the RED phase.
import { OpenAIProvider } from '../openai';
import type { AnalysisResult } from '@/types';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock expo-constants to return the API key
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_OPENAI_API_KEY: 'sk-test-key',
      },
    },
  },
}));

// Helper to create a mock OpenAI-style response
function mockOpenAIResponse(content: string) {
  return {
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content,
          },
        },
      ],
    }),
  };
}

// ─── Test Suite ─────────────────────────────────────────

describe('OpenAIProvider', () => {
  const validResult: AnalysisResult = {
    score: 75,
    category: 'manipulation',
    label: 'Proceed at your own discretion',
    advice: 'Watch for boundary violations.',
    reasons: ['Detected manipulation', 'Gaslighting patterns'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Interface compliance ─────────────────────────────

  it('implements the AIProvider interface', () => {
    const provider = new OpenAIProvider('sk-test');
    expect(provider.name).toBe('OpenAI (ChatGPT)');
    expect(typeof provider.analyzeExperience).toBe('function');
  });

  // ── API request format ───────────────────────────────

  it('sends a POST to the OpenAI chat completions endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    await provider.analyzeExperience('Someone was rude to me.');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
  });

  it('sends correct Authorization header', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    await provider.analyzeExperience('Test');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer sk-test');
  });

  it('sends Content-Type application/json header', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    await provider.analyzeExperience('Test');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('uses gpt-4o-mini model', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    await provider.analyzeExperience('Test');

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body.model).toBe('gpt-4o-mini');
  });

  it('includes system prompt and user message in messages array', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    await provider.analyzeExperience('Someone was manipulative.');

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[0].content).toContain('red flag');
    expect(body.messages[1].role).toBe('user');
    expect(body.messages[1].content).toBe('Someone was manipulative.');
  });

  // ── Response parsing ─────────────────────────────────

  it('parses a valid JSON response into AnalysisResult', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(validResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    const result = await provider.analyzeExperience('Test');

    expect(result).toEqual(validResult);
    expect(result.score).toBe(75);
    expect(result.reasons).toHaveLength(2);
  });

  it('handles structured follow-up questions in the response', async () => {
    const resultWithQuestions: AnalysisResult = {
      score: 0,
      category: 'ambiguous',
      label: 'Proceed with caution',
      advice: 'Need more info.',
      reasons: ['Unclear communication'],
      followUpQuestions: [
        {
          question: 'How often does he express anger while driving?',
          type: 'choice',
          choices: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
        },
        {
          question: 'How does he react when you bring it up?',
          type: 'open',
        },
      ],
    };

    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(resultWithQuestions)),
    );

    const provider = new OpenAIProvider('sk-test');
    const result = await provider.analyzeExperience('Ambiguous situation');

    expect(result.followUpQuestions).toHaveLength(2);
    expect(result.followUpQuestions![0]).toEqual({
      question: 'How often does he express anger while driving?',
      type: 'choice',
      choices: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    });
    expect(result.followUpQuestions![1]).toEqual({
      question: 'How does he react when you bring it up?',
      type: 'open',
    });
  });

  it('normalizes legacy string follow-up questions to open type', async () => {
    const legacyResult = {
      score: 0,
      category: 'ambiguous',
      label: 'Proceed with caution',
      advice: 'Need more info.',
      reasons: ['Unclear communication'],
      followUpQuestions: ['What happened next?'],
    };

    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse(JSON.stringify(legacyResult)),
    );

    const provider = new OpenAIProvider('sk-test');
    const result = await provider.analyzeExperience('Ambiguous situation');

    expect(result.followUpQuestions![0]).toEqual({
      question: 'What happened next?',
      type: 'open',
    });
  });

  // ── Error handling ───────────────────────────────────

  it('throws when the API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const provider = new OpenAIProvider('sk-test');
    await expect(
      provider.analyzeExperience('Test'),
    ).rejects.toThrow('Network error');
  });

  it('throws when the response has no choices', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const provider = new OpenAIProvider('sk-test');
    await expect(provider.analyzeExperience('Test')).rejects.toThrow();
  });
});
