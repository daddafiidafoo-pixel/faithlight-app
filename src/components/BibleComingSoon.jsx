import React from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen } from 'lucide-react';

export default function BibleComingSoon({
  title,
  message,
  showBackButton = false,
  onBack
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Back')}
          </button>
        )}

        <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <BookOpen className="w-8 h-8 text-amber-700" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {title || t('bibleComingSoon.title', 'Afaan Oromoo Bible Coming Soon')}
          </h1>

          <p className="text-base leading-7 text-gray-700 mb-6">
            {message ||
              t(
                'bibleComingSoon.message',
                'We are currently connecting the full Afaan Oromoo Bible source. Please check back soon.'
              )}
          </p>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-gray-700 font-medium">💡 {t(
              'bibleComingSoon.note',
              'English Bible features remain available while Afaan Oromoo Bible access is being completed.'
            )}</p>
          </div>
        </div>
      </div>
    </div>
  );
}