import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = 3000;

/** Host Metro is serving the JS bundle from (your Mac's LAN IP in Expo Go). */
function metroHost(): string | null {
  const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
  const match = scriptURL?.match(/https?:\/\/([^:/]+)/);
  const host = match?.[1];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  return host;
}

/**
 * Resolve the API base URL for the current runtime.
 *
 * `localhost` only works in the iOS simulator and web. Physical devices and the
 * Android emulator must reach your dev machine by IP (derived from Metro's URL).
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (
    configured &&
    !configured.includes('localhost') &&
    !configured.includes('127.0.0.1')
  ) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return configured?.replace(/\/$/, '') ?? `http://localhost:${DEFAULT_PORT}`;
  }

  const lanHost = metroHost();
  if (lanHost) {
    return `http://${lanHost}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'android') {
    // Android emulator: host loopback alias to the dev machine
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  return configured?.replace(/\/$/, '') ?? `http://localhost:${DEFAULT_PORT}`;
}
