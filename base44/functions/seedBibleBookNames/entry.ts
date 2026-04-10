import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BOOK_NAMES = [
  // Philippians
  { bookCode: 'PHP', lang: 'en', name: 'Philippians', abbr: 'Phil' },
  { bookCode: 'PHP', lang: 'om', name: 'Filiphisiyus', abbr: 'Fil' },
  { bookCode: 'PHP', lang: 'am', name: 'ፊልንታውያን', abbr: 'ፊል' },
  { bookCode: 'PHP', lang: 'ti', name: 'ፊሊፕያውያን', abbr: 'ፊሊ' },
  { bookCode: 'PHP', lang: 'sw', name: 'Wafilipai', abbr: 'Wafi' },
  { bookCode: 'PHP', lang: 'fr', name: 'Philippiens', abbr: 'Phil' },
  { bookCode: 'PHP', lang: 'ar', name: 'فيلبي', abbr: 'في' },

  // John
  { bookCode: 'JHN', lang: 'en', name: 'John', abbr: 'Jn' },
  { bookCode: 'JHN', lang: 'om', name: 'Jowhanis', abbr: 'Jow' },
  { bookCode: 'JHN', lang: 'am', name: 'ዮሐንስ', abbr: 'ዮሐ' },
  { bookCode: 'JHN', lang: 'sw', name: 'Yohane', abbr: 'Yoh' },
  { bookCode: 'JHN', lang: 'fr', name: 'Jean', abbr: 'Jn' },
  { bookCode: 'JHN', lang: 'ar', name: 'يوحنا', abbr: 'يو' },

  // Psalm
  { bookCode: 'PSA', lang: 'en', name: 'Psalm', abbr: 'Ps' },
  { bookCode: 'PSA', lang: 'om', name: 'Psalms', abbr: 'Psa' },
  { bookCode: 'PSA', lang: 'am', name: 'መዝሙር', abbr: 'መዝ' },
  { bookCode: 'PSA', lang: 'sw', name: 'Zaburi', abbr: 'Zab' },
  { bookCode: 'PSA', lang: 'fr', name: 'Psaume', abbr: 'Ps' },
  { bookCode: 'PSA', lang: 'ar', name: 'مزمور', abbr: 'مز' },

  // Romans
  { bookCode: 'ROM', lang: 'en', name: 'Romans', abbr: 'Rom' },
  { bookCode: 'ROM', lang: 'om', name: 'Romaanota', abbr: 'Rom' },
  { bookCode: 'ROM', lang: 'am', name: 'ሮማውያን', abbr: 'ሮማ' },
  { bookCode: 'ROM', lang: 'sw', name: 'Waroma', abbr: 'Waro' },
  { bookCode: 'ROM', lang: 'fr', name: 'Romains', abbr: 'Rm' },
  { bookCode: 'ROM', lang: 'ar', name: 'رومية', abbr: 'رو' },

  // Matthew
  { bookCode: 'MTT', lang: 'en', name: 'Matthew', abbr: 'Mt' },
  { bookCode: 'MTT', lang: 'om', name: 'Matewos', abbr: 'Mat' },
  { bookCode: 'MTT', lang: 'am', name: 'ማቴዎስ', abbr: 'ማጤ' },
  { bookCode: 'MTT', lang: 'sw', name: 'Mathayo', abbr: 'Math' },
  { bookCode: 'MTT', lang: 'fr', name: 'Matthieu', abbr: 'Mt' },
  { bookCode: 'MTT', lang: 'ar', name: 'متى', abbr: 'مت' },

  // Proverbs
  { bookCode: 'PRV', lang: 'en', name: 'Proverbs', abbr: 'Prov' },
  { bookCode: 'PRV', lang: 'om', name: 'Seera', abbr: 'See' },
  { bookCode: 'PRV', lang: 'am', name: 'ምሳሌ', abbr: 'ምስ' },
  { bookCode: 'PRV', lang: 'sw', name: 'Mithali', abbr: 'Mith' },
  { bookCode: 'PRV', lang: 'fr', name: 'Proverbes', abbr: 'Prov' },
  { bookCode: 'PRV', lang: 'ar', name: 'أمثال', abbr: 'ام' },

  // Genesis
  { bookCode: 'GEN', lang: 'en', name: 'Genesis', abbr: 'Gen' },
  { bookCode: 'GEN', lang: 'om', name: 'Uumama', abbr: 'Uum' },
  { bookCode: 'GEN', lang: 'am', name: 'ሕዝበ ዲናገር', abbr: 'ሕዝ' },
  { bookCode: 'GEN', lang: 'sw', name: 'Mwanzo', abbr: 'Mwa' },
  { bookCode: 'GEN', lang: 'fr', name: 'Genèse', abbr: 'Gn' },
  { bookCode: 'GEN', lang: 'ar', name: 'التكوين', abbr: 'تك' },

  // 1 Peter
  { bookCode: '1PE', lang: 'en', name: '1 Peter', abbr: '1 Pet' },
  { bookCode: '1PE', lang: 'om', name: '1 Philipos', abbr: '1 Phil' },
  { bookCode: '1PE', lang: 'am', name: '1 ጴጤሮስ', abbr: '1 ጴ' },
  { bookCode: '1PE', lang: 'sw', name: '1 Petro', abbr: '1 Pet' },
  { bookCode: '1PE', lang: 'fr', name: '1 Pierre', abbr: '1 P' },
  { bookCode: '1PE', lang: 'ar', name: '1 بطرس', abbr: '1 بط' }
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

    for (const entry of BOOK_NAMES) {
      const existing = await base44.entities.BibleBookNames.filter({
        bookCode: entry.bookCode,
        languageCode: entry.lang
      });

      if (!existing || existing.length === 0) {
        await base44.entities.BibleBookNames.create({
          bookCode: entry.bookCode,
          languageCode: entry.lang,
          name: entry.name,
          abbreviation: entry.abbr
        });
        created++;
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} book names`,
      total: BOOK_NAMES.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});