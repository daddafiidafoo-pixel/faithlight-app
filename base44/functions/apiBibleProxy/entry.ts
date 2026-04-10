import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * API.Bible Proxy
 * Handles /api/bible/text and /api/bible/versions
 * Keeps API key server-side
 */

const API_BIBLE_KEY = Deno.env.get('API_BIBLE_KEY');
const API_BIBLE_BASE = 'https://api.scripture.api.bible/v1';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // /api/bible/text
    if (path === '/api/bible/text') {
      return handleGetText(url);
    }

    // /api/bible/versions
    if (path === '/api/bible/versions') {
      return handleListVersions(url);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('API.Bible proxy error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

async function handleGetText(url) {
  const versionId = url.searchParams.get('versionId');
  const bookId = url.searchParams.get('bookId');
  const chapter = url.searchParams.get('chapter');

  if (!versionId || !bookId || !chapter) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (!API_BIBLE_KEY) {
    return Response.json({ error: 'NOT_CONFIGURED' }, { status: 200 });
  }

  try {
    // Call API.Bible to get chapter text
    // Example endpoint: GET /bibles/{bibleId}/chapters/{chapterId}
    // For now, return NOT_CONFIGURED until IDs are mapped
    return Response.json({ error: 'NOT_CONFIGURED' }, { status: 200 });
  } catch (err) {
    console.error('API.Bible getText error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function handleListVersions(url) {
  const lang = url.searchParams.get('lang');

  if (!lang) {
    return Response.json({ error: 'Missing lang parameter' }, { status: 400 });
  }

  if (!API_BIBLE_KEY) {
    return Response.json([], { status: 200 });
  }

  try {
    // Call API.Bible to list bibles for language
    // For now, return empty list until discovery is implemented
    return Response.json([], { status: 200 });
  } catch (err) {
    console.error('API.Bible listVersions error:', err);
    return Response.json([], { status: 200 });
  }
}