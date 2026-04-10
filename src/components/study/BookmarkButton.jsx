import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BookmarkButton({
  contentType,
  title,
  content,
  summary = '',
  onBookmarked,
}) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    try {
      setIsBookmarking(true);
      
      const user = await base44.auth.me();
      if (!user) {
        alert('Please log in to bookmark content');
        return;
      }

      const bookmark = await base44.entities.Bookmark.create({
        user_email: user.email,
        content_type: contentType,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        summary,
      });

      setIsBookmarked(true);
      if (onBookmarked) onBookmarked(bookmark);
      
      setTimeout(() => setIsBookmarked(false), 1500);
    } catch (error) {
      console.error('Failed to bookmark:', error);
      alert('Failed to save bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={isBookmarking}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
        isBookmarked
          ? 'bg-red-100 text-red-700'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  );
}