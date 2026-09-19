import { useRef } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

import {
  LAST_MINUTE_OF_DAY,
  SNAP_MINUTES,
  minutesToAngle,
  minutesToFraction,
  pointOnCircle,
  pointToMinutes,
} from '@/lib/dial';
import { formatDialTime } from '@/lib/time';
import { useDialTick } from '@/lib/useDialTick';
import { colors, textStyles } from '@/theme';

/** Everything is laid out against this one number, in points. */
const SIZE = 260;
const CENTRE = SIZE / 2;

/** Thickness of the ring, and the radius of its centre line. */
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;

/** The hairline circle the readout sits inside. */
const INNER_RADIUS = 80;

/** Twelve marks inside the ring, one every two hours. */
const TICK_COUNT = 12;
const TICK_OUTER = RADIUS - STROKE / 2 - 8;
const TICK_INNER = TICK_OUTER - 7;

const HANDLE_RADIUS = 6;

/** The full way round, used to draw the arc as a dashed circle. */
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type RotaryDialProps = {
  /** The chosen time, in minutes since midnight. */
  minutesOfDay: number;
  onChange: (minutesOfDay: number) => void;
};

/**
 * Roll the ring to choose a wake time.
 *
 * One full turn is a whole day, `00:00` at the top, running clockwise.
 *
 * The filled part of the ring is drawn as an ordinary circle with a dash
 * pattern: one dash exactly as long as the part we want filled, then a gap
 * long enough to swallow the rest. Turning it a quarter turn anticlockwise
 * moves the start of the dash from 3 o'clock up to 12 o'clock. That avoids
 * building an SVG arc path by hand.
 */
export function RotaryDial({ minutesOfDay, onChange }: RotaryDialProps) {
  const angle = minutesToAngle(minutesOfDay);
  const filled = minutesToFraction(minutesOfDay) * CIRCUMFERENCE;
  const handle = pointOnCircle(CENTRE, RADIUS, angle);

  const playDialTick = useDialTick();

  /**
   * The last time we announced.
   *
   * The dial snaps to 5 minutes, so a slow drag reports the same value dozens
   * of times in a row. Comparing against this means the tick only fires when
   * the dial really moves a step — and the parent is not asked to re-render
   * for a change that did not happen.
   */
  const lastAnnounced = useRef(minutesOfDay);

  /** Turns a touch inside the square into a time. */
  function touchToTime(x: number, y: number, isStart: boolean) {
    // A new drag can begin on a different day's time than the last one ended
    // on, so the baseline is re-read when the finger lands.
    if (isStart) lastAnnounced.current = minutesOfDay;

    const minutes = pointToMinutes(x - CENTRE, y - CENTRE);
    if (minutes === lastAnnounced.current) return;

    lastAnnounced.current = minutes;
    playDialTick();
    onChange(minutes);
  }

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => runOnJS(touchToTime)(event.x, event.y, true))
    .onUpdate((event) => runOnJS(touchToTime)(event.x, event.y, false));

  /** Arrow keys and VoiceOver's swipe up/down nudge by one step. */
  function nudge(by: number) {
    playDialTick();

    const next = minutesOfDay + by;
    if (next < 0) return onChange(LAST_MINUTE_OF_DAY);
    if (next > LAST_MINUTE_OF_DAY) return onChange(0);
    onChange(next);
  }

  return (
    <GestureDetector gesture={pan}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Wake time"
        accessibilityValue={{ text: formatDialTime(minutesOfDay) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) =>
          nudge(event.nativeEvent.actionName === 'increment' ? SNAP_MINUTES : -SNAP_MINUTES)
        }
        style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          {/* The unfilled ring. */}
          <Circle
            cx={CENTRE}
            cy={CENTRE}
            r={RADIUS}
            stroke={colors.line.strong}
            strokeWidth={STROKE}
            fill="none"
          />

          {/* Midnight up to the chosen time. */}
          <Circle
            cx={CENTRE}
            cy={CENTRE}
            r={RADIUS}
            stroke={colors.accent.base}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
          />

          <Ticks />

          {/* The hairline the readout sits in. */}
          <Circle
            cx={CENTRE}
            cy={CENTRE}
            r={INNER_RADIUS}
            stroke={colors.line.strong}
            strokeWidth={1}
            fill="none"
          />

          <Circle cx={handle.x} cy={handle.y} r={HANDLE_RADIUS} fill={colors.accent.base} />
        </Svg>

        {/* The readout, as real text so it uses the app's fonts. */}
        <View className="absolute inset-0 items-center justify-center" style={{ gap: 6 }}>
          <Text style={textStyles.eyebrow} className="text-ink-muted">
            Wake at
          </Text>
          <Text style={textStyles.title} className="text-ink-primary">
            {formatDialTime(minutesOfDay)}
          </Text>
          <Text style={textStyles.eyebrow} className="text-ink-muted">
            Roll to set
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}

function Ticks() {
  return (
    <>
      {Array.from({ length: TICK_COUNT }, (_, index) => {
        const angle = (index / TICK_COUNT) * 360;
        const outer = pointOnCircle(CENTRE, TICK_OUTER, angle);
        const inner = pointOnCircle(CENTRE, TICK_INNER, angle);

        return (
          <Line
            key={angle}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={colors.ink.muted}
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}
    </>
  );
}
