import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { levelAt } from '@/lib/ramp';

/**
 * One entry per soundscape. The paths have to be written out like this —
 * `require` is resolved when the app is bundled, so it cannot take a variable.
 */
const BEDS = {
  'soft-rain': require('@/assets/sounds/bed_soft-rain.m4a'),
  ocean: require('@/assets/sounds/bed_ocean.m4a'),
  forest: require('@/assets/sounds/bed_forest.m4a'),
  'dawn-chorus': require('@/assets/sounds/bed_dawn-chorus.m4a'),
  fireplace: require('@/assets/sounds/bed_fireplace.m4a'),
};

const WAKE_ALARM = require('@/assets/sounds/step_wake_alarm.m4a');

/**
 * The quietest the soundscape is allowed to get, as a share of the chosen
 * level.
 *
 * The cycle starts at 5%, and 5% of a 45% level is about 2% volume — which is
 * not "barely audible", it is silence. The ramp is rescaled to start here
 * instead, which keeps the shape of the curve and its ceiling while making the
 * opening something you could actually hear in a quiet room.
 */
const QUIETEST = 0.12;

function bedFor(soundscapeId: string) {
  return BEDS[soundscapeId as keyof typeof BEDS] ?? BEDS['soft-rain'];
}

type WakeSoundOptions = {
  soundscapeId: string;
  /** The level chosen on the app page, 0–1. The ceiling the ramp climbs to. */
  maxVolume: number;
  /** How far through the wake window, 0–1, or null when it is not running. */
  progress: number | null;
  /** True once the alarm is actually ringing. */
  ringing: boolean;
};

/**
 * The sound of waking up: a soundscape that fades up across the wake window,
 * and the alarm underneath it as a backstop.
 *
 * The two are separate players on purpose. The soundscape is the gentle part
 * and is allowed to be quiet; the alarm is the thing that has to work if the
 * gentle part did not, so it plays at full volume and ignores the ramp.
 */
export function useWakeSound({ soundscapeId, maxVolume, progress, ringing }: WakeSoundOptions) {
  const bed = useAudioPlayer(bedFor(soundscapeId));
  const alarm = useAudioPlayer(WAKE_ALARM);

  // Both loop: the soundscape runs for the length of the window, and the alarm
  // rings until it is stopped.
  useEffect(() => {
    bed.loop = true;
    alarm.loop = true;

    // An alarm that respects the mute switch is not an alarm. This is also why
    // the dial has no sound of its own — the setting is global, so a UI click
    // would have been forced to ignore the mute switch too.
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, [bed, alarm]);

  // Swapping the soundscape swaps the file under the same player.
  //
  // Skipped on the first run: `useAudioPlayer` has already loaded this exact
  // file, and replacing it on mount pulled the source out from under the
  // player before it was asked to play — which is why nothing was heard.
  const loaded = useRef(false);
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      return;
    }

    bed.replace(bedFor(soundscapeId));
  }, [bed, soundscapeId]);

  // The soundscape follows the ramp.
  useEffect(() => {
    if (progress === null) {
      bed.pause();
      return;
    }

    // Rescaled so the quietest point is QUIETEST rather than zero, and the
    // loudest is still exactly the level chosen on the app page.
    bed.volume = (QUIETEST + (1 - QUIETEST) * levelAt(progress)) * maxVolume;
    if (!bed.playing) bed.play();
  }, [bed, progress, maxVolume]);

  // The alarm is the backstop, so it is not scaled by anything.
  useEffect(() => {
    if (ringing) {
      alarm.volume = 1;
      alarm.play();
    } else {
      alarm.pause();
    }
  }, [alarm, ringing]);
}
