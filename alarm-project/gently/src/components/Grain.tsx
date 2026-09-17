import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { GRAIN_OPACITY, GRAIN_PITCH } from '@/theme';

/**
 * A fine speckle laid over the sky, so a big smooth gradient does not band on
 * an OLED screen. One faint dot every 3 points.
 *
 * The prototype gets this from a repeating CSS `radial-gradient` blended with
 * `mix-blend-mode: overlay`. React Native has no blend modes, so this is an
 * SVG `<Pattern>` of dots at a low opacity instead — slightly softer than the
 * original, and the same job.
 */
export function Grain() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" opacity={GRAIN_OPACITY}>
      <Defs>
        <Pattern
          id="grain"
          width={GRAIN_PITCH}
          height={GRAIN_PITCH}
          patternUnits="userSpaceOnUse">
          <Circle cx={1} cy={1} r={0.5} fill="rgba(255,255,255,0.5)" />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#grain)" />
    </Svg>
  );
}
