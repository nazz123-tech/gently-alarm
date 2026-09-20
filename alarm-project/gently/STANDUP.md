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

## Step 4: Lock-screen layout (2026-09-17)

**Done**
- `src/components/SkyBackground.tsx` — all three skies mounted and stacked, cross-faded on opacity like the prototype. Night sits underneath and never fades, so the screen can't flash empty mid-transition.
- `src/components/Grain.tsx` — the fine speckle over the gradient, so a big smooth sunrise doesn't band on an OLED screen.
- `src/components/IconButton.tsx` — the round translucent button both the chevron and the mute button are built on.
- `src/components/icons.tsx` — chevron and the two speaker icons, exact paths from the prototype. Small enough to keep inline instead of adding an icon library.
- `src/components/CollapseButton.tsx` — swaps the running countdown for the plain alarm time; the arrow turns over.
- `src/components/MuteButton.tsx` — mutes the soundscape without stopping the alarm.
- `src/components/SubLine.tsx` — the "Soft Rain · 7:30 – 8:00" line with the small dot separator.
- `src/components/SlideToStop.tsx` — drag to the right to stop.
- `src/theme/motion.ts` and `src/theme/effects.ts` — the animation durations and the grain values, so nothing is hard-coded in a component.
- `src/app/_layout.tsx` — added `GestureHandlerRootView` at the root. expo-router does not provide one and the drag needs it.
- `src/app/index.tsx` — the pieces assembled into the real layout.

**Three decisions worth knowing**
1. **No fake status bar, dynamic island or home indicator.** The prototype draws a phone mock inside a browser, so it has to fake those. On a real phone iOS draws them itself — rebuilding them would mean two status bars on top of each other. `SafeAreaView` keeps our content clear of them instead.
2. **The drag is tracked on the UI thread.** Progress lives in a Reanimated shared value that the gesture writes to directly, so the fill follows the finger instead of lagging a frame behind. Only `onStop` crosses back into React.
3. **Stopping needs 78% of the track**, straight from the prototype — far enough that a hand brushing the screen half asleep can't silence the alarm.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean, no warnings (iOS is now 1749 modules, up from 1570 — that's gesture-handler and reanimated coming in)
- Confirmed against the v57 docs that `babel-preset-expo` wires up the Reanimated plugin automatically, so `babel.config.js` needs no change

**Not verified**
- Nothing here has been seen running. There is no iOS simulator on this Mac and the dev server is in your terminal, so the gesture feel, the cross-fade timing and the grain are all compile-checked only — they need your eyes on the phone.

**Two knowing differences from the prototype**
- The "Slide to stop" label does not have the shimmer sweeping across it. That's a CSS `background-clip:text` animation with no cheap React Native equivalent; it fades as the fill passes under it instead, which is what the prototype itself falls back to under reduced motion.
- The buttons don't blur what's behind them (`backdrop-filter`). That needs `expo-blur`, which isn't installed — the white tint reads cleanly enough over a gradient. Easy to add later if you want it.

**Next:** step 5, the alarm state machine — armed, wake window, ringing, snoozed, stopped — including the breathing dot and the snooze button.

## Step 5: Alarm states (2026-09-17)

**Done**
- `src/lib/alarm.ts` — the five states (`armed`, `window`, `ringing`, `snoozed`, `stopped`), the alarm constants, and `describeScreen()`.
- `src/components/BreathingDot.tsx` — the slow pulsing dot during the wake window.
- `src/components/SnoozeButton.tsx` — the warm pill under the clock while ringing.
- `src/lib/time.ts` — added `formatSnooze()` (`mm:ss`).
- `src/theme/` — added `BREATHE_MS` and a `note` text style.
- `src/app/index.tsx` — now holds the state, one ticker, and what the buttons do. Nothing else.

**How it's kept simple**
`describeScreen()` is one `switch` that returns a plain object — label, clock, clock size, sub-line, sky, and whether the chevron and tray show. To change how a state looks you edit one block and nothing else in the app needs to know. The screen file just reads that object, so there are no `state === 'ringing' ? ... : ...` chains scattered through the layout. The switch has no `default` on purpose: because every case returns, adding a sixth state becomes a compile error instead of a silently blank screen.

There is one ticker for the whole screen, not one per state, and it only runs in the two states that actually count down.

**Two bugs found and fixed while writing it**
- Jumping straight to `snoozed` from the state picker bounced instantly back to `ringing`, because the snooze clock was still at zero and the "snooze finished" check fired immediately. `goTo()` now puts time on the clock on the way in.
- After three snoozes the sub-line read "Snooze 4 of 3". The count is capped now. The prototype has the same bug.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean, no warnings

**Not verified**
- Again, not seen running — no simulator here. Worth checking on the phone: that the snooze countdown reaches zero and rings again, that all five states look right, and that the breathing dot's glow shows up (it uses an iOS-only coloured shadow).

**Note**
- The state picker row is still temporary scaffolding, same as the prototype's row of buttons under the phone. It comes out once alarms can really be scheduled.

**Next:** step 6, the alarm setup screen — the rotary time picker from `context/Gradual-Awakening-Rotary-Awakening-Setup-2.png`.

## Step 6: Rotary time picker (2026-09-17)

**Done**
- `src/lib/dial.ts` — the dial maths. It is a 24-hour dial: one full turn is a day, `00:00` at the top, running clockwise, snapping to 5 minutes (which is why the reference labels the end `23:55`, not `24:00`).
- `src/components/RotaryDial.tsx` — the ring, the twelve tick marks, the handle and the readout. Drag anywhere on it to set the time.
- `src/app/setup.tsx` — a new route holding the picker and the card around it: the title, the "30 min" chip, the line about five sounds, and the `00:00 / 24 hour dial / 23:55` footer.
- `src/lib/time.ts` — added `formatDialTime()` (`HH:mm`, hour padded so the readout does not jump about).
- `src/app/index.tsx` — a temporary "set alarm" chip to reach the new screen.

**How it's kept simple**
The filled part of the ring is not a hand-built SVG arc path. It is an ordinary circle with a dash pattern: one dash exactly as long as the part that should be filled, then a gap long enough to swallow the rest, turned a quarter turn anticlockwise so the dash starts at the top instead of at 3 o'clock. Two numbers and a rotation, no arc flags.

Turning a touch into a time is one line: `atan2(dx, -dy)` gives the angle clockwise from the top, and the rest is a ratio.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean
- Checked the maths in a scratch script before building the component: the four compass points give `00:00 / 06:00 / 12:00 / 18:00`, 15:30 lands on 232.50° (which is where the handle sits in the reference), and all 288 five-minute steps round-trip from time to angle and back exactly.

**Needs a decision: the two references disagree on colour**
`lock-screen-prototype.html` is warm — sunrise orange `#E8853F` on a brown-black. This rotary reference is cold — crimson red on a neutral near-black, with a much more technical, instrument-panel feel. They are two different design languages.

I built the dial in the app's existing sunrise palette so it matches everything already there. If the red was the intended direction, that is a palette change rather than a rebuild — the dial reads its colours from `colors.accent`, so it is a small edit to `src/theme/palette.js`.

**Not verified**
- Not seen running. Worth checking the drag feels right, and that 260pt is a good size for the dial on your phone.

**Note**
- The chosen time only lives on the setup screen. Sharing it with the lock screen needs somewhere for settings to live (React context, a store, or straight to Supabase), which is a decision worth making deliberately rather than in passing.

**Next:** step 7, either wiring settings so the two screens share one alarm, or the awakening cycle list from the same reference.

## Step 6a: Slide-to-stop contrast (2026-09-17)

**Done**
- `src/theme/palette.js` — widened the gap between the slide track and its fill after you tested it on the phone. The prototype uses `0.07` against `0.17`, only 0.10 of alpha apart; the fill is now `0.32` against a `0.06` track, so it is about five times the track rather than twice it. The reason is written next to the values so nobody "fixes" them back to the prototype's numbers later.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export`: builds clean
- Only `SlideToStop.tsx` reads these two colours, so nothing else changed appearance.

**Note**
- If it still reads too faint while actually waking up, the next thing to try is a bright leading edge on the fill rather than pushing the whole fill brighter — it shows where the drag has got to without making the control shout.

## Step 7: One app page, bare lock screen (2026-09-17)

Restructure after your note that choosing a sound and setting the alarm belong on one page, not on the lock screen.

**Routes changed**
- `src/app/index.tsx` is now the app page — everything you set, in the order of `context/app-looklike.png`.
- `src/app/lock.tsx` is the lock screen. It was `index.tsx`.
- `src/app/setup.tsx` is gone; the rotary dial folded into the app page.
- Deleted `CollapseButton.tsx` and `MuteButton.tsx`. Both are in git history if mute ever comes back to the lock screen.

**Lock screen, stripped**
Left: the sunrise sky, the dot clock, the one line saying what is set, the breathing dot while the sound rises, the snooze pill while ringing, and slide-to-stop. Removed: the collapse chevron, the mute button, and the dev state picker. `describeScreen()` lost its `collapsed`, `muted` and `showChevron` fields as a result, so it is shorter than it was.

**App page, top to bottom**
- `AppHeader` — badge, name, 24h chip, and a dot that lights when an alarm is set.
- `NowBlock` — the date, a real live clock, and "a gentle start" with the seconds.
- `NextAwakening` — the next alarm and a switch to pause it without losing it.
- `WakeProgression` — a three-beat summary of the window.
- `WakeTimePicker` — the rotary dial from step 6, now in its card.
- `AwakeningCycle` — the five sounds that rise.
- `WakeSchedule` — the coming week, a day selectable.
- `Atmosphere` — the soundscape picker and a draggable level bar.
- Plus `SectionHeader`, `Toggle` and `LevelMeter` as shared pieces, and the extra icons.

**Two things that fell out nicely**
1. **No store needed.** The open question from step 6 was where settings should live so two screens could share them. Since it is one page, plain `useState` in `index.tsx` covers it — the dial, the cycle, the week and the progression strip all read the same number.
2. **The cycle is derived, not stored.** The reference wakes at 15:30 with a 30-minute window and lists steps at 15:00, 15:08, 15:15, 15:23, 15:30. That is exactly the window split into four and rounded, which I checked before writing the code. So `buildCycle()` works the times out from the wake time and rolling the dial moves the whole cycle, the progression strip and the schedule with it. Nothing can drift out of step because there is only one number.

**A bug found and fixed**
`LevelMeter` held its measured width in a plain local variable. Setting the level re-renders the component and `onLayout` only fires when the layout actually changes, so the width would have been back to zero by the second drag and the bar would have gone dead after one touch. It is a ref now, with the reason written next to it.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean
- Confirmed the derived cycle times match the reference exactly before building the component

**Adapted rather than copied**
- The reference is branded "Gradual / Awakening — Bedroom Unit 01". The layout is theirs, the name is ours.
- The reference crams the wake progression into one row where labels wrap mid-word. Three even columns here instead.
- The reference shows a different wake time per day in the week list. Per-day times are a real feature, not a layout change, so every row shows the one time the dial is set to for now.
- Still the sunrise palette, not the reference's crimson. That question from step 6 is still open.

**Not verified**
- Not seen running. The app page is long, so the things to check are the scroll and spacing, whether the dial is comfortable to roll mid-page, and whether the level bar is easy enough to hit.

**Next:** step 8, real audio — `context/sounds/` is waiting, and you have three ZapSplat candidates picked out.

## Step 7a: Slimmer slider, and opening the app after stopping (2026-09-18)

**Done**
- `src/components/SlideToStop.tsx` — track height 34 → 24. The fill carries the feedback now, so the bar itself does not need the bulk.
- `src/app/lock.tsx` — once the alarm is stopped, the finished screen holds for 5 seconds and then the app page opens.

**One decision**
It navigates with `replace`, not `push`. If it pushed, a back swipe would land on the lock screen of an alarm that is already finished — a dead screen with a countdown that no longer means anything. Replacing removes it from the history instead.

The timer is cleared if the screen goes away first, so leaving early cannot fire a navigation into a screen that is no longer there.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean

**Worth a look on the phone**
- Whether 24pt is the right thinness, or it now reads as too easy to catch by accident. The stop threshold is still 78% of the track, so the distance to drag has not changed.
- The five seconds are silent — the screen says "Up at 7:42" and then the app appears without warning. If that feels abrupt, a line like "opening Gently…" would fit under the sub-line, at the cost of one more thing on a screen you wanted bare.

## Step 7b: iOS-thin slider, and saying what happens next (2026-09-18)

**Done**
- `src/components/SlideToStop.tsx` — rebuilt as a hairline track with a round knob, the shape iOS uses for its own sliders. Track 24 → 6pt, with a 28pt knob.
- `src/app/lock.tsx` — "Opening Gently…" now sits under the sub-line once the alarm is stopped, so the jump to the app page is announced rather than sprung.

**What changed in the slider, and why**
- **The label moved above the track.** At 6pt there is no inside to put it in. It still fades as the knob travels.
- **The knob is the thing you aim at.** A 6pt bar is too thin to grab; a 28pt knob is not. The track can be a hairline because nothing asks you to hit it.
- **The touch area did not shrink with the track.** There is 18pt of `hitSlop` above and below, so the target stays roughly 44pt tall even though it looks like 6.
- **The finger is measured from the middle of the knob**, not the edge of the track. Without that the knob jumps half its own width ahead of the fingertip the moment you touch it.
- **Stopping still needs 78% of the travel**, unchanged. The control looks lighter; it is not easier to trigger by accident.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean

**Not verified**
- Not seen running. The thing to feel for is whether the knob stays under your thumb the whole way across — that is the part that is easy to get subtly wrong and impossible to see in a build log.

## Step 8: A time per day, level guidance, cycle follows the sound (2026-09-18)

Three features, before the audio goes in.

### 1. A different wake time for each day
- Times are stored **one per weekday, not one per date** (`wakeTimes[0]` is Sunday), so the week repeats: set Monday once and every Monday is set. That is how an alarm clock behaves, and it means the list never needs filling in again next week.
- Tap a day in the schedule to select it; the dial then edits that day and leaves the rest alone.
- `nextAlarmAt()` is no longer "today or tomorrow" — it walks forward day by day and returns the first alarm still ahead. It checks eight days rather than seven, so today's weekday coming round again is always a valid answer and the function can never fail to find one.
- The day being edited is named in the section heading **and** above the dial. The dial sits a long way down a scrolling page, and a time picker that does not say what it is setting is a good way to change the wrong day's alarm.
- The awakening cycle follows the day you are **editing**, not the next alarm — it is there to explain what the alarm you are setting will do. "Next awakening" at the top still shows the genuinely next one.

### 2. Guidance on the level
- `src/lib/level.ts` — four bands, each with a name and a sentence: **Very soft** ("may not reach you over traffic, a fan, or a partner breathing"), **Gentle** ("a good place to start"), **Clear** ("worth trying if the gentle setting gets slept through"), **Loud** ("more likely to startle you than to wake you gently").
- Shown under the level bar, green in the middle of the range and amber at both ends, because both ends are a problem.
- **Written down in the file, and worth repeating:** the 0–40 "dB" scale comes from the reference design. It is a relative level, not a measured sound pressure reading — what it actually sounds like depends on the phone, where it sits in the room, and the soundscape. The wording avoids claiming any real-world figure. Once real audio is in, this is worth revisiting against how the files actually sound.

### 3. The cycle follows the atmosphere
- Each soundscape now names the two middle steps of the cycle: Soft Rain gives "Rain on glass" and "Rain + chime", Ocean gives "Tide on sand" and "Tide + chime", and so on for all six.
- Steps 1, 4 and 5 ("Soft breath", "Warm tone", "Wake alarm") are the same whatever you pick, so only two strings per soundscape were needed rather than thirty.
- Switching the atmosphere now visibly changes the cycle list and the progression strip above it.

**Cleanup**
Removed `IconButton.tsx` and five icons that nothing used any more (the collapse chevron, the month arrows, the plus, the muted speaker). The month arrows and the plus were both dead controls that did nothing when tapped — with a weekly repeating schedule, month navigation has nothing to navigate. All in git history.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean
- Checked `nextAlarmAt` against a week with three different times (Mon 06:30, weekdays 07:42, weekend 09:00): Friday evening correctly gives Saturday 09:00, and Sunday evening correctly rolls to Monday 06:30 rather than stopping at the weekend time.

**Not verified**
- Not seen running. Worth checking that selecting a day and rolling the dial feels connected given the distance between the two on screen — that is the part most likely to need a layout change rather than a logic one.

**Next:** audio, once the files land in `context/sounds/`.

## Step 8a: Two sections merged into one (2026-09-18)

You spotted that "wake progression" and "awakening cycle" were the same thing shown twice — the strip was just the first, middle and last of the list below it. They are one section now.

**Done**
- `WakeProgression.tsx` rewritten as the single section. Deleted `AwakeningCycle.tsx`.
- Everything the cycle had and the strip did not: all five steps instead of three, the numbered circles, the detail line under each name, the level percentage, and the last step picked out in colour as the alarm proper.
- **Added, from neither:** a small bar on each row showing how loud that step is. That is what the strip was really for — seeing the sound rise — and now you get it without reading a single number, across all five steps rather than three.
- Moved it below the dial, since it explains what the dial just set.

**Cleanup**
Removed `SpeakerIcon`, `SunriseIcon` and `WavesIcon`, which only the old three-beat strip used. `icons.tsx` is down to `MoonIcon`. All in git history if the icons are wanted back.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios --platform web`: both bundles build clean
- The page is now seven sections: header, now, next awakening, set awakening (dial), wake progression, wake schedule, atmosphere.

**Not verified**
- Not seen running. The level bars are the new part — worth checking they read as a rise down the list rather than as clutter next to the percentages. If they compete, dropping the percentage and keeping the bar is the better trade.

## Step 9: Sound assets, and the first audio in the app (2026-09-19)

### The files
Eight MP3s arrived in `context/sounds/`. Processed with `afconvert` and `afinfo`
(both built into macOS) plus numpy — no ffmpeg, no CloudConvert. Output is in
`context/sounds/edited/`.

**Five beds trimmed and crossfade-looped**, exported to M4A/AAC:

| Bed | Length | Seam after |
| --- | --- | --- |
| soft-rain | 170.2s | 0.2 dB |
| ocean | 88.6s | 0.9 dB |
| forest | 81.4s | 1.0 dB |
| summer-storm | 188.1s | 0.6 dB |
| dawn-chorus | 141.3s | 0.5 dB |

**What actually fixed the seams was not what I predicted.** I expected MP3
encoder padding to be the problem. It was not: the big mismatches were the
recordings' own fade-ins and fade-outs. Trimming 0.08–1.22s off the ends took
the dawn chorus from 16.1 dB to 9.8 and the storm from 24.2 to 3.9; the
crossfade then finished the job. Worth remembering for the remaining files —
trim first, and only crossfade what is still wrong.

Also worth recording: the dawn chorus file has **LOOP** in its own filename and
arrived with a 16 dB seam. A title is not a measurement.

### Held back
- **Fireplace** — 35s with a 14.5 dB spit at 6.8s. Looping it turns a random
  fire into a metronome. Needs a longer recording, not processing.
- **Warm tone and wake alarm** — still to download. Two files, not one; the warm
  tone never arrived either.

### The dial tick — the first sound the app actually plays
- `assets/sounds/dial_tick.m4a` and `dial_tock.m4a`, 60ms each, cut from a
  wristwatch recording whose transient decays to -40 dB in 6ms.
- `src/lib/useDialTick.ts` — plays them alternately. A mechanical watch has a
  tick and a tock; swapping between them sounds like a movement rather than one
  sample on repeat.
- `RotaryDial` fires it on each 5-minute step.

**Three things in there worth knowing:**
1. **It is a one-shot per step, not a loop.** An earlier attempt made a 2-second
   looping tick, which was wrong: a loop runs at its own tempo no matter how
   fast your thumb moves. The rate has to come from the gesture.
2. **The rate is re-spaced, not resampled.** Speeding a tick up by resampling
   raises its pitch and turns a wristwatch into a toy. The transients are placed
   at a new spacing instead, so each one is exactly as recorded.
3. **The tick only fires on a real change, and that fixed a performance bug too.**
   The dial snaps to 5 minutes, so a slow drag reported the same value dozens of
   times in a row. Each of those called `onChange`, and the parent's handler
   builds a new array with `.map()` — a new object every time, so React
   re-rendered the whole page for a change that had not happened. Comparing
   against the last announced value stops both the audio spam and the renders.

A 30ms floor between ticks caps a fast flick, which would otherwise cross a
hundred of the 288 steps in half a second and buzz.

### Checks
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds; both audio files confirmed in the
  bundle by MD5 (they are stored hash-named with no extension, so searching for
  `*.m4a` in `dist` finds nothing and proves nothing).

### Not verified
- How any of it sounds. The seams are measured, not heard; the tick has never
  been played. Both need the phone.

### One wart to revisit
`expo-audio` defaults to `playsInSilentMode: true`, so the dial tick will click
even with the phone muted. That default is right for the alarm and wrong for a
UI sound, and the setting is global — so when the alarm audio lands, the two
will need separating.

**Next:** the alarm audio itself — the beds looping under the wake window with
the level ramp the progression already describes.

## Step 9a: The dial was lagging (2026-09-19)

Three separate things were compounding, none of which showed up in a build log.

**1. The thread crossing happened on every frame.**
The "has it actually changed?" check lived inside the JavaScript function, so
every single pan event — 60 to 120 a second — woke the JS thread just to be
told nothing had changed. `pointToMinutes` and `snapMinutes` are worklets now,
the check runs on the UI thread with the gesture, and JavaScript is only woken
when the dial really moves a step.

**2. `onChange` was not throttled at all.**
A quick flick crosses roughly seventy of the 288 steps in a third of a second —
about 240 `setState` calls a second, each one rebuilding the week array and
re-rendering the page. Nothing can draw that fast, so the handle fell behind
the finger. Updates handed to React are now capped at one per frame (16ms).
The value the finger *stops* on is always delivered on release, so throttling
cannot lose the final time.

**3. The page re-rendered every second for a clock.**
`now` lived on the page and ticked once a second, which re-rendered everything —
including `nextAlarmAt` (up to eight date objects) and `weekFrom` (seven more).
Fifteen date objects a second, before anyone touched the dial.
- `NowBlock` keeps its own timer now. It is the only thing that shows seconds.
- The page ticks every 30 seconds instead, which is plenty for a countdown
  measured in minutes.
- `AppHeader`, `NowBlock` and `Atmosphere` are memoised, so they sit still while
  the dial turns.
- `weekFrom` is memoised on the date, so the week is not rebuilt per step.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds clean

**Not verified**
- Whether it actually feels better. This needs the phone.

**If it still lags, the next lever is a bigger one.** The arc and the handle are
drawn from React state, so they can never move sooner than React re-renders.
Driving them from shared values instead would let them track the finger on the
UI thread and leave React to catch up with the text. That is the proper fix and
a more invasive one, which is why the cheap three went first.

## Step 9b: Reverted the UI-thread gesture (2026-09-19)

The 9a change crashed the app the moment the dial was touched. Reverted the
part that could have caused it, kept the rest.

**Reverted**
- `dial.ts` — `pointToMinutes` and `snapMinutes` are plain functions again, no
  `'worklet'`.
- `RotaryDial` — the gesture callbacks contain nothing but `runOnJS(...)` again,
  which is the shape that worked. No shared-value writes and no cross-module
  worklet calls on the UI thread.

**Kept, because none of it can touch a gesture**
- The 16ms throttle, moved to the JavaScript side. React still cannot be asked
  to render faster than the screen, and the value the finger stops on is still
  delivered on release via `onFinalize`.
- The change gate, so a drag does not re-render for values that did not change.
- `NowBlock` keeping its own once-a-second timer; the page ticks every 30s.
- `AppHeader`, `NowBlock` and `Atmosphere` memoised; `weekFrom` memoised on the
  date.

**Cause: not yet known.** Two hypotheses were checked and both were wrong — the
`'worklet'` directives were correctly placed as the first statement, and Babel
did workletize both functions. What was genuinely new in 9a was running real
worklet logic *inside* the gesture callbacks, where before they only called
`runOnJS`: a cross-module worklet call, shared-value writes and `Date.now()`.
Worth knowing before retrying: Reanimated 4 moved worklets into the separate
`react-native-worklets` package, so the API here is not the Reanimated 3 one
most examples assume.

**Do not retry this without the crash text.** Guessing at it costs more than
the lag does.

## Step 9c: Making the dial tick cheaper (2026-09-19)

The dial still lagged after 9b, and the suspicion was the sound. The timing
supports it: the lag appeared in the same step the tick was wired.

The mechanism is plausible. `playDialTick` calls `seekTo(0)`, which is a call
into the native audio player, and it ran *before* `onChange` — so every step
paid for a native round-trip before React was even told the value had moved.

**Three changes**
1. **The dial moves first, the click follows.** `onChange` now runs before
   `playDialTick` in `announce`.
2. **The audio is handed to a timer** rather than run inline, so `seekTo` cannot
   sit between the finger moving and the dial redrawing. The sound is allowed
   to be a frame late; the dial is not.
3. **The minimum gap went from 30ms to 55ms** — about eighteen ticks a second
   instead of thirty-three, so a third fewer native calls. A fast spin still
   sounds like a dense run of clicks, and a careful drag is never throttled.

**And a switch.** `TICK_ENABLED` at the top of `useDialTick.ts`. Whether the
sound is what makes the dial lag is a question best answered by turning it off
and dragging, not by reasoning about it — especially after 9a, where reasoning
about the cause produced a crash.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

**If silencing it fixes the lag, the better answer is probably haptics.**
`expo-haptics` `selectionAsync()` exists for exactly this — the detent feedback
iOS uses in its own pickers. It is far cheaper than playing a file, and it
behaves correctly with the silent switch, which the dial tick currently does
not (see the note in step 9). The wristwatch recording would then be spare,
or kept as an option alongside.

## Step 9d: Haptics instead of a sound file (2026-09-19)

Added `expo-haptics` (~57.0.3) and moved the dial's detent feedback onto it.

**Done**
- `src/lib/useDialTick.ts` is now `src/lib/useDialFeedback.ts`. It calls
  `Haptics.selectionAsync()` — the method the docs name for exactly this, and
  what iOS uses in its own pickers.
- Two independent switches at the top of the file: `HAPTICS_ENABLED` (on) and
  `SOUND_ENABLED` (off). The wristwatch files stay in `assets/sounds/`; turn
  the sound back on if you want both.
- Minimum gap between signalled steps is 45ms, covering both.
- The feedback is still handed to a timer rather than run inline, for the same
  reason as before: both haptics and audio cross into native code, and that
  work must not sit between the finger moving and the dial redrawing.

**Why this is the better answer than cheaper audio**
It costs far less than playing a file, and it behaves correctly with the mute
switch — which the sound did not. That wart from step 9 is gone rather than
worked around.

**One thing it cannot do**
iOS ignores haptics in Low Power Mode, when the user has turned system haptics
off, and while the camera or dictation is running. So haptics must never be the
only feedback that matters — fine for a dial, where the number moving is the
real feedback, but worth remembering before using them anywhere load-bearing.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds clean, 1783 modules

**Left alone on purpose**
`expo-doctor` now reports patch drift on four packages (`expo`, `expo-asset`,
`expo-constants`, `expo-router`), surfaced by the install and unrelated to
haptics. Not bumped: changing four dependencies while measuring a performance
problem would add variables to the measurement. `npx expo install --check`
fixes it whenever the dial is settled.

## Step 9e: Sound back on, diagnosis confirmed (2026-09-19)

Silencing the dial made it smooth, which settles it: **the sound was the cause
of the lag**, not the render path. The bigger fix that was on the table —
driving the arc and handle from shared values so they never wait for React — is
not needed, and the crash in 9a was chasing the wrong thing entirely.

**Done**
- `SOUND_ENABLED` back to true. The click plays alongside the haptics.

The path it runs down now is much cheaper than the one that caused the problem:
45ms between steps rather than 30, handed to a timer rather than run inline,
and fired after the dial redraws rather than before. Roughly a third of the
native calls, none of them blocking the redraw.

**If the lag comes back, flip `SOUND_ENABLED` to false first.** Haptics carry
the detent on their own — that has now been felt on the device, not assumed.
The next lever after that is decoupling the two rates, so the haptic fires on
every step and the sound only on every second or third one.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 9f: Softening the dial click (2026-09-19)

The click was too sharp. Measuring it said why, and changed the fix.

**What the tick actually is**

| band | share of energy |
| --- | --- |
| below 2 kHz | 1.1% |
| 2–8 kHz | 27.8% |
| above 8 kHz | 71.1% |

Spectral centroid 9,024 Hz. It is almost pure sizzle with no body at all.

**So a plain low-pass was the wrong tool.** Cutting the top of a sound that has
nothing underneath leaves near-silence, not a thock. What works is pitching it
*down* first — that moves the energy it already has into the low end — and then
rolling off what remains up top.

**Three variants**, in `context/sounds/edited/`:

| variant | pitch | low-pass | centroid | length |
| --- | --- | --- | --- | --- |
| original | 1.00x | — | 9,024 Hz | 60ms |
| `soft` | 1.00x | 5 kHz | 5,231 Hz | 60ms |
| `softer` | 0.60x | 6 kHz | 5,052 Hz | 80ms |
| `dull` | 0.45x | 4 kHz | 3,709 Hz | 80ms |

`softer` is installed. Note that `soft` lands at almost the same brightness as
`softer` but without the pitch change — which is exactly the trap above: it
reads thinner because low-passing took energy away instead of moving it.

Each variant also gets a 1ms fade-in, which takes the edge off the attack, and
peak stays at -6 dBFS so the change is tone and not level.

**Swapping**, from `alarm-project/gently`:

    cp ../context/sounds/edited/dial_tick_dull.m4a assets/sounds/dial_tick.m4a
    cp ../context/sounds/edited/dial_tock_dull.m4a assets/sounds/dial_tock.m4a

**One thing to watch**: the pitched variants are 80ms against a 45ms minimum
gap. Two players alternate, so each is reused every 90ms and just clears — but
if the gap is ever shortened, they will start overlapping.

**Checks**
- `npx expo export --platform ios`: builds clean

## Step 9g: Dial sound dropped (2026-09-19)

Neither the original click nor the softened versions worked against a haptic.
Dropped rather than tuned further.

**Done**
- `useDialFeedback` is haptics only — about fifteen lines instead of sixty. No
  audio players, no tick/tock alternation, no sound switch.
- Removed `assets/sounds/dial_tick.m4a` and `dial_tock.m4a` from the app.
- iOS bundle went 1783 to 1771 modules: the audio player code is no longer
  pulled in by the dial.

**Kept**
- `expo-audio` stays a dependency. Nothing in `src` imports it now, but the
  soundscape beds need it next.
- The recordings and every variant stay in `context/sounds/edited/`, in case
  the decision is ever revisited.

This is also what iOS pickers do: they tap, they do not click.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 9h: Dial click removed entirely (2026-09-19)

**Deleted**
- The eight click variants in `context/sounds/edited/` (`dial_tick*`, `dial_tock*`).
- The wristwatch source MP3 in `context/sounds/`.
- The remaining comment in `useDialFeedback` pointing at recordings that no
  longer exist.

The app assets and the audio code went in 9g, so nothing in `src` referenced
any of this by the time it was deleted.

**Deliberately kept, despite matching a search for "tick"**
- `Ticks()` in `RotaryDial` — the twelve marks drawn around the dial face. A
  visual, nothing to do with sound.
- The `setInterval` timers in `index.tsx`, `lock.tsx` and `NowBlock.tsx`, whose
  variable is called `tick`.
- `dial.ts`, `DotClock.tsx` — named for the dial and the clock, not the click.
- Haptics. They are the replacement for the click rather than part of it, and
  they are what made the dial smooth.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

**Meanwhile, the remaining sounds arrived.** `context/sounds/` now holds all
nine: a replacement fireplace (`nature_fire_burning_crackle_fireplace.mp3`,
swapped for the 35-second one with the spit), the warm tone
(`..._game_sound_chime_warm_soft_mallet_start_up_tone_...`) and the wake alarm
(`..._alarm_clock_beeps_...`). None processed yet.

## Step 10: The remaining sounds, and a correction (2026-09-19)

All nine assets now exist in `context/sounds/edited/`.

**New this round**
- `bed_fireplace` — the replacement recording, 69s instead of 35s. The old one
  put a 14.5 dB spit on a 35-second cycle, which made a random fire sound like
  a metronome. Trimmed and crossfaded to 65.5s.
- `layer_chime` — the wind chimes, trimmed and crossfaded into an 8.7s loop.
- `step_warm_tone` — 2.57 seconds of silence cut off the end, which is what you
  asked for a while back. 4.7s down to 2.1s.
- `step_wake_alarm` — cut to eleven whole beep cycles so it can ring
  continuously. It is the backstop, so it has to repeat until stopped rather
  than play once.

**A correction to step 9.** I reported the five beds as fixed with "seams under
1 dB". That measurement was wrong — or rather, it measured the wrong thing. It
compared the *level* either side of the join, and a click can survive a perfect
level match: the levels agree while the waveform still jumps.

Measuring the actual sample-to-sample step at the wrap found five of eight loops
would click, including three beds already committed. Worst was `bed_forest`,
where the jump was **2 dB louder than the average signal**.

Every loop has been rebuilt with its first and last sample faded to silence over
4ms, which makes the join continuous by construction rather than by luck.

| loop | wrap, before | after (measured on the AAC) |
| --- | --- | --- |
| bed_soft-rain | -7.1 dB | -21.9 dB |
| bed_ocean | -28.1 dB | -21.4 dB |
| bed_forest | **+2.0 dB** | -26.5 dB |
| bed_summer-storm | -34.0 dB | -25.2 dB |
| bed_dawn-chorus | -7.4 dB | -27.2 dB |
| bed_fireplace | -21.1 dB | -35.4 dB |
| layer_chime | **-0.6 dB** | -48.7 dB |
| step_wake_alarm | -5.3 dB | -44.0 dB |

Relative to the signal, so lower is better. Worst case went from a step louder
than the audio to one about twelve times quieter than it.

**It is not mathematically zero, and that is expected.** The ends are silent
before encoding; AAC is lossy, so the decoder does not reconstruct exactly zero.
The residue is encoder error rather than a bad cut, and at -21 dB under a
soundscape playing at 45% it should not be audible. Worth confirming by ear on
the quietest bed.

**Lesson worth keeping:** verify on the file that actually ships, not the
intermediate. The same mistake in step 9 was searching `dist` for `*.m4a` when
assets are stored hash-named.

**Next:** wiring the beds to the wake window with the level ramp.

## Step 11: The beds wired to the wake window (2026-09-19)

The soundscape now actually plays and actually fades up.

**Done**
- All nine assets copied into `assets/sounds/`.
- `src/lib/ramp.ts` — `levelAt(progress)`. The five cycle steps sit evenly
  across the window, so this walks between them: a quarter of the way through
  is exactly step two, and between steps the level slides rather than jumps.
  Five audible jumps would be five chances to be startled.
- `src/lib/cycle.ts` — exports `CYCLE_LEVELS`, so the list the app page shows
  and the curve the sound follows are the same numbers and cannot drift.
- `src/lib/useWakeSound.ts` — two players. The soundscape loops and follows the
  ramp up to the level chosen on the app page; the alarm loops at full volume
  and ignores the ramp, because it is the backstop.
- `src/app/lock.tsx` — walks the window and plays it. The sub-line shows the
  real level now instead of a hard-coded "12%".
- The settings reach the lock screen as route parameters on the link, so no
  store or context was needed for this.

**Audio mode**: `playsInSilentMode` and `shouldPlayInBackground` are both on. An
alarm that respects the mute switch is not an alarm. This is also the reason the
dial ended up silent — the setting is global, so a UI click would have been
forced to ignore the mute switch too.

**Two things worth knowing**

1. **The window runs in a minute here, not thirty.** `DEMO_WINDOW_SECONDS` in
   `lock.tsx`. The curve is identical; only the clock is shorter. Waiting half
   an hour to hear whether a fade works is not a test anyone runs twice.
2. **The lock screen could not reach the wake window at all.** It starts armed
   and only moves on snooze or stop, so the sound could never have fired. It
   now accepts a state on the link, and the app page has a "Preview wake" link
   beside "Lock screen" that opens it straight into the window.

**Not wired: `layer_chime` and `step_warm_tone`.** They are steps 3 and 4 of the
cycle as *layers* over the bed, and what is built here is a single bed fading
up. They are in `assets/sounds/` but nothing requires them, so Metro correctly
leaves them out of the bundle — seven of the nine files ship, which is right.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds clean, and all seven referenced
  audio files confirmed in the bundle by MD5

**Not verified**
- Nothing has been heard. Whether the fade feels gentle, whether the loop seams
  are audible under it, and whether the alarm is loud enough to do its job all
  need the phone.

## Step 12: The lock screen runs on the real clock (2026-09-19)

You set an alarm for the current time and the lock screen still said "getting
up in 9 hours", then "7:42". Both were literally hard-coded:
`secondsLeft = 32461` and `ALARM_TIME = '7:42'`. Nothing connected the lock
screen to the time you set, or to the clock.

**Done**
- `alarm.ts` — `ALARM_TIME`, `WAKE_WINDOW` and `SOUNDSCAPE` are gone.
  `describeScreen` takes the alarm time, the window and the soundscape name as
  inputs. There are no invented values left in it — the "7 h 12 m asleep" line
  on the stopped screen has gone too, since nothing tracks sleep.
- `lock.tsx` rewritten around **one number**: `alarmAt`, a timestamp handed
  over by the app page. The countdown, the window, which state the screen is
  in, and how loud the soundscape is are all worked out from that against the
  real clock.
- `index.tsx` computes the next alarm with `nextAlarmAt` and puts it on the
  link, so the app page and the lock screen can no longer disagree.

**The state now follows the clock**, rather than being set by hand:

    stopped                      -> stopped
    snoozing, and not up yet     -> snoozed
    past the alarm time          -> ringing
    inside the wake window       -> window
    otherwise                    -> armed

**Preview still works.** Opening with a `state` on the link forces that state,
and the window runs over a minute instead of thirty so the fade can be heard.
The moment you snooze or stop, the forced state is dropped and the screen goes
back to following the clock — otherwise it would be stuck in whatever it was
opened into.

**Checked against the clock at 12:43:**

| alarm set for | state | clock shows | window |
| --- | --- | --- | --- |
| 2 minutes away | window | 12:45 | 12:15 – 12:45, level 96% |
| 20 minutes away | window | 13:03 | 12:33 – 13:03, level 52% |
| 9 hours away | armed | 9:00:00 counting down | 21:13 – 21:43 |

Worth knowing: the wake window is 30 minutes, so **any alarm set less than half
an hour ahead means you are already inside the window** — the soundscape starts
immediately, partway up the ramp. That is correct behaviour, and it is also the
quickest way to test it for real.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 12a: Nothing played, and why (2026-09-19)

Two separate faults behind "no sound at the start of the window".

**1. The player had its source pulled out from under it.**
`useAudioPlayer(bedFor(soundscapeId))` loads the file, and then the effect that
handles swapping soundscapes also ran on mount and called `replace()` with the
same file — before anything was asked to play. It now skips its first run, so
`replace` only happens when the soundscape actually changes.

**2. Even working, the opening was inaudible.**
The cycle starts at 5% and the chosen level was 45%. Those multiply: 5% of 45%
is about **2% volume**. The intent was "barely audible"; the result was silence.

The ramp is rescaled so its quietest point is 12% of the chosen level rather
than zero. The shape of the curve and its ceiling are unchanged:

| progress | volume before | after |
| --- | --- | --- |
| 0% | 2.3% | **7.4%** |
| 25% | 20.3% | 23.2% |
| 50% | 29.3% | 31.1% |
| 100% | 45.0% | 45.0% |

**3. "Preview wake" renamed to "Test fade · 1 min".**
The old label did not say what it did. The two links are:
- **Lock screen** — the alarm that is actually set, running off the clock.
- **Test fade · 1 min** — the same fade compressed from thirty minutes into
  one. It exists only because the quiet opening is otherwise impossible to
  judge without sitting through half an hour of it.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 12b: Turning the soundscapes down (2026-09-19)

Rain and ocean read as hiss rather than water once they get loud.

**I measured before changing anything, and the measurement said I was wrong.**
The obvious guess was too much high frequency, to be fixed with a shelf. The
spectra say otherwise:

| bed | centroid | energy above 4 kHz |
| --- | --- | --- |
| ocean | **828 Hz** | **1.8%** |
| summer-storm | 1,652 Hz | 9.6% |
| forest | 1,985 Hz | 14.6% |
| soft-rain | 2,349 Hz | 15.2% |
| fireplace | 2,301 Hz | 22.7% |
| dawn-chorus | 3,511 Hz | 40.3% |

Ocean is the darkest bed of the six and rain is mid-pack, while the dawn chorus
— which nobody has complained about — is by far the brightest. So this is not
excess treble waiting to be filtered. Water and wind are *broadband*: they have
no pitch or rhythm to hold onto, so past a certain level any of them reads as
static. That is inherent, and the only lever is level. No EQ applied.

**Done**
- Default level 0.45 to **0.28** (18 dB to 11 dB on the reference's scale).
- The guidance bands in `level.ts` moved down with it:

| band | was | now |
| --- | --- | --- |
| Very soft | below 0.15 | below 0.10 |
| Gentle | 0.15–0.35 | 0.10–0.30 |
| Clear | 0.35–0.70 | 0.30–0.50 |
| Loud | above 0.70 | above 0.50 |

- The "Loud" advice now names the actual failure: broadband soundscapes turn to
  hiss up there.

**Worth recording:** those bands were invented from reasoning in step 8, and the
file said so at the time. Listening on a phone moved every one of them. The old
thresholds called 18 dB "clear, carries through deeper sleep" — it is hiss. The
caveat written into that file has been extended rather than quietly dropped.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 13: A genuinely soft rain, and matching the beds (2026-09-19)

**The new Soft Rain is in.** `biiansu_spaces_rain_Far_From_Window`, 1:58 looped.
It is a different sound from the one it replaces:

| | old (medium heavy, on a roof) | new (far from a bedroom window) |
| --- | --- | --- |
| spectral centroid | 2,371 Hz | **633 Hz** |
| energy above 4 kHz | 15.6% | **2.0%** |
| loud moments | 2.9 dB above median | none at all, across 1,211 windows |

Dark, indoor, and completely even — which is what the soundscape's own subtitle,
"fine rain on a quiet window", was always asking for.

**I also did something that was not asked for, because the data demanded it.**
Dropping the new file in revealed that the beds were never level-matched: they
spanned **26.2 dB**, from fireplace at -47.4 dBFS to the old rain at -21.2.
Switching soundscape lurched in volume, and the new rain — recorded 25 dB
quieter than the one it replaced — would have been inaudible.

All six were rebuilt from source and matched to -26 dBFS. The spread is now
**9.8 dB**.

**Measuring loudness by median was wrong** and had to be changed. Fire is mostly
quiet with sharp crackles, so the median reads the gaps between them: it said
fireplace needed +16 dB when its peaks were already at -1.4 dBFS. Energy RMS
weights the crackles properly.

**Fireplace still sits 9.8 dB below the rest, and that is the right answer.**
Its peaks are already at the ceiling, so reaching the target needs 16 dB of
limiting — which would flatten the crackles into a roar and destroy the only
thing that makes it sound like a fire. Beds may lean on the limiter by at most
6 dB (`MAX_LIMIT_DB`); fireplace uses all of it and stops there. Forest and dawn
chorus also lean on it and do reach the target.

**Checks**
- Every loop re-verified on the encoded AAC, not the intermediate. All wraps
  "ok" or better; the worst is the new rain at -16 dB below its own signal,
  which is the one to listen for since that bed is so quiet and smooth.
- `npx expo export --platform ios`: builds clean

**Still open**
- Whether Summer Storm works now that Soft Rain is genuinely soft. It read as a
  near-duplicate before; against a light indoor recording it should read as a
  storm. Worth judging before deciding to drop it.

## Step 13a: Summer Storm dropped (2026-09-19)

**Deleted**
- The entry in `soundscapes.ts` and the `require` in `useWakeSound.ts`.
- `assets/sounds/bed_summer-storm.m4a`, the copy in `context/sounds/edited/`,
  and the raw source MP3.

Five soundscapes remain: Soft Rain, Ocean, Forest, Dawn Chorus, Fireplace. All
five beds confirmed in the bundle by MD5. No trace of "summer" left anywhere in
`src` or `assets`.

**Note:** `zapsplat_nature_rain_medium_heavy_roof_and_trees_constant_112798.mp3`
is now orphaned too — it was the old Soft Rain, replaced by the bedroom-window
recording. Left in place rather than deleted unasked; it is gitignored either
way, so it costs nothing but disk.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 14: The chime and warm tone layers (2026-09-19)

The cycle has always described five steps; until now the sound was one bed
fading up. Steps 3 and 4 are real now, and every asset in `assets/sounds/` is
referenced.

**Where they land**, derived from `progressOfStep` in `cycle.ts` rather than
typed in — the same division the times and the level ramp already use, so the
sounds arrive exactly where the list on the app page says they do:

| step | progress | minute | level | what happens |
| --- | --- | --- | --- | --- |
| 01 | 0.00 | 0 | 5% | soundscape alone, barely there |
| 02 | 0.25 | 8 | 45% | soundscape settling in |
| 03 | 0.50 | 15 | 65% | **chime fades in over it** |
| 04 | 0.75 | 23 | 85% | **warm tone sounds once** |
| 05 | 1.00 | 30 | 100% | alarm joins |

**The chime loops, the warm tone does not.** The chime is a layer that stays for
the rest of the window, fading in over a tenth of it rather than appearing. The
warm tone is a single note — it plays once and is flagged so it cannot repeat,
and the flag is cleared when the window ends.

**Both layers had to be turned down, and the figure is measured rather than
guessed.** Both files sit about 4 dB hotter than the beds, which were matched to
-26 dBFS. Left alone they would have played over the top of the soundscape
instead of inside it. The chime now sits about 8 dB under the bed and the warm
tone about 6 dB, and both scale with the bed's current volume so they rise with
everything else rather than being fixed.

**The soundscape no longer stops when the alarm starts.** Ringing passed
`progress: null`, which paused the bed and the chime — so four steps of not
startling anybody ended with the sound cutting out and a beep. Ringing now holds
the ramp at the top and the alarm joins it, which is what step 5 of the list
describes.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds clean, and all eight audio files
  confirmed in the bundle by MD5 — nothing is unreferenced any more

**Not verified**
- Whether the chime is at the right level against each bed, and whether the warm
  tone reads as "ready when you are" or as an interruption. The numbers put them
  where they should be; only listening can say whether they belong there.

## Step 15: expo-doctor green, and the warm tone repeats (2026-09-19)

**expo-doctor: 21/21.** `npx expo install --fix` brought `expo` to ~57.0.24,
`expo-asset` to ~57.0.17, `expo-constants` to ~57.0.18 and `expo-router` to
~57.0.22 — the patch drift parked back in step 9d, held while the dial lag was
being diagnosed so the measurement was not polluted. That diagnosis is long
finished, so it is cleared.

**The warm tone was mostly nothing.** The file ran 2.12s but only the first
0.55s was audible; the rest was decay below hearing. Recut from the source to
**0.71s** — one lossy generation, not two — and mastered to -26 dBFS.

**It now sounds four times instead of once**, between step 4 and the alarm:

| | progress | minute | in the 1-minute preview |
| --- | --- | --- | --- |
| 1st | 0.750 | 22.5 | 45s |
| 2nd | 0.813 | 24.4 | 49s |
| 3rd | 0.875 | 26.3 | 53s |
| 4th | 0.938 | 28.1 | 56s |
| alarm | 1.000 | 30.0 | 60s |

A single note near the end was easy to sleep through and easy to miss entirely.
Four turns the last stretch into a series of nudges, which is the job that step
was always described as doing. The count is tracked rather than a flag, so a
note is never repeated if the effect runs twice at the same progress.

**One reference for everything.** The chime was re-mastered to -26 dBFS too, so
beds and layers now share a single level. Before this, the layer gains in code
were doing two jobs at once — correcting each file's own level *and* setting how
far under the bed it sits. They are purely musical now: chime 8 dB under the
bed, warm tone 6 dB, both scaling with the ramp.

**Checks**
- `npx expo-doctor`: 21/21, `npx tsc --noEmit`: passes
- `npx expo export --platform ios`: builds clean, all eight audio files in the
  bundle by MD5

## Step 15a: Two sounds that never played (2026-09-19)

Four warm tones were scheduled and two were heard, and the alarm never arrived
at 100%. Two separate faults.

**1. The preview had no ending.** Opening with `state=window` forces that state,
and forcing it never stopped — progress reached 1.0 and simply held there, so
`ringing` was never true and the alarm never fired. The thing the entire ramp
builds towards could not happen in the one mode built for hearing the ramp. The
preview now moves to `ringing` when it reaches the end of the window.

Worth noting this was only ever broken in preview. A real alarm reaches
`ringing` from the clock, which was working.

**2. `seekTo` is asynchronous and I treated it as if it were not.**

    warmTone.seekTo(0);   // a promise, not yet done
    warmTone.play();      // starts from wherever the player still is

The first note played because the player was already at the start. Every note
after that found the player sitting at the end of the file, so `play()` resumed
from the end and produced silence. Which notes survived depended on timing,
which is why it was two rather than a consistent number.

Both the warm tone and the alarm now wait for the rewind before playing. The
alarm had the same latent fault: after a snooze its player is paused part-way
through, so resuming would have started it in the middle of a beep.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 16: The lock screen was pinned to "armed" (2026-09-19)

Setting an alarm inside the next half hour and opening the lock screen showed a
countdown and played nothing, when the wake window had already started.

**The cause was the link, not the lock screen.** The "Lock screen" link passed
`state: 'armed'`, and that parameter *forces* a state — it exists so "Test fade"
can jump into the window. Forcing "armed" overrode everything the lock screen
works out from the clock. The lock screen itself was right all along; it was
never being allowed to decide.

The link no longer passes a state. "Test fade" still does, because skipping the
wait is the whole point of it.

| alarm in | state | step | level | sound |
| --- | --- | --- | --- | --- |
| 40 min | armed | – | – | silent |
| 29 min | window | 1 | 10% | bed |
| 20 min | window | 2 | 52% | bed |
| 10 min | window | 3 | 78% | bed + chime |
| 3 min | window | 4 | 94% | bed + chime |
| 0 min | ringing | 5 | 100% | bed + alarm |

**The window line now names the step.** It read `Soft Rain · 65%`; it reads
`Soft Rain · step 3 of 5 · 65%`. A percentage alone does not say where you are
in a sequence the app page describes in five named steps.

**And the app page says when the window is already running.** Setting an alarm
for twenty minutes from now is not "in twenty minutes" — the window opened ten
minutes ago and the soundscape is playing. `NextAwakening` shows a notice
naming the step, so this is visible where the alarm is set rather than only
after opening the lock screen.

`stepOfProgress` in `cycle.ts` is the inverse of `progressOfStep`, so the step
shown on both screens comes from the same division as the times, the levels and
the layer entry points. Step 5 is reached only at the alarm itself, which is
correct — step 5 *is* the alarm.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 16a: The notice grows instead of appearing (2026-09-19)

The "waking has already begun" notice was mounted and unmounted outright, so
the moment the dial crossed the half-hour mark a block of text appeared and
shoved everything below it down. Mid-drag that does not read as a message
arriving — it reads as the dial stuttering.

**Done**
- The notice is always mounted now. A single shared value drives its height and
  its opacity together, so it grows and fades over `NOTICE_FADE_MS` (260ms)
  instead of snapping in and out. Nothing below it jumps.
- Its height is measured from the text with `onLayout` rather than guessed, so
  the animation is right whatever the copy wraps to.
- `pointerEvents="none"`, since it is informational and should not take touches
  while collapsed.

**Why it is smoother as well as prettier:** crossing the boundary used to mount
a whole subtree and relayout the page, on a drag that can cross it repeatedly.
Now the subtree stays put and only two animated values change, on the UI thread.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 16b: The notice height was wrong twice (2026-09-19)

The grow-and-fade still looked bad. Two measurement faults, not animation ones.

**1. It popped on first appearance.** `noticeHeight` went from 0 to its real
value in one step while `shown` was already 1, so the height changed in a single
frame. The animation now waits until the text has been measured, so there is
always something real to ease towards.

**2. The margin was never counted.** The gap above the card was `mt-3`, a
margin — and `onLayout` reports the border box, not margins. So the animated
height was permanently 12px short of what the notice occupied, and that 12px of
empty space stayed on the page when the notice was collapsed. The gap is
padding on the measured box now.

**Risk worth knowing:** the content is measured inside a container whose height
animates to zero. If `onLayout` ever reported 0 there, the guard added for
fault 1 would hide the notice permanently — a worse failure than the pop. This
is the standard React Native collapse pattern and should measure correctly, but
if the notice ever fails to appear at all, that is the cause, and the fix is to
measure outside the clipped container.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 16c: Notice dropped, link disabled instead (2026-09-19)

The "waking has already begun" notice is gone, along with the height animation
it needed and `NOTICE_FADE_MS`. `NextAwakening` is back to the time and the
pause switch, and nothing else.

The same validation now shows up as state on the control rather than as a
message: while the wake window is already running, the **Lock screen** link is
disabled and dimmed. Opening it then would drop you into the middle of a waking
sequence, which is a surprising place to land from a settings page.

**Test fade stays enabled**, since its whole job is to run a window on demand
regardless of what the real alarm is doing.

Two rounds of fighting a height animation ended with the feature not needing
one. Worth remembering before reaching for an animated collapse again: a
message that has to animate in and out of a layout is often a sign the
information belongs on a control instead.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 17: Xcode arrived; the dev build is blocked on CocoaPods (2026-09-20)

**Xcode 27 is installed**, with iOS 27 simulators. That clears the blocker
recorded in step 1 — "Xcode will be required from step 9".

**The app was seen running for the first time.** Launched on an iPhone 17
simulator through Expo Go. The top of the app page renders as designed: the
badge and header, the 24h chip and armed dot, `SUN · SEP 20, 2026 / LOCAL`, the
big clock, the accent rule with "A GENTLE START", and next awakening showing
`07:42 · MON · IN 20H 44M`. Between two captures a minute apart the clock ticked
and the countdown decremented, so the self-clocking `NowBlock` and the
thirty-second page tick both work on device.

**Three environment findings, in the order they bit:**

1. **There is no Simulator GUI on this machine.** `Simulator.app` is absent from
   `/Applications`, from inside `Xcode.app`, and from Spotlight. `simctl` can
   boot, deep-link and screenshot headlessly, but nothing can *tap*. Expo Go's
   first-run dev-menu explainer therefore cannot be dismissed, and it covers the
   lower two thirds of the screen.
2. **Memory is in a bad state**: 8 GB total, 0.1 GB free, 2.9 GB compressed and
   **8.3 GB of 9.2 GB swap used**, with no single process above 0.26 GB. It is
   accumulated compressed and swapped-out state, much of it Xcode services and
   the simulator runtime.
3. **`npx expo run:ios` fails on CocoaPods, not on memory.** Prebuild succeeded
   and `ios/` was generated; the build then stopped at "The sandbox is not in
   sync with the Podfile.lock".
   - `gem install cocoapods` fails: system Ruby installs to `/Library/Ruby`,
     which needs sudo.
   - Homebrew is not installed at all (`spawn brew ENOENT`).
   - `gem install --user-install cocoapods` also fails, and this is the real
     wall: the `nkf` native extension needs Ruby 2.6 headers inside the macOS 27
     SDK, and **Xcode 27 no longer ships them** — Apple has deprecated the
     bundled Ruby. System Ruby cannot build native gems against this SDK.

**So CocoaPods needs a Ruby that is not the system one, and every route to that
needs a privileged install.** The build left `package.json` pointing at
`expo run:ios`; reverted, since that workflow does not currently work. `ios/`
is kept — it is gitignored, 164K, and saves regenerating on the next attempt.

**Unblocking it needs one command run by hand** (Homebrew's installer asks for a
password, which is why it cannot be automated from here):

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    brew install cocoapods
    npx expo run:ios

**Nothing in the app is blocked by this.** Expo Go on a real phone still works
and is the better test surface anyway — real speakers, real haptics, a real
mute switch. What is blocked is AlarmKit, which needs native code and therefore
a dev build.

## Step 18: Settings are remembered (2026-09-20)

Everything set on the app page lived in `useState`, so every reload threw it
away and went back to 07:42 every day, Soft Rain, 11 dB. Per-weekday alarms are
not much use if they have to be entered again each launch.

**Done**
- `@react-native-async-storage/async-storage` (2.2.0). Bundled in Expo Go, so it
  works with the workflow we are staying on — no dev build needed.
- `src/lib/settings.ts` — one hook, `useAlarmSettings()`, returning the settings
  and a single `update()` for changing any part of them.
- `src/app/index.tsx` reads from it. The wake times, pause switch, soundscape
  and level are all stored; the day you are *looking at* is not, because that is
  where you are in the app rather than a setting.

**Three things in there worth knowing**

1. **Writes are debounced by 400ms.** Rolling the dial changes the time up to
   sixty times a second; writing each one would hammer storage to save values
   that were true for a sixtieth of a second. Each change cancels the pending
   write, so only the time the dial settles on is stored.
2. **Nothing is written until the first read finishes.** Otherwise the defaults
   would be saved over whatever was already on disk, in the moment between
   mounting and loading.
3. **What comes back from storage is not trusted.** It was written by an earlier
   version of the app and may no longer fit. Every field is checked and falls
   back to its default on its own:

   | stored | becomes |
   | --- | --- |
   | `soundscapeId: 'summer-storm'` | `soft-rain` |
   | `level: 5` | `0.28` |
   | six wake times instead of seven | seven defaults |
   | `level: '0.4'` (a string) | `0.28` |
   | `null` / unparseable | all defaults |

   The first row is not hypothetical. Summer Storm was deleted two steps ago,
   so anyone who had it selected would otherwise load a soundscape with no bed
   file behind it.

The storage key carries a version (`gently.settings.v1`), so a future change of
shape can start from fresh defaults instead of trying to read data that no
longer fits.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean
- The fallback logic checked against six kinds of bad input, including the
  deleted soundscape

**Not verified**
- That it survives a real reload on the phone. That needs you.

## Step 18a: The lock screen no longer keeps its own defaults (2026-09-20)

Persistence exposed a second set of defaults hiding in `lock.tsx`:

    const maxVolume = Number(params.level ?? 0.45);
    const alarmAt = Number(params.alarmAt) || Date.now() + 8 * 60 * MINUTE;
    const soundscape = findSoundscape(params.soundscape ?? '');

All three were wrong. **0.45 is the old level** — the one dropped in step 12b
for turning rain into hiss — so opening the lock screen without a level
parameter played it at the volume that was specifically complained about. The
alarm fell back to an invented eight hours from now, and the soundscape
silently became whichever happens to be first in the list.

They read from the stored settings now. The link from the app page still
carries everything, and parameters still win where present; what changed is
what happens when one is missing.

**This also makes the screen stand on its own.** Opened cold with no
parameters at all, it works out the real next alarm from the stored wake times
and uses the chosen soundscape and level. That is exactly how it will be
reached once AlarmKit fires it with the app closed — there is no app page in
that situation to pass anything in.

`alarmAt` is memoised on the parameter and the stored wake times, so it settles
once when the settings finish loading rather than drifting.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

**Verified on the phone (2026-09-20):** persistence survives a force-quit, and
the chime sits correctly against Fireplace. That second one was the open
question from step 14 — the chime plays at one fixed share of the bed's volume,
tuned against beds that sit 10 dB louder, so Fireplace was where a single
number was most likely to be wrong. It is not, which means the layer gains hold
across the whole range.

## Step 19: AlarmKit research, before writing any of it (2026-09-20)

Apple's own documentation is JavaScript-rendered and returns nothing usable to
a fetch — the first attempt came back with invented details, including the
wrong iOS version, so it was discarded. What follows comes from the
documentation of working wrappers instead. Ten of them exist on npm; Expo ships
nothing for this.

### AlarmKit — verified

- **iOS 26+ only.** Hard gate.
- `NSAlarmKitUsageDescription` in Info.plist. Expressible in `app.json`, so no
  manual Xcode step.
- **Custom alarm sounds are supported, but must be `.wav`, `.aiff` or `.caf`.**
  Ours is `step_wake_alarm.m4a`, so it needs converting. Cheap, and needed
  whatever else is decided.
- Customisable: tint colour, title (keep under ~15 characters, a Dynamic Island
  constraint), and primary/secondary button text, colour and SF Symbol icon.
  Enough for Gently's colours and wording, not its design.
- **Native countdown and snooze**, in seconds. The 9/6/4-minute ladder maps
  onto it directly rather than needing reimplementation.
- **No widget extension is required by AlarmKit itself.** One wrapper asks for
  an App Group, but that is its own choice for sharing data with an extension,
  not a framework requirement — the two sets of docs disagree, which is worth
  knowing before picking one.
- **A physical device is required; simulator support is limited.**

### Live Activities — not verified

What a Live Activity may actually render — gradients, custom shapes, anything
resembling the dot clock, and whether it can be interactive — could not be
established. Apple's pages do not render, and the two relevant npm packages are
either thin on detail or unreachable. All that is confirmed is that a Live
Activity means hand-written SwiftUI in a widget extension, added through an
Expo config plugin.

Answering this properly means building a minimal one and looking at it, which
needs the build chain below.

### The gate nobody costed

AlarmKit needs a physical device. Building locally is blocked (CocoaPods cannot
be installed: no Homebrew, and Xcode 27 no longer ships the Ruby headers system
Ruby needs). That leaves EAS Build, and a build that installs on a real iPhone
has to be signed — which through EAS means an **Apple Developer Program
membership, around $99 a year**. A free Apple ID only permits local Xcode
sideloading, and local building is exactly what is blocked.

Worth confirming before spending anything. A free EAS *simulator* build
sidesteps signing, but AlarmKit is documented as limited on the simulator, so
it may not answer the question either.

### What this changes

AlarmKit covers more than expected — the alarm, a custom sound, and the snooze
ladder. It still does not cover the thirty-minute fade, which remains the open
design question. But the blocker is no longer knowledge; it is that testing any
of it has a cost attached.

## Step 19a: The alarm sound in CAF, ready for AlarmKit (2026-09-20)

AlarmKit will only take `.wav`, `.aiff` or `.caf`, and ours was `.m4a`.

**Built from the original MP3, not from the M4A** — converting the existing
asset would have been a second lossy generation for no reason. Same processing
as before: cut to 11 whole beep cycles so it can ring continuously, ends faded
to silence.

- `assets/sounds/step_wake_alarm.caf`, 4.66s, 16-bit PCM, 878 KB.
- **Level identical to the M4A** (RMS -15.5, peak -3.0 dBFS), so nothing about
  how it sounds changes.
- **Kept stereo.** The two channels measured 0.966 correlation — close, but not
  the same sound twice, so collapsing to mono to halve the size would have
  thrown away real width.
- **The loop wrap is now exactly zero** rather than -44 dB below the signal.
  PCM has no encoder to reintroduce error at the edges, which the AAC version
  did. For a sound that repeats until someone stops it, that is worth having.

**It costs nothing until it is used.** Metro only bundles assets something
requires, and nothing requires the `.caf` yet — confirmed by MD5 against the
export. The `.m4a` stays for in-app playback through `expo-audio`; the `.caf`
sits ready for AlarmKit. One of them will become redundant once AlarmKit is
wired, and that is the moment to pick.

## Step 19b: No microphone permission (2026-09-20)

Prebuild wrote four Android permissions into `app.json`, one of them
`RECORD_AUDIO`. `expo-audio` declares it by default because the library
supports recording; Gently only ever plays. An alarm app asking for the
microphone looks like surveillance whatever the explanation, and App Review
asks about permissions an app never exercises.

**Two changes were needed, not one.** Setting the plugin option alone would not
have fixed it — prebuild had already written the permission into `app.json` as
explicit config, which would keep declaring it regardless of what the plugin
did.

- `expo-audio` now takes `microphonePermission: false` (iOS) and
  `recordAudioAndroid: false` (Android), so it never adds them again.
- `RECORD_AUDIO` removed from the `android.permissions` array that was already
  there.

**Kept:** `MODIFY_AUDIO_SETTINGS`, `FOREGROUND_SERVICE` and
`FOREGROUND_SERVICE_MEDIA_PLAYBACK`. Those are what let a soundscape keep
playing with the screen off, which is the point.

**Verified** against `expo config --type prebuild`, which resolves the config
after every plugin has run: no `RECORD_AUDIO`, and no microphone key in the iOS
Info.plist. Checking the file alone would not have proved it, since the plugin
could have put it back.

**Also present, from Expo's own defaults:** `READ_EXTERNAL_STORAGE`,
`WRITE_EXTERNAL_STORAGE` and `INTERNET`. Left alone — they come from the
framework rather than from a choice here, and the storage pair is largely
legacy on modern Android. Worth a look before shipping to Android, which is not
a platform this targets yet.

**This does not affect the build currently queued**, which was uploaded before
the change. The next one will pick it up.

## Step 20: The EAS simulator build, and the app seen whole (2026-09-20)

**The build succeeded.** 20 MB uploaded, built in the cloud, 35 MB artifact
down. That proves the whole pipeline for this project — prebuild in the cloud,
the config plugins, the 12 MB of audio — before any native code is added to
debug alongside it. `@nazarism/gently`, profile `simulator`, no Apple
credentials and nothing paid.

Installed with `simctl install` and launched headlessly. No Expo Go, so no
first-run modal covering two thirds of the screen.

**The app page renders correctly, and the dial is right.** First proper look at
the rotary in colour at real size: the arc runs from midnight clockwise, the
handle sits just past three o'clock, which is where 07:42 belongs on a 24-hour
dial (about 115°). Header, date line, live clock, next awakening, the card and
its footer all as designed.

**Found by looking, which is the point of looking: "ROLL TO SET SUN".** The day
label was appended to the card title in step 16, and the abbreviation for Sunday
lands so that the line reads as *sunset* — in an app themed entirely on sunrise,
with a sunrise gradient behind its lock screen. It is not wrong, it just reads
wrong, and no amount of typechecking would ever have said so.

**The lock screen could not be reached.** Deep linking with `gently://lock`
raises an iOS "Open in Gently?" confirmation, both from inside the app and cold
from the home screen. That needs a tap, and there is still no Simulator GUI on
this machine. The app page is the initial route, which is the only reason it
could be captured at all.

Seeing the lock screen would mean temporarily making it the initial route and
building again. Cheap in money, slow in time, and worth it only when there is
something new to look at — a Live Activity, for instance.

## Step 20a: "Roll to set SUN" reverted (2026-09-20)

The card title is `Roll to choose wake time` again. The day was appended to it
in step 16 so the dial would say what it was setting, but abbreviated it landed
as "ROLL TO SET SUN" — which reads as *sunset*, in an app built on a sunrise.

The heading directly above the card still carries the day, so nothing is lost:
`SET AWAKENING · SUN` sits a line above `Roll to choose wake time`. The concern
from step 16 — that a picker far down a scrolling page should say what it is
setting — is still met, just once instead of twice.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean

## Step 21: Holding the audio session overnight (2026-09-20)

Agreed on what is being built, so this is the first piece — chosen first
because it is the riskiest assumption and the cheapest to test. Whether iOS
keeps an audio session alive for eight hours is not something reading settles.

**Two gaps found on the way**

1. **`UIBackgroundModes` was never in `app.json`.** The iOS config had only an
   icon and a bundle id, so `shouldPlayInBackground: true` did nothing in a
   standalone build. It works in Expo Go because Expo Go's *own* Info.plist
   declares the mode — which means the EAS build made earlier today has no
   background audio at all, and nobody would have noticed until an alarm
   silently failed. Now set to `["audio"]`.
2. **The bed paused whenever the window was not running.** So while armed,
   nothing played, and iOS suspends a backgrounded app that is playing nothing.
   Set the alarm at eleven, lock the phone, and by midnight the app is asleep
   and will not wake itself at 07:12 to start fading.

**The change:** while armed, the soundscape plays at volume zero. Silent, but
playing — which is what keeps the session alive. When the window opens the
normal ramp takes over from there.

That is the real cost of a gentle wake with the screen off: an audio decode
running all night. It is also the behaviour App Review asks about, so it wants
a straight answer in the submission when that day comes.

**How to test it, and it needs a night rather than a minute:** open the app, go
to the lock screen, set an alarm far enough ahead to sleep through, lock the
phone and leave it. If the soundscape fades up in the morning, the session
survived. If there is silence, it did not — and the gentle wake cannot work
with the screen off, which would make AlarmKit the main feature rather than the
backstop.

**Checks**
- `npx tsc --noEmit`: passes, `npx expo export --platform ios`: builds clean
- `UIBackgroundModes` confirmed in the resolved prebuild config, not just in
  the file — a plugin could have overwritten it
