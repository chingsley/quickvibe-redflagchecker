import { renderHook } from '@testing-library/react-hooks';
import { useSharedValue } from 'react-native-reanimated';
import { useHapticSync } from '../useHapticSync';

const mockImpactAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: mockImpactAsync,
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

describe('useHapticSync', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('does not crash when called', () => {
    const { result } = renderHook(() => {
      const progress = useSharedValue(0);
      useHapticSync(progress);
      return progress;
    });
    expect(result.current.value).toBe(0);
  });

  it('handles progress at 50 without crashing', () => {
    const { result } = renderHook(() => {
      const progress = useSharedValue(50);
      useHapticSync(progress);
      return progress;
    });
    expect(result.current.value).toBe(50);
  });

  it('handles progress at 85 without crashing', () => {
    const { result } = renderHook(() => {
      const progress = useSharedValue(85);
      useHapticSync(progress);
      return progress;
    });
    expect(result.current.value).toBe(85);
  });

  it('handles boundary value 0', () => {
    const { result } = renderHook(() => {
      const progress = useSharedValue(0);
      useHapticSync(progress);
      return progress;
    });
    expect(result.current.value).toBe(0);
  });

  it('handles boundary value 100', () => {
    const { result } = renderHook(() => {
      const progress = useSharedValue(100);
      useHapticSync(progress);
      return progress;
    });
    expect(result.current.value).toBe(100);
  });

  it('uses theme haptic thresholds', () => {
    const { hapticThresholds } = require('@/constants/theme');
    expect(hapticThresholds.length).toBeGreaterThan(0);
    expect(hapticThresholds[0].at).toBeLessThanOrEqual(20);
    expect(hapticThresholds[hapticThresholds.length - 1].at).toBe(100);
  });
});
