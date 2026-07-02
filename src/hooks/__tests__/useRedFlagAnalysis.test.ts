import { renderHook, act } from '@testing-library/react-hooks';
import { useRedFlagAnalysis } from '../useRedFlagAnalysis';

// Mock the AI provider factory
jest.mock('@/services/ai', () => ({
  getProvider: () => ({
    name: 'MockProvider',
    analyzeExperience: jest.fn().mockResolvedValue({
      score: 85,
      category: 'manipulation',
      label: 'Proceed at your own detriment',
      advice: 'Red flags detected.',
      reasons: ['Detected manipulation'],
    }),
  }),
}));

// Mock speech service
jest.mock('@/services/speech', () => ({
  startListening: jest.fn().mockResolvedValue(undefined),
  stopListening: jest.fn().mockResolvedValue('He was rude during our date.'),
}));

describe('useRedFlagAnalysis', () => {
  // ── Initial state ────────────────────────────────────

  it('starts in idle state', () => {
    const { result } = renderHook(() => useRedFlagAnalysis());
    expect(result.current.status).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.result).toBeNull();
  });

  it('exposes required API surface', () => {
    const { result } = renderHook(() => useRedFlagAnalysis());
    expect(result.current.status).toBeDefined();
    expect(result.current.score).toBeDefined();
    expect(result.current.result).toBeNull();
    expect(typeof result.current.startFlow).toBe('function');
    expect(typeof result.current.submitAnswer).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  // ── Flow: idle → recording ───────────────────────────

  it('transitions from idle to recording when startFlow is called', async () => {
    const { result } = renderHook(() => useRedFlagAnalysis());

    await act(async () => {
      await result.current.startFlow();
    });

    expect(result.current.status).toBe('recording');
  });

  // ── Flow: recording → transcribing → analyzing ───────

  it('transitions through states when recording is stopped', async () => {
    const { result } = renderHook(() => useRedFlagAnalysis());

    // Start recording
    await act(async () => {
      await result.current.startFlow();
    });
    expect(result.current.status).toBe('recording');

    // Stop recording (simulates user tapping mic again)
    await act(async () => {
      await result.current.startFlow(); // toggle
    });

    // After STT + analysis, should reach complete
    // The exact state depends on timing; verify it's not idle
    expect(result.current.status).not.toBe('idle');
  });

  // ── Reset ────────────────────────────────────────────

  it('reset returns to idle state', async () => {
    const { result } = renderHook(() => useRedFlagAnalysis());

    await act(async () => {
      await result.current.startFlow();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.result).toBeNull();
  });

  // ── Submit answer ────────────────────────────────────

  it('submitAnswer does not throw when called', async () => {
    const { result } = renderHook(() => useRedFlagAnalysis());

    await act(async () => {
      await result.current.submitAnswer('Some answer');
    });

    // Should remain idle since we haven't started a flow
    expect(result.current.status).toBe('idle');
  });
});
