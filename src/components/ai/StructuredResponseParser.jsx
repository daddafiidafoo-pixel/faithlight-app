import React from 'react';

/**
 * Parse AI response into 4-part structure:
 * - Explanation
 * - Bible Verse
 * - Reflection
 * - Prayer
 */
export function parseAIResponse(content) {
  const sections = {
    explanation: '',
    bibleVerse: { reference: '', text: '' },
    reflection: '',
    prayer: '',
  };

  // Try to parse each section by markers
  const explanationMatch = content.match(/Explanation\s*\n([\s\S]*?)(?=Bible Verse|$)/i);
  if (explanationMatch) sections.explanation = explanationMatch[1].trim();

  const verseMatch = content.match(/Bible Verse\s*\n(.*?)\n([\s\S]*?)(?=Reflection|$)/i);
  if (verseMatch) {
    sections.bibleVerse.reference = verseMatch[1].trim();
    sections.bibleVerse.text = verseMatch[2].trim();
  }

  const reflectionMatch = content.match(/Reflection\s*\n([\s\S]*?)(?=Prayer|$)/i);
  if (reflectionMatch) sections.reflection = reflectionMatch[1].trim();

  const prayerMatch = content.match(/Prayer\s*\n([\s\S]*?)$/i);
  if (prayerMatch) sections.prayer = prayerMatch[1].trim();

  return sections;
}

/**
 * Render the 4-part structured response
 */
export default function StructuredResponse({ content }) {
  const sections = parseAIResponse(content);

  // Fallback to plain text if parsing failed
  if (!sections.explanation && !sections.bibleVerse.reference && !sections.reflection && !sections.prayer) {
    return <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-3">
      {/* Explanation */}
      {sections.explanation && (
        <div className="rounded-xl border p-3 bg-indigo-50 border-indigo-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            📖 Explanation
          </p>
          <p className="text-sm leading-relaxed text-gray-800">{sections.explanation}</p>
        </div>
      )}

      {/* Bible Verse */}
      {sections.bibleVerse.reference && (
        <div className="rounded-xl border p-3 bg-amber-50 border-amber-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            📖 Bible Verse
          </p>
          <p className="text-xs font-semibold text-amber-900 mb-1.5">{sections.bibleVerse.reference}</p>
          <p className="text-sm font-semibold text-gray-800 italic leading-relaxed">
            "{sections.bibleVerse.text}"
          </p>
        </div>
      )}

      {/* Reflection */}
      {sections.reflection && (
        <div className="rounded-xl border p-3 bg-rose-50 border-rose-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            ✨ Reflection
          </p>
          <p className="text-sm leading-relaxed text-gray-800">{sections.reflection}</p>
        </div>
      )}

      {/* Prayer */}
      {sections.prayer && (
        <div className="rounded-xl border p-3 bg-purple-50 border-purple-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            🙏 Prayer
          </p>
          <p className="text-sm leading-relaxed text-gray-800">{sections.prayer}</p>
        </div>
      )}
    </div>
  );
}