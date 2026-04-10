import { t } from "./i18n";

function getPromptLanguageName(lang) {
  switch (lang) {
    case "om":
      return "Afaan Oromoo";
    case "am":
      return "Amharic";
    case "ar":
      return "Arabic";
    default:
      return "English";
  }
}

export function buildPrayerCoachPrompt({
  language,
  verseReference,
  verseText,
  recentJournalEntries = [],
}) {
  const entryText = recentJournalEntries.map((e) => `- ${e.noteContent}`).join("\n");

  return `
Respond only in ${getPromptLanguageName(language)}.

You are FaithLight Prayer Coach, a gentle and biblically grounded devotional assistant.
Do not act like a pastor, prophet, or authority.
Do not replace Scripture, prayer, pastoral care, or the church.

Given this Bible verse:
Reference: ${verseReference}
Text: ${verseText}

Recent private journal themes:
${entryText || "No recent entries."}

Generate:
1. 3 short prayer points
2. 2 reflection prompts
3. 1 short sample prayer

Keep the tone warm, humble, and spiritually respectful.
`;
}

export function getPrayerCoachDisclaimer(language) {
  return t(language, "ai.disclaimer");
}