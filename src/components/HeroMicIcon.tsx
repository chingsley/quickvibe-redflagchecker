import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface HeroMicIconProps {
  size?: number;
  color?: string;
}

/** Classic microphone silhouette for the hero home-screen button. */
export function HeroMicIcon({
  size = 48,
  color = colors.white,
}: HeroMicIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
        fill={color}
      />
      <Path
        d="M19 11a7 7 0 0 1-14 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 18v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
