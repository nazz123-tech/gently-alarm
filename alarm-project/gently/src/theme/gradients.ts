/**
 * Gradient tokens, shaped for `<LinearGradient />` from `expo-linear-gradient`.
 *
 * Each one is spread straight onto the component:
 *
 *   <LinearGradient {...gradients.sky.night} style={StyleSheet.absoluteFill} />
 *
 * The prototype writes these as CSS `linear-gradient(180deg, ...)`, which means
 * top to bottom — that is the `start`/`end` pair below. CSS percentages become
 * `locations` in the 0–1 range that expo-linear-gradient expects.
 */

import type { LinearGradientProps } from 'expo-linear-gradient';

import { colors } from './colors';

/** Top to bottom, the direction every sky in the prototype runs. */
const topToBottom = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
} as const;

type Gradient = Pick<LinearGradientProps, 'colors' | 'locations' | 'start' | 'end'>;

/**
 * The three sky states of the lock screen. We cross-fade between them as the
 * wake window progresses: night while the alarm waits, dawn as it starts to
 * ring, day once the user is up.
 *
 * Each ends on a near-black band so the bottom tray stays readable.
 */
export const sky = {
  night: {
    colors: ['#0A0605', '#140A06', '#3C1A09', '#8C4416', '#C9772F', '#E9CFA8', '#1C1410'],
    locations: [0, 0.3, 0.5, 0.66, 0.78, 0.89, 1],
    ...topToBottom,
  },
  dawn: {
    colors: ['#170D08', '#4A1E0A', '#A8511A', '#E08A38', '#F6DCB4', '#201710'],
    locations: [0, 0.18, 0.46, 0.7, 0.88, 1],
    ...topToBottom,
  },
  day: {
    colors: ['#2A1809', '#8E4A18', '#EC9A46', '#F8E2BE', '#FDF6EA', '#2E2015'],
    locations: [0, 0.12, 0.38, 0.66, 0.86, 1],
    ...topToBottom,
  },
} as const satisfies Record<string, Gradient>;

/** Which sky is showing. Handy as a prop type once the screens exist. */
export type SkyState = keyof typeof sky;

/** The warm fill of the snooze button. */
export const snoozeButton = {
  colors: [colors.accent.light, colors.accent.deep],
  locations: [0, 1],
  ...topToBottom,
} as const satisfies Gradient;

export const gradients = { sky, snoozeButton } as const;
