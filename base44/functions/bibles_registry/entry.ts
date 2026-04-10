/**
 * GET /api/bibles/registry
 * Returns available offline Bible packs
 */

import { ok, fail, handleOptions, clampInt } from './_shared/http.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function normalizeType(t) {
  const v = (t || '').trim().toLowerCase();
  return v ? v : '';
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'GET') {
    return fail('METHOD_NOT_ALLOWED', 'Use GET.', 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);

    const lang = (url.searchParams.get('lang') ?? '').trim().toLowerCase();
    const type = normalizeType(url.searchParams.get('type') ?? '');
    const includeDisabled = (url.searchParams.get('includeDisabled') ?? '') === '1';
    const limit = clampInt(Number(url.searchParams.get('limit') ?? 200), 1, 1000);

    // Build query filter
    const where = {};
    if (lang) where.languageCode = lang;
    if (type) where.type = type;
    if (!includeDisabled) where.status = 'active';

    // Fetch packs, ordered by packId and then by version descending
    const rows = await base44.asServiceRole.entities.BiblePack.filter(
      where,
      '-packVersion',
      limit
    );

    // Keep only the latest entry per packId
    const latestByPackId = new Map();
    for (const r of rows) {
      if (!r?.packId) continue;
      if (!latestByPackId.has(r.packId)) {
        latestByPackId.set(r.packId, r);
      }
    }

    const packs = Array.from(latestByPackId.values());

    // Build language and version lists for UI pickers
    const languagesMap = new Map();
    const versionsMap = new Map();

    for (const p of packs) {
      if (p.languageCode) {
        languagesMap.set(p.languageCode, {
          code: p.languageCode,
          name: p.languageName ?? p.languageCode,
        });
      }
      if (p.versionId) {
        const key = `${p.languageCode}:${p.versionId}`;
        versionsMap.set(key, {
          versionId: p.versionId,
          versionName: p.versionName ?? p.versionId,
          languageCode: p.languageCode,
        });
      }
    }

    return ok({
      packs,
      languages: Array.from(languagesMap.values()).sort((a, b) =>
        a.code.localeCompare(b.code)
      ),
      versions: Array.from(versionsMap.values()).sort((a, b) =>
        `${a.languageCode}:${a.versionId}`.localeCompare(`${b.languageCode}:${b.versionId}`)
      ),
      meta: {
        filteredBy: {
          lang: lang || null,
          type: type || null,
          includeDisabled,
        },
        count: packs.length,
      },
    });
  } catch (e) {
    console.error('Registry error:', e);
    return fail('SERVER_ERROR', 'Could not load Bible pack registry.', 500);
  }
});