/**
 * Speech recognition service.
 * Falls back gracefully when the native module is not available (e.g. Expo Go, web).
 */

import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

const SPEECH_MODULE_NAME = 'ExpoSpeechRecognition';
const UNAVAILABLE_MESSAGE =
  'Speech recognition is not available. Use text input or a development build for voice.';

let ExpoSpeechRecognitionModule: any = null;
let speechAvailable: boolean | null = null;

function probeAvailability(): boolean {
  if (speechAvailable !== null) {
    return speechAvailable;
  }

  if (Platform.OS === 'web') {
    speechAvailable = false;
    console.warn(
      '[QuickVibe] Speech recognition is unavailable on web. Mic disabled — use "Type instead".',
    );
    return false;
  }

  try {
    const nativeModule = requireOptionalNativeModule(SPEECH_MODULE_NAME);
    if (nativeModule) {
      ExpoSpeechRecognitionModule = nativeModule;
      speechAvailable = true;
      return true;
    }

    speechAvailable = false;
    console.warn(
      '[QuickVibe] Speech recognition native module not found. Mic disabled — use "Type instead".',
    );
    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[QuickVibe] Speech recognition unavailable:', message);
    speechAvailable = false;
    return false;
  }
}

function getModule(): any {
  if (!probeAvailability()) {
    throw new Error(UNAVAILABLE_MESSAGE);
  }
  return ExpoSpeechRecognitionModule;
}

/** Check if speech recognition is available on this device. */
export function isSpeechAvailable(): boolean {
  return probeAvailability();
}

/** Inline permission statuses to avoid importing expo-modules-core enums in tests. */
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
export async function stopListening(): Promise<null> {
  const module = getModule();
  await module.stop();
  return null;
}
