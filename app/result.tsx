import { BackgroundGradient } from '@/components/BackgroundGradient';
import { ResultCard } from '@/components/ResultCard';
import { colors, spacing, typography } from '@/constants/theme';
import { StyleSheet, View, Text } from 'react-native';

const dummyResult = {
  score: 85,
  category: 'manipulation',
  label: 'Proceed at your own detriment',
  advice: 'This situation shows concerning patterns. Consider setting boundaries and talking to someone you trust.',
  reasons: [
    'Detected love-bombing language patterns',
    'High incidence of deflection and blame-shifting',
    'Contains controlling ultimatum phrasing',
  ],
};

// Simplified view; main flow in index.tsx.
export default function ResultScreen() {
  return (
    <BackgroundGradient score={dummyResult.score}>
      <ResultCard
        score={dummyResult.score}
        category={dummyResult.category}
        label={dummyResult.label}
        advice={dummyResult.advice}
        reasons={dummyResult.reasons}
        onTryAgain={() => { }}
      />
    </BackgroundGradient>
  );
}
