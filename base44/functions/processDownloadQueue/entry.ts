import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Reset any items stuck in "downloading" for more than 2 minutes (crashed runs)
    const stuckItems = await base44.asServiceRole.entities.DownloadQueue.filter(
      { status: 'downloading' },
      'created_date',
      20
    );
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    for (const stuck of stuckItems) {
      const updatedAt = stuck.updated_date ? new Date(stuck.updated_date).getTime() : 0;
      if (updatedAt < twoMinutesAgo) {
        console.log(`Resetting stuck item: ${stuck.id}`);
        await base44.asServiceRole.entities.DownloadQueue.update(stuck.id, { status: 'queued' });
      }
    }

    // Find up to 5 queued items (oldest first)
    const queued = await base44.asServiceRole.entities.DownloadQueue.filter(
      { status: 'queued' },
      'created_date',
      5
    );

    if (!queued.length) {
      return Response.json({ processed: 0, message: 'Queue empty' });
    }

    const results = [];

    for (const item of queued) {
      // Mark as downloading to avoid double-processing
      await base44.asServiceRole.entities.DownloadQueue.update(item.id, { status: 'downloading' });

      try {
        if (item.type === 'text') {
          await processText(base44, item);
        } else if (item.type === 'audio') {
          await processAudio(base44, item);
        } else {
          throw new Error(`Unknown type: ${item.type}`);
        }
        await base44.asServiceRole.entities.DownloadQueue.update(item.id, { status: 'done' });
        results.push({ id: item.id, status: 'done', type: item.type, book: item.book_id, chapter: item.chapter });
      } catch (err) {
        console.error(`Queue item ${item.id} failed:`, err.message);
        await base44.asServiceRole.entities.DownloadQueue.update(item.id, {
          status: 'failed',
          error: err.message,
        });
        results.push({ id: item.id, status: 'failed', error: err.message });
      }
    }

    // Return how many are still queued so the caller knows whether to poll again
    const remaining = await base44.asServiceRole.entities.DownloadQueue.filter(
      { status: 'queued' },
      'created_date',
      1
    );

    return Response.json({
      processed: results.length,
      remaining: remaining.length,
      results,
    });
  } catch (error) {
    console.error('processDownloadQueue error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Text: query BibleVerse entity directly (already seeded) ─────────────────
async function processText(base44, item) {
  const { version_id, book_id, book_name, chapter, language_code, user_id } = item;
  const translation = version_id || 'WEB';

  // Skip if already saved
  const existing = await base44.asServiceRole.entities.OfflineTextChapter.filter(
    { version_id: translation, book_id, chapter },
    'created_date',
    1
  );
  if (existing.length) {
    console.log(`Already saved: ${book_id} ${chapter} (${translation})`);
    return;
  }

  // Fetch from BibleVerse entity — filter by translation + book_id + chapter
  // book_id here is the 3-letter code (e.g. JHN), but BibleVerse stores full names.
  // We match on book_id stored in BibleVerse.book_id (numeric) OR on book name.
  // Use the book_name if available.
  let verses = [];

  // Try by book name first (most reliable)
  if (book_name) {
    verses = await base44.asServiceRole.entities.BibleVerse.filter(
      { translation, book: book_name, chapter },
      'verse',
      200
    );
  }

  // Fallback: try book_id as book name (in case caller passed full name as book_id)
  if (!verses.length) {
    verses = await base44.asServiceRole.entities.BibleVerse.filter(
      { translation, book: book_id, chapter },
      'verse',
      200
    );
  }

  if (!verses.length) {
    throw new Error(`No verses found for ${book_name || book_id} ${chapter} (${translation}) — make sure Bible data is seeded.`);
  }

  await base44.asServiceRole.entities.OfflineTextChapter.create({
    version_id: translation,
    language_code: language_code || 'en',
    book_id,
    book_name: book_name || book_id,
    chapter,
    verses_json: JSON.stringify(
      verses.map(v => ({ verse: v.verse, text: v.text, reference: v.reference }))
    ),
    verse_count: verses.length,
    user_id: user_id || null,
    downloaded_at: new Date().toISOString(),
  });

  console.log(`Saved text: ${book_name || book_id} ${chapter} (${translation}), ${verses.length} verses`);
}

// ── Audio: store chapter URL from Bible Brain ────────────────────────────────
async function processAudio(base44, item) {
  const { fileset_id_audio, book_id, book_name, chapter, language_code, language_name, bible_name, user_id } = item;
  if (!fileset_id_audio) throw new Error('No fileset_id_audio on queue item');

  // Skip if already saved
  const existing = await base44.asServiceRole.entities.OfflineAudioChapter.filter(
    { fileset_id_audio, book_id, chapter },
    'created_date',
    1
  );
  if (existing.length) {
    console.log(`Already saved audio: ${book_id} ${chapter}`);
    return;
  }

  // Fetch chapter URL list from Bible Brain
  const BIBLE_BRAIN_KEY = Deno.env.get('BIBLE_BRAIN_KEY');
  if (!BIBLE_BRAIN_KEY) throw new Error('BIBLE_BRAIN_KEY secret not set');

  const apiUrl = `https://4.dbt.io/api/bibles/filesets/${encodeURIComponent(fileset_id_audio)}/${encodeURIComponent(book_id)}/${chapter}?v=4&key=${BIBLE_BRAIN_KEY}&type=audio`;
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`Bible Brain API error: ${resp.status} ${resp.statusText}`);

  const data = await resp.json();
  const files = data?.data;
  if (!files?.length) throw new Error(`No audio files returned for ${book_id} ${chapter}`);

  // Use the first file's path as the stream URL
  const audioUrl = files[0].path;
  if (!audioUrl) throw new Error(`No path in Bible Brain response for ${book_id} ${chapter}`);

  await base44.asServiceRole.entities.OfflineAudioChapter.create({
    language_code: language_code || 'en',
    language_name: language_name || '',
    fileset_id_audio,
    bible_name: bible_name || '',
    book_id,
    book_name: book_name || book_id,
    chapter,
    audio_source_url: audioUrl,
    user_id: user_id || null,
    downloaded_at: new Date().toISOString(),
  });

  console.log(`Saved audio URL: ${book_id} ${chapter} → ${audioUrl}`);
}