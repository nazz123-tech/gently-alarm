/**
 * Animation durations, in milliseconds, from `context/lock-screen-prototype.html`.
 *
 * Kept here rather than inline so the whole app moves at the same speeds — a
 * "gentle" alarm should never feel snappy.
 */

/** Cross-fade between two skies — prototype `.sky{transition:opacity .9s}`. */
export const SKY_FADE_MS = 900;

/** The chevron turning over when the countdown collapses. */
export const CHEVRON_TURN_MS = 350;

/** The slider easing back to empty after a drag that did not reach the end. */
export const SLIDE_RETURN_MS = 350;

/**
 * One half-breath of the pulsing dot in the wake window. It plays back in
 * reverse too, so a full breath takes twice this — the prototype's 4.6s.
 */
export const BREATHE_MS = 2300;
