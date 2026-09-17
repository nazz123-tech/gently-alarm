/**
 * The raw palette, taken from `context/lock-screen-prototype.html`.
 *
 * This one file is the single source of truth for colour. It is plain
 * JavaScript (not TypeScript) for one reason: `tailwind.config.js` runs in
 * Node and cannot import a `.ts` file, so both sides read this instead —
 * `tailwind.config.js` turns it into NativeWind classes, and `colors.ts`
 * re-exports it with types for use in props.
 *
 * The app is dark-only (`userInterfaceStyle: "dark"` in app.json), so these are
 * the prototype's dark values. It also has a light set we can add if we ever
 * offer a light theme.
 */

const palette = {
  /** Page and card backgrounds, darkest first. */
  surface: {
    /** App background — prototype `--bg`. */
    base: '#100D0B',
    /** Cards and sheets — `--surface`. */
    raised: '#191512',
    /** Inset rows inside a card — `--surface-2`. */
    sunken: '#211C18',
    /** Behind the lock-screen sky, so nothing flashes pale while it loads. */
    screen: '#0B0806',
  },

  /** Text, brightest first — `--ink`, `--ink-2`, `--muted`. */
  ink: {
    primary: '#F4EEE6',
    secondary: '#C4B9AD',
    muted: '#918578',
  },

  /** Hairlines and dividers — `--line`, `--line-2`. */
  line: {
    strong: '#2C2620',
    soft: '#241F1A',
  },

  /** The sunrise orange the whole app is built around. */
  accent: {
    /** `--accent` */
    base: '#E8853F',
    /** Text placed on top of `accent.base` — `--accent-ink`. */
    on: '#1A1109',
    /** Tinted background for a selected chip — `--accent-wash`. */
    wash: '#331F11',
    /** Top and bottom of the snooze button gradient. */
    light: '#F0A24E',
    deep: '#D9721C',
    /** Text on the snooze button. */
    onButton: '#2A1405',
  },

  /** Status colours — `--ok`, `--warn`. */
  status: {
    ok: '#7EC8A2',
    warn: '#E0B357',
  },

  /**
   * The dot-grid clock. Every cell of the 5x7 grid is drawn, lit or unlit —
   * the faint unlit dots are what make it read as a physical display.
   */
  dot: {
    on: 'rgba(255,248,240,0.96)',
    off: 'rgba(255,255,255,0.055)',
  },

  /**
   * Controls drawn on top of the sky. Over a gradient we tint white rather
   * than use a solid, so the sunrise still reads through the control.
   */
  onSky: {
    text: '#FFFFFF',
    button: 'rgba(255,255,255,0.13)',
    buttonOff: 'rgba(255,255,255,0.07)',
    track: 'rgba(255,255,255,0.07)',
    trackFill: 'rgba(255,255,255,0.17)',
    homeBar: 'rgba(255,255,255,0.35)',
  },
};

module.exports = { palette };
