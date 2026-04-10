/**
 * Event Logger — FaithLight Analytics
 * ─────────────────────────────────────
 * Track meaningful user events to understand what's working and spot broken flows.
 * Events are logged to the Base44 analytics system.
 *
 * Usage:
 *   import { logEvent, Events } from '@/components/services/analytics/eventLogger';
 *
 *   logEvent(Events.VERSE_SHARED, { book: 'JHN', chapter: 3, verse: 16, lang: 'en' });
 *   logEvent(Events.PRAYER_GENERATED, { mode: 'topic', lang: 'om' });
 *   logEvent(Events.LANGUAGE_CHANGED, { from: 'en', to: 'om' });
 *
 * Properties must be: string | number | boolean | null only.
 * Do NOT log PII (emails, user names, prayer content, etc.)
 */

import { base44 } from '@/api/base44Client';

// ── Event name constants ─────────────────────────────────────
export const Events = {
  // Bible
  CHAPTER_OPENED:           'chapter_opened',
  VERSE_HIGHLIGHTED:        'verse_highlighted',
  VERSE_NOTE_SAVED:         'verse_note_saved',
  VERSE_SHARED:             'verse_shared',
  VERSE_BOOKMARKED:         'verse_bookmarked',

  // Audio
  AUDIO_PLAYED:             'audio_played',
  AUDIO_PAUSED:             'audio_paused',
  AUDIO_CHAPTER_COMPLETED:  'audio_chapter_completed',

  // AI
  AI_EXPLANATION_REQUESTED: 'ai_explanation_requested',
  AI_QUESTION_ASKED:        'ai_question_asked',
  AI_STUDY_PLAN_GENERATED:  'ai_study_plan_generated',

  // Prayer
  PRAYER_GENERATED:         'prayer_generated',
  PRAYER_SAVED:             'prayer_saved',

  // Navigation / UX
  LANGUAGE_CHANGED:         'language_changed',
  DEVOTIONAL_OPENED:        'devotional_opened',
  GUIDED_STUDY_STARTED:     'guided_study_started',
  GUIDED_STUDY_COMPLETED:   'guided_study_completed',

  // Engagement
  APP_OPENED:               'app_opened',
  ONBOARDING_COMPLETED:     'onboarding_completed',
};

// ── Internal queue for batching ──────────────────────────────
let _queue = [];
let _flushTimer = null;
const FLUSH_DELAY_MS = 2000; // batch events every 2s

function _scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(_flush, FLUSH_DELAY_MS);
}

async function _flush() {
  _flushTimer = null;
  if (!_queue.length) return;
  const batch = _queue.splice(0);
  try {
    // Use base44 analytics if available, else fire-and-forget to entity
    for (const event of batch) {
      base44.analytics.track({ eventName: event.name, properties: event.properties });
    }
  } catch {
    // Analytics must never break the app
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Log a named event with optional properties.
 * Safe to call anywhere — errors are silently swallowed.
 *
 * @param {string} eventName  - Use Events.* constants
 * @param {Record<string, string|number|boolean|null>} [properties]
 */
export function logEvent(eventName, properties = {}) {
  try {
    _queue.push({ name: eventName, properties });
    _scheduleFlush();
  } catch {
    // Must never throw
  }
}

/**
 * Flush all queued events immediately.
 * Call on page unload or app close.
 */
export function flushEvents() {
  clearTimeout(_flushTimer);
  _flushTimer = null;
  _flush();
}