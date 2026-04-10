import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEFAULT_TRANSLATIONS = [
  {
    language: 'en',
    name: 'World English Bible',
    abbrev: 'WEB',
    license_name: 'Public Domain',
    license_url: 'https://ebible.org/web/',
    source_provider: 'eBible.org',
    is_official: true,
    offline_allowed: true,
    description: 'Modern English, public domain'
  },
  {
    language: 'en',
    name: 'American Standard Version',
    abbrev: 'ASV',
    license_name: 'Public Domain',
    license_url: 'https://ebible.org/asv/',
    source_provider: 'eBible.org',
    is_official: true,
    offline_allowed: true,
    description: 'Classic formal English, public domain'
  },
  {
    language: 'om',
    name: 'Macaafa Qulqulluu',
    abbrev: 'MQ',
    license_name: 'Creative Commons BY-NC-ND 4.0',
    license_url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    source_provider: 'Bible Society of Ethiopia',
    is_official: true,
    offline_allowed: true,
    description: 'Afaan Oromoo — eBible licensed'
  },
  {
    language: 'am',
    name: 'Amharic Bible',
    abbrev: 'AMH',
    license_name: 'Public Domain',
    license_url: 'https://ebible.org/amh/',
    source_provider: 'eBible.org',
    is_official: true,
    offline_allowed: true,
    description: 'Standard Amharic translation'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.BibleTranslation.list();
    const existingAbbrevs = new Set(existing.map(t => t.abbrev));

    const toCreate = DEFAULT_TRANSLATIONS.filter(t => !existingAbbrevs.has(t.abbrev));
    let created = 0;

    for (const t of toCreate) {
      await base44.asServiceRole.entities.BibleTranslation.create(t);
      created++;
    }

    return Response.json({ message: `Seeded ${created} translation(s). Skipped ${DEFAULT_TRANSLATIONS.length - created} existing.` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});