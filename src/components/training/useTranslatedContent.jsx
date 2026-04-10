import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch translated content for training modules
 * Falls back to original content if translation not available
 */
export function useTranslatedContent(contentId, contentType, languageCode, originalContent = {}) {
  const { data: translation } = useQuery({
    queryKey: ['translated-content', contentId, contentType, languageCode],
    queryFn: async () => {
      if (!contentId || !contentType || !languageCode || languageCode === 'en') {
        return null;
      }

      try {
        const results = await base44.entities.TrainingContentTranslation.filter({
          content_id: contentId,
          content_type: contentType,
          language_code: languageCode,
          status: 'published',
        });

        return results.length > 0 ? results[0] : null;
      } catch {
        return null;
      }
    },
  });

  // Return translated content or fallback to original
  if (translation && translation.status === 'published') {
    return {
      title: translation.title || originalContent.title,
      description: translation.description || originalContent.description,
      content: translation.content || originalContent.content,
      isTranslated: true,
      language: languageCode,
    };
  }

  return {
    title: originalContent.title,
    description: originalContent.description,
    content: originalContent.content,
    isTranslated: false,
    language: 'en',
  };
}

/**
 * Hook to fetch all available translations for content
 */
export function useAvailableTranslations(contentId, contentType) {
  const { data: translations = [] } = useQuery({
    queryKey: ['available-translations', contentId, contentType],
    queryFn: async () => {
      if (!contentId || !contentType) return [];

      try {
        const results = await base44.entities.TrainingContentTranslation.filter({
          content_id: contentId,
          content_type: contentType,
          status: 'published',
        });

        return results.map(t => ({
          code: t.language_code,
          name: t.language_name,
        }));
      } catch {
        return [];
      }
    },
  });

  return [{ code: 'en', name: 'English' }, ...translations];
}