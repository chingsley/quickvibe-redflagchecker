import { StyleSheet, View, Text } from 'react-native';
import { MicButton } from '@/components/MicButton';
import { colors, spacing, typography } from '@/constants/theme';

export default function RecordingScreen() {
  return (
    <View style={styles.center}>
      <MicButton recordingState="listening" accessibilityLabel="Stop recording" />
      <Text style={styles.hint}>Listening… tap to stop</Text>
    </View>
  );
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
});
