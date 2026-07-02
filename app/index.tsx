import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRedFlagAnalysis, isSpeechAvailable } from '@/hooks/useRedFlagAnalysis';
import { useHapticSync } from '@/hooks/useHapticSync';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MicButton } from '@/components/MicButton';
import { CircularLoader } from '@/components/CircularLoader';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { QuestionPrompt } from '@/components/QuestionPrompt';
import { ResultCard } from '@/components/ResultCard';
import { colors, spacing, typography } from '@/constants/theme';

export default function HomeScreen() {
  const analysis = useRedFlagAnalysis();
  useHapticSync(analysis.progress);
  useSoundEffects(analysis.status);

  const {
    status, score, result, error,
    startFlow, submitAnswer, submitText, reset, clearError,
  } = analysis;

  const [textInput, setTextInput] = useState('');
  const speechAvailable = isSpeechAvailable();

  // ── Error state ──────────────────────────────────────

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Idle ──────────────────────────────────────────────

  if (status === 'idle') {
    if (speechAvailable) {
      return (
        <View style={styles.center}>
          <MicButton onPress={startFlow} accessibilityLabel="Record your experience" />
          <Text style={styles.hint}>Tap the mic to share an experience</Text>
        </View>
      );
    }
    // Text-input fallback when speech is unavailable
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Share your experience:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Type what happened..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={5}
          value={textInput}
          onChangeText={setTextInput}
        />
        <TouchableOpacity
          style={[styles.submitButton, !textInput.trim() && styles.submitDisabled]}
          onPress={() => {
            if (textInput.trim()) {
              submitText(textInput.trim());
              setTextInput('');
            }
          }}
          disabled={!textInput.trim()}
        >
          <Text style={styles.submitText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Recording — Active mic ────────────────────────────

  if (status === 'recording') {
    return (
      <View style={styles.center}>
        <MicButton
          recordingState="listening"
          onPress={startFlow}
          accessibilityLabel="Stop recording"
        />
        <Text style={styles.hint}>Listening… tap to stop</Text>
      </View>
    );
  }

  // ── Transcribing — Loading ────────────────────────────

  if (status === 'transcribing') {
    return (
      <View style={styles.center}>
        <CircularLoader progress={0} loading showScore={false} showLabel />
        <Text style={styles.hint}>Transcribing…</Text>
      </View>
    );
  }

  // ── Morphing — Mic → Ring ─────────────────────────────

  if (status === 'morphing') {
    return (
      <View style={styles.center}>
        <CircularLoader progress={25} loading showScore={false} showLabel />
        <Text style={styles.hint}>Analysing…</Text>
      </View>
    );
  }

  // ── Analyzing / FollowUp — Loader + bg shift ──────────

  if (status === 'analyzing' || status === 'followUp') {
    const currentScore = score > 0 ? score : 50;

    return (
      <BackgroundGradient score={currentScore}>
        <View style={styles.center}>
          <CircularLoader
            progress={currentScore}
            loading={status === 'analyzing' && score === 0}
            showScore
            showLabel
          />

          {status === 'followUp' && result?.followUpQuestions && (
            <QuestionPrompt
              question={result.followUpQuestions[0]}
              choices={['Yes', 'No', 'Not sure']}
              onSelect={submitAnswer}
            />
          )}
        </View>
      </BackgroundGradient>
    );
  }

  // ── Complete — Result ─────────────────────────────────

  if (status === 'complete' && result) {
    return (
      <BackgroundGradient score={score}>
        <ResultCard
          score={result.score}
          category={result.category}
          label={result.label}
          advice={result.advice}
          reasons={result.reasons}
          onTryAgain={reset}
        />
      </BackgroundGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.gray500,
    marginTop: spacing.xl,
  },
  textInput: {
    width: '85%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.gray300 || '#ccc',
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.black,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: typography.sizes.base,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.sizes.base,
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
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
