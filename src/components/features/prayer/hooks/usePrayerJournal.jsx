/**
 * usePrayerJournal — manages the user's prayer journal entries.
 * All persistence via prayerService.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchPrayerJournalEntries, savePrayerJournalEntry } from '@/components/services/api';

export function usePrayerJournal(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await fetchPrayerJournalEntries(userId);
    setEntries(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const addEntry = useCallback(async (data) => {
    const entry = await savePrayerJournalEntry(userId, data);
    setEntries(prev => [entry, ...prev]);
    return entry;
  }, [userId]);

  return { entries, loading, addEntry, reload: load };
}