import { formatCountdown, formatSnooze } from '@/lib/time';
import type { SkyState } from '@/theme';

/**
 * The five things the lock screen can be doing, straight from the prototype.
 *
 *   armed   — alarm set, counting down to the wake window
 *   window  — inside the wake window, sound fading up, not ringing yet
 *   ringing — actually waking you
 *   snoozed — you tapped snooze, counting down to ringing again
 *   stopped — you are up, alarm finished
 */
export type AlarmState = 'armed' | 'window' | 'ringing' | 'snoozed' | 'stopped';

/** The alarm itself. Hard-coded until settings exist. */
export const ALARM_TIME = '7:42';
export const WAKE_WINDOW = '7:30 – 8:00';
/** How long the wake window lasts, in minutes. */
export const WAKE_WINDOW_MINUTES = 30;
export const SOUNDSCAPE = 'Soft Rain';

/**
 * Each snooze is shorter than the last, which is the whole idea — three
 * snoozes get you up rather than letting you loop forever.
 */
export const SNOOZE_SECONDS = [540, 360, 240] as const;
export const MAX_SNOOZES = SNOOZE_SECONDS.length;

/** How long the next snooze lasts, given how many you have already used. */
export function nextSnoozeSeconds(snoozesUsed: number): number {
  const index = Math.min(snoozesUsed, MAX_SNOOZES - 1);
  return SNOOZE_SECONDS[index];
}

/** Label for the snooze button, e.g. "Snooze 9 min". */
export function snoozeButtonLabel(snoozesUsed: number): string {
  return `Snooze ${nextSnoozeSeconds(snoozesUsed) / 60} min`;
}

/**
 * Everything the lock screen needs to know to draw itself.
 *
 * The lock screen is deliberately bare: the clock, one line saying what is
 * set, and the slide to stop. Choosing a sound or setting the alarm happens on
 * the app page, not here.
 */
export type ScreenContent = {
  /** The small caps line above the clock. */
  label: string;
  /** What the dot clock shows. */
  clock: string;
  /** The prototype's two clock widths. */
  clockSize: 'full' | 'small';
  /** Parts of the line under the clock, joined with a dot. */
  sub: string[];
  sky: SkyState;
  /** False once the alarm is done — there is nothing left to stop. */
  showTray: boolean;
};

type ScreenInput = {
  state: AlarmState;
  /** Seconds until the wake window opens. */
  secondsLeft: number;
  /** Seconds until the alarm rings again. */
  snoozeLeft: number;
  snoozesUsed: number;
  /** How loud the soundscape is right now, 0-100, while in the window. */
  windowLevelPercent: number;
};

/**
 * Turns the current state into what the screen should show.
 *
 * It is one `switch` returning plain objects on purpose: to change what a state
 * looks like you edit one block, and nothing else in the app has to know.
 */
export function describeScreen({
  state,
  secondsLeft,
  snoozeLeft,
  snoozesUsed,
  windowLevelPercent,
}: ScreenInput): ScreenContent {
  switch (state) {
    case 'armed':
      return {
        label: 'Getting up in',
        clock: formatCountdown(secondsLeft),
        clockSize: 'full',
        sub: [SOUNDSCAPE, WAKE_WINDOW],
        sky: 'night',
        showTray: true,
      };

    case 'window':
      return {
        label: 'Waking you gently',
        clock: ALARM_TIME,
        clockSize: 'small',
        sub: [SOUNDSCAPE, `${windowLevelPercent}%`],
        sky: 'dawn',
        showTray: true,
      };

    case 'ringing':
      return {
        label: 'Good morning',
        clock: ALARM_TIME,
        clockSize: 'full',
        sub: [SOUNDSCAPE, '16 min into your window'],
        sky: 'dawn',
        showTray: true,
      };

    case 'snoozed':
      return {
        label: 'Back in',
        clock: formatSnooze(snoozeLeft),
        clockSize: 'small',
        sub: [`Snooze ${snoozesUsed} of ${MAX_SNOOZES}`, 'each one shorter'],
        sky: 'dawn',
        showTray: true,
      };

    case 'stopped':
      return {
        label: 'Up at',
        clock: ALARM_TIME,
        clockSize: 'full',
        sub: ['7 h 12 m asleep', '16 min into the window'],
        sky: 'day',
        // Nothing left to stop, so the tray goes away entirely.
        showTray: false,
      };
  }
}
