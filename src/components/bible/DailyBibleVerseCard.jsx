import React, { useState, useEffect } from 'react';
import { Share2, Heart, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DailyBibleVerseCard() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getDailyVerse', {});
      if (response.data?.verse) {
        setVerse(response.data.verse);
      }
    } catch (error) {
      console.error('Error fetching daily verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!verse) return;

    const shareText = `${verse.reference}\n\n"${verse.text}"\n\n#FaithLight #Bible`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: verse.reference,
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md text-center">
        <p className="text-gray-500">Unable to load verse. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-8 shadow-md border border-purple-100">
      {/* Reference */}
      <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-4">
        Verse of the Day
      </div>

      {/* Verse Text */}
      <p className="text-lg italic leading-relaxed text-gray-800 mb-6">
        "{verse.text}"
      </p>

      {/* Reference */}
      <p className="text-right text-sm font-semibold text-purple-700 mb-6">
        — {verse.reference}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>

        <button
          onClick={() => copyToClipboard(`${verse.reference}: "${verse.text}"`)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium ml-auto">
          <Heart className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}