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
let activeTranscript = '';
let resultSubscription: { remove: () => void } | null = null;

function clearResultListener(): void {
  resultSubscription?.remove();
  resultSubscription = null;
}

function attachResultListener(module: any): void {
  clearResultListener();
  activeTranscript = '';

  if (typeof module.addListener !== 'function') {
    return;
  }

  resultSubscription = module.addListener('result', (event: {
    results?: { transcript?: string }[];
  }) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (transcript) {
      activeTranscript = transcript;
    }
  });
}

function probeAvailability(): boolean {
  if (speechAvailable !== null) {
    return speechAvailable;
  }

  if (Platform.OS === 'web') {
    speechAvailable = false;
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
    return false;
  } catch {
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

const GRANTED = 'granted';

/** Request mic + speech recognition permission and start listening. */
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

  attachResultListener(module);

  module.start({
    lang: 'en-US',
    interimResults: true,
    addsPunctuation: true,
  });
}

/**
 * Stop the active recognition session and return the transcribed text.
 */
export async function stopListening(): Promise<string> {
  const module = getModule();
  await module.stop();
  clearResultListener();

  const transcript = activeTranscript.trim();
  activeTranscript = '';

  if (!transcript) {
    throw new Error(
      'No speech was detected. Try again or type your experience instead.',
    );
  }

  return transcript;
}
