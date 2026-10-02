import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

/**
 * How bright the screen is left while waiting for the wake window, 0–1.
 *
 * Low enough that a phone face up on the nightstand does not light the room
 * and the backlight stops being the biggest drain on the battery, but not off:
 * the countdown should still be readable if you look.
 */
const NIGHT_BRIGHTNESS = 0.03;

/** Whether the app is on screen right now, rather than locked or switched away from. */
export function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) =>
      setActive(next === 'active'),
    );
    return () => subscription.remove();
  }, []);

  return active;
}

/**
 * The lock screen left open on the nightstand.
 *
 * Keeps the phone from auto-locking, so the app stays in the foreground all
 * night and iOS has no reason to suspend it. While `dim` is set the screen is
 * turned down to almost nothing, and it comes back to where it was the moment
 * `dim` clears — which is the wake window opening, so light still rises before
 * sound.
 *
 * Brightness on iOS is the system setting, not just this app's, so it is also
 * put back whenever the app stops being active. Leaving Gently should never
 * leave the phone stuck at 3%.
 */
export function useNightScreen(dim: boolean) {
  useKeepAwake();

  const active = useAppActive();
  const shouldDim = dim && active;

  /** The brightness to go back to, read just before dimming. */
  const original = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldDim) return;

    let cancelled = false;

    Brightness.getBrightnessAsync()
      .then((level) => {
        if (cancelled) return;
        original.current = level;
        return Brightness.setBrightnessAsync(NIGHT_BRIGHTNESS);
      })
      .catch(() => {
        // Not being able to dim costs battery, not the alarm.
      });

    return () => {
      cancelled = true;
      const level = original.current;
      original.current = null;
      if (level !== null) Brightness.setBrightnessAsync(level).catch(() => {});
    };
  }, [shouldDim]);

  return active;
}
