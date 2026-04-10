import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Format date as YYYY-MM-DD for DailyVerseAssignment lookup
function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fallback verse if nothing is assigned
const FALLBACK_VERSE = {
  reference: 'Psalm 23:1',
  translations: {
    en: 'The LORD is my shepherd; I shall not want.',
    om: 'Waaqayyo tiksee koo ti; homaa na hin dhabsiisu.',
    am: 'እግዚአብሔር እረኛዬ ነው፤ የሚያሳጣኝም የለም።',
    ti: 'እግዚኣብሄር ጓሳይ እዩ፤ ዘጐድለኒ የለን።',
    es: 'El Señor es mi pastor; nada me faltará.',
    fr: 'L\'Éternel est mon berger: je ne manquerai de rien.',
    ar: 'الرب راعي فلا يعوزني شيء.'
  }
};

export function useTodayVerse(selectedLanguage = 'en') {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    async function fetchVerse() {
      setLoading(true);
      setError(null);

      try {
        const dateKey = getTodayKey();
        
        // Fetch today's assignment from DailyVerseAssignment
        const assignments = await base44.entities.DailyVerseAssignment.filter(
          { date: dateKey },
          undefined,
          1
        );

        if (!assignments || assignments.length === 0) {
          // No assignment for today — use fallback
          setVerse({
            reference: FALLBACK_VERSE.reference,
            text: FALLBACK_VERSE.translations[selectedLanguage] || FALLBACK_VERSE.translations.en,
            language: selectedLanguage,
            isFallback: true
          });
          setUsedFallback(true);
          setLoading(false);
          return;
        }

        const assignment = assignments[0];
        const verseText = assignment.translations?.[selectedLanguage] || assignment.translations?.en || FALLBACK_VERSE.translations.en;

        setVerse({
          reference: assignment.reference,
          text: verseText,
          language: selectedLanguage,
          isFallback: !assignment.translations?.[selectedLanguage] // true if we used English or fallback
        });
        setUsedFallback(!assignment.translations?.[selectedLanguage]);
      } catch (err) {
        console.error('Failed to fetch daily verse:', err);
        setError('Could not load today\'s verse');
        // Still show fallback on error
        setVerse({
          reference: FALLBACK_VERSE.reference,
          text: FALLBACK_VERSE.translations[selectedLanguage] || FALLBACK_VERSE.translations.en,
          language: selectedLanguage,
          isFallback: true
        });
        setUsedFallback(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [selectedLanguage]);

  return { verse, loading, error, usedFallback };
}