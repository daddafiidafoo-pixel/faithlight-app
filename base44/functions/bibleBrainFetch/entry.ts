// v3 - CDN path follow + verbose logging
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { filesetId, bookId, chapter, language } = body;

    const apiKey = Deno.env.get("BIBLE_BRAIN_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "Bible Brain API key not configured" }, { status: 500 });
    }

    // Resolve fileset — prefer explicit filesetId, else fall back to legacy language map
    const LEGACY_FILES = {
      en: "ENGESVN_ET-json",
      om: "GAZBIBN_ET-json",
      gaz: "GAZBIBN_ET-json",
      hae: "HAEBSEN_ET-json",
      am: "AMHEVG",
      sw: "SWAKJV",
    };

    const resolvedFileset = filesetId || LEGACY_FILES[language];
    if (!resolvedFileset) {
      return Response.json({ error: `No fileset for language: ${language}` }, { status: 400 });
    }

    if (!bookId || !chapter) {
      return Response.json({ error: "Missing required params: bookId, chapter" }, { status: 400 });
    }

    const bookCode = bookId.toUpperCase();
    const apiUrl = `https://4.dbt.io/api/bibles/filesets/${resolvedFileset}/${bookCode}/${chapter}?key=${apiKey}&v=4`;

    console.log(`Fetching Bible Brain: fileset=${resolvedFileset} book=${bookCode} ch=${chapter}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Bible Brain API error ${response.status}:`, errText.slice(0, 200));
      return Response.json({ error: `Bible Brain API returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const items = data?.data || [];
    console.log(`Items count: ${items.length}, first item keys: ${items[0] ? JSON.stringify(Object.keys(items[0])) : 'none'}`);

    if (items.length === 0) {
      return Response.json({ error: "No verses found for this chapter" }, { status: 404 });
    }

    // Bible Brain returns signed CDN URLs for text filesets — fetch the first one
    // All verses for a chapter are in a single JSON file at item.path
    const firstItem = items[0];
    console.log(`firstItem.path exists: ${!!firstItem?.path}, path prefix: ${firstItem?.path?.slice(0,60)}`);
    if (firstItem?.path) {
      console.log(`Following CDN path for chapter text: ${firstItem.path.slice(0, 80)}...`);

      let cdnResp;
      try {
        cdnResp = await fetch(firstItem.path);
      } catch (fetchErr) {
        console.error(`CDN fetch threw: ${fetchErr.message}`);
        return Response.json({ error: `CDN fetch failed: ${fetchErr.message}` }, { status: 502 });
      }
      console.log(`CDN status: ${cdnResp.status} content-type: ${cdnResp.headers.get('content-type')}`);
      if (!cdnResp.ok) {
        const errBody = await cdnResp.text();
        console.error(`CDN fetch failed: ${cdnResp.status}`, errBody.slice(0, 100));
        return Response.json({ error: `CDN fetch failed: ${cdnResp.status}` }, { status: 502 });
      }

      const rawText = await cdnResp.text();
      console.log(`CDN raw text (first 300):`, rawText.slice(0, 300));
      let cdnData;
      try {
        cdnData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("CDN JSON parse error:", parseErr.message);
        return Response.json({ error: "CDN returned non-JSON" }, { status: 502 });
      }
      console.log("CDN response type:", typeof cdnData, "isArray:", Array.isArray(cdnData));
      if (Array.isArray(cdnData) && cdnData.length > 0) {
        console.log("CDN first item:", JSON.stringify(cdnData[0]));
      } else {
        console.log("CDN raw (first 300):", JSON.stringify(cdnData).slice(0, 300));
      }

      // CDN JSON is an array of verse objects
      const verses = (Array.isArray(cdnData) ? cdnData : []).map((v) => ({
        verse: v.verse_start ?? v.verse ?? v.verseStart,
        text: (v.verse_text ?? v.text ?? '').trim(),
      })).filter(v => v.verse && v.text);

      if (verses.length > 0) {
        return Response.json({
          success: true,
          fileset: resolvedFileset,
          bookCode,
          chapter,
          verses,
          source: "bibleBrain",
        });
      }

      console.warn("CDN data had no usable verses, falling back");
    }

    // Fallback: verse data was inline (older fileset format)
    const verses = items.map((v) => ({
      verse: v.verse_start ?? v.verse,
      text: (v.verse_text ?? v.text ?? '').trim(),
    })).filter(v => v.verse && v.text);

    if (verses.length === 0) {
      return Response.json({ error: "No verse text found in response" }, { status: 404 });
    }

    return Response.json({
      success: true,
      fileset: resolvedFileset,
      bookCode,
      chapter,
      verses,
      source: "bibleBrain",
    });

  } catch (error) {
    console.error("bibleBrainFetch error:", error.message);
    return Response.json({ error: "Failed to fetch from Bible Brain API" }, { status: 500 });
  }
});