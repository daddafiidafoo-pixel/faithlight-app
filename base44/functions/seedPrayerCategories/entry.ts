import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const categories = [
      {
        category_key: 'peace',
        name_en: 'Peace',
        name_om: 'Nagaa',
        name_am: 'ሰላም',
        name_ti: 'ሰላም',
        name_ar: 'السلام',
        name_sw: 'Amani',
        sort_order: 1,
        is_active: true,
      },
      {
        category_key: 'healing',
        name_en: 'Healing',
        name_om: 'Fayyina',
        name_am: 'ፈውስ',
        name_ti: 'ፈውሲ',
        name_ar: 'الشفاء',
        name_sw: 'Uponyaji',
        sort_order: 2,
        is_active: true,
      },
      {
        category_key: 'family',
        name_en: 'Family',
        name_om: 'Maatii',
        name_am: 'ቤተሰብ',
        name_ti: 'ስድራ',
        name_ar: 'العائلة',
        name_sw: 'Familia',
        sort_order: 3,
        is_active: true,
      },
      {
        category_key: 'guidance',
        name_en: 'Guidance',
        name_om: 'Qajeelfama',
        name_am: 'መሪነት',
        name_ti: 'መርሓ',
        name_ar: 'الإرشاد',
        name_sw: 'Mwongozo',
        sort_order: 4,
        is_active: true,
      },
      {
        category_key: 'strength',
        name_en: 'Strength',
        name_om: 'Jabinni',
        name_am: 'ጥንካሬ',
        name_ti: 'ምዕርግግታ',
        name_ar: 'القوة',
        name_sw: 'Nguvu',
        sort_order: 5,
        is_active: true,
      },
      {
        category_key: 'gratitude',
        name_en: 'Gratitude',
        name_om: 'Galata',
        name_am: '감사',
        name_ti: 'ምስጋና',
        name_ar: 'الامتنان',
        name_sw: 'Shukrani',
        sort_order: 6,
        is_active: true,
      },
      {
        category_key: 'forgiveness',
        name_en: 'Forgiveness',
        name_om: 'Galchutti',
        name_am: 'ይቅር ስጠት',
        name_ti: 'ምሕረት',
        name_ar: 'المغفرة',
        name_sw: 'Msamaha',
        sort_order: 7,
        is_active: true,
      },
      {
        category_key: 'protection',
        name_en: 'Protection',
        name_om: 'Walliin',
        name_am: 'ጥበት',
        name_ti: 'ምክልካል',
        name_ar: 'الحماية',
        name_sw: 'Kinga',
        sort_order: 8,
        is_active: true,
      },
    ];

    // Check if categories already exist
    const existing = await base44.asServiceRole.entities.PrayerCategory.list();
    if (existing && existing.length > 0) {
      return Response.json({
        success: true,
        message: 'Prayer categories already exist',
        count: existing.length,
      });
    }

    // Insert categories
    await base44.asServiceRole.entities.PrayerCategory.bulkCreate(categories);

    return Response.json({
      success: true,
      message: 'Prayer categories seeded successfully',
      count: categories.length,
    });
  } catch (error) {
    console.error('Error seeding prayer categories:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});