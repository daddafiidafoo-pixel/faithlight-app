/**
 * PrayerGeneratorPanel — generates a prayer from a Bible verse or personal topic,
 * then saves it to the Prayer Journal with a public/private toggle.
 */
import React, { useState } from 'react';
import { Sparkles, BookOpen, Loader2, Save, Globe, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { generatePrayer, generatePrayerFromTopic } from '@/components/services/api';
import { logEvent, Events } from '@/components/services/analytics/eventLogger';

export default function PrayerGeneratorPanel({ verseReference, verseText, lang = 'en', onSave }) {
  const [mode, setMode] = useState('verse');
  const [topic, setTopic] = useState('');
  const [prayer, setPrayer] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const canGenerate = mode === 'verse'
    ? !!(verseReference && verseText)
    : topic.trim().length > 2;

  const generate = async () => {
    setGenerating(true);
    setPrayer('');
    setSaved(false);
    logEvent(Events.PRAYER_GENERATED, { mode, lang, hasVerse: !!verseReference });
    try {
      const result = mode === 'verse'
        ? await generatePrayer(verseReference, verseText, lang)
        : await generatePrayerFromTopic(topic.trim(), lang);
      setPrayer(result?.content || result || '');
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!prayer || !onSave) return;
    setSaving(true);
    try {
      await onSave({
        prayer_text: prayer,
        source_verse: mode === 'verse' ? verseReference : null,
        topic: mode === 'topic' ? topic.trim() : null,
        is_public: isPublic,
        created_date: new Date().toISOString(),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-900 text-sm">Prayer Partner</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            {[{ key: 'verse', label: 'From Verse' }, { key: 'topic', label: 'From Topic' }].map(({ key, label }) => (
              <button key={key} onClick={() => setMode(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {key === 'verse' ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {mode === 'verse' && verseReference && (
            <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 font-medium">{verseReference}</div>
          )}
          {mode === 'verse' && !verseReference && (
            <p className="text-xs text-gray-400 italic">Select a verse in the Bible reader to generate a prayer from it.</p>
          )}
          {mode === 'topic' && (
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g., anxiety, healing, gratitude, strength…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}

          <button onClick={generate} disabled={generating || !canGenerate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Generating prayer…' : 'Generate Prayer'}
          </button>

          {prayer && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-line border border-gray-100">
                {prayer}
              </div>

              {onSave && (
                <>
                  {/* Public / Private toggle */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {isPublic
                        ? <Globe className="w-3.5 h-3.5 text-green-500" />
                        : <Lock className="w-3.5 h-3.5 text-gray-400" />}
                      <span>{isPublic ? 'Public — visible on Prayer Wall' : 'Private — only you can see this'}</span>
                    </div>
                    <button
                      onClick={() => setIsPublic(p => !p)}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isPublic ? 'bg-green-400' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Save button */}
                  <button onClick={save} disabled={saving || saved}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${saved ? 'bg-green-50 text-green-700 border border-green-200' : 'border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saved ? 'Saved to Journal ✓' : 'Save to Prayer Journal'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}