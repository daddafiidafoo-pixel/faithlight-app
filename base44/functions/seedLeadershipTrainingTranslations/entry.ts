import { base44 } from '@/api/base44Client';

export async function seedLeadershipTrainingTranslations() {
  try {
    // Afaan Oromo Leadership Translations
    const oromoLeadershipTranslations = {
      // Level 1
      'leadership.level1.title': 'Bu\'uura Hoggansa Kitaaba Qulqulluu',
      'leadership.level1.description': 'Leenjii kun bu\'uura hoggansa akka Kitaaba Qulqulluu barsiisu irratti xiyyeeffata.',
      'leadership.level1.lesson1': 'Hoggansa Tajaajilaa (Akka Yesus)',
      'leadership.level1.lesson2': 'Amala Gaarii fi Amanamummaa',
      'leadership.level1.lesson3': 'Yaada fi Amantii (Vision & Faith)',
      'leadership.level1.lesson4': 'Hoggansa Rakkina Keessa',
      'leadership.level1.lesson5': 'Hoggansa Akka Tiksee (Shepherd Leadership)',
      'leadership.level1.outcome': 'Hirmaattonni hoggansa bu\'uuraa Kitaaba Qulqulluu hubatu.',

      // Level 2
      'leadership.level2.title': 'Hoggansa Guddifachuu fi Garee Hogganuu',
      'leadership.level2.description': 'Hoggansa hojii irra oolchu, garee hogganuu, fi murtii sirrii fudhachuu barsiisa.',
      'leadership.level2.lesson1': 'Waamicha fi Itti Gaafatamummaa Hogganaa',
      'leadership.level2.lesson2': 'Yaada (Vision) Namootaaf Ibsuu',
      'leadership.level2.lesson3': 'Garee Tokkummaan Hogganuu',
      'leadership.level2.lesson4': 'Walqunnamtii fi Barsiisuu Sirrii',
      'leadership.level2.lesson5': 'Rakkoo Furuu fi Nagaa Uumuu',
      'leadership.level2.lesson6': 'Qabeenya fi Yeroo Sirnaan Bulchuu',
      'leadership.level2.lesson7': 'Hoggansa Dhiibbaa Jala',
      'leadership.level2.lesson8': 'Hoggantoota Biroo Leenjisuu (Mentorship)',
      'leadership.level2.lesson9': 'Amala Qulqulluu fi Naamusa Gaarii',
      'leadership.level2.lesson10': 'Dhamaatii Xumuraa fi Amanamummaa Dheeraa',
      'leadership.level2.outcome': 'Hoggantoonni garee hogganuu fi murtii sirrii fudhachuu danda\'u.',

      // Level 3
      'leadership.level3.title': 'Hoggansa Olaanaa & To\'annoo Tajaajilaa',
      'leadership.level3.description': 'Leenjii kun hoggansa olaanaa, to\'annoo tajaajilaa, fi dhaloota itti aanu qopheessuu irratti xiyyeeffata.',
      'leadership.level3.lesson1': 'Hoggansa Mul\'ata Dheeraa',
      'leadership.level3.lesson2': 'To\'annoo Mana Amantaa fi Tajaajilaa',
      'leadership.level3.lesson3': 'Murtii Ulfaa fi Qajeelfama Hafuuraa',
      'leadership.level3.lesson4': 'Eegumsa Amala Hogganaa',
      'leadership.level3.lesson5': 'Hoggansa Haala Addunyaa Keessa',
      'leadership.level3.lesson6': 'Hoggantoota Hedduu Qopheessuu',
      'leadership.level3.lesson7': 'Dhaabbataa fi Xumura Gaarii (Finish Well)',
      'leadership.level3.outcome': 'Hoggantoonni tajaajila bal\'aa fi itti fufiinsa qabu ijaaru.',
    };

    // English Leadership Translations
    const englishLeadershipTranslations = {
      // Level 1
      'leadership.level1.title': 'Leadership Foundations in Scripture',
      'leadership.level1.description': 'This training focuses on foundational leadership according to Scripture.',
      'leadership.level1.lesson1': 'Servant Leadership (Like Jesus)',
      'leadership.level1.lesson2': 'Character & Integrity',
      'leadership.level1.lesson3': 'Vision & Faith',
      'leadership.level1.lesson4': 'Leading Through Challenges',
      'leadership.level1.lesson5': 'Shepherd Leadership',
      'leadership.level1.outcome': 'Participants understand foundational Scripture-based leadership.',

      // Level 2
      'leadership.level2.title': 'Growing as a Leader & Team Leadership',
      'leadership.level2.description': 'Leadership in action, team building, and wise decision-making.',
      'leadership.level2.lesson1': 'Calling & Accountability',
      'leadership.level2.lesson2': 'Communicating Vision',
      'leadership.level2.lesson3': 'Leading as One Team',
      'leadership.level2.lesson4': 'Communication & Teaching',
      'leadership.level2.lesson5': 'Conflict Resolution & Peacemaking',
      'leadership.level2.lesson6': 'Managing Resources & Time',
      'leadership.level2.lesson7': 'Leading Under Pressure',
      'leadership.level2.lesson8': 'Mentoring Other Leaders',
      'leadership.level2.lesson9': 'Holiness & Integrity',
      'leadership.level2.lesson10': 'Closure & Lasting Impact',
      'leadership.level2.outcome': 'Leaders can build teams and make wise decisions.',

      // Level 3
      'leadership.level3.title': 'Advanced Leadership & Discipleship',
      'leadership.level3.description': 'Advanced leadership, mentoring systems, and building future leaders.',
      'leadership.level3.lesson1': 'Long-term Vision & Legacy',
      'leadership.level3.lesson2': 'Church & Ministry Training Systems',
      'leadership.level3.lesson3': 'Major Decisions & Spiritual Guidance',
      'leadership.level3.lesson4': 'Guarding Leader Character',
      'leadership.level3.lesson5': 'Leadership in Global Context',
      'leadership.level3.lesson6': 'Developing Multiple Leaders',
      'leadership.level3.lesson7': 'Sustainability & Finishing Well',
      'leadership.level3.outcome': 'Leaders build sustained impact and raise future leaders.',
    };

    // Amharic Leadership Translations (sample structure - expand as needed)
    const amharicLeadershipTranslations = {
      'leadership.level1.title': 'መሪነት በመጽሐፍ ቅዱስ ላይ ተመስርተው',
      'leadership.level1.description': 'ይህ ስልጠና በመጽሐፍ ቅዱስ ላይ ተመስርተው መሪነት በመሠረት ላይ ያተኩራል።',
      'leadership.level2.title': 'ራስን እንደ መሪ ማዳበር እና ቡድንን መመራት',
      'leadership.level2.description': 'መሪነት በተግባር፣ ቡድን ሕንፃ እና ጥሩ ውሳኔ ሕጋዊነት።',
      'leadership.level3.title': 'የላቀ መሪነት እና የመንቅ-ቦታ ስልጠና',
      'leadership.level3.description': 'የላቀ መሪነት፣ መለከያ ስርዓቶች እና ወደፊት መሪዎች መገንባት።',
    };

    // Arabic Leadership Translations (sample structure - expand as needed)
    const arabicLeadershipTranslations = {
      'leadership.level1.title': 'أسس القيادة في الكتاب المقدس',
      'leadership.level1.description': 'يركز هذا التدريب على أسس القيادة وفقًا للكتاب المقدس.',
      'leadership.level2.title': 'النمو كقائد وقيادة الفريق',
      'leadership.level2.description': 'القيادة في العمل وبناء الفريق واتخاذ القرارات الحكيمة.',
      'leadership.level3.title': 'القيادة المتقدمة والتلمذة',
      'leadership.level3.description': 'القيادة المتقدمة وأنظمة الإرشاد وبناء قادة المستقبل.',
    };

    // Combine all batches
    const allTranslations = [
      ...Object.entries(englishLeadershipTranslations).map(([key, value]) => ({
        key,
        language_code: 'en',
        value,
        category: 'training',
        status: 'published',
      })),
      ...Object.entries(oromoLeadershipTranslations).map(([key, value]) => ({
        key,
        language_code: 'om',
        value,
        category: 'training',
        status: 'published',
      })),
      ...Object.entries(amharicLeadershipTranslations).map(([key, value]) => ({
        key,
        language_code: 'am',
        value,
        category: 'training',
        status: 'published',
      })),
      ...Object.entries(arabicLeadershipTranslations).map(([key, value]) => ({
        key,
        language_code: 'ar',
        value,
        category: 'training',
        status: 'published',
      })),
    ];

    if (!base44?.entities?.Translation) return { success: false };

    // Only seed if not already seeded
    const existing = await base44.entities.Translation.filter({ language_code: 'en', category: 'training' }, '-created_date', 1).catch(() => []);
    if (existing && existing.length > 0) return { success: true, message: 'Already seeded' };

    await base44.entities.Translation.bulkCreate(allTranslations).catch(() => {});
    return { success: true, message: 'Leadership training translations seeded successfully' };
  } catch {
    return { success: false };
  }
}