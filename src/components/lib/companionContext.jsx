/**
 * Companion Context — lightweight localStorage helpers.
 * Components save context here; PersonalCompanionCard reads it to personalize.
 */

const PREFIX = 'fl_companion_';

export function saveContext(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, ts: Date.now() }));
  } catch {}
}

export function loadContext(key, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > maxAgeMs) return null;
    return value;
  } catch { return null; }
}

export function buildUserContext() {
  return {
    spiritualGoal: loadContext('goal') || localStorage.getItem('faithlight_spiritual_goal') || null,
    lastPrayerTopic: loadContext('last_prayer'),
    activeStudyName: loadContext('active_study'),
    lastVerseRef: loadContext('last_verse'),
    recentMood: loadContext('mood'),
  };
}