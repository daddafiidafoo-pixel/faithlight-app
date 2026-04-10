import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/* eslint-disable no-undef */

const AUDIO_FILESETS = {
  en: {
    fileset_id: 'ENGESVN2DA',
    bible_id: 'ENGESV',
  },
  hae: {
    fileset_id: 'HAEBSEN2SA',
    bible_id: 'HAEBSE',
  },
  gaz: {
    fileset_id: 'GAZBIBN1DA',
    bible_id: 'GAZBIB',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { bookCode, chapter, language } = await req.json();

    if (!bookCode || !chapter || !language) {
      return Response.json(
        { error: 'Missing bookCode, chapter, or language' },
        { status: 400 }
      );
    }

    const config = AUDIO_FILESETS[language];
    if (!config) {
      console.warn(`Audio not available for language: ${language}`);
      return Response.json({ url: null }, { status: 200 });
    }

    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!apiKey) {
      console.error('BIBLE_BRAIN_API_KEY not set');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Query Bible Brain for audio file
    const url = `https://api.scripture.api.bible/v1/filesets/${config.fileset_id}/files?includeLogData=false`;
    const response = await fetch(url, {
      headers: { 'api-key': apiKey },
    });

    if (!response.ok) {
      console.error(`Bible Brain API error: ${response.status}`);
      return Response.json({ url: null }, { status: 200 });
    }

    const data = await response.json();
    const files = data?.data || [];

    // Find audio file for the specific book/chapter
    // File names typically follow: BOOKCODE_C##V##.mp3 or similar
    const bookChapterPattern = new RegExp(
      `${bookCode}_C${String(chapter).padStart(3, '0')}`,
      'i'
    );

    const audioFile = files.find(
      (f) => bookChapterPattern.test(f.filename) && f.filesize > 0
    );

    if (!audioFile) {
      console.warn(
        `No audio file found for ${bookCode} chapter ${chapter} in ${language}`
      );
      return Response.json({ url: null }, { status: 200 });
    }

    const audioUrl = audioFile.url || audioFile.path;

    return Response.json({
      url: audioUrl,
      title: `${bookCode} ${chapter}`,
      duration: null,
    });
  } catch (error) {
    console.error('getChapterAudio error:', error.message);
    return Response.json(
      { error: 'Failed to fetch audio' },
      { status: 500 }
    );
  }
});