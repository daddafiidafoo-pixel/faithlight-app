import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { BookOpen, Save, Loader2, CheckCircle } from 'lucide-react';

export default function DailyJournalEditor({ user }) {
  const { t } = useI18n();
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState(null);
  const [verseRef, setVerseRef] = useState('');

  const todayKey = new Date().toISOString().split('T')[0];

  // Load today's existing journal entry
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Journal.filter({ user_id: user.id, day_key: todayKey }, '-created_date', 1)
      .then(results => {
        if (results && results.length > 0) {
          setExisting(results[0]);
          setReflection(results[0].reflection || '');
        }
      })
      .catch(() => {});
  }, [user?.id, todayKey]);

  // Get today's verse reference from VerseOfDay
  useEffect(() => {
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    const dd = String(new Date().getDate()).padStart(2, '0');
    const dayKey = `${mm}-${dd}`;
    base44.entities.VerseOfDay.filter({ day_key: dayKey }, 'day_key', 1)
      .then(results => {
        if (results && results.length > 0) {
          const r = results[0];
          const bookDisplay = r.book_key.charAt(0).toUpperCase() + r.book_key.slice(1);
          setVerseRef(`${bookDisplay} ${r.chapter}:${r.verse}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!user?.id || !reflection.trim()) return;
    setSaving(true);
    try {
      const data = { user_id: user.id, day_key: todayKey, verse_reference: verseRef, reflection: reflection.trim() };
      if (existing) {
        await base44.entities.Journal.update(existing.id, { reflection: reflection.trim() });
      } else {
        const created = await base44.entities.Journal.create(data);
        setExisting(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-4 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{t('journal.title', 'Daily Journal')}</p>
          {verseRef && <p className="text-xs text-amber-600">{t('journal.todaysVerse', "Today's verse")}: {verseRef}</p>}
        </div>
      </div>

      <textarea
        value={reflection}
        onChange={e => setReflection(e.target.value)}
        placeholder={t('journal.placeholder', 'Write your reflection on today\'s verse...')}
        rows={4}
        className="w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{reflection.length} {t('journal.chars', 'chars')}</span>
        <button
          onClick={handleSave}
          disabled={saving || !reflection.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          style={{ background: saved ? '#22C55E' : '#F59E0B', color: '#fff' }}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? t('journal.saved', 'Saved!') : t('common.save', 'Save')}
        </button>
      </div>
    </div>
  );
}