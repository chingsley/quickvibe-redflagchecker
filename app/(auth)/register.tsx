import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { AppTextInput } from '@/components/keyboard';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, text } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, user, isLoading } = useAuth();
  const [email, setEmail] = useState('chingsleychinonso@gmail.com');
  const [password, setPassword] = useState('password123!');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/" />;
  }

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <AppText style={styles.title}>Create account</AppText>
        <AppText style={styles.subtitle}>Sign up to start checking vibes</AppText>

        <AppTextInput
          variant="default"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
        />
        <AppTextInput
          variant="default"
          placeholder="Password (min 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          style={styles.input}
        />

        {error && <AppText style={styles.error}>{error}</AppText>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={submitting}
        >
          <AppText style={styles.buttonText}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </AppText>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <AppText style={styles.linkText}>Already have an account? Sign in</AppText>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...text('xxl', 'bold', 'tight'),
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...text('base', 'regular', 'relaxed'),
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  input: {
    minHeight: 52,
    marginBottom: spacing.md,
  },
  error: {
    ...text('sm', 'medium', 'normal'),
    color: colors.red,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 9999,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...text('base', 'semibold', 'normal'),
    color: colors.white,
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    ...text('sm', 'medium', 'normal'),
    color: colors.gray500,
    textDecorationLine: 'underline',
  },
});
