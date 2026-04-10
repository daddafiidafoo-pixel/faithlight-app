import type {
  AITranslationReviewQueueItem,
  ReviewPageContext,
  ReviewStatus,
  SupportedLanguage,
  TranslationIssue,
} from '@/types/aiTranslationReviewQueue';

type CreateInput = {
  user_id: string;
  session_id: string;
  page_context: ReviewPageContext;
  lang_expected: Exclude<SupportedLanguage, 'unknown'>;
  lang_detected?: SupportedLanguage;
  content_sample: string;
  issues: TranslationIssue[];
  review_notes?: string;
  status?: ReviewStatus;
};

export function createAITranslationReviewQueueItem(
  input: CreateInput
): AITranslationReviewQueueItem {
  const now = new Date().toISOString();
  return {
    user_id: input.user_id,
    session_id: input.session_id,
    page_context: input.page_context,
    lang_expected: input.lang_expected,
    lang_detected: input.lang_detected,
    content_sample: input.content_sample,
    issues: input.issues,
    review_notes: input.review_notes,
    created_at: now,
    updated_at: now,
    status: input.status ?? 'pending',
  };
}