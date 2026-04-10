import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, MessageCircle } from 'lucide-react';

export default function PrayerComments({ prayerId, user, initialCount = 0, onCountChange }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(initialCount);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PrayerRequestComment.filter(
      { prayer_request_id: prayerId }, 'created_date'
    ).catch(() => []);
    setComments(data);
    setCount(data.length);
    onCountChange?.(data.length);
    setLoading(false);
  };

  const toggle = () => {
    if (!open) load();
    setOpen(o => !o);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await base44.entities.PrayerRequestComment.create({
      prayer_request_id: prayerId,
      user_id: user?.id || null,
      author_name: user ? (user.full_name || user.email?.split('@')[0]) : 'Anonymous',
      content: text.trim(),
    }).catch(() => {});
    setText('');
    await load();
    setSubmitting(false);
  };

  return (
    <div className="mt-1">
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all ${
          open ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        {count} {open ? 'Hide' : 'Comment'}
      </button>

      {open && (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /></div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-2">Be the first to leave encouragement 💬</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="bg-indigo-50/60 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-indigo-700">{c.author_name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Leave encouragement..."
              maxLength={300}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          {!user && <p className="text-xs text-gray-400 text-center">Posting as Anonymous</p>}
        </div>
      )}
    </div>
  );
}