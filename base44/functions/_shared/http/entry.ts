/**
 * Shared HTTP helpers for Base44 Deno functions
 */

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    },
  });
}

export function ok(data) {
  return json({ ok: true, ...data }, 200);
}

export function fail(code, message, status = 400) {
  return json({ ok: false, code, message }, status);
}

export function handleOptions(req) {
  if (req.method === 'OPTIONS') return json({ ok: true }, 200);
  return null;
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function clampInt(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}