import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle2 } from 'lucide-react';

export default function PrayerPostModal({ open, onClose, onSubmit, isLoading }) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, isAnonymous);
    setContent('');
    setIsAnonymous(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Share a Prayer Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Textarea
            placeholder="Share your prayer request…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32"
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700">Post anonymously</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Post
          </Button>
        </div>
      </div>
    </div>
  );
}