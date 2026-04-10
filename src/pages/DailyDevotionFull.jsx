import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';
import { Loader2, Bookmark, Share2, Volume2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DailyDevotionFull() {
  const [devotion, setDevotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const uiLanguage = useLanguageStore(s => s.uiLanguage);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        setLoading(true);
        const res = await base44.functions.invoke('generateDailyAIDevotional', {
          language: uiLanguage || 'en',
          date: new Date().toISOString().split('T')[0],
        });

        if (!res.data?.success) throw new Error(res.data?.error || 'Failed to load devotion');
        setDevotion(res.data.devotion);
      } catch (err) {
        console.error('Error loading devotion:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevotion();
  }, [uiLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !devotion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Link to="/Home" className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-6">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="text-center text-gray-600">
          <p>Unable to load devotion. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/Home" className="text-indigo-600 hover:text-indigo-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Today's Devotion</h1>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Verse header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verse of the Day</p>
            <p className="text-sm font-semibold text-indigo-700 mb-3">{devotion.verseReference}</p>
            <p className="text-lg font-semibold text-gray-900 italic leading-relaxed">
              "{devotion.verseText}"
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📖 Explanation</p>
            <p className="text-sm leading-relaxed text-gray-800">
              {devotion.explanation}
            </p>
          </div>

          {/* Reflection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">✨ Reflection</p>
            <p className="text-sm leading-relaxed text-gray-800">
              {devotion.reflection}
            </p>
          </div>

          {/* Prayer */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-purple-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🙏 Prayer</p>
            <p className="text-sm leading-relaxed text-gray-800">
              {devotion.prayer}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setSaved(!saved)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                saved
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Bookmark size={18} className={saved ? 'fill-current' : ''} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-white text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors">
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-white text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors">
              <Volume2 size={18} />
              <span>Listen</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}