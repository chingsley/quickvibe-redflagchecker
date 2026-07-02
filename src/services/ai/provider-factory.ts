import type { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { CohereProvider } from './providers/cohere';
import { DeepSeekProvider } from './providers/deepseek';
import { ZaiProvider } from './providers/zai';

type ProviderConstructor = new (apiKey: string) => AIProvider;

const registry: Record<string, ProviderConstructor> = {
  openai: OpenAIProvider,
  cohere: CohereProvider,
  deepseek: DeepSeekProvider,
  zai: ZaiProvider,
};

const apiKeyEnvMap: Record<string, string> = {
  openai: 'EXPO_PUBLIC_OPENAI_API_KEY',
  cohere: 'EXPO_PUBLIC_COHERE_API_KEY',
  deepseek: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
  zai: 'EXPO_PUBLIC_ZAI_API_KEY',
};

/** Overridable config for testing. Set via __setTestConfig(). */
let testConfig: Record<string, string> | null = null;

/** Override the config source — used only in tests. */
export function __setTestConfig(config: Record<string, string> | null): void {
  testConfig = config;
}

function readConfig(): Record<string, string> {
  if (testConfig) return testConfig;
  // Direct access required — Metro inlines EXPO_PUBLIC_* as string literals
  return {
    EXPO_PUBLIC_AI_PROVIDER: process.env.EXPO_PUBLIC_AI_PROVIDER ?? '',
    EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
    EXPO_PUBLIC_COHERE_API_KEY: process.env.EXPO_PUBLIC_COHERE_API_KEY ?? '',
    EXPO_PUBLIC_DEEPSEEK_API_KEY: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY ?? '',
    EXPO_PUBLIC_ZAI_API_KEY: process.env.EXPO_PUBLIC_ZAI_API_KEY ?? '',
  };
}

/**
 * Returns the active AI provider based on EXPO_PUBLIC_AI_PROVIDER.
 *
 * @throws {Error} If the env value is empty or unrecognized.
 */
export function getProvider(): AIProvider {
  const config = readConfig();
  const providerName = (config.EXPO_PUBLIC_AI_PROVIDER ?? '').toLowerCase().trim();

  if (!providerName) {
    throw new Error(
      'EXPO_PUBLIC_AI_PROVIDER is not set. Set it to one of: openai, cohere, deepseek, zai',
    );
  }

  const ProviderClass = registry[providerName];

  if (!ProviderClass) {
    throw new Error(
      `Unknown AI provider "${providerName}". Available: ${Object.keys(registry).join(', ')}`,
    );
  }

  const apiKeyEnv = apiKeyEnvMap[providerName] ?? '';
  const apiKey = config[apiKeyEnv] ?? '';

  if (!apiKey) {
    throw new Error(
      `API key for "${providerName}" is missing. Set ${apiKeyEnv} in your .env file.`,
    );
  }

  return new ProviderClass(apiKey);
}
