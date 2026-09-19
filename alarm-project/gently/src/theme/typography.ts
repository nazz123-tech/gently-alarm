/**
 * Typography tokens, taken from `context/lock-screen-prototype.html`.
 *
 * Two families: Archivo for anything you read as a sentence, DM Mono for
 * labels, times and anything that should feel like a readout.
 *
 * One conversion to know about: CSS writes letter spacing in `em` (a multiple
 * of the font size), React Native wants plain points. So `.18em` at 11px
 * becomes `11 * 0.18 = 1.98`. Same for `line-height`: `1.55` at 15px is 23.25.
 */

import type { TextStyle } from 'react-native';

/** These strings are the keys passed to `useFonts` in `src/app/_layout.tsx`. */
export const fontFamily = {
  sans: 'Archivo_400Regular',
  sansMedium: 'Archivo_500Medium',
  sansSemibold: 'Archivo_600SemiBold',
  sansBold: 'Archivo_700Bold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

export const textStyles = {
  /**
   * The big clock at the top of the app page — `app-looklike.png`.
   * Tight tracking and a line height equal to the size, so it sits close to
   * the rule underneath it.
   */
  display: {
    fontFamily: fontFamily.sansBold,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -2,
  },
  /** Page title — prototype `h1`. */
  title: {
    fontFamily: fontFamily.sansBold,
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: -0.8,
  },
  /** Intro paragraph under a title — `.lede`. */
  lede: {
    fontFamily: fontFamily.sans,
    fontSize: 16,
    lineHeight: 24.8,
  },
  /** Default running text — prototype `body`. */
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 15,
    lineHeight: 23.25,
  },
  /** Small caps label above a title — `.eyebrow`. Render the text uppercase. */
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    letterSpacing: 1.98,
    textTransform: 'uppercase',
  },
  /** "Getting up in" over the clock — `.caplabel`. Widest tracking we use. */
  capLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    letterSpacing: 2.28,
    textTransform: 'uppercase',
  },
  /** Soundscape and time range under the clock — `.sub`. */
  sub: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 0.9,
  },
  /** Time and battery on the fake lock screen — `.statusbar`. */
  statusBar: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  /** Explanatory small print — `.hint`. */
  hint: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    lineHeight: 17.6,
  },
  /** Label on the snooze button — `.snooze`. */
  buttonLabel: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 13.5,
    letterSpacing: 0.27,
  },
  /** "Slide to stop" — `.slidelabel`. */
  slideLabel: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11.5,
    letterSpacing: 0.46,
  },
  /** The short note after the alarm stops — prototype `#extra p`. */
  note: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    lineHeight: 17,
  },
  /** Pill buttons in a row of choices — `.seg button`. */
  chipLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12.5,
  },
} as const satisfies Record<string, TextStyle>;

export type TextStyleName = keyof typeof textStyles;
