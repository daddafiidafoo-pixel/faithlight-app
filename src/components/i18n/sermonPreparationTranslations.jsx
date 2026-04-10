/**
 * Translation keys for Sermon Preparation feature
 */

export const sermonPreparationKeys = {
  title: 'Sermon Preparation',
  description: 'Generate high-quality sermons in your chosen language',
  
  // Language section
  language: 'Sermon Output Language',
  languageRequired: '(required)',
  languageDescription: 'The language the sermon will be generated in',
  useCurrentLanguage: 'Use current app language',
  fullGenerationSupport: 'Full sermon generation support',
  translateNote: 'Generate in English + translation',
  limitedSupport: 'Limited generation support',
  fullySupportedLabel: 'Fully Supported (Native Generation)',
  translationAvailableLabel: 'Translation Available',
  whatLanguagesSupported: 'What languages are fully supported?',
  
  // Form fields
  sermonType: 'Sermon Type',
  sermonTypeRequired: 'Choose a sermon type',
  theme: 'Theme / Topic',
  themeRequired: 'Enter a theme or topic',
  passage: 'Bible Passage',
  passageRequired: 'Enter a Bible passage (e.g., Romans 8:28, James 1:2-4)',
  audience: 'Audience',
  tone: 'Tone / Style',
  length: 'Estimated Length',
  lengthMinutes: 'minutes',
  outputType: 'Output Type',
  keywords: 'Keywords (optional)',
  occasion: 'Occasion (optional)',
  
  // Sermon types
  sundaySermon: 'Sunday Sermon',
  sundayDescription: 'General church gathering sermon',
  youthSermon: 'Youth Sermon',
  youthDescription: 'Tailored for young adults/teens',
  studyGuide: 'Bible Study Guide',
  studyDescription: 'Detailed study with discussion questions',
  funeralSermon: 'Funeral Sermon',
  funeralDescription: 'Comfort and hope in loss',
  weddingSermon: 'Wedding Sermon',
  weddingDescription: 'Marriage and commitment',
  customSermon: 'Custom Sermon',
  customDescription: 'Your own specifications',
  
  // Audiences
  generalChurch: 'General church audience',
  youthAdults: 'Youth / young adults',
  children: 'Children / families',
  leaders: 'Church leaders / pastors',
  newBelievers: 'New believers',
  smallGroup: 'Small group / home study',
  
  // Tones
  pastoral: 'Pastoral and caring',
  academic: 'Academic and scholarly',
  practical: 'Practical and applicable',
  prophetic: 'Prophetic and convicting',
  encouraging: 'Encouraging and hopeful',
  expository: 'Expository and detailed',
  
  // Output formats
  outlineOnly: 'Outline only (title, main points, verses)',
  fullSermon: 'Full sermon with introduction, body, and conclusion',
  bilingual: 'Bilingual (English + translation)',
  
  // Actions
  generate: 'Generate Sermon',
  generating: 'Generating sermon...',
  regenerate: 'Regenerate',
  regenerateOtherLanguage: 'Regenerate in Another Language',
  translate: 'Translate to Another Language',
  copy: 'Copy',
  copied: 'Copied',
  download: 'Download',
  share: 'Share',
  
  // Results
  generatedSermon: 'Generated Sermon',
  sermonLanguage: 'Language',
  sermonType: 'Type',
  bibleTranslation: 'Bible Translation',
  
  // Errors & Validation
  fillRequiredFields: 'Please fill in all required fields',
  fillLanguageThemePassage: 'Please select language, theme, and passage',
  generationFailed: 'Failed to generate sermon. Please try again.',
  noSermonGenerated: 'No sermon was generated. Please try again.',
  
  // Fallback messages
  limitedSupportWarning: 'Limited generation support',
  limitedSupportMessage: 'Full sermon generation is not yet available in {language}. We\'ll generate in English and provide a high-quality translation.',
  reviewWithNativeSpeaker: 'For important sermons, please review with a native speaker.',
  
  // Metadata display
  generatedAt: 'Generated',
  theme: 'Theme',
  passage: 'Passage',
  
  // Navigation
  backToForm: 'Back to form',
  startNew: 'Start new sermon',
};