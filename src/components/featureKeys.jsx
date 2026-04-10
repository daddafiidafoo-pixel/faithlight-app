/**
 * Feature Key Constants
 * 
 * All feature access decisions reference these keys.
 * Format: "category.feature" or "category.subcategory.feature"
 */

export const FEATURE_KEYS = {
  // Premium-only features
  ACADEMY_DIPLOMA: 'academy.diploma',
  CERTIFICATES_DOWNLOAD: 'certificates.download',
  SERMON_TOOLS_ADVANCED: 'sermon.tools.advanced',
  AI_UNLIMITED: 'ai.unlimited', // internal: bypass daily caps

  // Free features (always allowed)
  ACADEMY_FOUNDATIONS: 'academy.foundations',
  COMMUNITY_ACCESS: 'community.access',
  BIBLE_READ_MINUTES: 'bible.read_minutes', // limited free, unlimited premium
  AUDIO_STREAM_MINUTES: 'audio.stream_minutes', // limited free, unlimited premium
  AI_EXPLAIN_PASSAGE: 'ai.explain_passage', // limited daily
  AI_STUDY_PLAN_GENERATE: 'ai.study_plan_generate', // limited daily
  AI_SERMON_BUILDER_GENERATE: 'ai.sermon_builder_generate', // limited daily
};

export const PREMIUM_ONLY_FEATURES = [
  FEATURE_KEYS.ACADEMY_DIPLOMA,
  FEATURE_KEYS.CERTIFICATES_DOWNLOAD,
  FEATURE_KEYS.SERMON_TOOLS_ADVANCED,
  FEATURE_KEYS.AI_UNLIMITED,
];

export const LIMITED_FEATURES = [
  FEATURE_KEYS.BIBLE_READ_MINUTES,
  FEATURE_KEYS.AUDIO_STREAM_MINUTES,
  FEATURE_KEYS.AI_EXPLAIN_PASSAGE,
  FEATURE_KEYS.AI_STUDY_PLAN_GENERATE,
  FEATURE_KEYS.AI_SERMON_BUILDER_GENERATE,
];

export const FEATURE_LABELS = {
  [FEATURE_KEYS.ACADEMY_DIPLOMA]: 'Advanced Diploma',
  [FEATURE_KEYS.CERTIFICATES_DOWNLOAD]: 'Certificate Downloads',
  [FEATURE_KEYS.SERMON_TOOLS_ADVANCED]: 'Advanced Sermon Tools',
  [FEATURE_KEYS.AI_UNLIMITED]: 'Unlimited AI Usage',
  [FEATURE_KEYS.ACADEMY_FOUNDATIONS]: 'Foundations Academy',
  [FEATURE_KEYS.COMMUNITY_ACCESS]: 'Community',
  [FEATURE_KEYS.BIBLE_READ_MINUTES]: 'Bible Reading',
  [FEATURE_KEYS.AUDIO_STREAM_MINUTES]: 'Audio Streaming',
  [FEATURE_KEYS.AI_EXPLAIN_PASSAGE]: 'AI Verse Explanations',
  [FEATURE_KEYS.AI_STUDY_PLAN_GENERATE]: 'AI Study Plans',
  [FEATURE_KEYS.AI_SERMON_BUILDER_GENERATE]: 'AI Sermon Generator',
};