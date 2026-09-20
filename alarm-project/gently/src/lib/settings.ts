import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { SOUNDSCAPES } from '@/lib/soundscapes';

/**
 * The key carries a version. If the shape of these settings ever changes,
 * bumping it starts people from fresh defaults rather than crashing on data
 * that no longer fits.
 */
const STORAGE_KEY = 'gently.settings.v1';

/** What every day starts out set to, until one is changed. */
const DEFAULT_WAKE_MINUTES = 7 * 60 + 42; // 07:42

/**
 * How long to wait after the last change before writing.
 *
 * Rolling the dial changes the time many times a second. Writing on every one
 * of those would hammer storage to save values that were true for a sixtieth
 * of a second. Each change cancels the pending write, so only the time the
 * dial actually settles on is stored.
 */
const SAVE_DELAY_MS = 400;

export type AlarmSettings = {
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  paused: boolean;
  soundscapeId: string;
  /** Soundscape level, 0–1. */
  level: number;
};

export const DEFAULT_SETTINGS: AlarmSettings = {
  wakeTimes: Array.from({ length: 7 }, () => DEFAULT_WAKE_MINUTES),
  paused: false,
  soundscapeId: SOUNDSCAPES[0].id,
  level: 0.28,
};

/**
 * Whatever came back from storage, made safe to use.
 *
 * What is on disk was written by some earlier version of this app and cannot
 * be trusted to still fit: a soundscape may have been removed since, a number
 * may have arrived as a string. Anything that does not hold up falls back to
 * its default rather than reaching the rest of the app.
 */
function sanitise(raw: unknown): AlarmSettings {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS;

  const stored = raw as Partial<AlarmSettings>;

  const wakeTimes =
    Array.isArray(stored.wakeTimes) &&
    stored.wakeTimes.length === 7 &&
    stored.wakeTimes.every((time) => typeof time === 'number' && time >= 0 && time < 24 * 60)
      ? stored.wakeTimes
      : DEFAULT_SETTINGS.wakeTimes;

  // A soundscape that no longer exists would leave the app with no sound.
  const soundscapeId = SOUNDSCAPES.some((sound) => sound.id === stored.soundscapeId)
    ? (stored.soundscapeId as string)
    : DEFAULT_SETTINGS.soundscapeId;

  const level =
    typeof stored.level === 'number' && stored.level >= 0 && stored.level <= 1
      ? stored.level
      : DEFAULT_SETTINGS.level;

  return {
    wakeTimes,
    soundscapeId,
    level,
    paused: typeof stored.paused === 'boolean' ? stored.paused : DEFAULT_SETTINGS.paused,
  };
}

/**
 * Your alarm settings, remembered between launches.
 *
 * Returns the settings, a flag for whether they have been read yet, and one
 * function to change any part of them.
 */
export function useAlarmSettings() {
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let stillMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stillMounted) return;
        if (stored) setSettings(sanitise(JSON.parse(stored)));
      })
      .catch(() => {
        // Unreadable storage is not worth failing over — the defaults work.
      })
      .finally(() => {
        if (stillMounted) setLoaded(true);
      });

    return () => {
      stillMounted = false;
    };
  }, []);

  useEffect(() => {
    // Nothing is written until the first read has finished, or the defaults
    // would be saved over whatever was already there.
    if (!loaded) return;

    const write = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    }, SAVE_DELAY_MS);

    return () => clearTimeout(write);
  }, [settings, loaded]);

  /** Change one part of the settings, leaving the rest alone. */
  function update(change: Partial<AlarmSettings>) {
    setSettings((current) => ({ ...current, ...change }));
  }

  return { settings, loaded, update };
}
