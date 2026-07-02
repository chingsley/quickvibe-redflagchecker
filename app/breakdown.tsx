import { AnalysisBreakdown } from '@/components/AnalysisBreakdown';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BreakdownScreen() {
  const router = useRouter();
  const { label, advice, reasons } = useLocalSearchParams<{
    label?: string;
    advice?: string;
    reasons?: string;
  }>();

  let parsedReasons: string[] = [];
  try {
    parsedReasons = reasons ? JSON.parse(reasons) : [];
  } catch {
    parsedReasons = [];
  }

  return (
    <AnalysisBreakdown
      label={label ?? ''}
      advice={advice ?? ''}
      reasons={parsedReasons}
      onBack={() => router.back()}
    />
  );
}
