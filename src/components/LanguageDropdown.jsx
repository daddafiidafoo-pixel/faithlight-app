import { useLanguage } from '@/components/i18n/LanguageProvider';
import { useLanguageStore } from '@/stores/languageStore';
import { AccessibleSelect } from '@/components/ui/accessible-select';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ti', name: 'ትግርኛ', flag: '🇪🇷' },
];

export default function LanguageDropdown() {
  const { language, setLanguage: setContextLanguage } = useLanguage();
  const setStoreLanguage = useLanguageStore(s => s.setLanguage);

  const handleChange = (code) => {
    // Sync both the context (for component-level translations) and the Zustand store (for app-wide state)
    setContextLanguage(code);
    setStoreLanguage(code);
  };

  return (
    <AccessibleSelect
      value={language}
      onValueChange={handleChange}
      label="Select language"
      compact
      className="w-28 sm:w-36"
      options={LANGUAGES.map(lang => ({
        value: lang.code,
        label: `${lang.flag} ${lang.name}`,
      }))}
    />
  );
}