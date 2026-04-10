import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const VERSE_REFS = [
  { bookCode: 'PHP', chapter: 4, verse: 13 },
  { bookCode: 'PSA', chapter: 23, verse: 1 },
  { bookCode: 'JHN', chapter: 3, verse: 16 },
  { bookCode: 'ROM', chapter: 8, verse: 28 },
  { bookCode: 'PRV', chapter: 3, verse: 5 },
  { bookCode: 'MTT', chapter: 6, verse: 33 },
  { bookCode: '1PE', chapter: 5, verse: 7 }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const results = [];
    let created = 0;

    for (const ref of VERSE_REFS) {
      const existing = await base44.entities.BibleVerseRefs.filter({
        bookCode: ref.bookCode,
        chapter: ref.chapter,
        verse: ref.verse
      });

      if (!existing || existing.length === 0) {
        const created_ref = await base44.entities.BibleVerseRefs.create(ref);
        created++;
        results.push({ status: 'created', ref: `${ref.bookCode} ${ref.chapter}:${ref.verse}`, id: created_ref.id });
      } else {
        results.push({ status: 'exists', ref: `${ref.bookCode} ${ref.chapter}:${ref.verse}` });
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} verse references`,
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});