import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/i18n/LanguageProvider';

export default function DailyDevotionalFeature() {
  const { language } = useLanguage();
  const [devotional, setDevotional] = useState(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookmarking, setBookmarking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch {
        console.log('User not authenticated');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    loadDailyDevotional();
  }, [language]);

  const loadDailyDevotional = async () => {
    setLoading(true);
    try {
      const verse = await base44.functions.invoke('getVerseOfDay', {
        lang: language || 'en',
      });

      if (verse && !verse.unavailable) {
        setDevotional(verse);
        generateReflection(verse);
      }
    } catch (err) {
      console.error('Error loading verse:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReflection = async (verse) => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a brief, inspiring spiritual reflection (2-3 sentences) on this Bible verse for a daily devotional:

"${verse.text}" - ${verse.reference}

The reflection should help the reader apply this verse to their daily life with faith and hope.`,
        model: 'gemini_3_flash',
      });

      setReflection(response);
    } catch (err) {
      console.error('Error generating reflection:', err);
      setReflection('Take time today to meditate on this verse and how it applies to your life.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser || !devotional) return;
    setBookmarking(true);

    try {
      await base44.entities.PrivatePrayerJournal.create({
        userEmail: currentUser.email,
        title: `Devotional: ${devotional.reference}`,
        content: `${devotional.text}\n\n💭 Reflection:\n${reflection}`,
        entryDate: new Date().toISOString(),
        mood: 'peaceful',
        category: 'personal',
        isFavorite: true,
        linkedVerseReference: devotional.reference,
      });

      setBookmarked(true);
      setTimeout(() => setBookmarked(false), 2000);
    } catch (err) {
      console.error('Error bookmarking devotional:', err);
    } finally {
      setBookmarking(false);
    }
  };

  const handleShare = async () => {
    if (!devotional) return;
    const text = `Today's Devotional:\n\n"${devotional.text}"\n— ${devotional.reference}\n\n💭 ${reflection}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Devotional - ${devotional.reference}`,
          text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading today's devotional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Daily Devotional</h1>
          <p className="text-slate-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {devotional && (
          <div className="space-y-6">
            {/* Verse Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-600">
              <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                Scripture
              </h2>
              <p className="text-2xl leading-relaxed text-slate-900 font-serif mb-6 italic">
                "{devotional.text}"
              </p>
              <p className="text-lg font-semibold text-slate-700">{devotional.reference}</p>
            </div>

            {/* Reflection Card */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                {generating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
                <h3 className="text-lg font-semibold">Today's Reflection</h3>
              </div>

              {generating ? (
                <p className="text-white/80 leading-relaxed">
                  Generating your reflection...
                </p>
              ) : (
                <p className="text-lg leading-relaxed text-white/95">{reflection}</p>
              )}

              <p className="text-sm text-white/60 mt-6 italic">
                Reflect on this verse throughout your day and how it speaks to your life.
              </p>
            </div>

            {/* Prayer Prompt Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3">💬 Prayer Prompt</h3>
              <p className="text-slate-700 leading-relaxed">
                "Holy God, help me to internalize this verse today. Open my heart to understand your message and guide me in living it out. Amen."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleBookmark}
                disabled={bookmarking}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  bookmarked
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {bookmarking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
                {bookmarked ? 'Saved!' : 'Save to Profile'}
              </button>

              <button
                onClick={handleShare}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-900 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              <button
                onClick={() => loadDailyDevotional()}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}