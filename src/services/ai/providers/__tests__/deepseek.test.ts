// DeepSeekProvider — created in T28.
import { DeepSeekProvider } from '../deepseek';
import type { AnalysisResult } from '@/types';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockResponse(content: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

describe('DeepSeekProvider', () => {
  const validResult: AnalysisResult = {
    score: 88,
    category: 'controlling',
    label: 'Proceed at your own detriment',
    advice: 'This is a major red flag.',
    reasons: ['Controlling behavior', 'Ultimatums', 'Isolation tactics'],
  };

  beforeEach(() => jest.clearAllMocks());

  it('implements AIProvider', () => {
    const p = new DeepSeekProvider('dk-key');
    expect(p.name).toBe('DeepSeek (V3)');
    expect(typeof p.analyzeExperience).toBe('function');
  });

  it('POSTs to DeepSeek endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new DeepSeekProvider('dk-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://api.deepseek.com/v1/chat/completions',
    );
  });

  it('uses Bearer auth', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new DeepSeekProvider('dk-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer dk-key',
    );
  });

  it('parses response into AnalysisResult', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new DeepSeekProvider('dk-key');
    const r = await p.analyzeExperience('Test');
    expect(r.score).toBe(88);
    expect(r.reasons).toHaveLength(3);
  });

  it('throws on API failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Timeout'));
    const p = new DeepSeekProvider('dk-key');
    await expect(p.analyzeExperience('Test')).rejects.toThrow('Timeout');
  });
});
