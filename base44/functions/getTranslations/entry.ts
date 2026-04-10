import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_LANGUAGES = ['en', 'om', 'am', 'ar', 'fr', 'sw'];

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const language = url.searchParams.get('language') || 'en';

    // Validate language
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return Response.json({
        success: false,
        error: {
          code: 'INVALID_LANGUAGE',
          message: 'Unsupported language',
        },
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Fetch all translations for this language
    const translations = await base44.asServiceRole.entities.Translation.filter({
      language,
    });

    // Convert to key-value format
    const data = {};
    translations.forEach((t) => {
      data[t.translation_key] = t.value;
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('getTranslations error:', err);
    return Response.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch translations',
      },
    }, { status: 500 });
  }
});