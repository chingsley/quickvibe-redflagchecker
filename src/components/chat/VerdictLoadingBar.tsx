import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { AppText } from '@/components/AppText';
import { AnalyzingExperienceLabel } from './AnalyzingExperienceLabel';
import {
  animation,
  colors,
  getScoreColor,
  radii,
  spacing,
  text,
} from '@/constants/theme';

interface VerdictLoadingBarProps {
  targetScore: number;
  onComplete?: () => void;
}

const BAR_HEIGHT = 8;

export function VerdictLoadingBar({ targetScore, onComplete }: VerdictLoadingBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    Animated.timing(progress, {
      toValue: targetScore,
      duration: animation.loaderDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsAnalyzing(false);
        onComplete?.();
      }
    });

    return () => {
      progress.removeListener(listener);
    };
  }, [targetScore, progress, onComplete]);

  const widthInterp = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const barColor = getScoreColor(displayScore);

  return (
    <View style={styles.container}>
      {isAnalyzing ? (
        <View style={styles.labelWrap}>
          <AnalyzingExperienceLabel />
        </View>
      ) : null}
      <View style={styles.barSection}>
        <AppText style={[styles.score, { color: barColor }]}>{displayScore}</AppText>
        <View style={styles.track}>
          <Animated.View style={[styles.fillWrap, { width: widthInterp }]}>
            <View style={[styles.fill, { backgroundColor: barColor }]} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },
  labelWrap: {
    marginBottom: spacing.md,
  },
  barSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  track: {
    width: '100%',
    height: BAR_HEIGHT,
    maxHeight: BAR_HEIGHT,
    backgroundColor: colors.gray100,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fillWrap: {
    height: BAR_HEIGHT,
  },
  fill: {
    height: BAR_HEIGHT,
    borderRadius: radii.full,
  },
  score: {
    ...text('xl', 'medium', 'tight'),
    textAlign: 'right',
    alignSelf: 'stretch',
  },
});
