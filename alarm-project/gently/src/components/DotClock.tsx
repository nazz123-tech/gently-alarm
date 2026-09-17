import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { GLYPH_GAP, GLYPH_ROWS, columnsFor, glyphFor } from '@/lib/dotFont';
import { colors } from '@/theme';

/**
 * Dot radius as a fraction of one grid cell — the prototype's `pitch * 0.325`.
 * Under 0.5 so neighbouring dots never touch.
 */
const DOT_RADIUS = 0.325;

type DotClockProps = {
  /** What to show, e.g. `"7:42"` or `"9:01:01"`. Digits, `:` and spaces. */
  value: string;
  /** Lit dots. Defaults to the warm white from the prototype. */
  onColor?: string;
  /** Unlit dots. Defaults to a very faint white. */
  offColor?: string;
  /**
   * The clock fills the width it is given and sets its own height from the
   * grid, so size it by giving the parent (or this `style`) a width.
   */
  style?: StyleProp<ViewStyle>;
};

/**
 * The locked-screen clock, drawn as a 5x7 dot grid.
 *
 * The prototype draws this on a `<canvas>` and works out a pixel `pitch` from
 * the element width. Here the SVG `viewBox` is measured in grid cells instead —
 * one unit per cell — so a dot's centre is simply `(column + 0.5, row + 0.5)`
 * and the SVG scales itself to whatever width it is given. Same drawing, no
 * pixel maths.
 */
export function DotClock({
  value,
  onColor = colors.dot.on,
  offColor = colors.dot.off,
  style,
}: DotClockProps) {
  const { columns, dots } = useMemo(() => {
    const cells: { key: string; cx: number; cy: number; lit: boolean }[] = [];
    let column = 0;

    [...value].forEach((char, charIndex) => {
      const glyph = glyphFor(char);

      glyph.forEach((rowBits, row) => {
        [...rowBits].forEach((bit, offset) => {
          cells.push({
            key: `${charIndex}-${row}-${offset}`,
            cx: column + offset + 0.5,
            cy: row + 0.5,
            lit: bit === '1',
          });
        });
      });

      column += glyph[0].length + GLYPH_GAP;
    });

    return { columns: columnsFor(value), dots: cells };
  }, [value]);

  // An empty string has no grid to draw, and a zero-width viewBox is invalid.
  if (columns === 0) return null;

  return (
    <View style={[{ width: '100%', aspectRatio: columns / GLYPH_ROWS }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${columns} ${GLYPH_ROWS}`}>
        {dots.map((dot) => (
          <Circle
            key={dot.key}
            cx={dot.cx}
            cy={dot.cy}
            r={DOT_RADIUS}
            fill={dot.lit ? onColor : offColor}
          />
        ))}
      </Svg>
    </View>
  );
}
