import { json, badRequest, notConfigured, serverError, getQuery, stripHtml } from "./_shared/http.ts";

Deno.serve(async (req) => {
  try {
    const q = getQuery(req);
    const apiBibleId = q.get("apiBibleId");
    const bookId = q.get("bookId");
    const chapter = q.get("chapter");

    if (!apiBibleId) return notConfigured("Missing apiBibleId for this version.");
    if (!bookId || !chapter) return badRequest("bookId and chapter are required.");

    const API_KEY = Deno.env.get("API_BIBLE_KEY");
    if (!API_KEY) return notConfigured("API_BIBLE_KEY secret is not set.");

    const base = Deno.env.get("API_BIBLE_BASE") ?? "https://api.scripture.api.bible/v1";

    const chapterId = `${bookId}.${chapter}`;
    const url = `${base}/bibles/${encodeURIComponent(apiBibleId)}/chapters/${encodeURIComponent(chapterId)}?content-type=json`;

    const r = await fetch(url, { headers: { "api-key": API_KEY } });
    if (!r.ok) {
      return json({ ok: false, code: "UPSTREAM_ERROR", message: "Bible text unavailable." }, 502);
    }

    const payload = await r.json();
    const content = payload?.data?.content;

    const verses: Array<{ v: number; t: string }> = [];

    if (Array.isArray(content)) {
      for (const node of content) {
        const items = node?.items ?? [];
        if (Array.isArray(items)) {
          for (const it of items) {
            const vNum = Number(it?.name ?? it?.verse ?? NaN);
            const text = typeof it?.text === "string" ? stripHtml(it.text) : "";
            if (Number.isFinite(vNum) && text) verses.push({ v: vNum, t: text });
          }
        }
      }
    }

    if (!verses.length) {
      const html = typeof payload?.data?.content === "string" ? payload.data.content : "";
      const text = html ? stripHtml(html) : "";
      if (!text) {
        return json({ ok: false, code: "NO_CONTENT", message: "No text content found." }, 404);
      }
      verses.push({ v: 1, t: text });
    }

    return json({
      ok: true,
      bookId,
      chapter: Number(chapter),
      verses,
      copyright: payload?.data?.copyright ?? "",
    });
  } catch (_e) {
    return serverError();
  }
});