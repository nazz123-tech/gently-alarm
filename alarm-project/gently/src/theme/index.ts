/**
 * Design tokens for Gently, derived from `context/lock-screen-prototype.html`.
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

export { fontFamily, textStyles } from './typography';
export type { TextStyleName } from './typography';
