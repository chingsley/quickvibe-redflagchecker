/**
 * Speech recognition service.
 * Falls back gracefully when the native module is not available (e.g. in Expo Go).
 */

let ExpoSpeechRecognitionModule: any = null;
let speechAvailable: boolean | null = null;

function getModule(): any {
  if (speechAvailable === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('expo-speech-recognition');
      ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
      speechAvailable = !!ExpoSpeechRecognitionModule;
    } catch {
      speechAvailable = false;
    }
  }
  if (!speechAvailable) {
    throw new Error(
      'Speech recognition is not available in Expo Go. Use a development build for voice input.',
    );
  }
  return ExpoSpeechRecognitionModule;
}

/** Check if speech recognition is available on this device. */
export function isSpeechAvailable(): boolean {
  try {
    getModule();
    return true;
  } catch {
    return false;
  }
}

/** Inline permission statuses to avoid importing expo-modules-core (triggers native fetch polyfill in tests). */
const GRANTED = 'granted';

/**
 * Request mic + speech recognition permission and start listening.
 */
export async function startListening(): Promise<void> {
  const module = getModule();
  const { status } = await module.getSpeechRecognizerPermissionsAsync();

  if (status !== GRANTED) {
    const { status: newStatus } =
      await module.requestSpeechRecognizerPermissionsAsync();

    if (newStatus !== GRANTED) {
      throw new Error(
        'Microphone permission is required for speech recognition.',
      );
    }
  }

  module.start({
    lang: 'en-US',
    interimResults: true,
    addsPunctuation: true,
  });
}

/**
 * Stop the active recognition session.
 * Results come through the useSpeechRecognitionEvent hook / event listeners.
 */
export async function stopListening(): Promise<any> {
  const module = getModule();
  await module.stop();
  return null;
}
