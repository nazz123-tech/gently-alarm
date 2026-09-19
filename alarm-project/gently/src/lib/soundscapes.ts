/**
 * The soundscapes you can wake up to, taken from the shortlist in
 * `context/SOUND_RESEARCH.md` — one name and a short poetic subtitle each.
 *
 * The audio files themselves are not here yet; `context/sounds/` is where they
 * will land. Until then this is the menu and nothing plays.
 */

export type Soundscape = {
  id: string;
  name: string;
  subtitle: string;
  /**
   * The awakening cycle has the same five beats whatever you pick, but the two
   * middle ones are the soundscape itself — so each one names them. `bed` is
   * the sound settling in, `bedWithChime` is that same sound with a chime over
   * it, just before the alarm proper.
   */
  bed: string;
  bedWithChime: string;
};

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'soft-rain',
    name: 'Soft Rain',
    subtitle: 'fine rain on a quiet window',
    bed: 'Rain on glass',
    bedWithChime: 'Rain + chime',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    subtitle: 'slow tide, distant foam',
    bed: 'Tide on sand',
    bedWithChime: 'Tide + chime',
  },
  {
    id: 'forest',
    name: 'Forest',
    subtitle: 'wind in the leaves, birds singing',
    bed: 'Forest waking',
    bedWithChime: 'Forest + chime',
  },
  {
    id: 'summer-storm',
    name: 'Summer Storm',
    subtitle: 'far-off thunder, steady rain',
    bed: 'Rain and far thunder',
    bedWithChime: 'Thunder + chime',
  },
  {
    id: 'dawn-chorus',
    name: 'Dawn Chorus',
    subtitle: 'first light, waking birds',
    bed: 'First birdsong',
    bedWithChime: 'Birdsong + chime',
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    subtitle: 'low crackle, settling embers',
    bed: 'Low crackle',
    bedWithChime: 'Crackle + chime',
  },
];

/** The loudest the soundscape can get, in dB. The reference shows 18 of 40. */
export const MAX_DB = 40;

/** Falls back to the first soundscape rather than returning nothing. */
export function findSoundscape(id: string): Soundscape {
  return SOUNDSCAPES.find((sound) => sound.id === id) ?? SOUNDSCAPES[0];
}
