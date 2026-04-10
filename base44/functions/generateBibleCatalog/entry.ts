/**
 * generateBibleCatalog
 * Admin-only function that queries BibleBrain for all Phase 1 languages
 * and builds a catalog of available text + audio versions.
 * 
 * Call with: base44.functions.invoke('generateBibleCatalog')
 * Stores result in BibleCatalog entity for fast reads.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DBP = 'https://4.dbt.io/api';

// Phase 1 language map: appCode → DBP ISO 639-3 codes to try (in order)
const PHASE1_LANGS = [
  { appCode: 'en',  dbpCodes: ['eng'],           label: 'English',           flag: '🇺🇸', dir: 'ltr' },
  { appCode: 'om',  dbpCodes: ['orm','gaz','gax'],label: 'Afaan Oromoo',     flag: '🇪🇹', dir: 'ltr' },
  { appCode: 'am',  dbpCodes: ['amh'],            label: 'Amharic',           flag: '🇪🇹', dir: 'ltr' },
  { appCode: 'sw',  dbpCodes: ['swh','swa'],      label: 'Kiswahili',        flag: '🇰🇪', dir: 'ltr' },
  { appCode: 'fr',  dbpCodes: ['fra'],            label: 'Français',          flag: '🇫🇷', dir: 'ltr' },
  { appCode: 'ar',  dbpCodes: ['arb','ara'],      label: 'العربية',           flag: '🇸🇦', dir: 'rtl' },
  { appCode: 'pt',  dbpCodes: ['por'],            label: 'Português',         flag: '🇧🇷', dir: 'ltr' },
  { appCode: 'es',  dbpCodes: ['spa'],            label: 'Español',           flag: '🇪🇸', dir: 'ltr' },
];

async function dbpFetch(path, key) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${DBP}${path}${sep}v=4&key=${encodeURIComponent(key)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`DBP ${r.status} for ${path}`);
  return r.json();
}

function pickBestTextBible(bibles) {
  if (!Array.isArray(bibles) || !bibles.length) return null;
  // Prefer ones with text filesets
  const withText = bibles.filter(b =>
    Array.isArray(b.filesets) && b.filesets.some(f => f.type?.startsWith('text'))
  );
  return withText[0] || bibles[0];
}

function extractFilesets(bible) {
  const filesets = Array.isArray(bible?.filesets) ? bible.filesets : [];
  const textFileset = filesets.find(f => f.type === 'text_plain' || f.type === 'text_format');
  const audioDrama  = filesets.find(f => f.type === 'audio_drama');
  const audioPlain  = filesets.find(f => f.type === 'audio');
  return {
    textFilesetId:  textFileset?.id ?? null,
    audioFilesetId: audioDrama?.id ?? audioPlain?.id ?? null,
    hasText:  !!textFileset,
    hasAudio: !!(audioDrama || audioPlain),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const key = Deno.env.get('BIBLE_BRAIN_KEY');
    if (!key) {
      return Response.json({ error: 'BIBLE_BRAIN_KEY not set' }, { status: 503 });
    }

    const languages = [];
    const versions  = [];

    for (const lang of PHASE1_LANGS) {
      let bibles = null;
      let usedCode = null;

      for (const code of lang.dbpCodes) {
        try {
          const data = await dbpFetch(`/bibles?language_code=${encodeURIComponent(code)}`, key);
          const list = data?.data ?? [];
          if (list.length > 0) {
            bibles = list;
            usedCode = code;
            break;
          }
        } catch (e) {
          console.warn(`DBP ${lang.label}/${code} failed:`, e.message);
        }
      }

      if (!bibles) {
        console.warn(`No bibles found for ${lang.label}`);
        languages.push({ code: lang.appCode, name: lang.label, flag: lang.flag, dir: lang.dir, hasVersions: false });
        continue;
      }

      const best = pickBestTextBible(bibles);
      const { textFilesetId, audioFilesetId, hasText, hasAudio } = extractFilesets(best);

      languages.push({
        code:       lang.appCode,
        name:       lang.label,
        flag:       lang.flag,
        dir:        lang.dir,
        hasVersions: true,
        dbpCode:    usedCode,
      });

      // Each "best bible" becomes the default version for this language
      const versionId = `${lang.appCode}_${(best?.abbr || 'primary').toLowerCase()}`;
      versions.push({
        id:             versionId,
        language:       lang.appCode,
        title:          best?.name ?? lang.label,
        abbr:           best?.abbr ?? null,
        isDefault:      true,
        hasText,
        hasAudio,
        textFilesetId,
        audioFilesetId,
        provider:       'biblebrain',
        dbpBibleId:     best?.abbr ?? null,
      });

      // Also add other bibles for this language as non-default versions
      for (const b of bibles.slice(1, 4)) { // max 3 extras
        const fs = extractFilesets(b);
        const vid = `${lang.appCode}_${(b?.abbr || b?.id || Math.random()).toString().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        versions.push({
          id:             vid,
          language:       lang.appCode,
          title:          b?.name ?? b?.abbr ?? 'Unknown',
          abbr:           b?.abbr ?? null,
          isDefault:      false,
          hasText:        fs.hasText,
          hasAudio:       fs.hasAudio,
          textFilesetId:  fs.textFilesetId,
          audioFilesetId: fs.audioFilesetId,
          provider:       'biblebrain',
          dbpBibleId:     b?.abbr ?? null,
        });
      }
    }

    const catalog = {
      generatedAt: new Date().toISOString(),
      provider:    'biblebrain',
      languages,
      versions,
    };

    // Store in entity for fast frontend reads
    await base44.asServiceRole.entities.BibleCatalog.create({
      type:     'version',
      code:     'phase1_catalog',
      name:     'Phase 1 Catalog Snapshot',
      metadata: { catalogJson: catalog, generatedAt: catalog.generatedAt },
    });

    console.log(`Catalog generated: ${languages.length} languages, ${versions.length} versions`);
    return Response.json({ ok: true, catalog });

  } catch (err) {
    console.error('generateBibleCatalog error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});