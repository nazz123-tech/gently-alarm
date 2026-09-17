# Stand-up log

## Step 1: Scaffold (2026-09-16)

**Done**
- Created the Expo app in `alarm-project/gently` (Expo SDK 57, React Native 0.86, TypeScript strict, expo-router with routes in `src/app`).
- Removed the Expo example screens, components and images, plus the packages only they used (`expo-device`, `expo-image`, `expo-web-browser`, `expo-glass-effect`, `@expo/ui`).
- Tailwind through **NativeWind 4.2.7** (Tailwind 3.4): `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `src/global.css`, `nativewind-env.d.ts`, plus `css.d.ts` so TypeScript 6 accepts the CSS import.
- Fonts from the prototype, **Archivo** (400/500/600/700) and **DM Mono** (400/500), loaded in `src/app/_layout.tsx`. The splash screen stays up until they're ready. Tailwind classes: `font-sans`, `font-sans-bold`, `font-mono`, etc.
- Libraries for later steps: `dayjs`, `expo-audio` (+ `expo-asset`), `react-native-svg`, `expo-linear-gradient`.
- `app.json`: name "Gently", dark UI, background `#0A0605` (the prototype's night-sky top colour), iOS bundle id `com.gently.alarm`.
- Temporary home screen that shows Tailwind and both fonts working.
- Empty `src/components`, `src/lib`, `src/theme` folders for the next steps.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo-doctor`: 21/21 checks pass
- `npx expo export --platform ios --platform web`: both bundles build, and Tailwind classes compile (e.g. `.font-mono{font-family:DMMono_400Regular}`)

**Notes / blockers**
- Xcode isn't installed on this Mac (`xcrun simctl` is missing), so there's no iOS simulator. You can run the app now with Expo Go on your iPhone (`npm start`, scan the QR code). Xcode will be required from step 9 (AlarmKit and the Live Activity).

**Next:** step 2, design tokens (sunrise palette, gradients, typography) in `src/theme`.

## Step 2: Design tokens (2026-09-17)

**Done**
- `src/theme/palette.js` — the whole colour palette from `context/lock-screen-prototype.html` (dark values, since the app is dark-only). Plain JS on purpose: `tailwind.config.js` runs in Node and can't import TypeScript, so this one file feeds both sides and the two can't drift.
- `src/theme/colors.ts` — the typed view of that palette, for colours that have to be a prop instead of a class.
- `src/theme/gradients.ts` — the three sunrise skies (`night`, `dawn`, `day`) plus the snooze button fill, shaped so they spread straight onto `<LinearGradient {...gradients.sky.night} />`. CSS percentages converted to the 0–1 `locations` expo-linear-gradient wants; `180deg` became `start`/`end` top-to-bottom.
- `src/theme/typography.ts` — the two families and 11 text styles from the prototype. CSS `em` tracking and unitless line heights converted to the points React Native needs (e.g. `.18em` at 11px → `1.98`).
- `src/theme/index.ts` — one import point: `import { colors, gradients, textStyles } from '@/theme'`.
- `tailwind.config.js` — palette registered as NativeWind classes (`bg-surface-base`, `text-ink-primary`, `text-onSky-text/70`), plus the three tracking values.
- Replaced the step-1 placeholder screen with a token preview: the sunrise gradient behind the clock, and three chips to switch between night/dawn/day.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform web`: builds, and the palette compiles to CSS (`.bg-surface-screen`, `.text-onSky-text/70` with the right rgb values)
- Metro hot-reloaded the new screen onto the iPhone over Expo Go with no errors

**Notes / blockers**
- None. Expo login is done (`nazarism`), so the dev server shows up in Expo Go under "Development servers" without scanning the QR code.
- The prototype also has a light palette. Not ported — the app is dark-only for now, and it's a small addition to `palette.js` if that changes.

**Next:** step 3, the dot-grid digits component (`src/components`), which the locked clock is built from.

## Step 3: Dot-grid clock (2026-09-17)

**Done**
- `src/lib/dotFont.ts` — the 5x7 dot font from the prototype: digits, `:` and space. Each glyph is 7 strings of `0`/`1`. The colon is 1 column wide, not 5, so time reads `9:01` and not `9 : 01`. `glyphFor()` falls back to a space for any character we have no glyph for, so an unexpected character leaves a gap instead of crashing the clock. `columnsFor()` works out the grid width including the 1-column gaps.
- `src/components/DotClock.tsx` — draws the grid with `react-native-svg`. Both lit and unlit dots are drawn; the faint unlit ones are what make it read as a real dot-matrix display.
- `src/lib/time.ts` — `formatCountdown()` (`h:mm:ss`, hour unpadded) and `formatClock()` (`h:mm`), matching the prototype's `hms()` and `clock()`. Only characters the dot font can draw.
- `src/theme/palette.js` — added `dot.on` / `dot.off`.
- Preview screen now runs a live countdown in dots over the sunrise gradient, with a chip to collapse it to the plain alarm time (the prototype's 86% / 52% widths).

**The one thing worth explaining**
The prototype draws on a `<canvas>`: it measures the element in pixels, divides by the number of columns to get a `pitch`, then multiplies every dot position by it. The SVG version skips all of that — the `viewBox` is measured in grid cells, one unit per cell, so a dot's centre is just `(column + 0.5, row + 0.5)` and the SVG scales itself to whatever width it's given. Same picture, no pixel maths, and it stays sharp at any size.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build
- Rendered the font to ASCII in a scratch script to check the grid maths: `9:01` draws correctly and `columnsFor()` returns 19, matching the columns actually drawn. `columnsFor('')` is 0, and the component renders nothing rather than an invalid zero-width viewBox.

**Notes / blockers**
- None. The clock ticks once a second and redraws ~190 circles; smooth in Expo Go. If it ever costs too much, the fix is to redraw only the dots that changed.

**Next:** step 4, the lock-screen layout — status bar, the chevron, the sub-line and the bottom tray (slide-to-stop, mute).
