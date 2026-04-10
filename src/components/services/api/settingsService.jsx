/**
 * Settings Service — centralized API layer for user preferences and settings.
 */
import { base44 } from '@/api/base44Client';

// ── Current User ────────────────────────────────────────────

export async function getCurrentUser() {
  return base44.auth.me();
}

export async function isAuthenticated() {
  return base44.auth.isAuthenticated().catch(() => false);
}

export async function updateUser(data) {
  return base44.auth.updateMe(data);
}

export function logout(redirectUrl) {
  return base44.auth.logout(redirectUrl);
}

// ── Feature Access ──────────────────────────────────────────

export async function checkFeatureAccess(featureKey) {
  const result = await base44.functions.invoke('checkFeatureAccess', { featureKey });
  return result?.data || null;
}

// ── Notification Preferences ────────────────────────────────

export async function fetchNotificationPreferences(userId) {
  if (!userId) return null;
  const results = await base44.entities.NotificationPreferences.filter(
    { user_id: userId }, null, 1
  ).catch(() => []);
  return results?.[0] || null;
}

export async function saveNotificationPreferences(userId, data) {
  const existing = await fetchNotificationPreferences(userId);
  if (existing) {
    return base44.entities.NotificationPreferences.update(existing.id, data);
  }
  return base44.entities.NotificationPreferences.create({ user_id: userId, ...data });
}

// ── User Settings ───────────────────────────────────────────

export async function fetchUserSettings(userId) {
  if (!userId) return null;
  const results = await base44.entities.UserSettings.filter(
    { user_id: userId }, null, 1
  ).catch(() => []);
  return results?.[0] || null;
}

export async function saveUserSettings(userId, data) {
  const existing = await fetchUserSettings(userId);
  if (existing) {
    return base44.entities.UserSettings.update(existing.id, data);
  }
  return base44.entities.UserSettings.create({ user_id: userId, ...data });
}

// ── Translations ────────────────────────────────────────────

export async function fetchTranslations(language, limit = 500) {
  return base44.entities.Translation.filter({ language }, null, limit).catch(() => []);
}

// ── Daily Verse ─────────────────────────────────────────────

export async function fetchDailyVerse(dateKey, language = 'en') {
  const results = await base44.entities.DailyVerse.filter(
    { dateKey, language }, null, 1
  ).catch(() => []);
  return results?.[0] || null;
}