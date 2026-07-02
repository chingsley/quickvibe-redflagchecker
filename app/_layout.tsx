import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardDoneAccessory } from '@/components/keyboard';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <KeyboardDoneAccessory />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </SafeAreaProvider>
  );
}
