export type SupportedLanguage =
  | 'en'
  | 'om'
  | 'am'
  | 'fr'
  | 'sw'
  | 'ar'
  | 'unknown';

export type ReviewPageContext =
  | 'ai_hub'
  | 'bible_explanation'
  | 'verse_of_the_day'
  | 'prayer_page'
  | 'other';

export type TranslationIssue =
  | 'english_leak'
  | 'missing_refs'
  | 'mixed_language'
  | 'wrong_language'
  | 'translation_quality';

export type ReviewStatus =
  | 'pending'
  | 'reviewed'
  | 'resolved';

export interface AITranslationReviewQueueItem {
  user_id: string;
  session_id: string;
  page_context: ReviewPageContext;
  lang_expected: Exclude<SupportedLanguage, 'unknown'>;
  lang_detected?: SupportedLanguage;
  content_sample: string;
  issues: TranslationIssue[];
  review_notes?: string;
  created_at: string; // ISO date-time
  updated_at?: string; // ISO date-time
  status: ReviewStatus;
}