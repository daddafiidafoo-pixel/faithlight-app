import { base44 } from '@/api/base44Client';

// Starter pack sample data - can be seeded on first launch
export const STARTER_TRANSLATIONS = [
  {
    language_code: 'en',
    translation_id: 'KJV',
    display_name: 'King James Version',
    full_name: 'The Holy Bible, King James Version',
    has_audio: true,
    is_default_for_language: true,
    is_active: true,
    description: 'Classic English translation',
  },
  {
    language_code: 'en',
    translation_id: 'NIV',
    display_name: 'New International Version',
    full_name: 'The Holy Bible, New International Version',
    has_audio: true,
    is_default_for_language: false,
    is_active: true,
    description: 'Modern English translation',
  },
];

export const STARTER_TEXT_CHAPTERS = [
  {
    language_code: 'en',
    translation_id: 'KJV',
    book_key: 'GEN',
    book_name: 'Genesis',
    chapter_number: 1,
    verses_json: {
      '1': 'In the beginning God created the heaven and the earth.',
      '2': 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
      '3': 'And God said, Let there be light: and there was light.',
      '4': 'And God saw the light, that it was good: and God divided the light from the darkness.',
      '5': 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
    },
    total_verses: 31,
  },
  {
    language_code: 'en',
    translation_id: 'KJV',
    book_key: 'PSA',
    book_name: 'Psalms',
    chapter_number: 23,
    verses_json: {
      '1': 'The LORD is my shepherd; I shall not want.',
      '2': 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
      '3': 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
      '4': 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
      '5': 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
      '6': 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
    },
    total_verses: 6,
  },
  {
    language_code: 'en',
    translation_id: 'KJV',
    book_key: 'JHN',
    book_name: 'John',
    chapter_number: 1,
    verses_json: {
      '1': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      '2': 'The same was in the beginning with God.',
      '3': 'All things were made by him; and without him was not any thing made that was made.',
      '4': 'In him was life; and the life was the light of men.',
      '5': 'And the light shineth in darkness; and the darkness comprehended it not.',
      '14': 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
    },
    total_verses: 51,
  },
];

// Preload function - call this once on app startup
export async function seedBibleStarterPack() {
  const isSeeded = localStorage.getItem('bibleStarterPackSeeded');
  if (isSeeded) {
    return { ok: true, message: 'Already seeded' };
  }

  try {
    // Check if translations already exist
    const existingTrans = await base44.entities.BibleTranslations.filter({
      language_code: 'en',
    });

    if (!existingTrans?.length) {
      // Seed translations
      await base44.entities.BibleTranslations.bulkCreate(STARTER_TRANSLATIONS);
    }

    // Check if text chapters exist
    const existingChapters = await base44.entities.BibleTextChapter.filter({
      language_code: 'en',
    });

    if (!existingChapters?.length) {
      // Seed text chapters
      await base44.entities.BibleTextChapter.bulkCreate(STARTER_TEXT_CHAPTERS);
    }

    localStorage.setItem('bibleStarterPackSeeded', 'true');

    return { ok: true, message: 'Bible starter pack seeded successfully' };
  } catch (e) {
    console.error('Error seeding Bible starter pack:', e);
    return {
      ok: false,
      error: e?.message || 'Failed to seed starter pack',
    };
  }
}