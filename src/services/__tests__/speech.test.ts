import { startListening, stopListening } from '../speech';
import {
  mockStart,
  mockStop,
  mockGetPerms,
  mockRequestPerms,
} from 'expo-speech-recognition';

describe('speech service', () => {
  beforeEach(() => { jest.clearAllMocks(); });

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
    expect(result).toBeNull(); // results come via events, not return value
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
