import * as Haptics from 'expo-haptics';
import { useRef } from 'react';

/**
 * The shortest gap between two steps that get feedback, in milliseconds.
 *
 * A fast spin crosses dozens of the 288 steps in a moment, and every one of
 * them does not need announcing — each call crosses into native code.
 */
const MIN_GAP_MS = 45;

/**
 * What the dial does when it moves a step: a tap through the Taptic Engine,
 * and nothing else.
 *
 * Deliberately silent. A click was tried here and made the dial lag, because
 * playing a file on every step is a native call the redraw ends up waiting on.
 * iOS pickers work the same way — they tap, they do not click.
 */
export function useDialFeedback() {
  const lastSignalledAt = useRef(0);

  return function signalDialStep() {
    const now = Date.now();
    if (now - lastSignalledAt.current < MIN_GAP_MS) return;
    lastSignalledAt.current = now;

    // Handed to a timer rather than run here, so the call into native code
    // cannot sit between the finger moving and the dial redrawing.
    setTimeout(() => {
      // Ignored by iOS in Low Power Mode, or if the user has turned system
      // haptics off — so this must never be the only feedback that matters.
      Haptics.selectionAsync().catch(() => {});
    }, 0);
  };
}
