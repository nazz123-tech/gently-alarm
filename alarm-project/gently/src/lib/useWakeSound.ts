import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { CHIME_STEP, WARM_TONE_STEP, progressOfStep } from '@/lib/cycle';
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

const CHIME = require('@/assets/sounds/layer_chime.m4a');
const WARM_TONE = require('@/assets/sounds/step_warm_tone.m4a');
const WAKE_ALARM = require('@/assets/sounds/step_wake_alarm.m4a');

/** Where in the window the two layers arrive — step 3 and step 4 of five. */
const CHIME_AT = progressOfStep(CHIME_STEP);
const WARM_TONE_AT = progressOfStep(WARM_TONE_STEP);

/** How much of the window the chime takes to reach full level. */
const CHIME_FADE = 0.1;

/**
 * How many times the warm tone sounds between step 4 and the alarm, and how
 * far apart.
 *
 * One note near the end was easy to sleep straight through, and easy to miss
 * entirely. A handful of them turns the last stretch into a series of nudges,
 * which is the job that step is meant to do.
 */
const WARM_TONE_REPEATS = 4;
const WARM_TONE_EVERY = (1 - WARM_TONE_AT) / WARM_TONE_REPEATS;

/**
 * Both layers as a share of the bed's current volume.
 *
 * Every file — beds and layers alike — is mastered to the same -26 dBFS, so
 * these are purely musical: the chime sits about 8 dB under the bed and the
 * warm tone about 6 dB, and both scale with the bed so they rise with the ramp
 * rather than sitting at a fixed level.
 */
const CHIME_GAIN = 0.4;
const WARM_TONE_GAIN = 0.5;

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
  /**
   * Keep the audio session open while waiting for the window.
   *
   * iOS suspends a backgrounded app that is not playing anything. Set the
   * alarm at eleven, lock the phone, and by midnight the app is asleep and
   * will not wake itself at 07:12 to start fading. Holding the soundscape
   * playing at zero volume keeps the session alive so it can.
   *
   * This is the cost of a gentle wake with the screen off: a decode running
   * all night. Nothing is audible, and the alarm remains the backstop if iOS
   * reclaims the session anyway.
   */
  holdSession: boolean;
};

/**
 * The sound of waking up: a soundscape that fades up across the wake window,
 * and the alarm underneath it as a backstop.
 *
 * The two are separate players on purpose. The soundscape is the gentle part
 * and is allowed to be quiet; the alarm is the thing that has to work if the
 * gentle part did not, so it plays at full volume and ignores the ramp.
 */
export function useWakeSound({
  soundscapeId,
  maxVolume,
  progress,
  ringing,
  holdSession,
}: WakeSoundOptions) {
  const bed = useAudioPlayer(bedFor(soundscapeId));
  const chime = useAudioPlayer(CHIME);
  const warmTone = useAudioPlayer(WARM_TONE);
  const alarm = useAudioPlayer(WAKE_ALARM);

  /** How many warm tones have sounded so far in this window. */
  const warmTonesPlayed = useRef(0);

  // Both loop: the soundscape runs for the length of the window, and the alarm
  // rings until it is stopped.
  useEffect(() => {
    bed.loop = true;
    chime.loop = true;
    alarm.loop = true;

    // An alarm that respects the mute switch is not an alarm. This is also why
    // the dial has no sound of its own — the setting is global, so a UI click
    // would have been forced to ignore the mute switch too.
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, [bed, chime, alarm]);

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

  // The soundscape follows the ramp, and the two layers ride on top of it.
  useEffect(() => {
    if (progress === null) {
      chime.pause();
      warmTonesPlayed.current = 0;

      if (holdSession) {
        // Playing, but silent: enough to keep iOS from suspending us.
        bed.volume = 0;
        if (!bed.playing) bed.play();
      } else {
        bed.pause();
      }

      return;
    }

    // Rescaled so the quietest point is QUIETEST rather than zero, and the
    // loudest is still exactly the level chosen on the app page.
    const bedVolume = (QUIETEST + (1 - QUIETEST) * levelAt(progress)) * maxVolume;
    bed.volume = bedVolume;
    if (!bed.playing) bed.play();

    // Step 3: the chime fades in over the bed and stays for the rest.
    const chimeIn = Math.min(1, Math.max(0, (progress - CHIME_AT) / CHIME_FADE));
    chime.volume = chimeIn * CHIME_GAIN * bedVolume;

    if (chimeIn > 0) {
      if (!chime.playing) chime.play();
    } else {
      chime.pause();
    }

    // Step 4: short notes rather than a layer, spaced out on the way to the
    // alarm. Counting them means a note is never repeated if the effect runs
    // twice at the same progress.
    const tonesDue = Math.min(
      WARM_TONE_REPEATS,
      Math.floor((progress - WARM_TONE_AT) / WARM_TONE_EVERY) + 1,
    );

    if (tonesDue > warmTonesPlayed.current) {
      warmTonesPlayed.current = tonesDue;
      warmTone.volume = WARM_TONE_GAIN * bedVolume;

      // `seekTo` is asynchronous. Calling `play` on the next line starts the
      // player wherever it happens to be, which after the first note is the
      // end of the file — so the note is silent. Wait for the rewind first.
      warmTone
        .seekTo(0)
        .then(() => warmTone.play())
        .catch(() => {});
    }
  }, [bed, chime, warmTone, progress, maxVolume, holdSession]);

  // The alarm is the backstop, so it is not scaled by anything.
  useEffect(() => {
    if (ringing) {
      alarm.volume = 1;

      // Rewound first, for the same reason as the warm tone: after a snooze
      // the player is paused part-way through, and resuming there would start
      // the alarm in the middle of a beep.
      alarm
        .seekTo(0)
        .then(() => alarm.play())
        .catch(() => {});
    } else {
      alarm.pause();
    }
  }, [alarm, ringing]);
}
