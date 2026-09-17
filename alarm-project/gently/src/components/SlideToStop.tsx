import { Text, View, type LayoutChangeEvent } from 'react-native';
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

/** Height of the track, and therefore its corner radius. */
const TRACK_HEIGHT = 34;

type SlideToStopProps = {
  /** Called once the drag is released past the threshold. */
  onStop: () => void;
  label?: string;
};

/**
 * Drag-to-the-right to stop the alarm.
 *
 * Tracking the finger has to happen on the UI thread or the fill lags behind,
 * so the progress lives in a Reanimated shared value and the gesture updates it
 * directly. `onStop` is the only thing that crosses back to React.
 */
export function SlideToStop({ onStop, label = 'Slide to stop' }: SlideToStopProps) {
  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  const pan = Gesture.Pan()
    // Start filling the moment a finger lands, like the prototype's pointerdown.
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

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // The label fades as the fill passes under it, but never all the way out.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.8,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={onStop}
        style={{
          flex: 1,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          overflow: 'hidden',
          backgroundColor: colors.onSky.track,
          justifyContent: 'center',
        }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: colors.onSky.trackFill,
            },
            fillStyle,
          ]}
        />
        <Animated.Text
          style={[
            textStyles.slideLabel,
            { color: colors.onSky.text, textAlign: 'center' },
            labelStyle,
          ]}>
          {label}
        </Animated.Text>
      </View>
    </GestureDetector>
  );
}

/** Where the finger is, as 0–1 along the track. Runs on the UI thread. */
function positionToProgress(x: number, width: number): number {
  'worklet';
  if (width <= 0) return 0;
  return Math.min(1, Math.max(0, x / width));
}
