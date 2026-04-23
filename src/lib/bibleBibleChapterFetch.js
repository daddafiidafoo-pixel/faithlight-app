/**
 * Fetch Bible chapter text
 */
export async function fetchBibleChapter({
  bibleId,
  bookId,
  chapter,
  apiKey,
}) {
  if (!bibleId) {
    throw new Error("Missing bibleId");
  }

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${bookId}.${chapter}`;

  try {
    const res = await fetch(url, {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`Chapter not found for ${bookId} ${chapter}`);
        return {
          content_status: "not_found",
          verses: [],
        };
      }

      throw new Error(`Bible text fetch failed: ${res.status}`);
    }

    const data = await res.json();

    return {
      content_status: "ok",
      verses: data?.data?.content || "",
    };
  } catch (error) {
    console.error("Bible fetch error:", error);

    return {
      content_status: "error",
      verses: [],
      error: error.message,
    };
  }
} 
