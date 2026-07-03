import { resolveApiBaseUrl } from '../resolveApiUrl';

describe('resolveApiBaseUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
  });

  it('uses explicit non-localhost URL from env', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.50:3000';
    expect(resolveApiBaseUrl()).toBe('http://192.168.1.50:3000');
  });

  it('strips trailing slash from configured URL', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.50:3000/';
    expect(resolveApiBaseUrl()).toBe('http://192.168.1.50:3000');
  });
});
