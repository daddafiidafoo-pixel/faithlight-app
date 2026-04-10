import { base44 } from '@/api/base44Client';

export async function seedHomeTrainingTranslations() {
  try {
    // English Home Page Translations
    const enHomeTranslations = {
      'home.title': 'FaithLight',
      'home.tagline': 'Scripture lights your way',
      'home.welcome': 'Welcome',
      'home.intro': 'FaithLight AI is here to help you understand Scripture, apply it, and live it out.',
      'home.features.audioBible': 'Audio Bible',
      'home.features.readBible': 'Read Scripture',
      'home.features.askAI': 'Ask FaithLight AI',
      'home.features.training': 'Training & Courses',
      'home.voiceHint': 'Use voice or tap — your choice.',
      'home.quick.read': 'Read Scripture',
      'home.quick.listen': 'Audio Bible',
      'home.quick.training': 'Training & Courses',
      'home.quick.askAI': 'Ask FaithLight AI',
    };

    // English Training Page Translations
    const enTrainingTranslations = {
      'training.title': 'Training & Courses',
      'training.intro': 'FaithLight offers structured Bible and leadership training for students, youth, leaders, and pastors.',
      'training.biblical.title': 'Bible Training',
      'training.biblical.item1': 'Christian Faith Foundations',
      'training.biblical.item2': 'Scripture Understanding',
      'training.biblical.item3': 'Verse Interpretation & Application',
      'training.biblical.item4': 'Prayer & Spiritual Life',
      'training.leadership.title': 'Leadership Training',
      'training.leadership.item1': 'Servant Leadership (Like Jesus)',
      'training.leadership.item2': 'Integrity & Character',
      'training.leadership.item3': 'Leading Groups',
      'training.leadership.item4': 'Leading Through Challenges',
      'training.format.title': 'How We Teach',
      'training.format.lesson': 'Lessons',
      'training.format.quiz': 'Quizzes',
      'training.format.exam': 'Final Exam',
      'training.format.certificate': 'Certificate',
      'training.audience.title': 'For Whom?',
      'training.audience.youth': 'Youth',
      'training.audience.teachers': 'Teachers',
      'training.audience.pastors': 'Pastors & Church Leaders',
      'training.audience.teams': 'Ministry Teams',
      'training.cta': 'Start Training',
    };

    // Afaan Oromo Home Page Translations
    const omHomeTranslations = {
      'home.title': 'FaithLight',
      'home.tagline': 'Ifti Dubbiin Waaqayyoo karaa jireenya kee ibsu',
      'home.welcome': 'Baga nagaan dhuftan',
      'home.intro': 'FaithLight AI si gargaaruuf as jira — Dubbiin Waaqayyoo akka dhaggeeffattu, hubattu, fi jireenya kee keessatti hojiirra oolchitu.',
      'home.features.audioBible': 'Kitaaba Qulqulluu Sagalee',
      'home.features.readBible': 'Kitaaba Qulqulluu Dubbisi',
      'home.features.askAI': 'FaithLight AI Gaafadhu',
      'home.features.training': 'Leenjii fi Barnoota',
      'home.voiceHint': 'Sagalee fayyadami yookaan tuqi — filannoon kee.',
      'home.quick.read': 'Kitaaba Qulqulluu Dubbisi',
      'home.quick.listen': 'Kitaaba Qulqulluu Sagalee',
      'home.quick.training': 'Leenjii fi Barnoota',
      'home.quick.askAI': 'FaithLight AI Gaafadhu',
    };

    // Afaan Oromo Training Page Translations
    const omTrainingTranslations = {
      'training.title': 'Leenjii & Barnoota',
      'training.intro': 'FaithLight leenjii Kitaaba Qulqulluu fi hoggansa sirnaan qindaa\'e ni dhiyeessa — barattoota, dargaggoota, hoggantoota, fi lubaaf.',
      'training.biblical.title': 'Leenjii Kitaaba Qulqulluu',
      'training.biblical.item1': 'Bu\'uura amantii Kiristaanaa',
      'training.biblical.item2': 'Hubannaa Kitaaba Qulqulluu',
      'training.biblical.item3': 'Aayata hiikuu fi hojii irra oolchuu',
      'training.biblical.item4': 'Kadhannaa fi jireenya amantii',
      'training.leadership.title': 'Leenjii Hoggansa',
      'training.leadership.item1': 'Hoggansa tajaajilaa (akka Yesus)',
      'training.leadership.item2': 'Amanamummaa fi amala gaarii',
      'training.leadership.item3': 'Garee hogganuu',
      'training.leadership.item4': 'Hoggansa rakkina keessa',
      'training.format.title': 'Akkaataa Leenjii',
      'training.format.lesson': 'Barnoota',
      'training.format.quiz': 'Gaaffilee Qormaataa',
      'training.format.exam': 'Qormaata Xumuraa',
      'training.format.certificate': 'Ragaa Xumuraa',
      'training.audience.title': 'Eenyuf?',
      'training.audience.youth': 'Dargaggoota',
      'training.audience.teachers': 'Barsiisota',
      'training.audience.pastors': 'Luba fi tajaajiltoota mana amantaa',
      'training.audience.teams': 'Garee tajaajilaa',
      'training.cta': 'Leenjii Jalqabi',
    };

    // Combine all English translations
    const enBatch = [
      ...Object.entries(enHomeTranslations).map(([key, value]) => ({
        key,
        language_code: 'en',
        value,
        category: 'ui',
        status: 'published',
      })),
      ...Object.entries(enTrainingTranslations).map(([key, value]) => ({
        key,
        language_code: 'en',
        value,
        category: 'ui',
        status: 'published',
      })),
    ];

    // Combine all Oromo translations
    const omBatch = [
      ...Object.entries(omHomeTranslations).map(([key, value]) => ({
        key,
        language_code: 'om',
        value,
        category: 'ui',
        status: 'published',
      })),
      ...Object.entries(omTrainingTranslations).map(([key, value]) => ({
        key,
        language_code: 'om',
        value,
        category: 'ui',
        status: 'published',
      })),
    ];

    // Check if translations already exist (with guards)
    if (!base44?.entities?.Translation) return { success: false };
    
    const existingEnglish = await base44.entities.Translation.filter({ language_code: 'en', category: 'ui' }, '-created_date', 1).catch(() => []);
    const existingOromo = await base44.entities.Translation.filter({ language_code: 'om', category: 'ui' }, '-created_date', 1).catch(() => []);

    if (!existingEnglish || existingEnglish.length === 0) {
      await base44.entities.Translation.bulkCreate(enBatch).catch(err => {
        console.warn('Failed to bulk create English translations:', err);
      });
    }

    if (!existingOromo || existingOromo.length === 0) {
      await base44.entities.Translation.bulkCreate(omBatch).catch(err => {
        console.warn('Failed to bulk create Oromo translations:', err);
      });
    }

    return { success: true, message: 'Home and Training translations seeded successfully' };
  } catch (error) {
    console.warn('Error seeding translations:', error);
    return { success: false, error: error.message };
  }
}