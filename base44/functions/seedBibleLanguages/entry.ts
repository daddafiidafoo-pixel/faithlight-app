import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const bibleLanguages = [
      {
        language_code: 'en',
        language_name: 'English',
        native_name: 'English',
        bible_id: 'ENGESV',
        audio_fileset_id: 'ENGESVN2DA',
        ui_locale: 'en',
        is_rtl: false,
        is_active: true,
        sort_order: 1,
      },
      {
        language_code: 'om',
        language_name: 'Afaan Oromoo',
        native_name: 'Afaan Oromoo',
        bible_id: 'GAZGAZ',
        audio_fileset_id: 'OROWBTN2DA',
        ui_locale: 'om',
        is_rtl: false,
        is_active: true,
        sort_order: 2,
      },
      {
        language_code: 'am',
        language_name: 'Amharic',
        native_name: 'አማርኛ',
        bible_id: 'ETHAAA',
        audio_fileset_id: null,
        ui_locale: 'am',
        is_rtl: false,
        is_active: true,
        sort_order: 3,
      },
      {
        language_code: 'ar',
        language_name: 'Arabic',
        native_name: 'العربية',
        bible_id: 'ARBNASV',
        audio_fileset_id: null,
        ui_locale: 'ar',
        is_rtl: true,
        is_active: true,
        sort_order: 4,
      },
    ];

    // Clear existing records
    const existing = await base44.asServiceRole.entities.BibleLanguage.list();
    for (const item of existing) {
      await base44.asServiceRole.entities.BibleLanguage.delete(item.id);
    }

    // Seed new records
    const created = await base44.asServiceRole.entities.BibleLanguage.bulkCreate(bibleLanguages);

    return Response.json({ success: true, count: created.length });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});