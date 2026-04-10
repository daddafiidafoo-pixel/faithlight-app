/**
 * API Contract Layer
 * ─────────────────
 * Every service function should return a standard envelope:
 *
 *   Success: { success: true,  data: <any> }
 *   Failure: { success: false, error: { code: string, message: string } }
 *
 * Usage:
 *   import { ok, fail, wrap } from './apiContract';
 *
 *   // Manual
 *   return ok(verses);
 *   return fail('NOT_FOUND', 'No verses found for this chapter.');
 *
 *   // Automatic — wraps a promise, catches errors, normalises the shape
 *   return wrap(() => base44.entities.BibleVerse.filter({ ... }));
 *
 * On the consumer side:
 *   const result = await fetchVersesSafe(book, chapter);
 *   if (!result.success) { showError(result.error.message); return; }
 *   setVerses(result.data);
 */

/** Wrap a successful result. */
export function ok(data) {
  return { success: true, data };
}

/** Wrap a failure. code should be SCREAMING_SNAKE, message is user-safe. */
export function fail(code, message) {
  return { success: false, error: { code, message } };
}

/**
 * Wrap an async thunk in the standard envelope.
 * Catches all thrown errors and maps them to fail().
 *
 * @param {() => Promise<any>} thunk
 * @param {string} [errorCode]   fallback error code
 * @param {string} [errorMsg]    fallback user-safe message
 */
export async function wrap(thunk, errorCode = 'UNKNOWN_ERROR', errorMsg = 'Something went wrong. Please try again.') {
  try {
    const data = await thunk();
    return ok(data);
  } catch (err) {
    // Try to extract a meaningful code from the error
    const code = err?.code || err?.status || errorCode;
    const message = err?.userMessage || err?.message || errorMsg;
    console.error(`[ServiceError] ${code}:`, err);
    return fail(String(code), message);
  }
}

/**
 * Assert a contract result is successful, or throw.
 * Useful in contexts where you want to propagate failures as exceptions.
 */
export function unwrap(result) {
  if (!result.success) throw new Error(result.error?.message || 'Service call failed');
  return result.data;
}