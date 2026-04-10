// Stub: getLanguageSystemPrompt — returns a system prompt for the given language
export function getLanguageSystemPrompt(languageCode = 'en') {
  const prompts = {
    en: 'You are a helpful Bible study assistant. Respond clearly in English.',
    om: 'Gargaaraa barnoota Macaafa Qulqulluu taatee jirta. Afaan Oromootiin deebiisi.',
    am: 'የቅዱስ መጽሐፍ ጥናት ረዳት ነህ። በአማርኛ መልስ ስጥ።',
    ar: 'أنت مساعد دراسة الكتاب المقدس. أجب باللغة العربية.',
    fr: 'Tu es un assistant d\'étude biblique. Réponds clairement en français.',
    sw: 'Wewe ni msaidizi wa kusoma Biblia. Jibu kwa Kiswahili.',
    ti: 'ናይ ቅዱስ መጽሓፍ ትምህርቲ ሓጋዚ ኢኻ። ብትግርኛ መልሲ ሃብ።',
  };
  return prompts[languageCode] || prompts.en;
}

export default getLanguageSystemPrompt;