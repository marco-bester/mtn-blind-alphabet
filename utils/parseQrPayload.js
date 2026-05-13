// utils/parseQrPayload.js
// Accepts either:
// 1) JSON string: {"title":"Song Title","url":"https://example.com/song.mp3"}
// 2) Direct URL:  https://example.com/song.mp3   (title inferred from filename)
// 3) Plain text title: "Babery"
// Throws an Error if invalid.
export default function parseQrPayload(data) {
  let title, url;

  // Try JSON
  try {
    const obj = JSON.parse(data);
    if (obj && typeof obj.url === 'string') {
      url = obj.url.trim();
      title = (obj.title && String(obj.title).trim()) || inferTitle(url);
    } else if (obj && typeof obj.title === 'string') {
      title = obj.title.trim();
    }
  } catch (e) {
    // Not JSON; fallback to raw string
    if (!url) {
      const s = String(data).trim();
      if (isProbablyUrl(s)) {
        url = s;
        title = inferTitle(url);
      } else if (s) {
        title = s;
      }
    }
  }

  if (url && !isProbablyUrl(url)) {
    throw new Error('QR code contains an invalid URL.');
  }

  if (!url && !title) {
    throw new Error('QR code must contain a title or a valid URL.');
  }
  return { title, url };
}

function isProbablyUrl(s) {
  return /^https?:\/\/.+/i.test(s) && (s.endsWith('.mp3') || s.endsWith('.m4a') || s.endsWith('.aac') || s.includes('?'));
}

function inferTitle(u) {
  try {
    const path = new URL(u).pathname;
    const file = path.split('/').filter(Boolean).pop() || 'Unknown';
    const name = decodeURIComponent(file).replace(/\.(mp3|m4a|aac)$/i, '');
    return name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}
