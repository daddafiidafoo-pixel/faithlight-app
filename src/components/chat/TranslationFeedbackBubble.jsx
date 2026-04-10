import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TranslationFeedbackBubble({ verseReference, originalText, translatedText, language, userId }) {
  const [open, setOpen] = useState(false);
  const [vote, setVote] = useState(null); // 'up' | 'down'
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitting(true);
    try {
      await base44.entities.AITranslationReviewQueue.create({
        verse_reference: verseReference,
        original_text: originalText,
        translated_text: translatedText,
        language_code: language,
        vote,
        comment: comment.trim(),
        submitted_by: userId || 'anonymous',
        status: 'pending',
      });
      setSubmitted(true);
    } catch (e) {
      console.error('Feedback error:', e);
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-1 border-t border-gray-100 pt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
      >
        <MessageSquare className="w-3 h-3" />
        Translation feedback
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {submitted ? (
            <p className="text-xs text-green-600 font-medium">✓ Thank you for your feedback!</p>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setVote('up')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${vote === 'up' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}
                >
                  <ThumbsUp className="w-3 h-3" /> Accurate
                </button>
                <button
                  onClick={() => setVote('down')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${vote === 'down' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-500 hover:bg-red-50'}`}
                >
                  <ThumbsDown className="w-3 h-3" /> Needs review
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Optional note..."
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!vote || submitting}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}