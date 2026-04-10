/**
 * Audio Service — centralized API layer for all audio/TTS operations.
 * Audio metadata is cached; progress/playlists are always fresh.
 */
import { base44 } from '@/api/base44Client';
import { serviceCache, TTL } from '@/components/services/cache/serviceCache';

// ── Audio Tracks ────────────────────────────────────────────

export async function fetchAudioTrack(bookCode, chapter, language = 'en') {
  const cacheKey = `audio_track:${language}:${bookCode}:${chapter}`;
  const cached = serviceCache.get(cacheKey);
  if (cached) return cached;

  const tracks = await base44.entities.BibleAudioTrack.filter(
    { bookId: bookCode, chapterId: String(chapter), language }, null, 1
  ).catch(() => []);
  const track = tracks?.[0] || null;
  if (track) serviceCache.set(cacheKey, track, TTL.AUDIO_METADATA);
  return track;
}

export async function fetchAudioTracksForBook(bookCode, language = 'en') {
  const cacheKey = `audio_tracks:${language}:${bookCode}`;
  const cached = serviceCache.get(cacheKey);
  if (cached) return cached;

  const data = await base44.entities.BibleAudioTrack.filter(
    { bookId: bookCode, language }, 'chapterId', 200
  ).catch(() => []);
  serviceCache.set(cacheKey, data || [], TTL.AUDIO_METADATA);
  return data || [];
}

// ── Audio Progress ──────────────────────────────────────────

export async function saveAudioProgress(userId, data) {
  if (!userId) return;
  return base44.entities.AudioListenProgress.create({
    user_id: userId, ...data,
    listened_at: new Date().toISOString()
  }).catch(() => {});
}

export async function fetchAudioProgress(userId, limit = 10) {
  if (!userId) return [];
  return base44.entities.AudioListenProgress.filter(
    { user_id: userId }, '-listened_at', limit
  ).catch(() => []);
}

// ── Audio Playlists ─────────────────────────────────────────

export async function fetchPlaylists(userId) {
  if (!userId) return [];
  return base44.entities.AudioPlaylist.filter(
    { user_id: userId }, '-created_date', 50
  ).catch(() => []);
}

export async function createPlaylist(userId, name, items = []) {
  return base44.entities.AudioPlaylist.create({
    user_id: userId, name, items
  });
}