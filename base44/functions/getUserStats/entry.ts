Deno.serve(async (req) => {
  // Publish-safe defaults: never block app load.
  return Response.json({
    stats: {
      searches: 0,
      favorites: 0,
      streak: 0,
      readingMinutes: 0,
      listeningMinutes: 0,
    },
    source: "default",
    fallback: true,
  }, { status: 200 });
});