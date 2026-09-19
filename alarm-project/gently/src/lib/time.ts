/**
 * Time formatting for the dot clock.
 *
 * The dot font only has digits and a colon, so everything here returns just
 * those characters — no "h", no "am/pm".
 */

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Seconds until the alarm, as `h:mm:ss` — the prototype's `hms()`.
 * The hour is not padded, so it reads `9:01:01`, not `09:01:01`.
 */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

/** A wall-clock time as `h:mm` — the prototype's `clock()`. */
export function formatClock(date: Date): string {
  return `${date.getHours()}:${pad(date.getMinutes())}`;
}

/**
 * Snooze time left, as `mm:ss` — the prototype shows `09:00` counting down.
 * Minutes are padded here, unlike the countdown, because it never reaches an
 * hour and `09:00` lines up better than `9:00` as the digits change.
 */
export function formatSnooze(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));

  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;

  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * A time of day for the rotary dial, as `HH:mm` on a 24-hour clock.
 * The hour is padded here — the reference shows `09:20`, not `9:20` — because
 * the digits sit in a fixed-width readout that should not jump about.
 */
export function formatDialTime(minutesOfDay: number): string {
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  return `${pad(hours)}:${pad(minutes)}`;
}
