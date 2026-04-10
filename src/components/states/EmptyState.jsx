import React from 'react';
import { BookOpen } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';

export default function EmptyState({ 
  icon: Icon = BookOpen, 
  title, 
  description, 
  action = null 
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        {Icon && (
          <Icon className="w-8 h-8 text-gray-300 mx-auto" />
        )}
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}