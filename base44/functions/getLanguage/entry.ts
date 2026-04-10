Deno.serve(async (req) => {
  // Always respond instantly; never hang the app
  return Response.json({
    language: "en",
    source: "default",
    fallback: true,
  }, { status: 200 });
});