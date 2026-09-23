/**
 * Design tokens for Gently, derived from the lock screen prototype.
 *
 * Import from here rather than the individual files:
 *
 *   import { colors, gradients, textStyles } from '@/theme';
 *
 * The colours are also registered in `tailwind.config.js`, so the same palette
 * is available as NativeWind classes (`bg-surface-base`, `text-ink-primary`).
 * Use the classes in components; use these objects when a value has to be a
 * prop instead — a gradient's `colors`, a `StatusBar` colour, an animation.
 */

export { colors } from './colors';
export type { Colors } from './colors';

export { gradients, sky, snoozeButton } from './gradients';
export type { SkyState } from './gradients';

export { GRAIN_OPACITY, GRAIN_PITCH } from './effects';

export { BREATHE_MS, CHEVRON_TURN_MS, SKY_FADE_MS, SLIDE_RETURN_MS } from './motion';

export { fontFamily, textStyles } from './typography';
export type { TextStyleName } from './typography';
