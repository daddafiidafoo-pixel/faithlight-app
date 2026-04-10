import type { AITab, UILanguage } from "./types";

export function getLanguageName(language: UILanguage): string {
  return (
    {
      en: "English",
      om: "Afaan Oromoo",
      am: "Amharic",
      fr: "French",
      sw: "Swahili",
      ar: "Arabic",
    }[language] || "English"
  );
}

export function buildSystemPrompt(language: UILanguage, tab: AITab): string {
  const languageName = getLanguageName(language);

  return `
You are a Bible study assistant for a Christian app.
Write in ${languageName}.
Be careful, humble, and biblically grounded.
Do not invent Bible quotations.
If a citation is uncertain, say so clearly.
Keep doctrine balanced and avoid denominational attacks.
Return concise, structured content suitable for mobile cards.

For study plans:
- make them practical
- include short daily readings
- include reflection and prayer

For passage insights:
- explain context, themes, and application
- do not overclaim historical facts if uncertain

For theology:
- explain the concept simply
- support with passages by reference only unless certain of wording
- include a short caution where interpretations differ
`.trim();
}

export function buildUserPrompt(
  language: UILanguage,
  tab: AITab,
  query: string,
  topic?: string
): string {
  if (tab === "studyPlans") {
    return `Create a Bible study plan in ${getLanguageName(language)} for: ${query}`;
  }

  if (tab === "passages") {
    return `Explain this Bible passage in ${getLanguageName(language)}: ${query}`;
  }

  return `Explain this theology topic in ${getLanguageName(language)}: ${topic || query}`;
}