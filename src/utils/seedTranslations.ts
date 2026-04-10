import { base44 } from '@/api/base44Client';

type TranslationStatus = 'draft' | 'published';
type TranslationCategory = 'ui' | 'content' | 'system';

export type SeedTranslationsInput = Record<string, string>;

type SeedTranslationsOptions = {
  category?: TranslationCategory;
  status?: TranslationStatus;
  dryRun?: boolean;
};

type SeedTranslationsResult = {
  success: boolean;
  language_code: string;
  inserted: number;
  skipped: number;
  total: number;
  results: Array<{
    key: string;
    status: 'inserted' | 'skipped' | 'error';
    message?: string;
  }>;
  message?: string;
};

export async function seedTranslations(
  languageCode: string,
  translations: SeedTranslationsInput,
  options: SeedTranslationsOptions = {}
): Promise<SeedTranslationsResult> {
  const category = options.category ?? 'ui';
  const status = options.status ?? 'published';
  const dryRun = options.dryRun ?? false;

  if (!base44?.entities?.Translation) {
    return {
      success: false,
      language_code: languageCode,
      inserted: 0,
      skipped: 0,
      total: 0,
      results: [],
      message: 'Translation entity not available',
    };
  }

  if (!languageCode || typeof languageCode !== 'string') {
    return {
      success: false,
      language_code: languageCode,
      inserted: 0,
      skipped: 0,
      total: 0,
      results: [],
      message: 'languageCode is required',
    };
  }

  const entries = Object.entries(translations);
  let inserted = 0;
  let skipped = 0;

  const results: SeedTranslationsResult['results'] = [];

  for (const [key, value] of entries) {
    try {
      if (!key || typeof value !== 'string') {
        results.push({ key, status: 'error', message: 'Invalid translation key or value' });
        continue;
      }

      const existing = await (base44.entities.Translation as any)
        .filter({ key, language_code: languageCode, category }, '-created_date', 1)
        .catch(() => []);

      if (existing && existing.length > 0) {
        skipped++;
        results.push({ key, status: 'skipped' });
        continue;
      }

      if (!dryRun) {
        await base44.entities.Translation.create({ key, language_code: languageCode, value, category, status });
      }

      inserted++;
      results.push({ key, status: 'inserted' });
    } catch (error: any) {
      results.push({ key, status: 'error', message: error?.message || 'Unknown error' });
    }
  }

  return {
    success: true,
    language_code: languageCode,
    inserted,
    skipped,
    total: entries.length,
    results,
    message: dryRun ? 'Dry run completed' : 'Translations processed successfully',
  };
}

export async function seedMultipleLanguages(
  languageMap: Record<string, Record<string, string>>,
  options: SeedTranslationsOptions = {}
) {
  const results = [];
  for (const [languageCode, translations] of Object.entries(languageMap)) {
    const result = await seedTranslations(languageCode, translations, options);
    results.push(result);
  }
  return results;
}