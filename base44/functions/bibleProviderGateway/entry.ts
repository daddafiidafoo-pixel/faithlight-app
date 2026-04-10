/**
 * Bible Provider Gateway
 * Acts as a proxy between FaithLight and BibleBrain/API.Bible
 * Protects API keys, normalizes responses, and enables caching
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const path = url.pathname;

    // Endpoints pattern: /v1/bible/[action]
    if (path === '/v1/bible/translations') {
      // GET /v1/bible/translations?language=en
      const language = url.searchParams.get('language') || 'en';
      
      const versions = await base44.entities.BibleVersion.filter({
        language,
        isActive: true
      });

      return Response.json({
        success: true,
        data: versions.map(v => ({
          id: v.id,
          bibleId: v.bibleId,
          name: v.name,
          hasText: v.hasText,
          hasAudio: v.hasAudio
        }))
      });
    }

    if (path === '/v1/bible/books') {
      // GET /v1/bible/books?bibleId=xxx
      const bibleId = url.searchParams.get('bibleId');
      if (!bibleId) throw new Error('bibleId required');

      const books = await base44.entities.BibleBook.filter({ bibleId });
      return Response.json({
        success: true,
        data: books.map(b => ({
          id: b.id,
          bookId: b.bookId,
          name: b.name,
          chapterCount: b.chapterCount,
          order: b.order
        }))
      });
    }

    if (path === '/v1/bible/passage') {
      // GET /v1/bible/passage?bibleId=xxx&bookId=xxx&chapterId=xxx&language=en
      const bibleId = url.searchParams.get('bibleId');
      const bookId = url.searchParams.get('bookId');
      const chapterId = url.searchParams.get('chapterId');
      const language = url.searchParams.get('language') || 'en';

      if (!bibleId || !bookId || !chapterId) {
        throw new Error('bibleId, bookId, chapterId required');
      }

      const chapter = await base44.entities.BibleChapter.filter({
        bibleId,
        bookId,
        chapterId,
        language
      });

      if (!chapter || chapter.length === 0) {
        return Response.json(
          { success: false, error: 'Chapter not found' },
          { status: 404 }
        );
      }

      const ch = chapter[0];
      return Response.json({
        success: true,
        data: {
          reference: ch.reference,
          text: ch.contentText,
          html: ch.contentHtml,
          audioUrl: ch.audioUrl,
          language: ch.language
        }
      });
    }

    if (path === '/v1/bible/audio') {
      // GET /v1/bible/audio?bibleId=xxx&chapterId=xxx&language=en
      const bibleId = url.searchParams.get('bibleId');
      const chapterId = url.searchParams.get('chapterId');
      const language = url.searchParams.get('language') || 'en';

      if (!bibleId || !chapterId) {
        throw new Error('bibleId, chapterId required');
      }

      const audio = await base44.entities.BibleAudioTrack.filter({
        bibleId,
        chapterId,
        language
      });

      if (!audio || audio.length === 0) {
        return Response.json(
          { success: false, error: 'Audio not found' },
          { status: 404 }
        );
      }

      const track = audio[0];
      return Response.json({
        success: true,
        data: {
          streamUrl: track.streamUrl,
          format: track.audioFormat,
          duration: track.duration,
          narrator: track.narrator
        }
      });
    }

    if (path === '/v1/daily-verse') {
      // GET /v1/daily-verse?language=en
      const language = url.searchParams.get('language') || 'en';
      const today = new Date().toISOString().split('T')[0].slice(5);

      const verse = await base44.entities.DailyVerse.filter({
        dateKey: today,
        language
      });

      if (!verse || verse.length === 0) {
        return Response.json(
          { success: false, error: 'No verse for today' },
          { status: 404 }
        );
      }

      const v = verse[0];
      return Response.json({
        success: true,
        data: {
          reference: v.reference,
          text: v.verseText,
          explanation: v.explanation,
          audioUrl: v.audioUrl,
          theme: v.theme,
          prayerFocus: v.prayerFocus,
          language: v.language
        }
      });
    }

    return Response.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[bibleProviderGateway] Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});