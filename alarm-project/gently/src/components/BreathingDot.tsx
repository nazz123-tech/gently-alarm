import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BREATHE_MS } from '@/theme';

/** The dot's size at each end of a breath, and how bright it gets. */
const SCALE = { in: 0.72, out: 1.25 };
const OPACITY = { in: 0.45, out: 1 };

/**
 * A single dot, slowly breathing. It shows during the wake window, when the
 * sound is fading up but the alarm is not ringing yet — the one sign the phone
 * is doing something, without being a thing you have to read.
 *
 * The animation runs one half-breath and plays it back in reverse forever, so
 * a full cycle is twice `BREATHE_MS`, matching the prototype's 4.6s.
 */
export function BreathingDot() {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: BREATHE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [breath]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: SCALE.in + breath.value * (SCALE.out - SCALE.in) }],
    opacity: OPACITY.in + breath.value * (OPACITY.out - OPACITY.in),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 3.5,
          marginTop: 14,
          backgroundColor: 'rgba(255,255,255,0.85)',
          // The warm halo around the dot. iOS only — Android has no coloured
          // glow, and the dot still reads fine there without it.
          shadowColor: '#FFD6A0',
          shadowOpacity: 0.6,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
      ]}
    />
  );
}
