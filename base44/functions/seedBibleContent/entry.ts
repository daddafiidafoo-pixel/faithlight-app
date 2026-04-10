/**
 * Backend function to seed Bible content from provider (BibleBrain, API.Bible, etc.)
 * This function:
 * - Fetches available Bibles by language
 * - Stores Bible metadata (versions)
 * - Stores book and chapter information
 * 
 * Call this manually or via a scheduled automation after connecting your Bible provider API key
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can seed Bible content
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, bibleData } = await req.json();

    if (action === 'seed_versions') {
      // Seed Bible versions
      const versions = await base44.entities.BibleVersion.bulkCreate(bibleData.versions);
      console.log(`[seedBibleContent] Created ${versions.length} Bible versions`);
      return Response.json({ success: true, count: versions.length });
    }

    if (action === 'seed_books') {
      // Seed Bible books for a specific version
      const books = await base44.entities.BibleBook.bulkCreate(bibleData.books);
      console.log(`[seedBibleContent] Created ${books.length} Bible books`);
      return Response.json({ success: true, count: books.length });
    }

    if (action === 'seed_chapter') {
      // Seed a single chapter with content
      const chapter = await base44.entities.BibleChapter.create(bibleData.chapter);
      console.log(`[seedBibleContent] Created chapter: ${bibleData.chapter.reference}`);
      return Response.json({ success: true, chapterId: chapter.id });
    }

    if (action === 'seed_daily_verses') {
      // Seed daily verses for the year in multiple languages
      const dailyVerses = await base44.entities.DailyVerse.bulkCreate(bibleData.verses);
      console.log(`[seedBibleContent] Created ${dailyVerses.length} daily verses`);
      return Response.json({ success: true, count: dailyVerses.length });
    }

    return Response.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[seedBibleContent] Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});