import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: true },
  { code: 'om', name: 'Afaan Oromo', nativeName: 'Afaan Oromoo', direction: 'ltr', isActive: true },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', isActive: true },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', direction: 'ltr', isActive: true },
  { code: 'sw', name: 'Kiswahili', nativeName: 'Kiswahili', direction: 'ltr', isActive: true },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isActive: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isActive: true }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const results = [];
    let created = 0;

    for (const lang of LANGUAGES) {
      const existing = await base44.entities.Language.filter({
        code: lang.code
      });

      if (!existing || existing.length === 0) {
        await base44.entities.Language.create(lang);
        created++;
        results.push({ status: 'created', code: lang.code });
      } else {
        results.push({ status: 'exists', code: lang.code });
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} languages`,
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});