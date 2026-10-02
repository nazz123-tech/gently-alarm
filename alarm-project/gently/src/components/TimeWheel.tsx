import { memo, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { useDialFeedback } from '@/lib/useDialFeedback';
import { colors, textStyles } from '@/theme';

/** The wheel is far bigger than the screen; only its top edge shows. */
const RADIUS = 340;

/** How much of the wheel's top edge is visible, in points. */
const VISIBLE_HEIGHT = 120;

/** Where the wheel's rim sits below the top of the visible strip. */
const RIM_OFFSET = 12;

/** Width of the box each number is centred in. */
const LABEL_WIDTH = 44;

/** How far inside the rim the tick marks start, and how long they are. */
const TICK_INSET = 2;
const TICK_LENGTH = 10;

/**
 * How far a flick carries the wheel on, as seconds of its release speed.
 *
 * On release the wheel works out where that speed would take it, picks the
 * nearest value to there, and springs to it — one continuous movement. The
 * old way glided to a stop first and then jumped to the nearest value, which
 * read as two motions and a hitch between them.
 */
const FLICK_CARRY_SECONDS = 0.22;

/**
 * Critically damped, or a touch over, so the wheel lands on the value without
 * bouncing past it and back.
 */
const SETTLE_SPRING = { stiffness: 140, damping: 26, mass: 1 } as const;

/**
 * The numbers are drawn at the size of the one on top and shrunk away from
 * it, not drawn small and enlarged towards it. iOS rasterises text at its
 * drawn size, so enlarging it would blur exactly the number you are reading.
 */
const SMALLEST_SCALE = 0.65;

type TimeWheelProps = {
  /** How many values go round the wheel: 24 for hours, 60 for minutes. */
  count: number;
  /** Degrees between neighbouring values, `360 / count`, so the wheel wraps. */
  stepDegrees: number;
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
};

/** Wraps any whole number into `0 … count - 1`, negatives included. */
function wrap(value: number, count: number) {
  'worklet';
  return ((value % count) + count) % count;
}

/** Degrees the wheel turns for a finger moving `points` along its rim. */
function degreesFor(points: number) {
  'worklet';
  return (points / RADIUS) * (180 / Math.PI);
}

/**
 * A large wheel of numbers, seen edge-on, that you roll sideways.
 *
 * Only the top of the wheel is on screen; the value at the very top is the one
 * chosen, and a pointer above marks it. Flick it and it carries on, then
 * settles exactly on a value — it never stops between two.
 *
 * Everything that moves runs on the UI thread: the turning, and the numbers
 * brightening and growing as they near the top. React only hears about it when
 * the value at the top changes, which is also when the tap is felt. Nothing on
 * the wheel itself re-renders while it turns.
 */
export function TimeWheel({
  count,
  stepDegrees,
  value,
  onChange,
  accessibilityLabel,
}: TimeWheelProps) {
  // Turning the wheel clockwise brings smaller numbers to the top, so a value
  // sits at the top when the wheel is turned back by that many steps.
  const rotation = useSharedValue(-value * stepDegrees);

  const signalStep = useDialFeedback();

  /**
   * The last value this wheel reported itself. When it comes back as `value`
   * it is only the parent catching up, and the wheel — which may well have
   * spun on since, mid-flick — must not be turned back to it.
   */
  const lastReported = useRef(value);

  // A value set from anywhere else turns the wheel to it.
  useEffect(() => {
    if (value === lastReported.current) return;
    lastReported.current = value;
    rotation.value = withSpring(-value * stepDegrees, SETTLE_SPRING);
  }, [value, stepDegrees, rotation]);

  function reportStep(next: number) {
    lastReported.current = next;
    signalStep();
    onChange(next);
  }

  useAnimatedReaction(
    () => wrap(Math.round(-rotation.value / stepDegrees), count),
    (current, previous) => {
      if (previous !== null && current !== previous) runOnJS(reportStep)(current);
    },
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .onBegin(() => {
      // Catch a wheel that is still moving, wherever it is.
      cancelAnimation(rotation);
    })
    // Moved by each change rather than by the total since the touch began. The
    // total includes the few points the finger travels before the drag counts
    // as one, and adding those all at once made the wheel lurch as it started.
    .onChange((event) => {
      rotation.value += degreesFor(event.changeX);
    })
    .onFinalize((event) => {
      const velocity = degreesFor(event.velocityX);
      const carriedTo = rotation.value + velocity * FLICK_CARRY_SECONDS;
      const target = Math.round(carriedTo / stepDegrees) * stepDegrees;

      rotation.value = withSpring(target, { ...SETTLE_SPRING, velocity });
    });

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: value, min: 0, max: count - 1 }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(wrap(value + (event.nativeEvent.actionName === 'increment' ? 1 : -1), count))
      }>
      {/* The pointer: the value directly under it is the one chosen. */}
      <View className="items-center pb-2">
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 5,
            borderRightWidth: 5,
            borderTopWidth: 7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: colors.onSky.text,
          }}
        />
      </View>

      <GestureDetector gesture={pan}>
        <View style={{ height: VISIBLE_HEIGHT, overflow: 'hidden' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: '50%',
                top: RIM_OFFSET + RADIUS,
                width: 0,
                height: 0,
              },
              wheelStyle,
            ]}>
            <WheelNumbers count={count} stepDegrees={stepDegrees} rotation={rotation} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

type WheelNumbersProps = {
  count: number;
  stepDegrees: number;
  rotation: SharedValue<number>;
};

/**
 * Every number round the wheel. Memoised, and its props never change while
 * the wheel turns, so the parent re-rendering for a new value does not touch
 * the sixty of these.
 */
const WheelNumbers = memo(function WheelNumbers({
  count,
  stepDegrees,
  rotation,
}: WheelNumbersProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <WheelNumber key={index} index={index} stepDegrees={stepDegrees} rotation={rotation} />
      ))}
    </>
  );
});

type WheelNumberProps = {
  index: number;
  stepDegrees: number;
  rotation: SharedValue<number>;
};

/** One number and its tick, brighter and larger the nearer it is to the top. */
function WheelNumber({ index, stepDegrees, rotation }: WheelNumberProps) {
  /** How many steps this number is from the top, as a fraction. */
  const stepsFromTop = () => {
    'worklet';
    const angle = index * stepDegrees + rotation.value;
    // Into -180…180, so a number just left of the top is near, not 359° away.
    const fromTop = ((((angle + 180) % 360) + 360) % 360) - 180;
    return Math.abs(fromTop) / stepDegrees;
  };

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stepsFromTop(), [0, 1, 3], [1, 0.55, 0.3], Extrapolation.CLAMP),
  }));

  const sizeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(stepsFromTop(), [0, 1], [1, SMALLEST_SCALE], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: -LABEL_WIDTH / 2,
          top: -RADIUS,
          width: LABEL_WIDTH,
          alignItems: 'center',
          transformOrigin: [LABEL_WIDTH / 2, RADIUS, 0],
          transform: [{ rotate: `${index * stepDegrees}deg` }],
        },
        fadeStyle,
      ]}>
      <View
        style={{
          width: 1,
          height: TICK_LENGTH,
          marginTop: TICK_INSET,
          backgroundColor: colors.onSky.text,
        }}
      />
      <Animated.Text
        style={[
          textStyles.wheelSelected,
          { color: colors.onSky.text, marginTop: 6, transformOrigin: 'top' },
          sizeStyle,
        ]}>
        {String(index).padStart(2, '0')}
      </Animated.Text>
    </Animated.View>
  );
}
