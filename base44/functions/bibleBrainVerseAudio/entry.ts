import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get('BIBLE_BRAIN_API_KEY');
const BASE_URL = 'https://4.dbt.io/api';

Deno.serve(async (req) => {
  try {
    const { fileset_id, book_id, chapter, verse_start, verse_end, language } = await req.json();

    if (!fileset_id || !book_id || !chapter || !verse_start) {
      return Response.json(
        { error: 'fileset_id, book_id, chapter, and verse_start are required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return Response.json(
        { error: 'BIBLE_BRAIN_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log(
      `[bibleBrainVerseAudio] Fetching ${fileset_id} / ${book_id} ${chapter}:${verse_start}${verse_end ? `-${verse_end}` : ''}`
    );

    // Bible Brain audio endpoint expects: /audio-files?fileset_id=&book_id=&chapter=&verse_start=&verse_end=
    const url = new URL(`${BASE_URL}/audio-files`);
    url.searchParams.set('fileset_id', fileset_id);
    url.searchParams.set('book_id', book_id);
    url.searchParams.set('chapter', chapter);
    url.searchParams.set('verse_start', verse_start);
    if (verse_end) url.searchParams.set('verse_end', verse_end);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('v', '4');

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[bibleBrainVerseAudio] API error ${res.status}: ${text}`);
      return Response.json(
        { error: `Bible Brain API error: ${res.status}`, url: null },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Bible Brain returns audio files in data array
    const audioFiles = Array.isArray(data?.data) ? data.data : [];

    if (audioFiles.length === 0) {
      console.warn(`[bibleBrainVerseAudio] No audio files found for ${fileset_id} ${book_id} ${chapter}:${verse_start}`);
      return Response.json({
        error: 'No audio file available for this verse',
        url: null,
      });
    }

    // Use the first matching audio file
    const audioFile = audioFiles[0];
    const audioUrl = audioFile?.url || audioFile?.stream_url || null;

    if (!audioUrl) {
      console.error('[bibleBrainVerseAudio] No URL in audio file response:', audioFile);
      return Response.json({
        error: 'Audio URL not found',
        url: null,
      });
    }

    console.log(`[bibleBrainVerseAudio] Success: ${audioUrl}`);

    return Response.json({
      url: audioUrl,
      duration: audioFile?.duration || null,
      fileset_id: audioFile?.fileset_id || fileset_id,
      book_id: audioFile?.book_id || book_id,
      chapter: audioFile?.chapter_number || chapter,
      verse_start: audioFile?.verse_start || verse_start,
      verse_end: audioFile?.verse_end || verse_end || verse_start,
    });
  } catch (error) {
    console.error('[bibleBrainVerseAudio] Error:', error.message);
    return Response.json(
      { error: error.message, url: null },
      { status: 500 }
    );
  }
});