// Auto-mock for expo-speech-recognition — prevents native module loading in tests

const mockStart = jest.fn();
const mockStop = jest.fn();
const mockGetPerms = jest.fn();
const mockRequestPerms = jest.fn();

const ExpoSpeechRecognitionModule = {
  start: mockStart,
  stop: mockStop,
  getSpeechRecognizerPermissionsAsync: mockGetPerms,
  requestSpeechRecognizerPermissionsAsync: mockRequestPerms,
};

// Re-export so tests can access mock functions
export { mockStart, mockStop, mockGetPerms, mockRequestPerms };

export { ExpoSpeechRecognitionModule };

// Stub other exports
export const useSpeechRecognitionEvent = () => { };
