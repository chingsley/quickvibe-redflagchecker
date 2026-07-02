// AIProvider will be created in T22.
// This import fails until the stub exists — that's the RED phase.
import type { AIProvider } from '../types';
import type { AnalysisResult } from '@/types';

// ─── Test Suite ─────────────────────────────────────────

describe('AIProvider interface', () => {
  it('requires a name property of type string', () => {
    // Create an object that satisfies the interface
    const provider: AIProvider = {
      name: 'TestProvider',
      analyzeExperience: jest.fn(),
    };
    expect(typeof provider.name).toBe('string');
    expect(provider.name).toBe('TestProvider');
  });

  it('requires an analyzeExperience method', () => {
    const provider: AIProvider = {
      name: 'TestProvider',
      analyzeExperience: jest.fn(),
    };
    expect(typeof provider.analyzeExperience).toBe('function');
  });

  it('analyzeExperience accepts text string', async () => {
    const mockResult: AnalysisResult = {
      score: 50,
      category: 'test',
      label: 'Proceed with caution',
      advice: 'Be careful.',
      reasons: ['Test reason'],
    };

    const provider: AIProvider = {
      name: 'TestProvider',
      analyzeExperience: jest.fn().mockResolvedValue(mockResult),
    };

    const result = await provider.analyzeExperience('Some experience text');
    expect(result).toEqual(mockResult);
    expect(provider.analyzeExperience).toHaveBeenCalledWith(
      'Some experience text',
    );
  });

  it('analyzeExperience accepts optional previousContext', async () => {
    const provider: AIProvider = {
      name: 'TestProvider',
      analyzeExperience: jest.fn().mockResolvedValue({
        score: 75,
        category: 'red-flag',
        label: 'Proceed at your own detriment',
        advice: 'Run.',
        reasons: ['Danger detected'],
      }),
    };

    await provider.analyzeExperience('main text', ['Q1 answer', 'Q2 answer']);
    expect(provider.analyzeExperience).toHaveBeenCalledWith(
      'main text',
      ['Q1 answer', 'Q2 answer'],
    );
  });

  it('AnalysisResult shape is consistent', () => {
    const result: AnalysisResult = {
      score: 85,
      category: 'manipulation',
      label: 'Proceed at your own detriment',
      advice: 'Consider setting boundaries.',
      reasons: [
        'Detected love-bombing language patterns',
        'High incidence of deflection',
      ],
      followUpQuestions: ['Can you elaborate on X?'],
    };

    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(1);
    expect(result.followUpQuestions).toBeDefined();
    expect(Array.isArray(result.followUpQuestions)).toBe(true);
  });
});
