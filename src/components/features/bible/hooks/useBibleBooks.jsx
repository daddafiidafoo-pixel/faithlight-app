/**
 * useBibleBooks — loads BibleBook records for a given language.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useBibleBooks(language = 'en') {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    base44.asServiceRole.entities.BibleBook.filter({ language })
      .then(data => {
        if (!mounted) return;
        setBooks((data || []).sort((a, b) => a.sort_order - b.sort_order));
      })
      .catch(() => {
        if (mounted) setError('Could not load Bible books. Please try again.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [language]);

  return { books, loading, error };
}