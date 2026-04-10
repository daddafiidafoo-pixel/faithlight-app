import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function ErrorState({ 
  title, 
  message, 
  action = null,
  fullWidth = false 
}) {
  const { t } = useI18n();

  const title_text = title || t('error.somethingWrong', 'Something went wrong');
  const message_text = message || t('error.tryAgain', 'Please try again');

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${!fullWidth && 'max-w-md'}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-1">
            {title_text}
          </h4>
          <p className="text-sm text-red-800 mb-3">
            {message_text}
          </p>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}