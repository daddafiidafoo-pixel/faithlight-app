/**
 * Service Worker Registration Helper
 * Registers the offline service worker on app init
 */

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    // Service worker registration is done client-side
    // This endpoint can be used to check service worker status
    return Response.json({
      message: 'Service worker registration initiated',
      status: 'pending',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Service worker registration error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});