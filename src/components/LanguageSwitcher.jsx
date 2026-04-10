import React from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from './I18nProvider';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'om', label: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', label: 'Swahili', flag: '🇹🇿' },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇷' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const current = SUPPORTED_LANGUAGES.find(l => l.code === lang);

  const handleChange = (newLang) => {
    logEvent(Events.LANGUAGE_CHANGED, { from: lang, to: newLang });
    setLang(newLang);
  };

  return (
    <Select value={lang} onValueChange={handleChange}>
      <SelectTrigger className="min-h-[44px] min-w-[44px] h-auto w-auto gap-1 px-2 border-0 shadow-none bg-transparent hover:bg-gray-100 focus:ring-0 text-gray-600 flex items-center justify-center" aria-label={`Change language. Current: ${current?.label || 'English'}`}>
        <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs hidden sm:inline">{current?.flag || '🌐'}</span>
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LANGUAGES.map(l => (
          <SelectItem key={l.code} value={l.code} className="text-sm">
            {l.flag} {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}