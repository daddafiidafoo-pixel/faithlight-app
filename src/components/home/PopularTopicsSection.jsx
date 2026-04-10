import React from 'react';
import { useI18n } from '../I18nProvider';

const TOPICS = [
  { key: 'topics.hope', label: 'Hope', omLabel: 'Abdii' },
  { key: 'topics.love', label: 'Love', omLabel: 'Jaalala' },
  { key: 'topics.faith', label: 'Faith', omLabel: 'Amantii' },
  { key: 'topics.forgiveness', label: 'Forgiveness', omLabel: 'Dhiifama' },
  { key: 'topics.strength', label: 'Strength', omLabel: 'Cimina' },
  { key: 'topics.peace', label: 'Peace', omLabel: 'Nagaa' },
];

export default function PopularTopicsSection() {
  const { t, lang } = useI18n();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
        {t('home.popularTopics', 'Popular Topics')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <button
            key={topic.key}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 text-sm font-medium transition-colors"
          >
            {lang === 'om' ? topic.omLabel : t(topic.key, topic.label)}
          </button>
        ))}
      </div>
    </div>
  );
}