/**
 * The maths behind the rotary time picker.
 *
 * It is a 24-hour dial: one full turn is a whole day, `00:00` sits at the top,
 * and it runs clockwise. Times snap to 5 minutes, which is why the reference
 * labels the far end of the dial `23:55` and not `24:00`.
 *
 * Angles here are always degrees clockwise from the top, 0–360.
 */

export const MINUTES_PER_DAY = 24 * 60;

/** Times snap to this many minutes. */
export const SNAP_MINUTES = 5;

/** The last selectable time of the day, in minutes — 23:55. */
export const LAST_MINUTE_OF_DAY = MINUTES_PER_DAY - SNAP_MINUTES;

/** Where on the dial a time sits. */
export function minutesToAngle(minutesOfDay: number): number {
  return (minutesOfDay / MINUTES_PER_DAY) * 360;
}

/** How far around the dial a time is, as 0–1. Handy for a dashed arc. */
export function minutesToFraction(minutesOfDay: number): number {
  return minutesOfDay / MINUTES_PER_DAY;
}

/**
 * Which time a touch points at.
 *
 * `dx`/`dy` are measured from the centre of the dial, in the usual screen
 * sense where y grows downwards. `atan2(dx, -dy)` gives the angle clockwise
 * from the top: straight up is 0, right is 90.
 */
export function pointToMinutes(dx: number, dy: number): number {
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;

  // atan2 returns -180..180; the dial wants 0..360.
  const clockwise = (degrees + 360) % 360;

  return snapMinutes((clockwise / 360) * MINUTES_PER_DAY);
}

/**
 * Rounds to the nearest 5 minutes. Rounding can land exactly on a full day,
 * which is the same moment as `00:00`, so it wraps back to zero.
 */
export function snapMinutes(minutes: number): number {
  const snapped = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  return snapped % MINUTES_PER_DAY;
}

/** A point on a circle at `angle` degrees clockwise from the top. */
export function pointOnCircle(
  centre: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;

  return {
    x: centre + radius * Math.sin(radians),
    y: centre - radius * Math.cos(radians),
  };
}
