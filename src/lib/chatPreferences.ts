import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'vibemeter_show_followups_in_chat';

export async function getShowFollowUpsInChat(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem(KEY)
      : null;
    return raw === 'true';
  }
  const raw = await SecureStore.getItemAsync(KEY);
  return raw === 'true';
}

export async function setShowFollowUpsInChat(value: boolean): Promise<void> {
  const str = value ? 'true' : 'false';
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, str);
    return;
  }
  await SecureStore.setItemAsync(KEY, str);
}
