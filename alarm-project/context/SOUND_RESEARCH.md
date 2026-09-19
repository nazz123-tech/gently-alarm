# Gently — soundscape research

Purpose: expand the three soundscapes shown in the video (Ocean, Rainforest, Soft Rain)
into a full menu, and figure out where the actual audio files can come from without a
licensing problem once the app ships on the App Store.

---

## 1. Ten soundscapes

Same voice as the existing three: one name, a two-word-pair poetic subtitle, nothing
longer. Keep the copy short enough to sit under the alarm row next to a time range.

| #   | Name                | Subtitle                                | Texture                                                                 | Status   |
| --- | ------------------- | --------------------------------------- | ----------------------------------------------------------------------- | -------- |
| 1   | **Soft Rain**       | fine rain on a quiet window             | light, high-frequency, no wind                                          | in video |
| 2   | **Ocean**           | slow tide, distant foam                 | low rolling swell, long period                                          | in video |
| 3   | **Rainforest**      | warm air, subtle birdsong               | dense, humid, layered insects+birds                                     | in video |
| 4   | **Summer Storm**    | far-off thunder, steady rain            | heavier rain bed + occasional low rumble                                | new      |
| 5   | **Tide Pools**      | shallow waves, trickling stone          | beach, but close and small — not open ocean                             | new      |
| 6   | **Pine Forest**     | wind through needles, creaking branches | dry, airy, wind-driven — contrast to Rainforest's damp stillness        | new      |
| 7   | **Mountain Stream** | clear water over stone                  | running fresh water, brighter/higher than ocean                         | new      |
| 8   | **Dawn Chorus**     | first light, waking birds               | bird-forward, sparse — thematically the "waking up" sound               | new      |
| 9   | **Night Garden**    | Su                                      | for the evening/bedtime nudge (backlog §08)                             | new      |
| 10  | **Fireplace**       | low crackle, settling embers            | indoor/cozy, non-nature — good bedtime contrast, needs no window/season | new      |

Two more if the list ever needs stretching, both very quiet by nature and good
candidates for the "barely audible first 90 seconds" ramp (backlog §04):
**Snowfall** — hushed air, a distant creak of ice; **Autumn Wind** — leaves stirring,
a cool breeze.

Notes:

- Dawn Chorus and Night Garden are the two picks worth prioritizing beyond the
  original three — they're the only ones that tie directly to a specific backlog
  feature (Dawn Chorus for the getting-up moment, Night Garden for the bedtime
  countdown in §08), rather than just being another nature texture.
- Keep one non-nature option (Fireplace) — every soundscape in the video is outdoor/
  weather, and a "wake up on a rainy Tuesday" user may want something that doesn't
  imply weather at all.
- For §09 (layered soundscapes — two beds mixed, e.g. rain + distant thunder), pair
  candidates from this list: Soft Rain + Summer Storm's thunder layer, Ocean + Pine
  Forest's wind, Rainforest + Dawn Chorus's birds. Worth recording/sourcing rain,
  wind, and bird layers as separate stems from the start rather than only as
  pre-mixed beds, since layering is called out as "the natural first paid feature."

---

## 2. Where the audio itself can come from

Three real options, in order of how much control/cost they trade off:

### A. Licensed sound-effect libraries (fastest)

For a **shipped, distributed app** (not a video or podcast), the license has to say
apps/games/software explicitly — a lot of "royalty-free music" services are scoped to
video/social content only and do **not** cover embedding audio as an app asset.

- **Zapsplat** — explicitly covers "games, apps, and software" with no per-app or
  per-project limit. Free tier requires attribution somewhere in the app (credits/
  settings/about screen); Premium (~one paid tier) removes the attribution
  requirement and keeps sounds licensed for life even after cancelling. One catch in
  their terms: sound effects can't be "the primary value of a product" (e.g. a
  standalone soundboard app) — worth a quick read of the full EULA since Gently's
  soundscapes are close to central to the pitch, even if they're one feature among
  several (alarm scheduling, wake window, lock screen).
  [zapsplat.com/license-type/standard-license](https://www.zapsplat.com/license-type/standard-license/)
- **Freesound.org** — huge crowd-sourced library, filter to **CC0** sounds
  specifically: no attribution required, commercial use explicitly allowed, can't
  claim authorship. CC-BY sounds on the same site need a credit; CC-BY-NC sounds are
  off-limits for a commercial app. Good source for one-off texture layers (a single
  bird call, a thunder clap) to build custom beds from, less good for long
  ready-made ambient loops.
  [freesound.org/help/faq](https://freesound.org/help/faq/)
- **Epidemic Sound / Artlist / Soundstripe** — worth ruling out explicitly: these are
  **sync licenses for video/podcast content**, and standard tiers say "cannot
  redistribute tracks" — embedding one as a shipped app asset isn't covered even
  though they're the first thing that comes up when searching "royalty free ambient
  sound." Skip these for this use case.
- **Envato Elements** — commercial license, but the fine print on embedding audio as
  a persistent app asset (rather than using it in a rendered video) is genuinely
  unclear from their own docs; would need to ask their support directly before
  relying on it.
- **BBC Sound Effects Archive** — excellent nature recordings, but the RemArc license
  is personal/non-commercial only. Not usable for a shipped commercial app.

### B. Record or commission custom loops (best fit, more effort)

Given the brand voice already leans on very specific, poetic descriptions ("slow
tide, distant foam"), custom recordings avoid licensing ambiguity entirely and let
each soundscape actually match its subtitle. A field-recording freelancer (via
Fiverr/Upwork, or a sound-design contact) can deliver seamless loops per brief far
cheaper than it sounds, and this sidesteps the "primary value of a product" clause
in library EULAs since the app would own the assets outright.

### C. Generative/AI ambient audio (newest option, check current terms)

Tools that generate ambient beds from a text prompt exist now (ElevenLabs sound
generation and similar); output ownership and commercial-use terms vary by
provider and change often, so this needs a fresh check against each tool's current
terms before relying on it for shipped assets — don't assume last year's terms hold.

**Recommendation:** start with Zapsplat Premium + Freesound CC0 for the prototype/
TestFlight build (fast, unambiguous licenses), and budget custom recordings for the
three or four hero soundscapes (Ocean, Soft Rain, Dawn Chorus) before App Store
launch, since those are the ones the marketing screenshots and video will hinge on.

---

## 3. Technical notes for implementation

- **Seamless looping is the actual hard part**, more than sourcing — a soundscape
  that audibly "seams" every 30 seconds breaks the "gentle" premise immediately.
  Look for sources that sell/provide loop-ready files (loop points already
  crossfaded), or budget time to crossfade-loop raw recordings in something like
  Audacity/Logic before they go in the app.
- Per `AGENT_INFO.md` / `FEATURE_IDEAS.md`: the stack note there already flags that
  `react-native-sound-player` is too thin for the ramp/background needs and
  recommends **`expo-audio`** instead — confirm loop + fade API support there before
  committing to a file format.
- Ship compressed (AAC/M4A) rather than WAV for bundle size — ten-plus long ambient
  loops in WAV would bloat the app download significantly; test that looping stays
  seamless after compression, since some codecs introduce a tiny gap at the loop
  point.
- For backlog §04 (sound that starts barely audible, fades over 90s+2min), the
  source file just needs to be a clean, constant-level loop — the fade itself is
  application logic (gain ramp), not something to bake into the audio file.
