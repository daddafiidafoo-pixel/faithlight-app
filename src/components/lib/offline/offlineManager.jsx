import { base44 } from '@/api/base44Client';
import { getOfflineLimitBytes } from './offlineLimits';

function estimateTextBytes(text) {
  return new Blob([String(text || "")]).size;
}

export async function ensureStorageState(me) {
  const limit = getOfflineLimitBytes(me?.plan_key || me?.subscriptionPlan);
  const existing = await base44.entities.UserOfflineStorage.filter({ user_id: me.id }, null, 1).catch(() => []);
  if (existing.length > 0) {
    const s = existing[0];
    if (s.limit_bytes !== limit) {
      await base44.entities.UserOfflineStorage.update(s.id, { limit_bytes: limit });
      s.limit_bytes = limit;
    }
    return s;
  }
  return base44.entities.UserOfflineStorage.create({
    user_id: me.id,
    limit_bytes: limit,
    used_bytes: 0,
  });
}

export async function recalcUsedBytes(me) {
  const items = await base44.entities.OfflineItem.filter({ user_id: me.id }, null, 2000).catch(() => []);
  const used = (items || []).reduce((sum, it) => sum + Number(it.size_bytes || 0), 0);
  const stateArr = await base44.entities.UserOfflineStorage.filter({ user_id: me.id }, null, 1).catch(() => []);
  if (stateArr.length > 0) {
    await base44.entities.UserOfflineStorage.update(stateArr[0].id, { used_bytes: used });
  }
  return used;
}

export async function canFitDownload(me, sizeBytes) {
  const state = await ensureStorageState(me);
  const used = Number(state.used_bytes || 0);
  const limit = Number(state.limit_bytes || 0);
  return used + Number(sizeBytes || 0) <= limit;
}

export async function downloadLesson(me, lesson) {
  const sizeEstimate = estimateTextBytes(lesson.content || "");
  const ok = await canFitDownload(me, sizeEstimate);
  if (!ok) throw new Error("LIMIT_EXCEEDED");

  const item = await base44.entities.OfflineItem.create({
    user_id: me.id,
    type: "lesson",
    key: lesson.id,
    title: lesson.title,
    version: lesson.updated_date || new Date().toISOString(),
    size_bytes: sizeEstimate,
    status: "ready",
    progress: 100,
  });

  await recalcUsedBytes(me);
  return item;
}

export async function downloadCourse(me, course, lessons) {
  const sizeEstimate = estimateTextBytes(JSON.stringify({ course, lessons }));
  const ok = await canFitDownload(me, sizeEstimate);
  if (!ok) throw new Error("LIMIT_EXCEEDED");

  const item = await base44.entities.OfflineItem.create({
    user_id: me.id,
    type: "course",
    key: course.id,
    title: course.title,
    version: course.updated_date || new Date().toISOString(),
    size_bytes: sizeEstimate,
    status: "ready",
    progress: 100,
  });

  await recalcUsedBytes(me);
  return item;
}

export async function deleteOfflineItem(me, itemId) {
  await base44.entities.OfflineItem.delete(itemId);
  await recalcUsedBytes(me);
}

export async function checkOfflineUpdates(me) {
  const items = await base44.entities.OfflineItem.filter({ user_id: me.id, status: "ready" }, null, 2000).catch(() => []);
  const out = [];

  for (const it of items || []) {
    if (it.type === "lesson") {
      const latest = await base44.entities.Lesson.filter({ id: it.key }, null, 1).catch(() => []);
      if (!latest.length) continue;
      const latestV = latest[0].updated_date || null;
      if (latestV && it.version && String(latestV) !== String(it.version)) {
        out.push({ offlineItem: it, latestVersion: latestV, reason: "Lesson updated" });
      }
    } else if (it.type === "course") {
      const course = await base44.entities.Course.filter({ id: it.key }, null, 1).catch(() => []);
      if (!course.length) continue;
      const latestV = course[0].updated_date || null;
      if (latestV && it.version && String(latestV) !== String(it.version)) {
        out.push({ offlineItem: it, latestVersion: latestV, reason: "Course updated" });
      }
    }
  }

  return out;
}

export async function applyOfflineUpdates(me, itemIds) {
  for (const id of itemIds) {
    const items = await base44.entities.OfflineItem.filter({ id }, null, 1).catch(() => []);
    const it = items[0];
    if (!it) continue;

    if (it.type === "lesson") {
      const latest = await base44.entities.Lesson.filter({ id: it.key }, null, 1).catch(() => []);
      if (!latest.length) continue;
      const sizeEstimate = estimateTextBytes(latest[0].content || "");
      await base44.entities.OfflineItem.update(it.id, {
        version: latest[0].updated_date || new Date().toISOString(),
        size_bytes: sizeEstimate,
      });
    } else if (it.type === "course") {
      const course = await base44.entities.Course.filter({ id: it.key }, null, 1).catch(() => []);
      if (!course.length) continue;
      await base44.entities.OfflineItem.update(it.id, {
        version: course[0].updated_date || new Date().toISOString(),
      });
    }
  }
  await recalcUsedBytes(me);
}