import { json, badRequest, notConfigured, serverError, getQuery } from "./_shared/http.ts";

Deno.serve(async (req) => {
  try {
    const q = getQuery(req);
    const lang = q.get("lang");
    if (!lang) return badRequest("lang is required.");

    const KEY = Deno.env.get("BIBLEBRAIN_KEY");
    if (!KEY) return notConfigured("BIBLEBRAIN_KEY secret is not set.");

    const base = Deno.env.get("BIBLEBRAIN_BASE") ?? "https://4.dbt.io/api";

    const url = `${base}/bibles?language_code=${encodeURIComponent(lang)}&key=${encodeURIComponent(KEY)}`;

    const r = await fetch(url);
    if (!r.ok) return json({ ok: false, code: "UPSTREAM_ERROR", message: "Unable to list audio versions." }, 502);

    const payload = await r.json();

    const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
    const versions = items.map((x: any) => ({
      label: x?.name ?? x?.abbr ?? x?.bible ?? "Bible",
      filesets: x?.filesets ?? [],
      id: x?.id ?? "",
    }));

    return json({ ok: true, lang, versions });
  } catch (_e) {
    return serverError();
  }
});