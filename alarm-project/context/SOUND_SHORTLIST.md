# ZapSplat shortlist

Nine files: six soundscape beds, three shared one-shots. Search each title on
zapsplat.com and download the MP3 (WAV is premium-only on Basic).

**How these were chosen.** Titles only — nobody has listened to them yet. Kept
anything saying *constant*, *steady*, *loop* or *ambience*; rejected anything
naming a one-off event (a car passing, a voice, "intensifies in gusts", "turns
heavy", construction). Events make a seamless loop impossible, which
`SOUND_RESEARCH.md` calls the genuinely hard part. Durations are not listed
because the search pages fill them in with JavaScript — check them yourself,
and aim for 2 minutes or more on the beds.

---

## The six beds (one loop each)

| # | Soundscape | Pick | Backup |
| - | --- | --- | --- |
| 1 | Soft Rain | Medium heavy rain on roof and trees, exterior, constant *(ZapSplat, 2:55 — your own pick)* | Constant heavy rain on metal garage roof |
| 2 | Ocean | Gentle ocean waves on sandy beach, distant surf, winter, Australia | Small, calm gentle ocean waves lap onto sand, secluded tropical beach 1 *(your pick)* |
| 3 | Rainforest | Lamington National Park, Queensland, Australia, temperate rainforest ambience with distant lyrebird, various smaller birds with slight canopy wind | Rainforest ambience, end of winter, early spring, birds, eastern whipbird, cockatoo, Sunshine Coast, QLD, Australia |
| 4 | Summer Storm | Medium heavy constant rain with a distant rumble of thunder from 1min 50sec | — |
| 5 | Dawn Chorus | Nature ambience, Rupununi, South America, Morning, Savannah meadow, dawn chorus, many birds tweets, LOOP | Noosa Everglades, Cooloola National Park, Queensland, Australia, bright busy dawn chorus |
| 6 | Fireplace | Wood burning on fire in fireplace with crackle 1 | Fire burning with crackle, inside fireplace |

### Notes on individual picks
- **Summer Storm** — the thunder arrives at 1:50 and is a one-off, so the loop
  should come from the clean rain before it. Or cut the rumble out as its own
  layer, which `SOUND_RESEARCH.md` §09 wants anyway for mixing two beds.
- **Dawn Chorus** — the Rupununi one has **LOOP** in its own title, which is the
  only file in the whole scan that advertises it. Try this one first.
- **Rainforest** — avoid the Lamington recording that ends with "a flock of
  crimson rosellas fly over towards the end": an event at the end is the worst
  possible place for one. Also avoid the Queensland lake dawn chorus, which has
  construction work in it.
- **Ocean** — avoid the Kemer, Turkey recordings. All three versions say "some
  voices".
- **Fireplace** — prefer the plain "crackle" recordings over "roar and crackle
  of flames"; a roar will not sit under a sleeping person.

---

## The three one-shots (shared by every soundscape)

| # | Step | Pick |
| - | --- | --- |
| 7 | Chime (step 3, over the bed) | Metal wind chimes gentle movements 1 |
| 8 | Warm tone (step 4) | Game sound, warm chime, soft mallet, start up tone |
| 9 | Wake alarm (step 5) | Digital alarm clock beeps, chimes |

### Why the alarm file stays
ZapSplat's alarm category is all digital beeping, which is the opposite of this
app's premise. It is downloaded anyway, and deliberately: **it is the backstop.**
If the four gentle steps fail to wake you — phone face down under a pillow,
volume knocked down, the ramp not doing its job — step 5 is the one that has to
work regardless. A gradual alarm needs a hard floor under it, or it is not an
alarm.

So step 5 is not "the gentle sequence, louder". It is a different kind of sound
on purpose.

---

## Licensing, which still needs resolving
The account is **Basic (free)**, which means:
- **Attribution is required in the app.** A credits line in settings or an about
  screen covers it. This is a real build task, not a formality.
- The standard licence says sound effects must not be "the primary value of a
  product". `SOUND_RESEARCH.md` already flags this as a genuine question for
  Gently, since the soundscapes are close to the centre of the pitch. Fine for
  prototyping; worth reading the full EULA before shipping.
- **MP3 only.** WAV is premium-gated, so the ramp will be applied to a lossy
  source. Not a problem for ambient beds at this stage.

---

## Is MP3 a problem?

**For one thing, yes: looping the six beds. For everything else, no.**

MP3 encodes in fixed blocks of 1152 samples, so the encoder pads the start and
end of every file to fill the last block. A decoded MP3 is therefore slightly
longer than what went in, with a sliver of silence at each end. Play it on a
plain loop and those two slivers meet: a small gap or click, once per lap. On a
2-minute bed that is a tick every two minutes, all night.

`expo-audio` does not save us here. Its `loop` is documented as a plain boolean;
only *playlists* mention gapless playback. Nothing promises a seamless wrap.

**Where MP3 is completely fine:**
- The three one-shots — chime, warm tone, wake alarm. They play once. Padding at
  the ends of a sound that is not looping is inaudible.
- The volume ramp. Level is applied at playback and has nothing to do with the
  codec.
- Bundle size. MP3 is far smaller than WAV, which `SOUND_RESEARCH.md` wanted anyway.
- Quality. These are ambient beds, and the first two steps play at 5% and 45%
  where lossy artefacts are least audible.

**The fix, done once per bed, offline:**
Open the bed in an editor, overlap the tail back over the head and crossfade
the join, then export as **M4A/AAC**. This solves two problems at once — the
codec padding, and any natural seam in the recording itself, which no format
change would have fixed. AAC in an M4A container also carries gapless metadata
that iOS honours, which raw MP3 does not.

That is the CloudConvert WAV-to-AAC direction, with a crossfade step added
before it.

**What not to do:** crossfading between two players in app code. It works, but
it puts real audio-timing logic into the app to paper over something that a
one-off edit fixes properly in the file.

**Do not fix this before hearing it.** Get one bed in, loop it, and listen. If
the seam is inaudible under a soundscape at 45%, that is the answer. Sourcing
first, fixing second.

---

## Correction: the rain picks were wrong (2026-09-19)

Both rain beds turned out to be the same thing:

    zapsplat_nature_rain_medium_heavy_roof_and_trees_constant_...
    zapsplat_nature_rain_rainfall_medium_heavy_constant_distant_thunder_...

**Both are "medium heavy".** This shortlist filtered on the word *constant*,
because the worry at the time was seamless looping. That was the right thing to
worry about and the wrong thing to filter on alone: it selected for texture
that never changes and ignored what the texture actually is. "Medium heavy rain
on a roof" is not a soundscape called **Soft Rain**, whose own subtitle here is
*fine rain on a quiet window*.

It also made Summer Storm nearly a duplicate of Soft Rain — same rain, plus one
rumble every three minutes.

**Better candidates**, all in the Rain category, same recording from three mic
positions, about 2:01 each:

| pick | why |
| --- | --- |
| Rain on bedroom window, internal, **centre of room** | what you would hear lying in bed — recommended |
| Rain on bedroom window, internal, **far from window** | softest of the three, if centre is still too present |
| Rain on bedroom window, internal, **close to window** | most detail, probably too bright for this |

Indoor, distanced, against glass. That is what "soft" means here, and none of
them describe an event, so the looping worry is satisfied anyway.

**On Summer Storm:** worth judging again *after* Soft Rain is replaced. It read
as wrong partly because it was a near-duplicate; against a light indoor
recording, medium-heavy outdoor rain with distant thunder becomes a genuinely
different thing and earns its name. If it still does not work, the cleanest
replacement soundscape is **Night Garden** (crickets, a far owl) from
`SOUND_RESEARCH.md` — a texture unlike any of the other five, and it ties to
the bedtime feature in the backlog.

**Lesson for future picks:** filter on character first, then check loopability.
Doing it the other way round selects for monotony.
