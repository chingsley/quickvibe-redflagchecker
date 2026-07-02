fix: downgrade to Expo SDK 54 for Expo Go compatibility + add text-input fallback

## Summary
Downgraded project from SDK 57 → SDK 54 to match Expo Go 54.0.2 (App Store),
resolving "Project is incompatible" error. Added text-input fallback for
when speech recognition is unavailable (Expo Go doesn't bundle the native
`ExpoSpeechRecognition` module). Fixed env var loading for all AI providers.

## Changes

### SDK 57 → 54 Migration
- `package.json`: expo ~57.0.1 → ~54.0.0, react 19.2.3 → 19.1.0,
  react-native 0.86.0 → 0.81.5, jest-expo 57 → 54, typescript 6→5.9
- Reanimated 4.5.0 → ~4.1.1 (added react-native-worklets@0.5.1)
- expo-router ~57.0.2 → ~6.0.24, expo-speech-recognition 56.x → ~3.1.0
- Added react-native-screens@4.16.0 (missing dep for expo-router nav)
- Removed expo-dev-client (not needed for Expo Go workflow)

### Bug Fixes
- **StyleSheet.absoluteFill → absoluteFillObject** (TS 5.3 spread compatibility)
- **Env var loading**: Switched from `Constants.expoConfig.extra` to direct
  `process.env.EXPO_PUBLIC_*` string literals so Metro can inline at build time
- **`.env` quotes removed**: Single quotes in .env values were treated as
  literal characters (`'deepseek'` ≠ `deepseek`)
- **All 4 AI providers**: Error handling now reads `response.text()` body
  and logs to console (React Native `statusText` is always empty)
- **Console.error logging**: Added `[QuickVibe]` prefixed logs in all
  hook catch blocks for terminal visibility

### Speech → Text Fallback
- `src/services/speech.ts`: Lazy-loads expo-speech-recognition; exports
  `isSpeechAvailable()` to detect missing native module at runtime
- `src/hooks/useRedFlagAnalysis.ts`: Added `submitText()` method + shared
  `runAnalysis()` helper; exports `isSpeechAvailable`
- `app/index.tsx`: Idle state conditionally renders text input + "Analyze"
  button when speech is unavailable (Expo Go), or MicButton when available
  (dev build)

## Verification
- TypeScript: zero errors
- Tests: 14 suites, 104/104 passing
- iOS bundle: `npx expo export --platform ios` ✅
- Android bundle: `npx expo export --platform android` ✅
- Expo Go: app loads and renders text-input fallback successfully
