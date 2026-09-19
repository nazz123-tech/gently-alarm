/**
 * Telling you whether the level you have picked is a sensible one.
 *
 * A number on its own does not help — "18 dB" means nothing when you are
 * setting an alarm at bedtime and cannot test it against tomorrow morning's
 * traffic. So each band gets a name and a sentence about what it will be like
 * to wake up to.
 *
 * One honest caveat, which is why nothing here claims a real-world figure: the
 * 0–40 scale comes from the reference design and is a relative level, not a
 * measured sound pressure reading. What it actually sounds like depends on the
 * phone, where it sits in the room, and the soundscape itself. Treat these as
 * a starting point to adjust from, not a calibration.
 */

export type LevelTone = 'low' | 'good' | 'high';

export type LevelAdvice = {
  label: string;
  advice: string;
  tone: LevelTone;
};

/** Where each band ends, as a fraction of the maximum. */
const BANDS: { upTo: number; value: LevelAdvice }[] = [
  {
    upTo: 0.15,
    value: {
      label: 'Very soft',
      advice: 'May not reach you over traffic, a fan, or a partner breathing.',
      tone: 'low',
    },
  },
  {
    upTo: 0.35,
    value: {
      label: 'Gentle',
      advice: 'Enough to notice without pulling you awake. A good place to start.',
      tone: 'good',
    },
  },
  {
    upTo: 0.7,
    value: {
      label: 'Clear',
      advice: 'Carries through deeper sleep. Worth trying if the gentle setting gets slept through.',
      tone: 'good',
    },
  },
  {
    upTo: 1,
    value: {
      label: 'Loud',
      advice: 'More likely to startle you than to wake you gently.',
      tone: 'high',
    },
  },
];

/** Which band a 0–1 level falls in. */
export function describeLevel(level: number): LevelAdvice {
  const band = BANDS.find(({ upTo }) => level <= upTo);

  // The last band ends at 1, so this only matters if a level above 1 arrives.
  return (band ?? BANDS[BANDS.length - 1]).value;
}
