import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Share2, Copy, Volume2 } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';

export default function VerseOfTheDayCard() {
  const { language } = useLanguage();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadVerseOfDay();
  }, [language]);

  const loadVerseOfDay = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const verses = await base44.entities.VerseOfDay.filter({
        date: today,
        language: language || 'en',
      });

      if (verses.length > 0) {
        setVerse(verses[0]);
      }
    } catch (error) {
      console.error('Error loading verse of day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVerse = () => {
    const text = `${verse.reference}\n\n${verse.text}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `📖 ${verse.reference}\n\n"${verse.text}"\n\n✨ Shared from FaithLight`;

    if (navigator.share) {
      navigator.share({
        title: 'Verse of the Day',
        text: shareText,
      });
    } else {
      handleCopyVerse();
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-8 shadow-lg h-64 animate-pulse" />
    );
  }

  if (!verse) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 p-8 text-center">
        <p className="text-slate-600">Verse of the day not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-8 shadow-lg text-white">
      <div className="space-y-4">
        {/* Title */}
        <p className="text-sm font-semibold text-violet-100">VERSE OF THE DAY</p>

        {/* Verse Text */}
        <p className="text-xl leading-relaxed italic font-light">
          "{verse.text}"
        </p>

        {/* Reference */}
        <p className="text-sm font-semibold text-violet-100 pt-2">
          — {verse.reference}
        </p>

        {/* Theme */}
        {verse.theme && (
          <p className="text-xs text-violet-100 opacity-75">
            Theme: {verse.theme}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleCopyVerse}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition text-sm font-medium"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}