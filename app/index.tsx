import { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { useRedFlagAnalysis, isSpeechAvailable } from '@/hooks/useRedFlagAnalysis';
import { useHapticSync } from '@/hooks/useHapticSync';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MicButton } from '@/components/MicButton';
import { AnalyzingLoader } from '@/components/AnalyzingLoader';
import { QuestionPrompt } from '@/components/QuestionPrompt';
import { ResultCard } from '@/components/ResultCard';
import { AppTextInput, KeyboardAwareScreen } from '@/components/keyboard';
import { colors, spacing, text, typography } from '@/constants/theme';

type InputMode = 'voice' | 'text';

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function HomeShell({
  children,
  scrollable = false,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const content = (
    <>
      <View style={styles.header}>
        <AppText style={styles.title}>VibeCheck</AppText>
        <AppText style={styles.subtitle}>
          Tap the mic and tell us about your experience. We'll analyze it for you.
        </AppText>
      </View>

      {children}

      <AppText style={styles.footerText}>
        Speak naturally about a date, conversation, or situation. Our AI will
        detect patterns and flag potential concerns.
      </AppText>
    </>
  );

  if (scrollable) {
    return (
      <KeyboardAwareScreen contentContainerStyle={styles.homeScrollContent}>
        {content}
      </KeyboardAwareScreen>
    );
  }

  return <SafeAreaView style={styles.screen}>{content}</SafeAreaView>;
}

export default function HomeScreen() {
  const router = useRouter();
  const analysis = useRedFlagAnalysis();
  useHapticSync(analysis.progress);
  useSoundEffects(analysis.status);

  const {
    status, score, result, error,
    pendingQuestions, followUpIndex,
    startFlow, submitAnswer, submitText, reset, clearError,
  } = analysis;

  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const speechAvailable = useMemo(() => isSpeechAvailable(), []);

  const handleTryAgain = () => {
    reset();
    setInputMode('voice');
    setTextInput('');
  };

  useEffect(() => {
    if (status !== 'recording') {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [status]);

  // ── Error state ──────────────────────────────────────

  if (error) {
    return (
      <View style={styles.center}>
        <AppText style={styles.errorIcon}>⚠️</AppText>
        <AppText style={styles.errorTitle}>Something went wrong</AppText>
        <AppText style={styles.errorMessage}>{error}</AppText>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <AppText style={styles.retryText}>Try Again</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Idle ──────────────────────────────────────────────

  if (status === 'idle') {
    if (inputMode === 'text') {
      const handleAnalyze = () => {
        if (!textInput.trim()) return;
        Keyboard.dismiss();
        submitText(textInput.trim());
        setTextInput('');
      };

      return (
        <HomeShell scrollable>
          <View style={styles.textModeSection}>
            <AppText style={styles.textModeLabel}>Share your experience:</AppText>
            <AppTextInput
              style={styles.textInput}
              placeholder="Type what happened..."
              multiline
              numberOfLines={5}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleAnalyze}
            />
            <TouchableOpacity
              style={[styles.submitButton, !textInput.trim() && styles.submitDisabled]}
              onPress={handleAnalyze}
              disabled={!textInput.trim()}
            >
              <AppText style={styles.submitText}>Analyze</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeLinkButton}
              onPress={() => {
                Keyboard.dismiss();
                setInputMode('voice');
              }}
            >
              <AppText style={styles.modeLink}>Use microphone instead</AppText>
            </TouchableOpacity>
          </View>
        </HomeShell>
      );
    }

    return (
      <HomeShell>
        <View style={styles.micSection}>
          <MicButton
            variant="hero"
            size={220}
            disabled={!speechAvailable}
            onPress={speechAvailable ? startFlow : undefined}
            accessibilityLabel="Record your experience"
          />
          <AppText style={styles.micHint}>Tap to start recording</AppText>
          <AppText style={styles.timer}>{formatTimer(elapsedSeconds)}</AppText>
          <TouchableOpacity
            style={styles.modeLinkButton}
            onPress={() => setInputMode('text')}
          >
            <AppText style={styles.modeLink}>Type instead</AppText>
          </TouchableOpacity>
        </View>
      </HomeShell>
    );
  }

  // ── Recording — Active mic ────────────────────────────

  if (status === 'recording') {
    return (
      <HomeShell>
        <View style={styles.micSection}>
          <MicButton
            variant="hero"
            size={220}
            recordingState="listening"
            onPress={startFlow}
            accessibilityLabel="Stop recording"
          />
          <AppText style={styles.micHint}>Listening… tap to stop</AppText>
          <AppText style={styles.timer}>{formatTimer(elapsedSeconds)}</AppText>
        </View>
      </HomeShell>
    );
  }

  // ── Transcribing / Morphing / Analyzing — unified loader ──

  if (status === 'transcribing' || status === 'morphing' || status === 'analyzing') {
    const message =
      status === 'transcribing' ? 'Transcribing' : 'Analysing';

    return (
      <View style={styles.center}>
        <AnalyzingLoader message={message} />
      </View>
    );
  }

  // ── Follow-up — Questions only, no score ──────────────

  if (status === 'followUp' && pendingQuestions.length > 0) {
    const currentQuestion = pendingQuestions[followUpIndex];

    return (
      <KeyboardAwareScreen centerContent bottomInset={120}>
        <AppText style={styles.followUpTitle}>A few quick questions</AppText>
        <AppText style={styles.followUpSubtitle}>
          Help us understand the situation before we score it.
        </AppText>
        <QuestionPrompt
          question={currentQuestion}
          onSubmit={submitAnswer}
          speechAvailable={speechAvailable}
        />
      </KeyboardAwareScreen>
    );
  }

  // ── Complete — Result ─────────────────────────────────

  if (status === 'complete' && result) {
    return (
      <ResultCard
        score={result.score}
        category={result.category}
        label={result.label}
        advice={result.advice}
        reasons={result.reasons}
        onTryAgain={handleTryAgain}
        onViewSuggestions={() =>
          router.push({
            pathname: '/breakdown',
            params: {
              label: result.label,
              advice: result.advice,
              reasons: JSON.stringify(result.reasons),
            },
          })
        }
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  homeScrollContent: {
    paddingHorizontal: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...text('xxl', 'bold', 'tight'),
    color: colors.navy,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  micSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.xl,
  },
  textModeSection: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  micHint: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  timer: {
    ...text('hero', 'bold', 'tight'),
    color: colors.navy,
    marginTop: spacing.lg,
    fontVariant: ['tabular-nums'],
  },
  modeLinkButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  modeLink: {
    ...text('sm', 'medium', 'normal'),
    color: colors.gray500,
    textDecorationLine: 'underline',
  },
  footerText: {
    ...text('sm', 'regular', 'relaxed'),
    color: colors.gray500,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  textModeLabel: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },
  textInput: {
    minHeight: 140,
  },
  submitButton: {
    backgroundColor: colors.navy,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  hint: {
    ...text('sm', 'regular', 'relaxed'),
    color: colors.gray500,
    marginTop: spacing.xl,
  },
  errorIcon: {
    fontSize: typography.sizes.hero,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...text('xl', 'semibold', 'tight'),
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.black,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  followUpTitle: {
    ...text('xl', 'bold', 'tight'),
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  followUpSubtitle: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
