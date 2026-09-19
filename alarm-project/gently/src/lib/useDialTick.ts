import { useAudioPlayer } from 'expo-audio';
import { useRef } from 'react';

/**
 * The shortest gap between two ticks, in milliseconds.
 *
 * A full turn of the dial is 288 five-minute steps, so a quick flick can cross
 * a hundred of them in half a second. Without a floor that becomes a buzz
 * rather than a row of ticks, and a hundred overlapping plays to go with it.
 * At 30ms a fast spin still sounds dense, and a careful drag is never throttled.
 */
const MIN_GAP_MS = 30;

/**
 * The click of the dial, from a wristwatch recording.
 *
 * Two files, not one: a mechanical watch alternates a tick and a tock, so
 * swapping between them sounds like a real movement rather than one sample on
 * repeat. Both are 60ms.
 */
export function useDialTick() {
  const tick = useAudioPlayer(require('@/assets/sounds/dial_tick.m4a'));
  const tock = useAudioPlayer(require('@/assets/sounds/dial_tock.m4a'));

  const playTock = useRef(false);
  const lastPlayedAt = useRef(0);

  return function playDialTick() {
    const now = Date.now();
    if (now - lastPlayedAt.current < MIN_GAP_MS) return;
    lastPlayedAt.current = now;

    const player = playTock.current ? tock : tick;
    playTock.current = !playTock.current;

    // A player that is already running has to be sent back to the start, or
    // the second tap plays nothing.
    player.seekTo(0);
    player.play();
  };
}
