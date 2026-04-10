import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BOOKS = [
  { code: 'GEN', testament: 'OT', sortOrder: 1, numChapters: 50 },
  { code: 'PSA', testament: 'OT', sortOrder: 19, numChapters: 150 },
  { code: 'PRV', testament: 'OT', sortOrder: 20, numChapters: 31 },
  { code: 'MTT', testament: 'NT', sortOrder: 40, numChapters: 28 },
  { code: 'JHN', testament: 'NT', sortOrder: 43, numChapters: 21 },
  { code: 'ROM', testament: 'NT', sortOrder: 45, numChapters: 16 },
  { code: 'PHP', testament: 'NT', sortOrder: 50, numChapters: 4 },
  { code: '1PE', testament: 'NT', sortOrder: 60, numChapters: 5 }
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

    for (const book of BOOKS) {
      const existing = await base44.entities.BibleBooks.filter({
        code: book.code
      });

      if (!existing || existing.length === 0) {
        await base44.entities.BibleBooks.create(book);
        created++;
        results.push({ status: 'created', code: book.code });
      } else {
        results.push({ status: 'exists', code: book.code });
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} Bible books`,
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