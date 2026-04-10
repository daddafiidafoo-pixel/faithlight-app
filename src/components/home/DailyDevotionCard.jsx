import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';
import { ChevronRight, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bibleService } from '@/services/bibleService';
import TextToSpeechButton from '@/components/audio/TextToSpeechButton';
import { toast } from 'sonner';

export default function DailyDevotionCard() {
  const [devotion, setDevotion] = useState(null);
  const [verseText, setVerseText] = useState(null);
  const [loading, setLoading] = useState(true);
  const uiLanguage = useLanguageStore(s => s.uiLanguage);

  // Reset devotion when language changes so it refetches
  useEffect(() => {
    setDevotion(null);
    setVerseText(null);
    setLoading(true);
  }, [uiLanguage]);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        const res = await base44.functions.invoke('generateDailyAIDevotional', {
          language: uiLanguage || 'en',
          date: new Date().toISOString().split('T')[0],
        });
        if (res.data?.success) {
          setDevotion(res.data.devotion);
          
          // Fetch verse text through centralized service
          if (res.data.devotion?.verseReference) {
            const verse = await bibleService.getVerse(res.data.devotion.verseReference);
            if (verse) setVerseText(verse.text);
          }
        }
      } catch (err) {
        console.error('Error loading daily devotion:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevotion();
  }, [uiLanguage]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-md animate-pulse border border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full mb-3" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </motion.div>
    );
  }

  if (!devotion) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `${devotion.verseReference}\n\n"${verseText || ''}"\n\n${devotion.explanation?.slice(0, 200)}...\n\nRead more on FaithLight`;
    const url = `${window.location.origin}/DailyDevotionFull`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Daily Devotion – ${devotion.verseReference}`, text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Devotion copied to clipboard!');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
        {/* Header */}
        <Link to="/DailyDevotionFull" className="block">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Daily Devotion</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{devotion.verseReference}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-6">
          {verseText && (
            <p className="text-base italic leading-relaxed text-gray-800 mb-4">"{verseText}"</p>
          )}
          <p className="text-sm leading-relaxed text-gray-700 line-clamp-3">
            {devotion.explanation}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Link
              to={`/AIHub?verse=${devotion.verseReference}`}
              aria-label="Explain this verse with AI"
              className="inline-flex items-center bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 rounded-lg font-semibold transition-colors min-h-[44px]"
            >
              ✨ Explain Verse
            </Link>
            <button
              onClick={handleShare}
              aria-label="Share this devotion"
              className="ml-auto inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 rounded-lg font-semibold transition-colors min-h-[44px]"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}