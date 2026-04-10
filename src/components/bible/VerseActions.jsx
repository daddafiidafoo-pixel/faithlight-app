import React, { useState } from 'react';
import { Copy, Check, Share2, Highlighter, Bookmark, Sparkles, Image } from 'lucide-react';
import { toast } from 'sonner';

const HIGHLIGHT_COLORS = [
  { key: 'yellow', label: 'Yellow', bg: '#FCD34D', light: '#FFFAED' },
  { key: 'green',  label: 'Green',  bg: '#86EFAC', light: '#F0FDF4' },
  { key: 'pink',   label: 'Pink',   bg: '#F472B6', light: '#FDF2F8' },
  { key: 'blue',   label: 'Blue',   bg: '#93C5FD', light: '#EFF6FF' },
];

/**
 * VerseActions — compact toolbar for each verse
 * Features: copy, highlight, share (native or fallback), bookmark, AI explain, share as image
 */
export default function VerseActions({
  verse,
  book,
  chapter,
  translation,
  highlighted,
  isBookmarked,
  onHighlight,
  onClearHighlight,
  onBookmark,
  onAIExplain,
  onShareImage,
}) {
  const [copied, setCopied] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const verseRef = `${book} ${chapter}:${verse.verse}`;
  const verseText = `"${verse.text}" — ${verseRef} (${translation})`;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(verseText).then(() => {
      setCopied(true);
      toast.success('Verse copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: `${verseRef} | FaithLight`,
      text: verseText,
      url: `https://faithlight.app/BibleReader?book=${encodeURIComponent(book)}&chapter=${chapter}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(`${verseText}\n${shareData.url}`);
          toast.success('Copied to clipboard for sharing!');
        }
      }
    } else {
      // Fallback: copy with link
      navigator.clipboard.writeText(`${verseText}\n${shareData.url}`);
      toast.success('Verse + link copied! Paste anywhere to share.');
    }
  };

  const handleHighlightClick = (e) => {
    e.stopPropagation();
    setShowColors(v => !v);
  };

  const handleSelectColor = (e, colorKey) => {
    e.stopPropagation();
    if (highlighted === colorKey) {
      onClearHighlight?.();
    } else {
      onHighlight?.(colorKey);
    }
    setShowColors(false);
  };

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-0.5">
        {/* Copy */}
        <button
          onClick={handleCopy}
          title="Copy verse"
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Highlight */}
        <button
          onClick={handleHighlightClick}
          title="Highlight verse"
          className={`p-1 rounded hover:bg-gray-100 transition-colors ${highlighted ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          title="Share verse"
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Bookmark */}
        {onBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(); }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
            className={`p-1 rounded hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* AI Explain */}
        {onAIExplain && (
          <button
            onClick={(e) => { e.stopPropagation(); onAIExplain(); }}
            title="AI explanation"
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Share as image */}
        {onShareImage && (
          <button
            onClick={(e) => { e.stopPropagation(); onShareImage(); }}
            title="Share as image"
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Color picker dropdown */}
      {showColors && (
        <div
          className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1.5"
          onClick={e => e.stopPropagation()}
        >
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.key}
              onClick={(e) => handleSelectColor(e, c.key)}
              title={c.label}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                highlighted === c.key ? 'border-gray-700 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.bg }}
            />
          ))}
          {highlighted && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearHighlight?.(); setShowColors(false); }}
              title="Clear highlight"
              className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white text-gray-400 text-xs flex items-center justify-center hover:border-red-300 hover:text-red-500"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}