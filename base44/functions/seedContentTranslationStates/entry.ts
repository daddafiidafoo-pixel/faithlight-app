import { base44 } from '@/api/base44Client';

/**
 * Translation States for Safe AI Auto-Translation
 * SOURCE_EN → AI_TRANSLATED → HUMAN_REVIEWED → PUBLISHED
 */

export async function seedContentTranslationStates() {
  try {
    // Initialize default translation state template
    const stateDefinitions = [
      {
        state: 'SOURCE_EN',
        label: 'English Source (Original)',
        description: 'Original English content from creator',
        color: 'blue',
        isPublished: true,
      },
      {
        state: 'AI_TRANSLATED',
        label: 'AI Translated',
        description: 'Content translated by AI, pending human review',
        color: 'yellow',
        isPublished: false,
      },
      {
        state: 'HUMAN_REVIEWED',
        label: 'Reviewed by Human',
        description: 'Translator/reviewer has checked and approved',
        color: 'green',
        isPublished: false,
      },
      {
        state: 'PUBLISHED',
        label: 'Published',
        description: 'Ready for users to see',
        color: 'green',
        isPublished: true,
      },
    ];

    // Store state definitions in a utility (not a database entity)
    // This is a reference system for the UI and workflow
    console.log('✅ Translation States Ready:', stateDefinitions);

    return {
      success: true,
      message: 'Content translation states configured',
      states: stateDefinitions,
    };
  } catch (error) {
    console.error('Error setting up content translation states:', error);
    throw error;
  }
}

/**
 * Helper function to transition content state
 */
export function getTransitionRules() {
  return {
    SOURCE_EN: ['AI_TRANSLATED'],
    AI_TRANSLATED: ['HUMAN_REVIEWED', 'SOURCE_EN'],
    HUMAN_REVIEWED: ['PUBLISHED', 'AI_TRANSLATED'],
    PUBLISHED: ['HUMAN_REVIEWED'],
  };
}

/**
 * UI Label for AI-translated content
 */
export const AI_TRANSLATION_BADGE = {
  en: '🌍 This lesson was translated by AI—you can improve it.',
  om: '🌍 Leenjiin kun AI\'n hiikamee jira — ati gaarii gochuu dandeessa.',
  am: '🌍 ይህ ትምህርት በ AI ተተርጉሟል - ሊሻሩት ይችላሉ።',
  ar: '🌍 تمت ترجمة هذا الدرس بواسطة الذكاء الاصطناعي - يمكنك تحسينه.',
};