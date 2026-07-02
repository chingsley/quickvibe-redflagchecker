// ZaiProvider — created in T30.
import { ZaiProvider } from '../zai';
import type { AnalysisResult } from '@/types';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockResponse(content: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

describe('ZaiProvider', () => {
  const validResult: AnalysisResult = {
    score: 20,
    category: 'harmless',
    label: 'This is actually sweet',
    advice: 'Nothing to worry about.',
    reasons: ['Genuine kindness', 'No red flags detected'],
  };

  beforeEach(() => jest.clearAllMocks());

  it('implements AIProvider', () => {
    const p = new ZaiProvider('zai-key');
    expect(p.name).toBe('Z.ai (GLM)');
    expect(typeof p.analyzeExperience).toBe('function');
  });

  it('POSTs to Z.ai endpoint', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new ZaiProvider('zai-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    );
  });

  it('uses Bearer auth', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new ZaiProvider('zai-key');
    await p.analyzeExperience('Test');
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer zai-key',
    );
  });

  it('parses response into AnalysisResult', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(JSON.stringify(validResult)),
    );
    const p = new ZaiProvider('zai-key');
    const r = await p.analyzeExperience('Test');
    expect(r.score).toBe(20);
    expect(r.reasons).toHaveLength(2);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
    const p = new ZaiProvider('zai-key');
    await expect(p.analyzeExperience('Test')).rejects.toThrow(
      'Connection refused',
    );
  });
});
