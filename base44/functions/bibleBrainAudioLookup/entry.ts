/**
 * Bible Brain Audio Fileset Lookup
 * 
 * Queries Bible Brain API to verify audio fileset IDs for languages.
 * This is the ONLY safe way to confirm audio filesets - do not guess.
 * 
 * Usage:
 * POST /functions/bibleBrainAudioLookup
 * { "language": "Eastern Oromo" }
 */

Deno.serve(async (req) => {
  try {
    // Parse request
    const { language } = await req.json();
    
    if (!language) {
      return Response.json(
        { error: "Missing language parameter" },
        { status: 400 }
      );
    }

    const apiKey = Deno.env.get("BIBLE_BRAIN_API_KEY");
    if (!apiKey) {
      return Response.json(
        { error: "Bible Brain API key not configured" },
        { status: 500 }
      );
    }

    // Query Bible Brain for available content
    // This endpoint returns all filesets for a language with their types
    const url = new URL("https://api.scripture.api.bible/v1/bibles");
    url.searchParams.set("language", language);
    
    const response = await fetch(url.toString(), {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Bible Brain API error:", error);
      return Response.json(
        { 
          error: "Bible Brain API request failed",
          status: response.status,
          language,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract filesets grouped by type
    const filesets = {
      text: [],
      audio: [],
      audioDrama: [],
      video: [],
    };

    if (data.data && Array.isArray(data.data)) {
      for (const bible of data.data) {
        const type = bible.type?.name?.toLowerCase() || "unknown";
        const fileset = {
          id: bible.id,
          name: bible.name,
          language: bible.language?.name,
          type: bible.type?.name,
          abbreviation: bible.abbreviation,
        };

        if (type.includes("audio")) {
          if (type.includes("drama")) {
            filesets.audioDrama.push(fileset);
          } else {
            filesets.audio.push(fileset);
          }
        } else if (type.includes("video")) {
          filesets.video.push(fileset);
        } else {
          filesets.text.push(fileset);
        }
      }
    }

    // Log for debugging
    console.log(`Audio lookup for "${language}":`, {
      textCount: filesets.text.length,
      audioCount: filesets.audio.length,
      audioIds: filesets.audio.map(f => f.id),
    });

    return Response.json({
      success: true,
      language,
      filesets,
      timestamp: new Date().toISOString(),
      recommendation: {
        audioFilesetId: filesets.audio.length > 0 ? filesets.audio[0].id : null,
        audioCount: filesets.audio.length,
        status: filesets.audio.length > 0 ? "verified" : "not_found",
      },
    });

  } catch (error) {
    console.error("Audio lookup error:", error);
    return Response.json(
      { 
        error: error.message,
        details: "Failed to lookup audio filesets",
      },
      { status: 500 }
    );
  }
});