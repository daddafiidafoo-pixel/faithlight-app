import React from 'react';
import { Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickShareButton({ verse, reference, verseId, bookId, chapter, verseNum }) {
  const navigate = useNavigate();

  const handleShare = () => {
    const params = new URLSearchParams();
    
    if (verseId) {
      params.set('verseId', verseId);
    } else {
      params.set('bookId', bookId);
      params.set('chapter', chapter);
      params.set('verse', verseNum);
    }

    navigate(`/VerseShareBuilder?${params.toString()}`);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      title="Create shareable image"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}