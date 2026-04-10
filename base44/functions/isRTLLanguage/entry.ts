Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const lang = String(body.language || "en").toLowerCase();

    const rtlLangs = ["ar", "he", "fa", "ur"];
    const rtl = rtlLangs.includes(lang);

    return Response.json({
      rtl,
      language: lang,
      fallback: false,
    }, { status: 200 });
  } catch (e) {
    // Never hang; always return a usable default
    return Response.json({
      rtl: false,
      language: "en",
      fallback: true,
    }, { status: 200 });
  }
});