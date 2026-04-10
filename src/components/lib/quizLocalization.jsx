/**
 * Quiz Localization - Topics and question translations
 * Supports: English, Afaan Oromoo, Kiswahili, Amharic, French, Portuguese, Spanish, Arabic
 */

export const QUIZ_TOPICS = {
  faith: {
    en: 'Faith',
    om: 'Imani',
    sw: 'Imani',
    am: 'ሙሉ ግምገማ',
    fr: 'Foi',
    pt: 'Fé',
    es: 'Fe',
    ar: 'الإيمان',
  },
  salvation: {
    en: 'Salvation',
    om: 'Wokovu',
    sw: 'Wokovu',
    am: 'ሕይወት',
    fr: 'Salut',
    pt: 'Salvação',
    es: 'Salvación',
    ar: 'الخلاص',
  },
  grace: {
    en: 'Grace',
    om: 'Neema',
    sw: 'Neema',
    am: ' grace',
    fr: 'Grâce',
    pt: 'Graça',
    es: 'Gracia',
    ar: 'النعمة',
  },
  prayer: {
    en: 'Prayer',
    om: 'Kadhannaa',
    sw: 'Maombi',
    am: 'ጸሎት',
    fr: 'Prière',
    pt: 'Oração',
    es: 'Oración',
    ar: 'الدعاء',
  },
  forgiveness: {
    en: 'Forgiveness',
    om: 'Msamaha',
    sw: 'Msamaha',
    am: 'ይቅር',
    fr: 'Pardon',
    pt: 'Perdão',
    es: 'Perdón',
    ar: 'المغفرة',
  },
  psalms: {
    en: 'Psalms',
    om: 'Zaburi',
    sw: 'Zaburi',
    am: 'መዝሙር',
    fr: 'Psaumes',
    pt: 'Salmos',
    es: 'Salmos',
    ar: 'الزبور',
  },
  resurrection: {
    en: 'Resurrection',
    om: 'Ufufuo',
    sw: 'Ufufuo',
    am: 'ሕይወት ማግኘት',
    fr: 'Résurrection',
    pt: 'Ressurreição',
    es: 'Resurrección',
    ar: 'القيامة',
  },
  gospel_of_john: {
    en: 'Gospel of John',
    om: 'Injili ya Yohana',
    sw: 'Injili ya Yohana',
    am: 'ዮሐንስ ወንጌል',
    fr: 'Évangile de Jean',
    pt: 'Evangelho de João',
    es: 'Evangelio de Juan',
    ar: 'إنجيل يوحنا',
  },
  love: {
    en: 'Love',
    om: 'Upendo',
    sw: 'Upendo',
    am: 'ፍቅር',
    fr: 'Amour',
    pt: 'Amor',
    es: 'Amor',
    ar: 'الحب',
  },
  faithfulness: {
    en: 'Faithfulness',
    om: 'Uaminifu',
    sw: 'Uaminifu',
    am: 'ታማኝነት',
    fr: 'Fidélité',
    pt: 'Fidelidade',
    es: 'Fidelidad',
    ar: 'الأمانة',
  },
};

/**
 * Get localized quiz topic label
 */
export function getLocalizedQuizTopic(topicKey, languageCode = 'en') {
  return QUIZ_TOPICS[topicKey]?.[languageCode] || QUIZ_TOPICS[topicKey]?.['en'] || topicKey;
}

/**
 * Get all quiz topics for a language
 */
export function getQuizTopicsForLanguage(languageCode = 'en') {
  return Object.entries(QUIZ_TOPICS).map(([key, labels]) => ({
    key,
    label: labels[languageCode] || labels.en,
  }));
}

/**
 * Quiz question difficulty levels (localized)
 */
export const QUIZ_DIFFICULTY = {
  beginner: {
    en: 'Beginner',
    om: 'Jalqabaa',
    sw: 'Mpya',
    am: 'ጀማሪ',
    fr: 'Débutant',
    pt: 'Iniciante',
    es: 'Principiante',
    ar: 'مبتدئ',
  },
  intermediate: {
    en: 'Intermediate',
    om: 'Giddugaleessaa',
    sw: 'Kwa Kati',
    am: 'መካከለኛ',
    fr: 'Intermédiaire',
    pt: 'Intermediário',
    es: 'Intermedio',
    ar: 'متوسط',
  },
  advanced: {
    en: 'Advanced',
    om: 'Ol\'aanaa',
    sw: 'Juu',
    am: 'ዝቅተኛ',
    fr: 'Avancé',
    pt: 'Avançado',
    es: 'Avanzado',
    ar: 'متقدم',
  },
};

/**
 * Get localized difficulty label
 */
export function getLocalizedDifficulty(difficultyKey, languageCode = 'en') {
  return QUIZ_DIFFICULTY[difficultyKey]?.[languageCode] || QUIZ_DIFFICULTY[difficultyKey]?.['en'] || difficultyKey;
}

/**
 * Quiz tone/style options (for AI-generated explanations)
 */
export const QUIZ_TONE = {
  devotional: {
    en: 'Devotional (Warm, uplifting, faith-focused)',
    om: 'Kaka\'umsa amantii (Jaalala, jedhii, amantii-xiyyeeffatu)',
    sw: 'Kuabudu (Joto, kujenga imani)',
    am: 'ሙሉ ግምገማ (ሞቅታማ፣ ከልብ የተወለደ)',
    fr: 'Dévotionnel (Chaud, édifiant)',
    pt: 'Devocional (Quente, inspirador)',
    es: 'Devocional (Cálido, inspirador)',
    ar: 'عبادي (دافئ، مسبت)',
  },
  academic: {
    en: 'Academic (Scholarly, precise, detailed)',
    om: 'Barnoota (Barreessaa, sirrii, bal\'inaan ibsame)',
    sw: 'Kielimu (Kielimu, sahihi, maelezo kina)',
    am: 'ሙሉ ግምገማ (ሳይንሳዊ)',
    fr: 'Académique (Savant, précis)',
    pt: 'Acadêmico (Acadêmico, preciso)',
    es: 'Académico (Académico, preciso)',
    ar: 'أكاديمي (علمي، دقيق)',
  },
  pastoral: {
    en: 'Pastoral (Practical, applicable, relatable)',
    om: 'Tajaajila Luba (Hojiirra oolu, mana amantii)',
    sw: 'Huduma ya Kanisa (Kazi, huduma ya kanisa)',
    am: 'ሙሉ ግምገማ (ተግባራዊ)',
    fr: 'Pastoral (Pratique, applicable)',
    pt: 'Pastoral (Prático, aplicável)',
    es: 'Pastoral (Práctico, aplicable)',
    ar: '牧羊人 (عملي، قابل للتطبيق)',
  },
};

/**
 * Get localized tone label
 */
export function getLocalizedTone(toneKey, languageCode = 'en') {
  return QUIZ_TONE[toneKey]?.[languageCode] || QUIZ_TONE[toneKey]?.['en'] || toneKey;
}