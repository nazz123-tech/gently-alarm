import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SLIDE_RETURN_MS, colors, textStyles } from '@/theme';

/**
 * How far along the track you have to get before letting go actually stops the
 * alarm. The prototype uses 0.78 — deliberately most of the way, so a hand
 * brushing the screen while half asleep cannot turn the alarm off.
 */
const STOP_THRESHOLD = 0.78;

/**
 * A hairline track with a round knob, the shape iOS uses for its own sliders.
 * The knob is what you aim at, so the track itself can stay this thin.
 */
const TRACK_HEIGHT = 6;
const KNOB_SIZE = 28;

type SlideToStopProps = {
  /** Called once the drag is released past the threshold. */
  onStop: () => void;
  label?: string;
};

/**
 * Drag the knob to the right to stop the alarm.
 *
 * Tracking the finger has to happen on the UI thread or the knob lags behind,
 * so the progress lives in a Reanimated shared value and the gesture updates it
 * directly. `onStop` is the only thing that crosses back to React.
 *
 * The label sits above the track rather than inside it — at 6pt there is no
 * inside to put it in.
 */
export function SlideToStop({ onStop, label = 'Slide to stop' }: SlideToStopProps) {
  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  const pan = Gesture.Pan()
    // Respond the moment a finger lands, like the prototype's pointerdown.
    .minDistance(0)
    .onBegin((event) => {
      progress.value = positionToProgress(event.x, trackWidth.value);
    })
    .onUpdate((event) => {
      progress.value = positionToProgress(event.x, trackWidth.value);
    })
    .onFinalize(() => {
      if (progress.value > STOP_THRESHOLD) {
        runOnJS(onStop)();
      }
      // Always ease back to empty — if the alarm stopped, this control is
      // about to disappear anyway, and if it did not, it should look untouched.
      progress.value = withTiming(0, { duration: SLIDE_RETURN_MS });
    });

  /** How far the knob can travel: the track, less its own width. */
  const travel = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * Math.max(0, trackWidth.value - KNOB_SIZE) }],
  }));

  // The filled part runs from the left to the middle of the knob.
  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * Math.max(0, trackWidth.value - KNOB_SIZE) + KNOB_SIZE / 2,
  }));

  // The label fades as the knob travels, but never all the way out.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.8,
  }));

  return (
    <View style={{ gap: 12 }}>
      <Animated.Text
        style={[textStyles.slideLabel, { color: colors.onSky.text, textAlign: 'center' }, labelStyle]}>
        {label}
      </Animated.Text>

      <GestureDetector gesture={pan}>
        <View
          onLayout={onLayout}
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={onStop}
          // The track is 6pt but the touch area is a comfortable one.
          hitSlop={{ top: 18, bottom: 18 }}
          style={{ height: KNOB_SIZE, justifyContent: 'center' }}>
          <View
            style={{
              height: TRACK_HEIGHT,
              borderRadius: TRACK_HEIGHT / 2,
              backgroundColor: colors.onSky.track,
              overflow: 'hidden',
            }}>
            <Animated.View
              style={[
                { height: '100%', backgroundColor: colors.onSky.trackFill },
                fillStyle,
              ]}
            />
          </View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                width: KNOB_SIZE,
                height: KNOB_SIZE,
                borderRadius: KNOB_SIZE / 2,
                backgroundColor: colors.onSky.text,
              },
              travel,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

/**
 * Where the knob should sit, as 0–1.
 *
 * The finger is measured from the middle of the knob, not the edge of the
 * track, so the knob lands under the fingertip instead of jumping half its own
 * width ahead of it. Runs on the UI thread.
 */
function positionToProgress(x: number, width: number): number {
  'worklet';
  const travel = width - KNOB_SIZE;
  if (travel <= 0) return 0;

  return Math.min(1, Math.max(0, (x - KNOB_SIZE / 2) / travel));
}
