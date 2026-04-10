import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AIEnhancedBibleStudy from '@/components/ai/AIEnhancedBibleStudy.jsx';
import { useI18n } from '@/components/I18nProvider';

export default function AIEnhancedBibleStudyPage() {
  const { lang } = useI18n();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const initialTab =
    tab === 'studyPlans' || tab === 'passages' || tab === 'theology'
      ? tab
      : 'theology';

  const handleSearch = (query, activeTab, selectedTopic) => {
    console.log('Search:', { query, activeTab, selectedTopic });
    // Later connect to your AI API
  };

  return (
    <AIEnhancedBibleStudy
      language={lang}
      initialTab={initialTab}
      onBack={() => window.history.back()}
      onSearch={handleSearch}
    />
  );
}