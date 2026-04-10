Deno.serve(async (req) => {
  // Publish-safe: default to non-premium so nothing blocks the app.
  // You can add Stripe/subscription logic later with timeouts.
  return Response.json({
    premium: false,
    source: "default",
    fallback: true,
  }, { status: 200 });
});