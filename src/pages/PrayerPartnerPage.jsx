/**
 * PrayerPartnerPage — Prayer Partner feature module.
 * Generate prayers from Bible passages or personal topics.
 * Save to Prayer Journal with public/private toggle.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/components/store/appStore';
import { useI18n } from '@/components/I18nProvider';
import { usePrayerJournal } from '@/components/features/prayer/hooks/usePrayerJournal';
import PrayerGeneratorPanel from '@/components/features/prayer/PrayerGeneratorPanel';
import PrayerJournalList from '@/components/features/prayer/PrayerJournalList';
import { base44 } from '@/api/base44Client';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export default function PrayerPartnerPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('generate');

  // Pre-fill from URL params (e.g., linked from BibleReader)
  const params = new URLSearchParams(window.location.search);
  const verseReference = params.get('verseRef') || '';
  const verseText = params.get('verseText') || '';

  const { entries, loading, addEntry, reload } = usePrayerJournal(currentUser?.id);

  const handleSave = async (data) => {
    logEvent(Events.PRAYER_SAVED, { lang, isPrivate: data.is_private ?? true });
    await addEntry(data);
    setActiveTab('journal');
  };

  const handleDelete = async (id) => {
    await base44.entities.PrayerJournal.delete(id);
    reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700 p-1">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <BookHeart className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Prayer Partner</h1>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm">
          {[
            { key: 'generate', label: 'Generate Prayer' },
            { key: 'journal', label: `My Journal${entries.length ? ` (${entries.length})` : ''}` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <PrayerGeneratorPanel
                verseReference={verseReference}
                verseText={verseText}
                lang={lang}
                onSave={currentUser ? handleSave : null}
              />
              {!currentUser && (
                <p className="text-center text-sm text-gray-500 py-2">
                  <button onClick={() => base44.auth.redirectToLogin()}
                    className="text-indigo-600 font-medium hover:underline">Sign in</button>
                  {' '}to save prayers to your personal journal.
                </p>
              )}
            </div>
          )}

          {activeTab === 'journal' && (
            <PrayerJournalList
              entries={entries}
              loading={loading}
              onDelete={currentUser ? handleDelete : null}
            />
          )}
        </motion.div>

      </div>
    </div>
  );
}