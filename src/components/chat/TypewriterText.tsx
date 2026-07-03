import { useEffect, useRef, useState } from 'react';
import { AppText } from '@/components/AppText';
import type { TextStyle } from 'react-native';

interface TypewriterTextProps {
  text: string;
  /** When false, show full text immediately (history / reload). */
  animate?: boolean;
  style?: TextStyle | TextStyle[];
  speedMs?: number;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  animate = false,
  style,
  speedMs = 14,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState(() => (animate ? '' : text));
  const onCompleteRef = useRef(onComplete);
  const finishedRef = useRef(!animate);
  const textRef = useRef(text);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (textRef.current !== text) {
      textRef.current = text;
      finishedRef.current = !animate;
    }

    if (finishedRef.current) {
      return;
    }

    if (!animate) {
      setDisplayed(text);
      finishedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    setDisplayed('');
    if (!text) {
      finishedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        finishedRef.current = true;
        onCompleteRef.current?.();
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, animate, speedMs]);

  const visible = finishedRef.current ? text : displayed;

  return <AppText style={style}>{visible}</AppText>;
}
