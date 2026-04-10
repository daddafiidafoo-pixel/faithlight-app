export const useTranslation = (translations, language) => {
  return translations[language] || translations.en;
};