const mockStart = jest.fn();
const mockStop = jest.fn();
const mockGetPerms = jest.fn();
const mockRequestPerms = jest.fn();

let resultListener: ((event: {
  results?: { transcript?: string }[];
}) => void) | null = null;

const mockNativeModule = {
  start: mockStart,
  stop: mockStop,
  getSpeechRecognizerPermissionsAsync: mockGetPerms,
  requestSpeechRecognizerPermissionsAsync: mockRequestPerms,
  addListener: jest.fn((eventName: string, listener: typeof resultListener) => {
    if (eventName === 'result') {
      resultListener = listener;
    }
    return { remove: jest.fn(() => { resultListener = null; }) };
  }),
};

const mockRequireOptionalNativeModule = jest.fn(() => mockNativeModule);

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: (...args: unknown[]) =>
    mockRequireOptionalNativeModule(...args),
}));

import { startListening, stopListening, isSpeechAvailable } from '../speech';

describe('speech service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resultListener = null;
    mockRequireOptionalNativeModule.mockReturnValue(mockNativeModule);
  });

  it('reports speech as available when native module exists', () => {
    expect(isSpeechAvailable()).toBe(true);
  });

  it('reports speech as unavailable when native module is missing', () => {
    jest.isolateModules(() => {
      mockRequireOptionalNativeModule.mockReturnValue(null);
      const { isSpeechAvailable: probe } = require('../speech');
      expect(probe()).toBe(false);
    });
  });

  it('requests permission if not granted', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'denied' });
    mockRequestPerms.mockResolvedValueOnce({ status: 'granted' });
    await startListening();
    expect(mockRequestPerms).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
  });

  it('skips request if already granted', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'granted' });
    await startListening();
    expect(mockRequestPerms).not.toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
  });

  it('throws if permission denied', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'denied' });
    mockRequestPerms.mockResolvedValueOnce({ status: 'denied' });
    await expect(startListening()).rejects.toThrow(/permission/i);
  });

  it('returns transcribed text from speech results', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'granted' });
    mockStop.mockResolvedValueOnce(undefined);
    await startListening();
    resultListener?.({
      results: [{ transcript: 'He yelled at other drivers on the way to our date.' }],
    });
    const transcript = await stopListening();
    expect(mockStop).toHaveBeenCalled();
    expect(transcript).toBe('He yelled at other drivers on the way to our date.');
  });

  it('throws when no speech was detected', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'granted' });
    mockStop.mockResolvedValueOnce(undefined);
    await startListening();
    await expect(stopListening()).rejects.toThrow(/no speech was detected/i);
  });

  it('stopListening propagates errors', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'granted' });
    await startListening();
    mockStop.mockRejectedValueOnce(new Error('fail'));
    await expect(stopListening()).rejects.toThrow('fail');
  });

  it('startListening passes correct options to native module', async () => {
    mockGetPerms.mockResolvedValueOnce({ status: 'granted' });
    await startListening();
    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({
        lang: 'en-US',
        interimResults: true,
        addsPunctuation: true,
      }),
    );
  });
});
