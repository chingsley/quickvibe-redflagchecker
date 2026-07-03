import { useEffect, useState } from 'react';

export const ANALYZING_LABEL = 'Analyzing your experience';
export const ELLIPSIS_FRAMES = ['', '.', '..', '...'] as const;
const ELLIPSIS_INTERVAL_MS = 400;

export function useAnalyzingEllipsis(active: boolean): string {
  const [ellipsisFrame, setEllipsisFrame] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % ELLIPSIS_FRAMES.length;
      setEllipsisFrame(frame);
    }, ELLIPSIS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [active]);

  return ELLIPSIS_FRAMES[active ? ellipsisFrame : 0];
}
