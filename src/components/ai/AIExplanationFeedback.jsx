import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const FEEDBACK_TAGS = ['Too long', 'Too short', 'Unclear', 'Off-topic', 'Missing context', 'Very helpful'];

export default function AIExplanationFeedback({ me, threadId, modelKey }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!me?.id || submitted) {
    if (submitted) return <p className="text-xs text-green-600 mt-2">Thanks for your feedback!</p>;
    return null;
  }

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function submit() {
    if (!rating) { toast.error('Please select a rating first.'); return; }
    setSaving(true);
    try {
      await base44.entities.AIExplanationFeedback.create({
        user_id: me.id,
        thread_id: threadId,
        model_key: modelKey || 'default',
        rating,
        tags,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
      toast.success('Feedback saved!');
    } catch {
      toast.error('Could not save feedback.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl mt-4 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <span className="font-medium">Rate this explanation</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Stars */}
          <div className="flex gap-1 pt-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110">
                <Star className={`w-6 h-6 ${n <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map(t => (
              <button key={t} type="button" onClick={() => toggleTag(t)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${tags.includes(t) ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t}
              </button>
            ))}
          </div>

          <Textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Optional: any additional comments…" rows={2} className="resize-none text-sm" />

          <Button onClick={submit} disabled={saving} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? 'Saving…' : 'Submit Feedback'}
          </Button>
        </div>
      )}
    </div>
  );
}