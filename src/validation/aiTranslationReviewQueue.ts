import type {
  AITranslationReviewQueueItem,
  ReviewPageContext,
  ReviewStatus,
  SupportedLanguage,
  TranslationIssue,
} from '@/types/aiTranslationReviewQueue';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'om', 'am', 'fr', 'sw', 'ar', 'unknown'];
const EXPECTED_LANGUAGES: Exclude<SupportedLanguage, 'unknown'>[] = ['en', 'om', 'am', 'fr', 'sw', 'ar'];
const PAGE_CONTEXTS: ReviewPageContext[] = ['ai_hub', 'bible_explanation', 'verse_of_the_day', 'prayer_page', 'other'];
const TRANSLATION_ISSUES: TranslationIssue[] = ['english_leak', 'missing_refs', 'mixed_language', 'wrong_language', 'translation_quality'];
const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'reviewed', 'resolved'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return !Number.isNaN(Date.parse(value));
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export function validateAITranslationReviewQueueItem(
  input: unknown
): ValidationResult<AITranslationReviewQueueItem> {
  const errors: string[] = [];

  if (!isObject(input)) {
    return { success: false, errors: ['Input must be an object.'] };
  }

  if (!isNonEmptyString(input.user_id)) errors.push('user_id is required and must be a non-empty string.');
  if (!isNonEmptyString(input.session_id)) errors.push('session_id is required and must be a non-empty string.');
  if (!isOneOf(input.page_context, PAGE_CONTEXTS)) errors.push(`page_context must be one of: ${PAGE_CONTEXTS.join(', ')}.`);
  if (!isOneOf(input.lang_expected, EXPECTED_LANGUAGES)) errors.push(`lang_expected must be one of: ${EXPECTED_LANGUAGES.join(', ')}.`);

  if (input.lang_detected !== undefined && !isOneOf(input.lang_detected, SUPPORTED_LANGUAGES)) {
    errors.push(`lang_detected must be one of: ${SUPPORTED_LANGUAGES.join(', ')}.`);
  }

  if (!isNonEmptyString(input.content_sample)) errors.push('content_sample is required and must be a non-empty string.');

  if (!Array.isArray(input.issues) || input.issues.length === 0) {
    errors.push('issues is required and must be a non-empty array.');
  } else if (!isStringArray(input.issues)) {
    errors.push('issues must contain only strings.');
  } else {
    const invalidIssues = input.issues.filter((issue) => !TRANSLATION_ISSUES.includes(issue as TranslationIssue));
    if (invalidIssues.length > 0) {
      errors.push(`issues contains invalid values: ${invalidIssues.join(', ')}. Allowed: ${TRANSLATION_ISSUES.join(', ')}.`);
    }
  }

  if (input.review_notes !== undefined && typeof input.review_notes !== 'string') {
    errors.push('review_notes must be a string if provided.');
  }

  if (!isIsoDateTime(input.created_at)) errors.push('created_at is required and must be a valid ISO date-time string.');
  if (input.updated_at !== undefined && !isIsoDateTime(input.updated_at)) errors.push('updated_at must be a valid ISO date-time string if provided.');
  if (!isOneOf(input.status, REVIEW_STATUSES)) errors.push(`status must be one of: ${REVIEW_STATUSES.join(', ')}.`);

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: input as AITranslationReviewQueueItem };
}