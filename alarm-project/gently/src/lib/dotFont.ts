/**
 * The 5x7 dot font for the clock, copied from the lock screen prototype.
 *
 * Each glyph is 7 strings, one per row, read top to bottom. A "1" is a lit dot
 * and a "0" is an unlit one — the unlit dots still get drawn, very faintly,
 * which is what makes it look like a real dot-matrix display instead of just
 * floating dots.
 *
 * The colon is deliberately 1 column wide rather than 5, so time reads as
 * "9:01" rather than "9 : 01".
 */

/** Every glyph is 7 rows tall. Widths vary — read them off the glyph. */
export const GLYPH_ROWS = 7;

/** Blank columns inserted between two characters. */
export const GLYPH_GAP = 1;

const GLYPHS = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
  ' ': ['0', '0', '0', '0', '0', '0', '0'],
} as const satisfies Record<string, readonly string[]>;

/** The characters the dot clock can draw. */
export type DotChar = keyof typeof GLYPHS;

const SPACE = GLYPHS[' '];

/**
 * The glyph for a character. Anything we have no glyph for becomes a space,
 * so an unexpected character leaves a gap instead of crashing the clock.
 */
export function glyphFor(char: string): readonly string[] {
  return GLYPHS[char as DotChar] ?? SPACE;
}

/** How many grid columns `text` needs, including the gaps between characters. */
export function columnsFor(text: string): number {
  const chars = [...text];
  if (chars.length === 0) return 0;

  const glyphWidths = chars.reduce((total, char) => total + glyphFor(char)[0].length, 0);
  return glyphWidths + (chars.length - 1) * GLYPH_GAP;
}
