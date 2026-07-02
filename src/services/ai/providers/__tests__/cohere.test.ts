// CohereProvider will be created in T26.
import { CohereProvider } from '../cohere';
import type { AnalysisResult } from '@/types';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockCohereResponse(content: string) {
  return {
    ok: true,
    json: async () => ({
      text: content,
    }),
  };
}

describe('CohereProvider', () => {
  const validResult: AnalysisResult = {
    score: 60,
    category: 'passive-aggressive',
    label: 'Proceed at your own discretion',
    advice: 'Look for patterns.',
    reasons: ['Passive-aggressive tone', 'Avoidance'],
  };

  beforeEach(() => jest.clearAllMocks());

  it('implements AIProvider interface', () => {
    const p = new CohereProvider('test-key');
    expect(p.name).toBe('Cohere (Command R)');
    expect(typeof p.analyzeExperience).toBe('function');
  });

  it('POSTs to Cohere chat endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      mockCohereResponse(JSON.stringify(validResult)),
    );
    const p = new CohereProvider('test-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.cohere.ai/v2/chat');
  });

  it('uses Bearer auth', async () => {
    mockFetch.mockResolvedValueOnce(
      mockCohereResponse(JSON.stringify(validResult)),
    );
    const p = new CohereProvider('test-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer test-key',
    );
  });

  it('parses response into AnalysisResult', async () => {
    mockFetch.mockResolvedValueOnce(
      mockCohereResponse(JSON.stringify(validResult)),
    );
    const p = new CohereProvider('test-key');
    const r = await p.analyzeExperience('Test');
    expect(r.score).toBe(60);
    expect(r.reasons).toHaveLength(2);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const p = new CohereProvider('test-key');
    await expect(p.analyzeExperience('Test')).rejects.toThrow('Network error');
  });
});
