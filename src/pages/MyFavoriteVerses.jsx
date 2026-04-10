import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, Share2, Copy, BookOpen } from 'lucide-react';
import { getFavorites, removeFavorite } from '@/components/bible/FavoritesManager';

export default function MyFavoriteVerses() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemove = (verseId) => {
    const updated = removeFavorite(verseId);
    setFavorites(updated);
  };

  const handleCopy = (verse) => {
    navigator.clipboard?.writeText(`${verse.reference_text}\n${verse.verse_text}`);
    setCopiedId(verse.verse_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (verse) => {
    navigator.share?.({ text: `${verse.reference_text}\n${verse.verse_text}` }).catch(() => {});
  };

  const handleOpenInReader = (verse) => {
    navigate(`/BibleReaderPage?book_id=${verse.book_id}&chapter=${verse.chapter}&verse_start=${verse.verse_number}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> My Favorite Verses
            </h1>
            <p className="text-xs text-gray-500">{favorites.length} saved verse{favorites.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {favorites.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart className="w-14 h-14 text-gray-200 mb-4" />
            <p className="text-lg font-semibold text-gray-700">No favorites yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Tap the ♡ icon on any verse while reading to save it here.</p>
            <button
              onClick={() => navigate('/BibleReaderPage')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Open Bible Reader
            </button>
          </div>
        )}

        {favorites.map((verse) => (
          <div key={verse.verse_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {verse.reference_text}
              </span>
              <button
                onClick={() => handleRemove(verse.verse_id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
                aria-label="Remove from favorites"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <p className="text-gray-800 leading-7 text-[16px] mb-3 italic">"{verse.verse_text}"</p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenInReader(verse)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors min-h-[36px]"
              >
                <BookOpen size={12} /> Read in Context
              </button>
              <button
                onClick={() => handleCopy(verse)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors min-h-[36px]"
              >
                <Copy size={12} /> {copiedId === verse.verse_id ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleShare(verse)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors min-h-[36px]"
              >
                <Share2 size={12} /> Share
              </button>
            </div>

            {verse.savedAt && (
              <p className="text-xs text-gray-300 mt-2">
                Saved {new Date(verse.savedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}