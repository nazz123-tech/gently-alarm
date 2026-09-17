/**
 * Colour tokens.
 *
 * The values live in `palette.js` so `tailwind.config.js` can read them too —
 * see the comment at the top of that file. This module is just the typed view
 * of the same object, for the places where a colour has to be a prop rather
 * than a class name.
 */

import { palette } from './palette';

export const colors = palette;

export type Colors = typeof palette;
