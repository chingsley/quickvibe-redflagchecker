import { useState, useCallback, useRef } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { getProvider } from '@/services/ai';
import {
  startListening,
  stopListening,
  isSpeechAvailable,
} from '@/services/speech';
import { animation } from '@/constants/theme';
import type { AnalysisState, AnalysisResult } from '@/types';

export { isSpeechAvailable };

interface UseRedFlagAnalysisReturn {
  /** Current phase of the analysis lifecycle. */
  status: AnalysisState;
  /** Final red-flag score 0–100 (populated when complete). */
  score: number;
  /** Full analysis result (populated when complete). */
  result: AnalysisResult | null;
  /** Error message if something went wrong (null when no error). */
  error: string | null;
  /** Animated progress shared value (0–100) for the CircularLoader. */
  progress: ReturnType<typeof useSharedValue<number>>;
  /** Start a new analysis flow (toggle recording / stop + process). */
  startFlow: () => Promise<void>;
  /** Submit a follow-up answer and continue analysis. */
  submitAnswer: (answer: string) => Promise<void>;
  /** Submit a text experience directly (for when speech is unavailable). */
  submitText: (text: string) => Promise<void>;
  /** Reset back to idle state. */
  reset: () => void;
  /** Clear the current error. */
  clearError: () => void;
}

/**
 * Central state machine that orchestrates the full red-flag check flow:
 *   idle → recording → transcribing → morphing → analyzing → followUp → complete
 */
export function useRedFlagAnalysis(): UseRedFlagAnalysisReturn {
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const progress = useSharedValue(0);

  // Keep track of context for follow-up questions
  const contextRef = useRef<string[]>([]);
  const isRecordingRef = useRef(false);

  const animateProgress = useCallback(
    (target: number) => {
      progress.value = withTiming(target, {
        duration: animation.loaderDuration,
      });
    },
    [progress],
  );

  const startFlow = useCallback(async () => {
    if (status === 'idle') {
      // Begin recording
      await startListening();
      isRecordingRef.current = true;
      setStatus('recording');
    } else if (status === 'recording') {
      // Stop recording and process
      isRecordingRef.current = false;
      setStatus('transcribing');

      try {
        await stopListening();

        // Simulate transcribed text (in production, results come via events)
        const transcribedText = 'User experience transcribed from speech.';

        setStatus('morphing');

        // Let morph animation play
        await new Promise((r) => setTimeout(r, animation.morphDuration));

        setStatus('analyzing');

        const provider = getProvider();
        const analysisResult = await provider.analyzeExperience(
          transcribedText,
          contextRef.current.length > 0 ? contextRef.current : undefined,
        );

        // Check for follow-up questions
        if (
          analysisResult.followUpQuestions &&
          analysisResult.followUpQuestions.length > 0
        ) {
          setStatus('followUp');
          setScore(analysisResult.score);
          setResult(analysisResult);
          animateProgress(analysisResult.score);
        } else {
          setScore(analysisResult.score);
          setResult(analysisResult);
          animateProgress(analysisResult.score);
          setStatus('complete');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        console.error('[QuickVibe] startFlow error:', message, err);
        setError(message);
        setStatus('idle');
      }
    }
  }, [status, animateProgress]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (status !== 'followUp') return;

      contextRef.current.push(answer);
      setStatus('analyzing');

      try {
        const provider = getProvider();
        const analysisResult = await provider.analyzeExperience(
          'Additional context provided.',
          contextRef.current,
        );

        if (
          analysisResult.followUpQuestions &&
          analysisResult.followUpQuestions.length > 0
        ) {
          setStatus('followUp');
          setScore(analysisResult.score);
          setResult(analysisResult);
          animateProgress(analysisResult.score);
        } else {
          setScore(analysisResult.score);
          setResult(analysisResult);
          animateProgress(analysisResult.score);
          setStatus('complete');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed.';
        console.error('[QuickVibe] submitAnswer error:', message, err);
        setError(message);
        setStatus('idle');
      }
    },
    [status, animateProgress],
  );

  const clearError = useCallback(() => setError(null), []);

  /** Shared analysis logic — send text to AI and handle follow-ups. */
  const runAnalysis = useCallback(
    async (text: string) => {
      setStatus('analyzing');
      const provider = getProvider();
      const analysisResult = await provider.analyzeExperience(
        text,
        contextRef.current.length > 0 ? contextRef.current : undefined,
      );

      if (
        analysisResult.followUpQuestions &&
        analysisResult.followUpQuestions.length > 0
      ) {
        setStatus('followUp');
        setScore(analysisResult.score);
        setResult(analysisResult);
        animateProgress(analysisResult.score);
      } else {
        setScore(analysisResult.score);
        setResult(analysisResult);
        animateProgress(analysisResult.score);
        setStatus('complete');
      }
    },
    [animateProgress],
  );

  /** Submit text directly when speech is unavailable. */
  const submitText = useCallback(
    async (text: string) => {
      if (status !== 'idle') return;
      try {
        setStatus('morphing');
        await new Promise((r) => setTimeout(r, animation.morphDuration));
        await runAnalysis(text);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        console.error('[QuickVibe] submitText error:', message, err);
        setError(message);
        setStatus('idle');
      }
    },
    [status, runAnalysis],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setScore(0);
    setResult(null);
    setError(null);
    progress.value = withTiming(0, { duration: 300 });
    contextRef.current = [];
    isRecordingRef.current = false;
  }, [progress]);

  return {
    status,
    score,
    result,
    error,
    progress,
    startFlow,
    submitAnswer,
    submitText,
    reset,
    clearError,
  };
}
