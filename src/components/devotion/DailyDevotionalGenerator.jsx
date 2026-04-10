import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wand2, BookOpen, Heart, Lightbulb, Save, Loader2, Check } from 'lucide-react';

export default function DailyDevotionalGenerator({ language = 'en' }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [devotional, setDevotional] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const queryClient = useQueryClient();

  // Labels
  const labels = {
    en: {
      title: 'Daily Devotional Generator',
      desc: 'Analyze verses you read today & generate a personalized prayer',
      noVerses: 'No verses tracked yet today',
      generate: 'Generate Devotional',
      generating: 'Creating your devotional...',
      reflection: 'Reflection',
      prayer: 'Prayer',
      insight: 'Insight for Today',
      save: 'Save to Journal',
      saved: 'Saved to Journal',
      addVerse: 'Add Verse from Today'
    },
    om: {
      title: 'Uumamsa Deggere Guyyaa',
      desc: 'Aayaalee jedhee guyyaa ilaalchi & kadhaa nama isarraa uumi',
      noVerses: 'Aayaale guyyaa kanaa xiyyeeffannee hin jiru',
      generate: 'Deggere Uumi',
      generating: 'Deggere kee tolchi jira...',
      reflection: 'Ilaalcha',
      prayer: 'Kadhaa',
      insight: 'Hubannoo Guyyaa',
      save: 'Gara Kadhaa Kuusi',
      saved: 'Kadhaa keessa kuufame',
      addVerse: 'Aayaa Guyyaa Kanaa Dabaluu'
    },
    am: {
      title: 'ዕለታዊ ጾመ መፃሰፍ ጀነሬተር',
      desc: 'ዛሬ የነበበ ጥቅስ ተንታንተዋ እና ግለሰባዊ ሰላይ ስር',
      noVerses: 'ዛሬ ምንም ጥቅስ አልታተሙም',
      generate: 'ጾመ ስር',
      generating: 'ጾመዋ ልታስ ይችላል...',
      reflection: 'ስሌት',
      prayer: 'ሰላይ',
      insight: 'ዛሬ ለ Insight',
      save: 'ወደ መ날ክ ያስቀምጡ',
      saved: 'ወደ መልከ ተቀምጧል',
      addVerse: 'ዛሬ ጥቅስ ጨምር'
    }
  };

  const L = labels[language] || labels.en;

  // Track verses read today
  useEffect(() => {
    const trackVerse = (event) => {
      const { reference, text } = event.detail;
      setVerses(prev => {
        const exists = prev.find(v => v.reference === reference);
        if (exists) return prev;
        return [...prev, { reference, text }];
      });
    };

    window.addEventListener('verseRead', trackVerse);
    return () => window.removeEventListener('verseRead', trackVerse);
  }, []);

  // Generate devotional
  const generateDevotion = async () => {
    if (verses.length === 0) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateDailyDevotionalAI', {
        verses,
        language
      });
      setDevotional(response.devotional);
      setSavedId(response.journalEntry.id);
      setShowGenerated(true);
    } catch (error) {
      console.error('Error generating devotional:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{L.title}</h2>
        <p className="text-gray-600 text-sm mt-1">{L.desc}</p>
      </div>

      {/* Verses Tracked */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #8B5CF6'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">
            📖 {verses.length} {verses.length === 1 ? 'Verse' : 'Verses'} Read
          </span>
        </div>

        {verses.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {verses.map((verse, idx) => (
              <div key={idx} className="text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900">{verse.reference}</span>
                <p className="mt-1 italic">{verse.text.substring(0, 60)}...</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs">{L.noVerses}</p>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={generateDevotion}
        disabled={verses.length === 0 || loading}
        className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mb-4"
        style={{
          backgroundColor: verses.length > 0 && !loading ? '#8B5CF6' : '#E5E7EB',
          color: verses.length > 0 && !loading ? '#fff' : '#9CA3AF',
          cursor: verses.length > 0 && !loading ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {L.generating}
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            {L.generate}
          </>
        )}
      </button>

      {/* Generated Devotional */}
      {showGenerated && devotional && (
        <div className="space-y-3 animate-in fade-in">
          {/* Reflection */}
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 text-sm">{L.reflection}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{devotional.reflection}</p>
          </div>

          {/* Prayer */}
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-gray-900 text-sm">{L.prayer}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed italic">{devotional.prayer}</p>
          </div>

          {/* Insight */}
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900 text-sm">{L.insight}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{devotional.insight}</p>
          </div>

          {/* Save Button */}
          <button
            disabled={!!savedId}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: savedId ? '#10B981' : '#8B5CF6',
              color: '#fff'
            }}
          >
            {savedId ? (
              <>
                <Check className="w-5 h-5" />
                {L.saved}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {L.save}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}