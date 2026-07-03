import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '@/api/types';

/** Message IDs that should play the typewriter animation (newly arrived only). */
export function useAnimateMessageIds(messages: ChatMessage[]): Set<string> {
  const isInitialLoad = useRef(true);
  const prevIdsKey = useRef('');
  const [animateIds, setAnimateIds] = useState<Set<string>>(() => new Set());

  const idsKey = useMemo(
    () => messages.map((message) => message.id).join('\0'),
    [messages],
  );

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevIdsKey.current = idsKey;
      return;
    }

    if (idsKey === prevIdsKey.current) {
      return;
    }

    const previousIds = new Set(
      prevIdsKey.current ? prevIdsKey.current.split('\0') : [],
    );
    const assistantIds = messages
      .filter(
        (message) =>
          !previousIds.has(message.id) &&
          message.role === 'assistant' &&
          !message.id.startsWith('optimistic-'),
      )
      .map((message) => message.id);

    if (assistantIds.length > 0) {
      setAnimateIds((prev) => new Set([...prev, ...assistantIds]));
    }

    prevIdsKey.current = idsKey;
  }, [idsKey, messages]);

  return animateIds;
}
