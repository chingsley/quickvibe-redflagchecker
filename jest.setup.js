// Jest setup file for VibeMeter
// Runs before every test suite.

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@expo-google-fonts/roboto', () => ({
  Roboto_400Regular: 'Roboto_400Regular',
  Roboto_500Medium: 'Roboto_500Medium',
  Roboto_700Bold: 'Roboto_700Bold',
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Redirect: () => null,
  Link: ({ children }: { children: unknown }) => children,
  Stack: ({ children }: { children: unknown }) => children,
}));

// ── Mock React Native Reanimated ────────────────────────
// Self-contained mock — doesn't rely on native worklets module.

jest.mock('react-native-reanimated', () => {
  const { View, Text, Image } = require('react-native');

  // Minimal shared value implementation
  const createSharedValue = (val) => ({ value: val });

  return {
    __esModule: true,
    default: {
      View,
      Text,
      Image,
      createAnimatedComponent: (Component) => Component,
    },
    useSharedValue: createSharedValue,
    useAnimatedProps: () => ({}),
    useAnimatedStyle: () => ({}),
    useAnimatedReaction: () => { },
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    withRepeat: (toValue) => toValue,
    withSequence: (...args) => args[args.length - 1],
    withDelay: (_delay, animation) => animation,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    cancelAnimation: () => { },
    Easing: {
      linear: () => 0,
      ease: () => 0,
      inOut: () => 0,
      out: () => 0,
    },
  };
});

// ── Mock react-native-svg ───────────────────────────────

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  const Svg = View;
  Svg.Path = View;
  Svg.G = View;
  Svg.Circle = View;
  Svg.Defs = View;
  Svg.LinearGradient = View;
  Svg.Stop = View;
  Svg.Rect = View;
  Svg.Text = View;
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Path: View,
    G: View,
    Circle: View,
    Defs: View,
    LinearGradient: View,
    Stop: View,
    Rect: View,
    Text: View,
  };
});
