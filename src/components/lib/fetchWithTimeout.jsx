/**
 * Fetch with timeout to prevent infinite spinners
 * Returns response or throws predictable error code
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    // Normalize into consistent error shape
    const isAbort = err?.name === 'AbortError';
    const e = new Error(isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR');
    e.code = isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR';
    throw e;
  }
}