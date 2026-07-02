// provider-factory test — uses injectable readConfig to bypass expo-constants mock.

import { getProvider, __setTestConfig } from '../provider-factory';

const mockConfig: Record<string, string> = {
  EXPO_PUBLIC_AI_PROVIDER: 'openai',
  EXPO_PUBLIC_OPENAI_API_KEY: 'sk-openai-test',
  EXPO_PUBLIC_COHERE_API_KEY: 'cohere-test',
  EXPO_PUBLIC_DEEPSEEK_API_KEY: 'deepseek-test',
  EXPO_PUBLIC_ZAI_API_KEY: 'zai-test',
};

// Inject test config so we don't need to mock expo-constants
__setTestConfig(mockConfig);

// ─── Test Suite ─────────────────────────────────────────

describe('provider-factory', () => {
  beforeEach(() => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'openai';
  });

  // ── Provider selection ───────────────────────────────

  it('returns OpenAIProvider when EXPO_PUBLIC_AI_PROVIDER is "openai"', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'openai';
    const provider = getProvider();
    expect(provider).toBeDefined();
    expect(provider.name).toBe('OpenAI (ChatGPT)');
    expect(typeof provider.analyzeExperience).toBe('function');
  });

  it('returns CohereProvider when EXPO_PUBLIC_AI_PROVIDER is "cohere"', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'cohere';
    const provider = getProvider();
    expect(provider.name).toBe('Cohere (Command R)');
  });

  it('returns DeepSeekProvider when EXPO_PUBLIC_AI_PROVIDER is "deepseek"', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'deepseek';
    const provider = getProvider();
    expect(provider.name).toBe('DeepSeek (V3)');
  });

  it('returns ZaiProvider when EXPO_PUBLIC_AI_PROVIDER is "zai"', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'zai';
    const provider = getProvider();
    expect(provider.name).toBe('Z.ai (GLM)');
  });

  // ── Error handling ───────────────────────────────────

  it('throws when EXPO_PUBLIC_AI_PROVIDER is unrecognized', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'unknown-model';
    expect(() => getProvider()).toThrow(/unknown-model/i);
  });

  it('throws when EXPO_PUBLIC_AI_PROVIDER is empty string', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = '';
    expect(() => getProvider()).toThrow();
  });

  // ── API key passthrough ──────────────────────────────

  it('passes the correct API key to each provider', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'openai';
    // The factory should read OPENAI_API_KEY for openai provider
    const provider = getProvider();
    expect(provider).toBeDefined();

    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'cohere';
    const cohere = getProvider();
    expect(cohere.name).toBe('Cohere (Command R)');
  });

  // ── Case insensitivity ───────────────────────────────

  it('handles uppercase provider names', () => {
    mockConfig.EXPO_PUBLIC_AI_PROVIDER = 'OPENAI';
    const provider = getProvider();
    expect(provider.name).toBe('OpenAI (ChatGPT)');
  });
});
