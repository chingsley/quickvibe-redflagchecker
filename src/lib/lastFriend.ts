import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'vibemeter_last_friend_id';

export async function getLastFriendId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(KEY)
      : null;
  }
  return SecureStore.getItemAsync(KEY);
}

export async function setLastFriendId(friendId: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, friendId);
    return;
  }
  await SecureStore.setItemAsync(KEY, friendId);
}

export async function clearLastFriendId(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
