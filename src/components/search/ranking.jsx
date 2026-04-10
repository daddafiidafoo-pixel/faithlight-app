export function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreText(query, text) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 85;
  if (t.includes(q)) return 70;

  const qWords = q.split(" ");
  let hits = 0;
  for (const w of qWords) if (w && t.includes(w)) hits++;
  return hits ? 30 + hits * 7 : 0;
}

export function scoreResult(query, { title, subtitle, body, tags }) {
  let s = 0;
  s = Math.max(s, scoreText(query, title) * 1.3);
  s = Math.max(s, scoreText(query, subtitle) * 1.0);
  s = Math.max(s, scoreText(query, body) * 0.9);
  s = Math.max(s, scoreText(query, (tags || []).join(" ")) * 1.1);
  return Math.round(s);
}