import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Grain } from '@/components/Grain';
import { SKY_FADE_MS, gradients, type SkyState } from '@/theme';

type SkyBackgroundProps = {
  state: SkyState;
};

/**
 * The sunrise behind everything on the lock screen.
 *
 * All three skies are always mounted, stacked on top of each other, and we
 * cross-fade by changing opacity — the same trick the prototype uses. Night
 * sits at the bottom and never fades, so there is always something behind the
 * one fading in and the screen can never flash empty mid-transition.
 *
 * Memoised: the screens it sits behind re-render often — the edit screen on
 * every step of the wheel — and the sky only changes when its state does.
 */
export const SkyBackground = memo(function SkyBackground({ state }: SkyBackgroundProps) {
  return (
    <>
      <LinearGradient {...gradients.sky.night} style={StyleSheet.absoluteFill} />
      <FadingSky state={state} shownWhen="dawn" />
      <FadingSky state={state} shownWhen="day" />
      <Grain />
    </>
  );
});

type FadingSkyProps = {
  state: SkyState;
  /** Which state this layer belongs to. It fades in when `state` matches. */
  shownWhen: Exclude<SkyState, 'night'>;
};

function FadingSky({ state, shownWhen }: FadingSkyProps) {
  const opacity = useSharedValue(state === shownWhen ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(state === shownWhen ? 1 : 0, { duration: SKY_FADE_MS });
  }, [state, shownWhen, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
      <LinearGradient {...gradients.sky[shownWhen]} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}
