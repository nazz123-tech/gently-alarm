# Gently — lock screen reference & feature backlog

Source: TikTok by @rad — https://vt.tiktok.com/ZSqq9qr4k
Caption: *"Apparently building the app with Codex was easier than making the rain sound right 🌧️ ... Chat should I release this on the App Store?"*

Companion file: `lock-screen-prototype.html` — open it in a browser for a working
recreation of the locked clock (five states, real 5×7 dot-matrix renderer,
draggable slide-to-stop).

---

## 1. What the video actually shows

The product thesis is one spoken line: **"I never need to wake up at one exact time."**
Alarms are *ranges*, not times.

| Element | Detail |
| --- | --- |
| **Digits** | 5×7 dot grid; unlit dots faintly visible behind the lit ones. Used for the countdown, the alarm editor, and the *Alarms* screen title itself. |
| **Label** | `GETTING UP IN` in small tracked uppercase, over an `h:mm:ss` **countdown** — not a clock. The screen sells time remaining, not time. |
| **Gradient** | Full-bleed vertical sunrise: near-black at the top → amber through the middle → pale cream near the bottom → dark again at the very bottom edge. |
| **Controls** | Mute pill bottom-left, `Slide to stop` across the bottom, a chevron (collapse) top-right. Nothing else on screen. |
| **Ringing** | Large orange **Snooze** pill above the slide bar; dot digits switch to the current time. |
| **Alarms list** | Rows are ranges — `7:30–8:00 AM`, `8:00–8:20 AM` — each with a coloured soundscape tile and a toggle. |
| **Editor** | "Edit alarm": HOUR / MINUTE dot digits over a horizontal ruler picker (`…52 53 **55** 56 57…`) with a caret. |
| **Soundscapes** | Ocean — *slow tide, distant foam* · Rainforest — *warm air, subtle birdsong* · Soft Rain — *fine rain on a quiet window* |
| **Home** | Light theme, near-empty: a circular sky orb centred, list icon top-left, settings icon top-right. |

### Design notes worth preserving
- The countdown, not a clock, is the strongest idea in the whole design. Keep it.
- Every soundscape has a two-word poetic subtitle. That copy voice is part of the product.
- Exactly four interactive elements on the lock screen. Resist adding a fifth.

---

## 2. Feature backlog

Effort is rough: **S** = a day or two, **M** = a week-ish, **L** = the hard part of the app.

### 01 — Window, not a time · M · core
Make the range the only input. Earliest and latest; the app owns the moment in
between. It is the one thing the stock iOS alarm cannot express, so it is the
whole reason to install this.

### 02 — Movement picks the minute · L
Phone on the charger, accelerometer sampling through the window. Fire at the
first stirring; fall back to the latest edge if nothing happens. No wearable
required. This is the expensive one — see §3 before committing.

### 03 — The gradient is the light · S
Ramp screen brightness from ~3% to full across the window so the sunrise is a
real wake light, not a picture of one. Cheap to build, and it gives people a
reason to dock the phone instead of leaving it face-down.

### 04 — Sound that never cuts · S
First 90 seconds barely audible, then a slow curve. When you stop it, fade over
two minutes instead of a hard silence — the abrupt silence is what jolts people
awake as much as the sound did.

### 05 — Escalation ladder · S
"Gentle" is a promise you can only keep if it actually works. No slide within
three minutes → brighter screen, denser sound, haptics. Show the ladder in
settings so people trust it enough to stop setting a backup alarm.

### 06 — Shrinking snooze · S
9 → 6 → 4 → 2 minutes, and the gradient cools a step each time. Snoozing gets
you less, and you can see it getting less.

### 07 — Nightstand mode · S · marketing
The locked dot-grid clock as its own standalone feature: dock, dim to 2%, tap to
reveal the countdown. This is the screenshot people post. Ship it before the
smart wake — it has no dependency on any of the hard parts.

### 08 — Countdown runs backwards too · S
The same "getting up in" number in the evening: when it drops under your sleep
target, that is the bedtime nudge. One mechanic, two jobs, no new screen.

### 09 — Layered soundscapes · M
Two beds with independent levels — rain plus distant thunder, ocean plus wind.
Save as a named preset that shows on the alarm row where "Soft Rain" sits now.
Also the natural first paid feature.

### 10 — "Why 7:46?" · M
A one-card morning receipt: *woke you at 7:46, sixteen minutes into your window,
because you moved.* Two buttons: too early / too late. That feedback loop is the
entire model — without it, §02 never gets better than a coin flip.

---

## 3. The constraint that decides the architecture

**A third-party app cannot ring through a locked, silenced iPhone the way the
stock Clock app does — unless it holds Apple's alarm entitlement.**

- On iOS 26 that entitlement is exposed through **AlarmKit**: full-screen alert,
  audio that overrides the silent switch, scheduling that survives termination.
  A plain local notification will *not* survive silent mode or a long ramp.
- For Expo that means a **development build with a native module**, not Expo Go.
  Decide this before the architecture sets — it affects the build pipeline, the
  test loop, and TestFlight.
- Verify the current AlarmKit API surface against Apple's docs; it is new enough
  that the details move.
- There is a real product tension here: "gentle ramp" and "must be loud enough to
  wake you" pull against each other inside whatever Apple permits. Prototype the
  loudest-allowed and quietest-usable ends early.

### Stack notes against `AGENT_INFO.md`
- `react-native-sound-player` is thin for this. The ramp needs audio-session
  control and background playback — **`expo-audio`** is the better fit.
- Add the `audio` value to `UIBackgroundModes` and confirm the session survives
  the screen locking, not just backgrounding.
- `dayjs` is fine, but wake *windows* need interval maths (overlap, next
  occurrence, DST boundaries). Write that as a small pure module with tests —
  it is the part that will silently break at 2 AM on the last Sunday in October.

---

## 4. Open questions

- Does the window belong to the alarm, or is the alarm one window on a weekly schedule?
- What happens when two windows overlap? (The video shows 7:30–8:00 and 8:00–8:20 adjacent.)
- Is there a "must be up by" hard stop that behaves like a normal alarm?
- Does the soundscape keep playing after stop, as a morning bed? (See §04.)
