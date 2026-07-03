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

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
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

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <AppText style={styles.title}>Welcome back</AppText>
        <AppText style={styles.subtitle}>Sign in to continue with VibeMeter</AppText>

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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          style={styles.input}
        />

        {error && <AppText style={styles.error}>{error}</AppText>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={submitting}
        >
          <AppText style={styles.buttonText}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </AppText>
        </TouchableOpacity>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <AppText style={styles.linkText}>
              Don&apos;t have an account? Sign up
            </AppText>
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
