// Bible Brain catalog + audio URL lookup — keeps API key server-side
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DBP_BASE = "https://4.dbt.io/api";

// Hardcoded catalog of known audio filesets per language
// filesetId format for audio: e.g. ENGKJVO1DA (audio non-drama), ENGKJVO2DA (audio drama)
const LANGUAGE_CATALOG = {
  en: {
    label: "English",
    versions: [
      { id: "ENGESV", name: "English Standard Version", filesetId: "ENGESVN2DA", type: "audio_drama" },
      { id: "ENGKJV", name: "King James Version", filesetId: "ENGKJVO1DA", type: "audio" },
      { id: "ENGNIV", name: "New International Version", filesetId: "ENGNIVN2DA", type: "audio_drama" },
    ],
  },
  om: {
    label: "Afaan Oromoo",
    versions: [
      { id: "GAZBIB", name: "Afaan Oromoo Bible", filesetId: "GAZBIBN1DA", type: "audio" },
    ],
  },
  am: {
    label: "Amharic",
    versions: [
      { id: "AMHBSB", name: "Amharic Bible (BSE)", filesetId: "AMHBSBN1DA", type: "audio" },
      { id: "AMHNASB", name: "New Amharic Standard Bible", filesetId: "AMHNASBDA", type: "audio" },
    ],
  },
  ar: {
    label: "Arabic",
    versions: [
      { id: "ARBARAV", name: "Arabic Van Dyck", filesetId: "ARBARAVDA", type: "audio" },
      { id: "ARBSHAR", name: "Sharif Bible (NAV)", filesetId: "ARBSHARDA", type: "audio" },
    ],
  },
  fr: {
    label: "French",
    versions: [
      { id: "FRALSG", name: "Louis Segond 1910", filesetId: "FRALSGO1DA", type: "audio" },
      { id: "FRASEM", name: "Bible du Semeur", filesetId: "FRASEMN1DA", type: "audio" },
    ],
  },
  sw: {
    label: "Kiswahili",
    versions: [
      { id: "SWABSN", name: "Kiswahili (BSN)", filesetId: "SWABSNN1DA", type: "audio" },
      { id: "SWAKCV", name: "Kiswahili Contemporary Version", filesetId: "SWAKCVN2DA", type: "audio_drama" },
    ],
  },
  tir: {
    label: "Tigrinya",
    versions: [
      { id: "TIRBSE", name: "Tigrinya BSE 1991", filesetId: "TIRBSEN1DA", type: "audio" },
    ],
  },
  tig: {
    label: "Tigrayit",
    versions: [
      { id: "TIGWBT", name: "Tigrayit WBT", filesetId: "TIGWBTN1DA", type: "audio" },
    ],
  },
};

async function dbpFetch(path, apiKey) {
  // Bible Brain v4 requires key as query param
  const sep = path.includes('?') ? '&' : '?';
  const url = `${DBP_BASE}${path}${sep}key=${apiKey}&v=4`;
  console.log(`DBP fetch: ${url.replace(apiKey, '***')}`);
  const response = await fetch(url, {
    headers: { "accept": "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bible Brain ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action, lang, filesetId, bookId, chapter } = body;

    const apiKey = Deno.env.get("BIBLE_BRAIN_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "BIBLE_BRAIN_API_KEY not configured" }, { status: 503 });
    }

    // ── catalog: return versions for a language ───────────────────────────────
    if (action === "catalog") {
      const entry = LANGUAGE_CATALOG[lang] || LANGUAGE_CATALOG["en"];
      return Response.json({ ok: true, data: entry });
    }

    // ── audio: get chapter audio URL for a fileset ────────────────────────────
    if (action === "audio") {
      if (!filesetId || !bookId || !chapter) {
        return Response.json({ error: "filesetId, bookId, and chapter required" }, { status: 400 });
      }

      // Reject placeholder or invalid filesetIds
      if (filesetId === ":id" || filesetId === "id" || filesetId === "undefined" || filesetId === "null") {
        return Response.json({ error: `Invalid filesetId: '${filesetId}'. A real Bible Brain filesetId was not provided.` }, { status: 400 });
      }

      const bookCode = bookId.toUpperCase();
      console.log(`Audio lookup: fileset=${filesetId} book=${bookCode} ch=${chapter}`);

      // Bible Brain audio chapter endpoint
      const data = await dbpFetch(
        `/bibles/filesets/${filesetId}/${bookCode}/${chapter}`,
        apiKey
      );

      const items = data?.data || [];
      console.log(`Audio items: ${items.length}, first keys: ${items[0] ? Object.keys(items[0]).join(',') : 'none'}`);

      if (items.length === 0) {
        return Response.json({ error: "No audio found for this chapter" }, { status: 404 });
      }

      // Audio filesets return items with a `path` (signed CDN URL)
      const audioUrl = items[0]?.path || items[0]?.url || null;
      if (!audioUrl) {
        return Response.json({ error: "No audio URL in response", raw: items[0] }, { status: 404 });
      }

      return Response.json({
        ok: true,
        url: audioUrl,
        items: items.map(i => ({ path: i.path || i.url, verse_start: i.verse_start, duration: i.duration })),
      });
    }

    return Response.json({ error: "Invalid action. Use: catalog | audio" }, { status: 400 });

  } catch (error) {
    console.error("bibleBrainCatalog error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});