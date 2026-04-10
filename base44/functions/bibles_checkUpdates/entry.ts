/**
 * POST /api/bibles/checkUpdates
 * Checks for updates to installed Bible packs
 */

import { ok, fail, handleOptions, readJson } from './_shared/http.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'POST') {
    return fail('METHOD_NOT_ALLOWED', 'Use POST.', 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await readJson(req);

    if (!body?.installed || !Array.isArray(body.installed)) {
      return fail(
        'BAD_REQUEST',
        'Body must include installed: [{packId, packVersion}].'
      );
    }

    const installed = body.installed
      .filter(
        (p) =>
          typeof p?.packId === 'string' && Number.isFinite(p?.packVersion)
      )
      .map((p) => ({
        packId: p.packId.trim(),
        packVersion: Number(p.packVersion),
        contentHash: p.contentHash,
      }));

    if (installed.length === 0) {
      return ok({ updates: [], meta: { checked: 0 } });
    }

    // Get unique packIds
    const packIds = [...new Set(installed.map((p) => p.packId))];

    // Query latest packs for all installed packIds
    const where = {
      status: 'active',
    };

    // Optional language filter
    const lang = (body.lang ?? '').trim().toLowerCase();
    if (lang) where.languageCode = lang;

    // Fetch all matching packs (we'll filter to latest per packId)
    const allRows = await base44.asServiceRole.entities.BiblePack.filter(
      where,
      '-packVersion',
      500
    );

    // Build map of latest version per packId
    const latest = new Map();
    for (const r of allRows) {
      if (packIds.includes(r.packId) && !latest.has(r.packId)) {
        latest.set(r.packId, r);
      }
    }

    const updates = [];
    for (const local of installed) {
      const remote = latest.get(local.packId);
      if (!remote) continue;

      // If remote version is newer
      if (remote.packVersion > local.packVersion) {
        updates.push({
          packId: remote.packId,
          type: remote.type,
          languageCode: remote.languageCode,
          versionId: remote.versionId,
          versionName: remote.versionName ?? remote.versionId,
          current: local.packVersion,
          latest: remote.packVersion,
          downloadUrl: remote.downloadUrl,
          contentHash: remote.contentHash ?? null,
          fileSizeBytes: remote.fileSizeBytes ?? null,
          updatedAt: remote.updatedAt ?? null,
          reason: 'NEW_VERSION',
        });
        continue;
      }

      // Check for hash mismatch (integrity check)
      if (
        local.contentHash &&
        remote.contentHash &&
        local.contentHash !== remote.contentHash
      ) {
        updates.push({
          packId: remote.packId,
          type: remote.type,
          languageCode: remote.languageCode,
          versionId: remote.versionId,
          versionName: remote.versionName ?? remote.versionId,
          current: local.packVersion,
          latest: remote.packVersion,
          downloadUrl: remote.downloadUrl,
          contentHash: remote.contentHash ?? null,
          fileSizeBytes: remote.fileSizeBytes ?? null,
          updatedAt: remote.updatedAt ?? null,
          reason: 'HASH_MISMATCH',
        });
      }
    }

    return ok({
      updates,
      meta: {
        checked: installed.length,
        uniquePackIds: packIds.length,
        lang: lang || null,
      },
    });
  } catch (e) {
    console.error('Update check error:', e);
    return fail('SERVER_ERROR', 'Could not check Bible pack updates.', 500);
  }
});