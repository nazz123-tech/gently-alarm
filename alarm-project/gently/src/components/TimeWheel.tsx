import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
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

const SNAP_MS = 220;

type TimeWheelProps = {
  /** How many values go round the wheel: 24 for hours, 60 for minutes. */
  count: number;
  /** Degrees between neighbouring values. Hours sit wider apart than minutes. */
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

/**
 * A large wheel of numbers, seen edge-on, that you roll sideways.
 *
 * Only the top of the wheel is on screen; the value at the very top is the one
 * chosen, and a pointer above marks it. Flick and it keeps turning for a
 * moment, then settles exactly on a value — it never stops between two.
 *
 * The turning happens on the UI thread. React only hears about it when the
 * value at the top actually changes, which is also when the tap is felt.
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
  const dragStart = useSharedValue(0);

  // The number on top, for highlighting. Kept here so the highlight moves the
  // moment the wheel does, not after the parent has re-rendered.
  const [atTop, setAtTop] = useState(value);
  const signalStep = useDialFeedback();

  /**
   * The last value this wheel reported itself. When it comes back as `value`
   * it is only the parent catching up, and the wheel — which may well have
   * spun on since, mid-flick — must not be turned back to it.
   */
  const lastReported = useRef(value);

  // A value set from anywhere else turns the wheel to it, rather than leaving
  // the wheel where it was.
  useEffect(() => {
    if (value === lastReported.current) return;
    lastReported.current = value;
    rotation.value = withTiming(-value * stepDegrees, { duration: SNAP_MS });
    setAtTop(value);
  }, [value, stepDegrees, rotation]);

  function reportStep(next: number) {
    lastReported.current = next;
    setAtTop(next);
    signalStep();
    onChange(next);
  }

  useAnimatedReaction(
    () => wrap(Math.round(-rotation.value / stepDegrees), count),
    (current, previous) => {
      if (previous !== null && current !== previous) runOnJS(reportStep)(current);
    },
  );

  /** Degrees the wheel turns for a finger moving `points` along its rim. */
  const degreesFor = (points: number) => {
    'worklet';
    return (points / RADIUS) * (180 / Math.PI);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .onStart(() => {
      cancelAnimation(rotation);
      dragStart.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = dragStart.value + degreesFor(event.translationX);
    })
    .onEnd((event) => {
      rotation.value = withDecay(
        { velocity: degreesFor(event.velocityX), deceleration: 0.994 },
        (finished) => {
          if (!finished) return;
          const snapped = Math.round(rotation.value / stepDegrees) * stepDegrees;
          rotation.value = withTiming(snapped, { duration: SNAP_MS });
        },
      );
    });

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const centreTop = RIM_OFFSET + RADIUS;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: atTop, min: 0, max: count - 1 }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(wrap(atTop + (event.nativeEvent.actionName === 'increment' ? 1 : -1), count))
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
                top: centreTop,
                width: 0,
                height: 0,
              },
              wheelStyle,
            ]}>
            {Array.from({ length: count }, (_, index) => {
              const selected = index === atTop;

              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: -LABEL_WIDTH / 2,
                    top: -RADIUS,
                    width: LABEL_WIDTH,
                    alignItems: 'center',
                    transformOrigin: [LABEL_WIDTH / 2, RADIUS, 0],
                    transform: [{ rotate: `${index * stepDegrees}deg` }],
                  }}>
                  <View
                    style={{
                      width: 1,
                      height: TICK_LENGTH,
                      marginTop: TICK_INSET,
                      backgroundColor: colors.onSky.text,
                      opacity: selected ? 0.9 : 0.3,
                    }}
                  />
                  <Text
                    style={[
                      selected ? textStyles.wheelSelected : textStyles.wheel,
                      { color: colors.onSky.text, opacity: selected ? 1 : 0.5, marginTop: 8 },
                    ]}>
                    {String(index).padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
