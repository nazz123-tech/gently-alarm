import { CYCLE_LEVELS } from '@/lib/cycle';

/**
 * How loud the soundscape should be at a given point in the wake window.
 *
 * The five cycle steps are evenly spaced across the window, so this walks
 * between them: at a quarter of the way through you are exactly on step two,
 * and between steps the level slides rather than jumps. That sliding is the
 * whole point — five audible jumps would be five chances to be startled.
 *
 * `progress` is 0 at the start of the window and 1 at the wake time. The
 * result is 0–1, ready to multiply by whatever ceiling the user has chosen.
 */
export function levelAt(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));

  const gaps = CYCLE_LEVELS.length - 1;
  const position = p * gaps;

  // Which two steps we are between, and how far along.
  const step = Math.min(gaps - 1, Math.floor(position));
  const between = position - step;

  const percent = CYCLE_LEVELS[step] + (CYCLE_LEVELS[step + 1] - CYCLE_LEVELS[step]) * between;

  return percent / 100;
}
