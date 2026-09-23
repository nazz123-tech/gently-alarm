import type { Soundscape } from '@/lib/soundscapes';
import { formatDialTime } from '@/lib/time';

/**
 * The awakening cycle: five sounds rising across the wake window.
 *
 * Two things are worked out rather than stored:
 *
 * 1. **The times.** The reference wakes at 15:30 with a 30-minute window and
 *    shows steps at 15:00, 15:08, 15:15, 15:23 and 15:30 — that is just the
 *    window split evenly into four and rounded. So roll the dial and the whole
 *    cycle moves with it.
 * 2. **The two middle names.** They are the chosen soundscape, so switching
 *    from Soft Rain to Ocean turns "Rain on glass" into "Tide on sand". The
 *    first, fourth and fifth steps are the same whatever you pick.
 */

export type CycleStep = {
  /** 1-based, shown as `01`–`05`. */
  number: string;
  name: string;
  detail: string;
  /** How loud this step is, as a percentage. */
  level: number;
  /** When it happens, as `HH:mm`. */
  at: string;
};

/**
 * The shape of the cycle: how loud each beat is and what it is for. Two of the
 * names come from the soundscape, so they are filled in by `buildCycle`.
 */
const SHAPE = [
  { name: 'Soft breath', detail: 'Relaxing room tone', level: 5 },
  { name: null, detail: 'Steady, gentle texture', level: 45 },
  { name: null, detail: 'Clearer presence', level: 65 },
  { name: 'Warm tone', detail: 'Ready when you are', level: 85 },
  { name: 'Wake alarm', detail: 'Final alarm', level: 100 },
] as const;

export const CYCLE_LENGTH = SHAPE.length;

/**
 * How loud each step is, as percentages. The list the app page shows and the
 * curve the sound actually follows are the same numbers, so they cannot drift.
 */
export const CYCLE_LEVELS = SHAPE.map((step) => step.level);

/** Which steps take their name from the soundscape. */
const BED_STEP = 1;

/** The step where the chime comes in over the bed. */
export const CHIME_STEP = 2;

/** The step where the warm tone sounds. */
export const WARM_TONE_STEP = 3;

/**
 * Where a step sits in the wake window, 0 at the start and 1 at the alarm.
 *
 * The steps are evenly spaced, so this is the same division the times and the
 * level ramp use — the sounds arrive exactly where the list says they do.
 */
export function progressOfStep(index: number): number {
  return index / (CYCLE_LENGTH - 1);
}

/**
 * Which step the window is on, numbered 1 to `CYCLE_LENGTH` for showing to a
 * person. The inverse of `progressOfStep`.
 */
export function stepOfProgress(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(CYCLE_LENGTH, Math.floor(p * (CYCLE_LENGTH - 1)) + 1);
}

/**
 * Works out when each step happens and what it is called.
 *
 * The last step is the wake time itself and the first is a whole window
 * earlier, so the window is divided into `CYCLE_LENGTH - 1` equal gaps.
 */
export function buildCycle(
  wakeMinutes: number,
  windowMinutes: number,
  soundscape: Soundscape,
): CycleStep[] {
  const startsAt = wakeMinutes - windowMinutes;
  const gaps = CYCLE_LENGTH - 1;

  return SHAPE.map((step, index) => ({
    detail: step.detail,
    level: step.level,
    name: step.name ?? nameFromSoundscape(index, soundscape),
    number: String(index + 1).padStart(2, '0'),
    at: formatDialTime(startsAt + Math.round((index / gaps) * windowMinutes)),
  }));
}

function nameFromSoundscape(index: number, soundscape: Soundscape): string {
  if (index === BED_STEP) return soundscape.bed;
  if (index === CHIME_STEP) return soundscape.bedWithChime;

  // Unreachable: only those two steps have a null name in SHAPE.
  return soundscape.name;
}
