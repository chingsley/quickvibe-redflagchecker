import { api } from '@/api/client';
import type { Friend } from '@/api/types';
import { getLastFriendId } from '@/lib/lastFriend';

/** Pick the chat route for the last visited friend, or the most recently updated. */
export async function resolveDefaultChatPath(): Promise<string | null> {
  const { friends } = await api.listFriends();
  if (friends.length === 0) return null;

  const lastId = await getLastFriendId();
  const match = friends.find((f) => f.id === lastId);
  const friend: Friend = match ?? friends[0];

  return `/chat/${friend.id}`;
}
