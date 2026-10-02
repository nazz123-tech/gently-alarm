import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

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
 * Dragging the level meter changes it many times a second. Writing on every
 * one of those would hammer storage to save values that were true for a
 * sixtieth of a second. Each change cancels the pending write, so only the
 * value it actually settles on is stored.
 */
const SAVE_DELAY_MS = 400;

export type AlarmSettings = {
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  /**
   * The one alarm that is paused, named by its date (`dayKeyOf`), or null.
   *
   * Pausing is for the next alarm only, not the whole schedule: skip tomorrow
   * and the day after still rings. Once that date has gone by this simply
   * stops matching anything, so it never needs clearing.
   */
  skippedDay: string | null;
  soundscapeId: string;
  /** Soundscape level, 0–1. */
  level: number;
};

export const DEFAULT_SETTINGS: AlarmSettings = {
  wakeTimes: Array.from({ length: 7 }, () => DEFAULT_WAKE_MINUTES),
  skippedDay: null,
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
    skippedDay:
      typeof stored.skippedDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(stored.skippedDay)
        ? stored.skippedDay
        : DEFAULT_SETTINGS.skippedDay,
  };
}

/*
 * One copy of the settings for the whole app.
 *
 * The app page and the edit screen are both on screen at once — one under the
 * other — and the edit screen's Save has to show up on the page underneath
 * straight away. With a copy per screen, the page would only find out on the
 * next launch. So the settings live here, once, and every screen subscribes.
 */

let current: AlarmSettings = DEFAULT_SETTINGS;
let loaded = false;
let loadStarted = false;
let pendingWrite: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Read what was stored, once, the first time anything asks for the settings. */
function load() {
  if (loadStarted) return;
  loadStarted = true;

  AsyncStorage.getItem(STORAGE_KEY)
    .then((stored) => {
      if (stored) current = sanitise(JSON.parse(stored));
    })
    .catch(() => {
      // Unreadable storage is not worth failing over — the defaults work.
    })
    .finally(() => {
      loaded = true;
      notify();
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

/** Change one part of the settings, leaving the rest alone. */
export function updateSettings(change: Partial<AlarmSettings>) {
  current = { ...current, ...change };
  notify();

  // Nothing is written until the first read has finished, or the defaults
  // would be saved over whatever was already there.
  if (!loaded) return;

  clearTimeout(pendingWrite);
  pendingWrite = setTimeout(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current)).catch(() => {});
  }, SAVE_DELAY_MS);
}

/**
 * Your alarm settings, remembered between launches.
 *
 * Returns the settings, a flag for whether they have been read yet, and one
 * function to change any part of them.
 */
export function useAlarmSettings() {
  const settings = useSyncExternalStore(subscribe, () => current);
  const isLoaded = useSyncExternalStore(subscribe, () => loaded);

  return { settings, loaded: isLoaded, update: updateSettings };
}
