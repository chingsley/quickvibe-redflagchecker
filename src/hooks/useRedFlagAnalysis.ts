import { useState, useCallback, useRef } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { getProvider } from '@/services/ai';
import {
  startListening,
  stopListening,
  isSpeechAvailable,
} from '@/services/speech';
import { animation } from '@/constants/theme';
import type { AnalysisState, AnalysisResult, FollowUpQuestion } from '@/types';

export { isSpeechAvailable };

interface Clarification {
  question: string;
  answer: string;
}

interface UseRedFlagAnalysisReturn {
  status: AnalysisState;
  score: number;
  result: AnalysisResult | null;
  error: string | null;
  progress: ReturnType<typeof useSharedValue<number>>;
  pendingQuestions: FollowUpQuestion[];
  followUpIndex: number;
  startFlow: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  submitText: (text: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

function hasFollowUpQuestions(result: AnalysisResult): boolean {
  return Boolean(result.followUpQuestions && result.followUpQuestions.length > 0);
}

/**
 * Central state machine:
 *   idle → recording → transcribing → morphing → analyzing → followUp → analyzing → complete
 */
export function useRedFlagAnalysis(): UseRedFlagAnalysisReturn {
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const progress = useSharedValue(0);

  const experienceRef = useRef('');
  const clarificationsRef = useRef<Clarification[]>([]);
  const isRecordingRef = useRef(false);

  const animateProgress = useCallback(
    (target: number) => {
      progress.value = withTiming(target, {
        duration: animation.loaderDuration,
      });
    },
    [progress],
  );

  const beginFollowUp = useCallback((analysisResult: AnalysisResult) => {
    setPendingQuestions(analysisResult.followUpQuestions ?? []);
    setFollowUpIndex(0);
    setScore(0);
    setResult(analysisResult);
    setStatus('followUp');
  }, []);

  const completeAnalysis = useCallback(
    (analysisResult: AnalysisResult) => {
      setScore(analysisResult.score);
      setResult(analysisResult);
      animateProgress(analysisResult.score);
      setStatus('complete');
      setPendingQuestions([]);
      setFollowUpIndex(0);
    },
    [animateProgress],
  );

  const handleAnalysisResult = useCallback(
    (analysisResult: AnalysisResult, options?: { allowFollowUp?: boolean }) => {
      if (options?.allowFollowUp !== false && hasFollowUpQuestions(analysisResult)) {
        beginFollowUp(analysisResult);
        return;
      }
      completeAnalysis(analysisResult);
    },
    [beginFollowUp, completeAnalysis],
  );

  const runFinalAnalysis = useCallback(async () => {
    setStatus('analyzing');
    setScore(0);
    progress.value = 0;

    const provider = getProvider();
    const context = clarificationsRef.current.map(
      (item) => `Q: ${item.question}\nA: ${item.answer}`,
    );

    const analysisResult = await provider.analyzeExperience(
      experienceRef.current,
      context,
      { isFinal: true },
    );

    handleAnalysisResult(analysisResult, { allowFollowUp: false });
  }, [handleAnalysisResult, progress]);

  const runInitialAnalysis = useCallback(
    async (text: string) => {
      experienceRef.current = text;
      clarificationsRef.current = [];
      setStatus('analyzing');
      setScore(0);
      progress.value = 0;

      const provider = getProvider();
      const analysisResult = await provider.analyzeExperience(text);
      handleAnalysisResult(analysisResult);
    },
    [handleAnalysisResult, progress],
  );

  const startFlow = useCallback(async () => {
    if (status === 'idle') {
      await startListening();
      isRecordingRef.current = true;
      setStatus('recording');
    } else if (status === 'recording') {
      isRecordingRef.current = false;
      setStatus('transcribing');

      try {
        const transcribedText = await stopListening();
        setStatus('morphing');
        await new Promise((r) => setTimeout(r, animation.morphDuration));
        await runInitialAnalysis(transcribedText);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        console.error('[QuickVibe] startFlow error:', message, err);
        setError(message);
        setStatus('idle');
      }
    }
  }, [status, runInitialAnalysis]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (status !== 'followUp') return;

      const currentQuestion = pendingQuestions[followUpIndex];
      if (!currentQuestion) return;

      clarificationsRef.current.push({
        question: currentQuestion.question,
        answer,
      });

      const nextIndex = followUpIndex + 1;
      if (nextIndex < pendingQuestions.length) {
        setFollowUpIndex(nextIndex);
        return;
      }

      try {
        await runFinalAnalysis();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed.';
        console.error('[QuickVibe] submitAnswer error:', message, err);
        setError(message);
        setStatus('idle');
      }
    },
    [status, pendingQuestions, followUpIndex, runFinalAnalysis],
  );

  const submitText = useCallback(
    async (text: string) => {
      if (status !== 'idle') return;
      try {
        setStatus('morphing');
        await new Promise((r) => setTimeout(r, animation.morphDuration));
        await runInitialAnalysis(text);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        console.error('[QuickVibe] submitText error:', message, err);
        setError(message);
        setStatus('idle');
      }
    },
    [status, runInitialAnalysis],
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setStatus('idle');
    setScore(0);
    setResult(null);
    setError(null);
    setPendingQuestions([]);
    setFollowUpIndex(0);
    progress.value = withTiming(0, { duration: 300 });
    experienceRef.current = '';
    clarificationsRef.current = [];
    isRecordingRef.current = false;
  }, [progress]);

  return {
    status,
    score,
    result,
    error,
    progress,
    pendingQuestions,
    followUpIndex,
    startFlow,
    submitAnswer,
    submitText,
    reset,
    clearError,
  };
}
