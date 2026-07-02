const mockStart = jest.fn();
const mockStop = jest.fn();
const mockGetPerms = jest.fn();
const mockRequestPerms = jest.fn();

const mockNativeModule = {
  start: mockStart,
  stop: mockStop,
  getSpeechRecognizerPermissionsAsync: mockGetPerms,
  requestSpeechRecognizerPermissionsAsync: mockRequestPerms,
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
    mockRequireOptionalNativeModule.mockReturnValue(mockNativeModule);
  });

  it('reports speech as available when native module exists', () => {
    expect(isSpeechAvailable()).toBe(true);
  });

  it('reports speech as unavailable when native module is missing', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.isolateModules(() => {
      mockRequireOptionalNativeModule.mockReturnValue(null);
      const { isSpeechAvailable: probe } = require('../speech');
      expect(probe()).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
    });

    warnSpy.mockRestore();
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

  it('stopListening calls stop on native module', async () => {
    mockStop.mockResolvedValueOnce(undefined);
    const result = await stopListening();
    expect(mockStop).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('stopListening propagates errors', async () => {
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
