// utils/songCatalog.js
// Map normalized titles to local audio assets.
const SONGS = {
  // Add your songs here after placing files in assets/audio.
  // Example:
  babery: { title: 'Babery', source: require('../assets/audio/AUD-20260209-WA0017.mp3') },
  baccate: { title: 'Baccate', source: require('../assets/audio/AUD-20260209-WA0018.mp3') },
  bacillary: { title: 'Bacillary', source: require('../assets/audio/AUD-20260209-WA0019.mp3') },
  baculiform: { title: 'Baculiform', source: require('../assets/audio/AUD-20260209-WA0020.mp3') },
  balanoid: { title: 'Balanoid', source: require('../assets/audio/AUD-20260209-WA0021.mp3') },
};

export function getSongByTitle(title) {
  const key = normalizeTitle(title);
  return SONGS[key] || null;
}

export function normalizeTitle(title) {
  const normalized = String(title || '').trim().toLowerCase();
  return normalized.replace(/^tdmd\d+\s*-\s*/i, '');
}
