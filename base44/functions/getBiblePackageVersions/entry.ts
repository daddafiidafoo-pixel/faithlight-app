import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Current server-side version for each language package
// Bump this when Bible content is updated
const PACKAGE_VERSIONS = {
  en: '1.1',
  om: '1.1',
  am: '1.1',
  ti: '1.1',
  sw: '1.1',
  fr: '1.1',
  ar: '1.1',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return Response.json({
      success: true,
      versions: PACKAGE_VERSIONS
    });
  } catch (error) {
    console.error('Version check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});