import React from 'react';
import { useGlobalLanguage } from '../GlobalLanguageContext';
import { SUPPORTED_AI_LANGUAGES } from '../../functions/getLanguageSystemPrompt';
import { Sparkles } from 'lucide-react';
import MobileActionSheet from '../MobileActionSheet';

export default function AILanguageSelector() {
  const { aiLanguage, setAILanguage } = useGlobalLanguage();

  return (
    <div className="flex items-center gap-2">
      <Sparkles className="w-4 h-4 text-indigo-500" />
      <div className="hidden md:block">
        {/* Desktop: custom minimal select-like button */}
        <button
          onClick={() => {}}
          className="w-auto h-9 text-xs px-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded text-gray-700 transition-colors"
        >
          {SUPPORTED_AI_LANGUAGES.find(l => l.code === aiLanguage)?.label || 'AI Language'}
        </button>
      </div>
      <div className="md:hidden">
        {/* Mobile: bottom sheet */}
        <MobileActionSheet
          value={aiLanguage}
          onValueChange={setAILanguage}
          label="AI Language"
          options={SUPPORTED_AI_LANGUAGES.map(lang => ({
            value: lang.code,
            label: `${lang.flag} ${lang.label}`,
          }))}
          renderOption={(opt) => opt.label || opt}
        />
      </div>
    </div>
  );
}