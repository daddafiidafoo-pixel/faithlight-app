import { json, badRequest, notConfigured, serverError, getQuery } from "./_shared/http.ts";

Deno.serve(async (req) => {
  try {
    const q = getQuery(req);
    const lang = q.get("lang");
    if (!lang) return badRequest("lang is required.");

    const API_KEY = Deno.env.get("API_BIBLE_KEY");
    if (!API_KEY) return notConfigured("API_BIBLE_KEY secret is not set.");

    const base = Deno.env.get("API_BIBLE_BASE") ?? "https://api.scripture.api.bible/v1";

    const url = `${base}/bibles`;
    const r = await fetch(url, { headers: { "api-key": API_KEY } });
    if (!r.ok) return json({ ok: false, code: "UPSTREAM_ERROR", message: "Unable to list versions." }, 502);

    const payload = await r.json();
    const all = payload?.data ?? [];

    const filtered = all.filter((b: any) => {
      const lid = (b?.language?.id ?? "").toLowerCase();
      const lnm = (b?.language?.name ?? "").toLowerCase();
      const abbr = (b?.abbreviation ?? "").toLowerCase();
      return lid.startsWith(lang) || abbr.includes(lang) || lnm.includes(lang);
    });

    const versions = filtered.map((b: any) => ({
      apiBibleId: b?.id,
      label: b?.name ?? b?.abbreviation ?? "Bible",
      language: b?.language?.name ?? "",
      abbreviation: b?.abbreviation ?? "",
    }));

    return json({ ok: true, lang, versions });
  } catch (_e) {
    return serverError();
  }
});