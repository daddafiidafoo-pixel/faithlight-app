import React from 'react';
import { useI18n } from '@/components/I18nProvider';

/**
 * Standard feature grid for quick actions
 * Usage:
 * <FeatureGrid items={[
 *   { icon: BookOpen, label: 'Read Bible', href: '/BibleReader' },
 *   { icon: Wand2, label: 'AI Guide', href: '/AIBibleCompanion' },
 * ]} />
 */
export default function FeatureGrid({ items = [], columns = 5 }) {
  const { t } = useI18n();

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-3`}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        const href = item.href || '#';

        return (
          <a
            key={idx}
            href={href}
            className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
          >
            {Icon && (
              <div className="mb-2">
                <Icon className="w-6 h-6 mx-auto text-indigo-600" />
              </div>
            )}
            {item.emoji && (
              <div className="text-2xl mb-2">
                {item.emoji}
              </div>
            )}
            <p className="text-xs font-bold text-gray-900">
              {item.label}
            </p>
          </a>
        );
      })}
    </div>
  );
}