import type { SupportedLanguage, TranslationIssue } from '@/types/aiTranslationReviewQueue';

const ENGLISH_WORD_HINTS = [
  'the', 'and', 'this', 'that', 'god',
  'verse', 'faith', 'love', 'hope', 'jesus',
];

export function detectTranslationIssues(params: {
  expected: Exclude<SupportedLanguage, 'unknown'>;
  detected?: SupportedLanguage;
  content: string;
  hasRefs?: boolean;
}): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  const text = params.content.toLowerCase();

  if (params.detected && params.detected !== params.expected) {
    issues.push('wrong_language');
  }

  const englishHintCount = ENGLISH_WORD_HINTS.filter(
    (word) => text.includes(` ${word} `) || text.startsWith(`${word} `) || text.endsWith(` ${word}`)
  ).length;

  if (params.expected !== 'en' && englishHintCount >= 2) {
    issues.push('english_leak');
  }

  if (params.detected && params.detected !== 'en' && englishHintCount >= 2) {
    issues.push('mixed_language');
  }

  if (params.hasRefs === false) {
    issues.push('missing_refs');
  }

  return Array.from(new Set(issues));
}