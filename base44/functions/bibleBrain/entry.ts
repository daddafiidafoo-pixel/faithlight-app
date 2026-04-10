import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get('BIBLE_BRAIN_API_KEY');
const BASE_URL = 'https://4.dbt.io/api';

async function apiFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${path}${sep}v=4&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bible Brain API error: ${res.status} ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
  const body = await req.json().catch(() => ({}));
  const { action, fileset_id, book_id, chapter } = body;

  // ── GET CHAPTER AUDIO URL ──────────────────────────────────────────────────
  if (action === 'chapter_url') {
    if (!fileset_id || !book_id || !chapter) {
      return Response.json({ error: 'fileset_id, book_id, chapter required' }, { status: 400 });
    }
    if (!API_KEY) {
      // No API key — return placeholder so UI doesn't crash
      return Response.json({ url: null, message: 'BIBLE_BRAIN_API_KEY not set' });
    }
    const data = await apiFetch(`/bibles/filesets/${fileset_id}/${book_id}/${chapter}`);
    const item = data?.data?.[0];
    const url = item?.path || null;
    return Response.json({ url, duration: item?.duration || null });
  }

  // ── GET CHAPTER TIMESTAMPS (verse-follow-along) ────────────────────────────
  if (action === 'timestamps') {
    if (!fileset_id || !book_id || !chapter) {
      return Response.json({ error: 'fileset_id, book_id, chapter required' }, { status: 400 });
    }
    if (!API_KEY) return Response.json({ timestamps: [] });
    const data = await apiFetch(`/timestamps/${fileset_id}/${book_id}/${chapter}`);
    return Response.json({ timestamps: data?.data || [] });
  }

  // ── LIST LANGUAGES WITH AUDIO ─────────────────────────────────────────────
  if (action === 'list_languages') {
    if (!API_KEY) return Response.json({ languages: [], message: 'BIBLE_BRAIN_API_KEY not set' });
    const data = await apiFetch('/languages?media=audio&include_translations=true');
    const languages = (data?.data || []).map(l => ({
      id: l.id,
      glotto_id: l.glotto_id,
      iso: l.iso,
      name: l.name,
      autonym: l.autonym,
    }));
    return Response.json({ languages });
  }

  // ── LIST BIBLES FOR A LANGUAGE ────────────────────────────────────────────
  if (action === 'list_bibles') {
    const { language_code } = body;
    if (!language_code) return Response.json({ error: 'language_code required' }, { status: 400 });
    if (!API_KEY) return Response.json({ bibles: [], message: 'BIBLE_BRAIN_API_KEY not set' });
    const data = await apiFetch(`/bibles?language_code=${language_code}&media=audio`);
    const bibles = (data?.data || []).map(b => ({
      abbr: b.abbr,
      name: b.name,
      language: b.language,
      filesets: (b.filesets || []).filter(f => f.type === 'audio' || f.type === 'audio_drama'),
    }));
    return Response.json({ bibles });
  }

  // ── LOOKUP SPECIFIC BIBLE BY ABBR ─────────────────────────────────────────
  if (action === 'lookup_bible') {
    const { abbr } = body;
    if (!abbr) return Response.json({ error: 'abbr required' }, { status: 400 });
    if (!API_KEY) return Response.json({ bible: null, message: 'BIBLE_BRAIN_API_KEY not set' });
    const data = await apiFetch(`/bibles/${abbr}`);
    return Response.json({ bible: data?.data || null });
  }

  // ── FIND AUDIO FILESETS FOR A LANGUAGE ────────────────────────────────────
  if (action === 'find_audio_filesets') {
    const { language_id } = body;
    if (!language_id) return Response.json({ error: 'language_id required' }, { status: 400 });
    if (!API_KEY) return Response.json({ filesets: [], message: 'BIBLE_BRAIN_API_KEY not set' });
    const data = await apiFetch(`/bibles?language_id=${language_id}`);
    const results = (data?.data || []).map(b => ({
      abbr: b.abbr,
      name: b.name,
      iso: b.iso,
      filesets: Object.values(b.filesets || {}).flat().filter(f => f.type?.startsWith('audio')),
    })).filter(b => b.filesets.length > 0);
    return Response.json({ results });
  }

  // ── CHECK DOWNLOAD PERMISSIONS ────────────────────────────────────────────
  if (action === 'check_downloads') {
    const { fileset_id: fid } = body;
    if (!fid || !API_KEY) return Response.json({ allowed: false });
    const data = await apiFetch(`/download/list?fileset_id=${fid}`);
    return Response.json({ allowed: !!(data?.data?.length) });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('bibleBrain error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});