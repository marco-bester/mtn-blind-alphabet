// utils/songCatalog.js
// Songs live in Firebase Storage. `catalog.json` at the bucket root maps normalized titles to audio paths:
// { "babery": { "title": "Babery", "audio": "audio/babery.mp3" } }
// Adding a song = upload the mp3 and add an entry to catalog.json; no app release needed.
const BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;

let catalogPromise = null;

export function storageUrl(path) {
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`;
}

function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(storageUrl('catalog.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
        return res.json();
      })
      .catch((e) => {
        catalogPromise = null; // allow retry on next call
        throw e;
      });
  }
  return catalogPromise;
}

export async function getSongByTitle(title) {
  const catalog = await loadCatalog();
  const entry = catalog[normalizeTitle(title)];
  if (!entry) return null;
  return { title: entry.title, source: { uri: storageUrl(entry.audio) } };
}

export function normalizeTitle(title) {
  const normalized = String(title || '').trim().toLowerCase();
  return normalized.replace(/^tdmd\d+\s*-\s*/i, '');
}
