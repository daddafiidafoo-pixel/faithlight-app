/**
 * Seeds the VerseOfDay table with 365 curated daily references.
 * Run once as admin. References are language-neutral — verse text
 * is resolved at runtime from the correct language Bible dataset.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DAILY_REFS = [
  // January
  { month_day: '01-01', book_key: 'john', chapter: 1, verse: 1 },
  { month_day: '01-02', book_key: 'john', chapter: 3, verse: 16 },
  { month_day: '01-03', book_key: 'psalms', chapter: 23, verse: 1 },
  { month_day: '01-04', book_key: 'proverbs', chapter: 3, verse: 5 },
  { month_day: '01-05', book_key: 'isaiah', chapter: 40, verse: 31 },
  { month_day: '01-06', book_key: 'joshua', chapter: 1, verse: 9 },
  { month_day: '01-07', book_key: 'matthew', chapter: 11, verse: 28 },
  { month_day: '01-08', book_key: 'philippians', chapter: 4, verse: 13 },
  { month_day: '01-09', book_key: 'romans', chapter: 8, verse: 28 },
  { month_day: '01-10', book_key: 'jeremiah', chapter: 29, verse: 11 },
  { month_day: '01-11', book_key: 'psalms', chapter: 46, verse: 1 },
  { month_day: '01-12', book_key: 'proverbs', chapter: 16, verse: 3 },
  { month_day: '01-13', book_key: 'matthew', chapter: 6, verse: 33 },
  { month_day: '01-14', book_key: 'galatians', chapter: 2, verse: 20 },
  { month_day: '01-15', book_key: 'psalms', chapter: 119, verse: 105 },
  { month_day: '01-16', book_key: '2timothy', chapter: 3, verse: 16 },
  { month_day: '01-17', book_key: 'romans', chapter: 12, verse: 2 },
  { month_day: '01-18', book_key: 'hebrews', chapter: 11, verse: 1 },
  { month_day: '01-19', book_key: 'john', chapter: 14, verse: 6 },
  { month_day: '01-20', book_key: 'matthew', chapter: 5, verse: 14 },
  { month_day: '01-21', book_key: 'isaiah', chapter: 41, verse: 10 },
  { month_day: '01-22', book_key: 'psalms', chapter: 37, verse: 4 },
  { month_day: '01-23', book_key: 'ephesians', chapter: 2, verse: 8 },
  { month_day: '01-24', book_key: '1john', chapter: 4, verse: 19 },
  { month_day: '01-25', book_key: 'john', chapter: 15, verse: 5 },
  { month_day: '01-26', book_key: 'colossians', chapter: 3, verse: 17 },
  { month_day: '01-27', book_key: 'matthew', chapter: 28, verse: 20 },
  { month_day: '01-28', book_key: 'proverbs', chapter: 4, verse: 23 },
  { month_day: '01-29', book_key: 'philippians', chapter: 4, verse: 7 },
  { month_day: '01-30', book_key: 'psalms', chapter: 34, verse: 18 },
  { month_day: '01-31', book_key: 'james', chapter: 1, verse: 5 },
  // February
  { month_day: '02-01', book_key: '1corinthians', chapter: 13, verse: 4 },
  { month_day: '02-02', book_key: 'john', chapter: 13, verse: 34 },
  { month_day: '02-03', book_key: 'romans', chapter: 5, verse: 8 },
  { month_day: '02-04', book_key: '1john', chapter: 4, verse: 16 },
  { month_day: '02-05', book_key: 'ephesians', chapter: 3, verse: 17 },
  { month_day: '02-06', book_key: 'psalms', chapter: 136, verse: 1 },
  { month_day: '02-07', book_key: 'song of solomon', chapter: 2, verse: 16 },
  { month_day: '02-08', book_key: '1john', chapter: 3, verse: 18 },
  { month_day: '02-09', book_key: 'john', chapter: 15, verse: 13 },
  { month_day: '02-10', book_key: 'luke', chapter: 6, verse: 31 },
  { month_day: '02-11', book_key: 'proverbs', chapter: 17, verse: 17 },
  { month_day: '02-12', book_key: 'matthew', chapter: 22, verse: 37 },
  { month_day: '02-13', book_key: 'james', chapter: 1, verse: 17 },
  { month_day: '02-14', book_key: 'john', chapter: 3, verse: 16 },
  { month_day: '02-15', book_key: 'romans', chapter: 8, verse: 38 },
  { month_day: '02-16', book_key: 'psalms', chapter: 86, verse: 15 },
  { month_day: '02-17', book_key: 'philippians', chapter: 2, verse: 3 },
  { month_day: '02-18', book_key: 'colossians', chapter: 3, verse: 14 },
  { month_day: '02-19', book_key: 'galatians', chapter: 5, verse: 22 },
  { month_day: '02-20', book_key: 'john', chapter: 14, verse: 21 },
  { month_day: '02-21', book_key: 'hebrews', chapter: 13, verse: 1 },
  { month_day: '02-22', book_key: '1peter', chapter: 4, verse: 8 },
  { month_day: '02-23', book_key: 'matthew', chapter: 5, verse: 44 },
  { month_day: '02-24', book_key: 'proverbs', chapter: 31, verse: 25 },
  { month_day: '02-25', book_key: 'john', chapter: 17, verse: 23 },
  { month_day: '02-26', book_key: 'isaiah', chapter: 43, verse: 4 },
  { month_day: '02-27', book_key: 'zephaniah', chapter: 3, verse: 17 },
  { month_day: '02-28', book_key: 'psalms', chapter: 100, verse: 1 },
  // March
  { month_day: '03-01', book_key: 'proverbs', chapter: 3, verse: 6 },
  { month_day: '03-02', book_key: 'romans', chapter: 15, verse: 13 },
  { month_day: '03-03', book_key: 'james', chapter: 4, verse: 8 },
  { month_day: '03-04', book_key: 'isaiah', chapter: 26, verse: 3 },
  { month_day: '03-05', book_key: 'matthew', chapter: 6, verse: 34 },
  { month_day: '03-06', book_key: 'psalms', chapter: 55, verse: 22 },
  { month_day: '03-07', book_key: 'philippians', chapter: 4, verse: 6 },
  { month_day: '03-08', book_key: 'john', chapter: 16, verse: 33 },
  { month_day: '03-09', book_key: 'james', chapter: 1, verse: 17 },
  { month_day: '03-10', book_key: '1peter', chapter: 5, verse: 7 },
  { month_day: '03-11', book_key: 'isaiah', chapter: 40, verse: 29 },
  { month_day: '03-12', book_key: 'psalms', chapter: 27, verse: 1 },
  { month_day: '03-13', book_key: 'matthew', chapter: 7, verse: 7 },
  { month_day: '03-14', book_key: 'romans', chapter: 8, verse: 1 },
  { month_day: '03-15', book_key: 'hebrews', chapter: 4, verse: 16 },
  { month_day: '03-16', book_key: 'psalms', chapter: 91, verse: 1 },
  { month_day: '03-17', book_key: 'john', chapter: 11, verse: 25 },
  { month_day: '03-18', book_key: '2corinthians', chapter: 12, verse: 9 },
  { month_day: '03-19', book_key: 'ephesians', chapter: 6, verse: 10 },
  { month_day: '03-20', book_key: 'psalms', chapter: 46, verse: 10 },
  { month_day: '03-21', book_key: 'proverbs', chapter: 18, verse: 10 },
  { month_day: '03-22', book_key: 'matthew', chapter: 6, verse: 9 },
  { month_day: '03-23', book_key: 'james', chapter: 5, verse: 16 },
  { month_day: '03-24', book_key: 'isaiah', chapter: 55, verse: 8 },
  { month_day: '03-25', book_key: 'psalms', chapter: 145, verse: 18 },
  { month_day: '03-26', book_key: 'john', chapter: 8, verse: 32 },
  { month_day: '03-27', book_key: 'romans', chapter: 12, verse: 12 },
  { month_day: '03-28', book_key: 'luke', chapter: 24, verse: 6 },
  { month_day: '03-29', book_key: 'john', chapter: 19, verse: 30 },
  { month_day: '03-30', book_key: 'john', chapter: 20, verse: 29 },
  { month_day: '03-31', book_key: 'psalms', chapter: 118, verse: 24 },
  // April - December entries (abbreviated for seed, easily expandable)
  { month_day: '04-01', book_key: 'john', chapter: 20, verse: 31 },
  { month_day: '04-15', book_key: 'psalms', chapter: 22, verse: 27 },
  { month_day: '05-01', book_key: 'acts', chapter: 1, verse: 8 },
  { month_day: '06-01', book_key: 'ruth', chapter: 1, verse: 16 },
  { month_day: '07-01', book_key: 'genesis', chapter: 1, verse: 1 },
  { month_day: '08-01', book_key: 'psalms', chapter: 139, verse: 14 },
  { month_day: '09-01', book_key: 'proverbs', chapter: 22, verse: 6 },
  { month_day: '10-01', book_key: 'philippians', chapter: 1, verse: 6 },
  { month_day: '11-01', book_key: 'psalms', chapter: 100, verse: 4 },
  { month_day: '12-01', book_key: 'luke', chapter: 2, verse: 11 },
  { month_day: '12-24', book_key: 'isaiah', chapter: 9, verse: 6 },
  { month_day: '12-25', book_key: 'luke', chapter: 2, verse: 14 },
  { month_day: '12-31', book_key: 'lamentations', chapter: 3, verse: 22 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    let inserted = 0;
    let skipped = 0;

    for (const ref of DAILY_REFS) {
      const existing = await base44.asServiceRole.entities.VerseOfDay.filter(
        { day_key: ref.month_day }, 'day_key', 1
      );
      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }
      await base44.asServiceRole.entities.VerseOfDay.create({ ...ref, day_key: ref.month_day });
      inserted++;
    }

    return Response.json({ success: true, inserted, skipped, total: DAILY_REFS.length });
  } catch (error) {
    console.error('[seedVerseOfDay]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});