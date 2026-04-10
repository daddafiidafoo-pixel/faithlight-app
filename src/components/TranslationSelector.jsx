import React from 'react';
import LanguageSelectorDropdown from './LanguageSelectorDropdown';
import { useUITranslation } from './useUITranslation';

export default function TranslationSelector({ selectedLanguage, onLanguageChange }) {
  const { t } = useUITranslation(selectedLanguage);

  return (
    <div className="space-y-2">
      <LanguageSelectorDropdown
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        showLabel={true}
      />
      <p className="text-xs text-gray-500">
        {t('msg.loading', 'Loading translations...')}
      </p>
    </div>
  );
}