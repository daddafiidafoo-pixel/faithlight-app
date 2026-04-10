import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '../components/I18nProvider';
import { Search, Download, Plus, Loader, Calendar } from 'lucide-react';
import JournalForm from '../components/journal/JournalForm';
import JournalEntryCard from '../components/journal/JournalEntryCard';

export default function PrivateJournal() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');

  const MOODS = ['grateful', 'hopeful', 'challenged', 'peaceful', 'questioning', 'joyful'];

  useEffect(() => {
    const init = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          base44.auth.redirectToLogin();
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        loadEntries(me.id);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    init();
  }, []);

  const loadEntries = async (userId) => {
    try {
      const data = await base44.entities.JournalEntry.filter(
        { user_id: userId, is_private: true },
        '-entry_date',
        500
      );
      setEntries(data || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entryData) => {
    try {
      const newEntry = await base44.entities.JournalEntry.create({
        user_id: user.id,
        ...entryData,
        is_private: true,
      });
      setEntries([newEntry, ...entries]);
      setShowForm(false);
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to save journal entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      // Soft delete by updating is_private to false
      await base44.entities.JournalEntry.update(entryId, { is_private: false });
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete entry');
    }
  };

  const handleExportSummary = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => e.entry_date === today);

    const summary = `
═══════════════════════════════════════
DAILY SPIRITUAL REFLECTION SUMMARY
${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
═══════════════════════════════════════

${todayEntries.map(e => `
📖 ${e.related_verse || 'Reflection'}
Mood: ${e.mood}
─────────────────────────────────────
${e.content}
${e.tags.length > 0 ? `Tags: ${e.tags.join(', ')}` : ''}
`).join('\n')}

═══════════════════════════════════════
Created with FaithLight | ${new Date().toLocaleTimeString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summary));
    element.setAttribute('download', `reflection-${today}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (e.related_verse && e.related_verse.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMood = filterMood === 'all' || e.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[var(--faith-light-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2">
            {t('journal.title', 'Private Journal')}
          </h1>
          <p className="text-gray-600">{t('journal.subtitle', 'Reflect on your spiritual journey')}</p>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <Button onClick={handleExportSummary} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t('journal.export', 'Export')}
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--faith-light-primary)] gap-2">
            <Plus className="w-4 h-4" />
            {t('journal.new', 'New Entry')}
          </Button>
        </div>
      </div>

      {showForm && (
        <JournalForm
          onSubmit={handleAddEntry}
          onCancel={() => setShowForm(false)}
          lang={lang}
        />
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('journal.search', 'Search reflections...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterMood === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterMood('all')}
          >
            All Moods
          </Button>
          {MOODS.map(mood => (
            <Button
              key={mood}
              variant={filterMood === mood ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMood(mood)}
              className="capitalize"
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-gray-500">
            {entries.length === 0
              ? t('journal.empty', 'No journal entries yet. Start reflecting!')
              : t('journal.noResults', 'No entries match your search.')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}