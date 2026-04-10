/**
 * getBibleCatalog
 * Returns the latest generated catalog, or a hardcoded Phase 1 bootstrap
 * catalog so the app works even before generateBibleCatalog is run.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Bootstrap catalog — works out of the box with known DBP fileset IDs.
// These are real public-domain/open-licensed filesets from Bible Brain.
// Run generateBibleCatalog to auto-discover and replace with live data.
const BOOTSTRAP_CATALOG = {
  generatedAt: '2026-03-05',
  provider:    'biblebrain',
  isBootstrap: true,
  // NOTE: Non-English languages are listed here but marked hasVersions:false
  // until real BibleBrain fileset IDs are confirmed.
  // Set BIBLE_BRAIN_KEY env var, run generateBibleCatalog, then paste results
  // back here to get real textDamId + audioDamId + license info per language.
  languages: [
    { code: 'en', name: 'English',      flag: '🇺🇸', dir: 'ltr', hasVersions: true  },
    { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹', dir: 'ltr', hasVersions: false, comingSoon: true },
    { code: 'am', name: 'Amharic',      flag: '🇪🇹', dir: 'ltr', hasVersions: false, comingSoon: true },
    { code: 'sw', name: 'Kiswahili',    flag: '🇰🇪', dir: 'ltr', hasVersions: false, comingSoon: true },
    { code: 'fr', name: 'Français',     flag: '🇫🇷', dir: 'ltr', hasVersions: false, comingSoon: true },
    { code: 'ar', name: 'العربية',       flag: '🇸🇦', dir: 'rtl', hasVersions: false, comingSoon: true },
    { code: 'pt', name: 'Português',    flag: '🇧🇷', dir: 'ltr', hasVersions: false, comingSoon: true },
    { code: 'es', name: 'Español',      flag: '🇪🇸', dir: 'ltr', hasVersions: false, comingSoon: true },
  ],
  versions: [
    // ── ENGLISH ──────────────────────────────────────────────────────────
    {
      id:             'en_web',
      language:       'en',
      title:          'World English Bible (WEB)',
      abbr:           'WEB',
      isDefault:      true,
      hasText:        true,
      hasAudio:       true,
      textFilesetId:  'ENGWEBN2ET',
      audioFilesetId: 'ENGWEBN2DA',
      provider:       'biblebrain',
      dbpBibleId:     'ENGWEB',
      coverage:       { ot: true, nt: true },
      license:        'public-domain',
      offlineAllowed: true,
      attribution:    'World English Bible (Public Domain).',
    },
    {
      id:             'en_kjv',
      language:       'en',
      title:          'King James Version (KJV)',
      abbr:           'KJV',
      isDefault:      false,
      hasText:        true,
      hasAudio:       true,
      textFilesetId:  'ENGKJVN2ET',
      audioFilesetId: 'ENGKJVN2DA',
      provider:       'biblebrain',
      dbpBibleId:     'ENGKJV',
      coverage:       { ot: true, nt: true },
      license:        'public-domain',
      offlineAllowed: true,
      attribution:    'King James Version (1611, Public Domain).',
    },
    // ── PLACEHOLDER STUBS (will be filled after BibleBrain discovery) ────
    // Oromo — awaiting fileset IDs from BibleBrain (langCode: orm / gaz / gax)
    // {
    //   id: 'om_xxx', language: 'om', title: 'Afaan Oromoo Bible',
    //   textFilesetId: 'TBD', audioFilesetId: 'TBD',
    //   license: 'fcbh-streaming-only', offlineAllowed: false,
    //   attribution: 'Provided via BibleBrain / FCBH (streaming only).',
    // },
    // Amharic — awaiting fileset IDs (langCode: amh)
    // Swahili  — awaiting fileset IDs (langCode: swh)
    // French   — awaiting fileset IDs (langCode: fra)
    // Arabic   — awaiting fileset IDs (langCode: arb)
    // Portuguese — awaiting fileset IDs (langCode: por)
    // Spanish  — awaiting fileset IDs (langCode: spa)
  ],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Try to fetch a live-generated catalog from entity store
    try {
      const entries = await base44.asServiceRole.entities.BibleCatalog.filter(
        { type: 'version', code: 'phase1_catalog' },
        '-created_date',
        1
      );
      const latest = entries?.[0];
      if (latest?.metadata?.catalogJson) {
        return Response.json(latest.metadata.catalogJson, {
          headers: { 'Cache-Control': 'public, max-age=3600' }
        });
      }
    } catch (e) {
      console.warn('No live catalog in entity store, using bootstrap:', e.message);
    }

    // Fall back to bootstrap
    return Response.json(BOOTSTRAP_CATALOG, {
      headers: { 'Cache-Control': 'public, max-age=300' }
    });

  } catch (err) {
    console.error('getBibleCatalog error:', err);
    return Response.json(BOOTSTRAP_CATALOG);
  }
});