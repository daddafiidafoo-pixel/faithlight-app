import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Admin-only protection
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const amharicHomeTranslations = {
      'home.title': 'FaithLight',
      'home.tagline': 'ቃል እግዚአብሔር መንገድህን የሚያብራ ብርሃን',
      'home.welcome': 'እንኳን በደህና መጡ',
      'home.intro': 'FaithLight የመጽሐፍ ቅዱስን ቃል እንድትሰሙ፣ እንድትረዱ እና በሕይወታችሁ እንድትተግብሩ ይረዳችኋል።',
      'home.features.training': 'ስልጠና እና ትምህርት',
    };

    const amharicTrainingTranslations = {
      'training.title': 'ስልጠና እና ትምህርት',
      'training.intro': 'FaithLight የመጽሐፍ ቅዱስን እና መሪነት ስልጠና ለወጣቶች፣ መሪዎች እና አባቶች ያቀርባል።',
      'training.leadership.title': 'መሪነት ስልጠና',
      'training.cta': 'ስልጠና ጀምር',
    };

    const arabicHomeTranslations = {
      'home.title': 'FaithLight',
      'home.tagline': 'كلام الله ينير طريقك',
      'home.welcome': 'أهلاً وسهلاً',
      'home.intro': 'يساعدك FaithLight على سماع كلام الله وفهمه وتطبيقه في حياتك.',
      'home.features.training': 'التدريب والتعليم',
    };

    const arabicTrainingTranslations = {
      'training.title': 'التدريب والتعليم',
      'training.intro': 'يوفّر FaithLight تدريبًا كتابيًا وقياديًا منظمًا للشباب والقادة والرعاة.',
      'training.leadership.title': 'تدريب القيادة',
      'training.cta': 'ابدأ التدريب',
    };

    const allTranslations = [
      ...Object.entries(amharicHomeTranslations).map(([key, value]) => ({ key, language_code: 'am', value, category: 'ui', status: 'published' })),
      ...Object.entries(amharicTrainingTranslations).map(([key, value]) => ({ key, language_code: 'am', value, category: 'ui', status: 'published' })),
      ...Object.entries(arabicHomeTranslations).map(([key, value]) => ({ key, language_code: 'ar', value, category: 'ui', status: 'published' })),
      ...Object.entries(arabicTrainingTranslations).map(([key, value]) => ({ key, language_code: 'ar', value, category: 'ui', status: 'published' })),
    ];

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const row of allTranslations) {
      // Per-row duplicate check by key + language_code + category
      const existing = await base44.asServiceRole.entities.Translation.filter(
        { key: row.key, language_code: row.language_code, category: row.category },
        '-created_date',
        1
      );

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      try {
        await base44.asServiceRole.entities.Translation.create(row);
        inserted++;
      } catch (e) {
        console.error(`Failed to insert [${row.language_code}] ${row.key}:`, e.message);
        errors.push({ key: row.key, language_code: row.language_code, error: e.message });
      }
    }

    return Response.json({
      success: errors.length === 0,
      message: 'Multi-language translations processed',
      inserted,
      skipped,
      total: allTranslations.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
});