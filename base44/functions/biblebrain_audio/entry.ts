import { json, badRequest, notConfigured, serverError, getQuery } from "./_shared/http.ts";

Deno.serve(async (req) => {
  try {
    const q = getQuery(req);
    const filesetId = q.get("filesetId");
    const bookId = q.get("bookId");
    const chapter = q.get("chapter");

    if (!filesetId) return notConfigured("Missing filesetId for this version audio.");
    if (!bookId || !chapter) return badRequest("bookId and chapter are required.");

    const KEY = Deno.env.get("BIBLEBRAIN_KEY");
    if (!KEY) return notConfigured("BIBLEBRAIN_KEY secret is not set.");

    const base = Deno.env.get("BIBLEBRAIN_BASE") ?? "https://4.dbt.io/api";

    const url = `${base}/bibles/filesets/${encodeURIComponent(filesetId)}/${encodeURIComponent(bookId)}/${encodeURIComponent(chapter)}.mp3?key=${encodeURIComponent(KEY)}`;

    return json({
      ok: true,
      url,
      mime: "audio/mpeg",
      bookId,
      chapter: Number(chapter),
    });
  } catch (_e) {
    return serverError();
  }
});