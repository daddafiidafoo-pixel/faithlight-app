import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Send, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PastorVerseControl({ sessionId, verseRefs = [], currentVerseRef }) {
  const [customRef, setCustomRef] = useState('');
  const [pushing, setPushing] = useState(false);
  const [lastPushed, setLastPushed] = useState(currentVerseRef || null);
  const [error, setError] = useState('');

  const pushVerse = async (ref) => {
    if (!ref?.trim() || pushing) return;
    setPushing(true);
    setError('');
    try {
      await base44.functions.invoke('churchmode_pushVerse', {
        sessionId,
        verseRef: ref.trim(),
        verseText: '',
      });
      setLastPushed(ref.trim());
      setCustomRef('');
    } catch (e) {
      setError('Failed to push verse. Try again.');
    }
    setPushing(false);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4 text-amber-300" />
        <p className="text-sm font-semibold text-white">Push Verse to Congregation</p>
      </div>

      {/* Currently live verse badge */}
      {lastPushed && (
        <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <div>
            <p className="text-xs text-amber-200 font-medium">Currently showing</p>
            <p className="text-sm font-bold text-amber-100">{lastPushed}</p>
          </div>
        </div>
      )}

      {/* Quick-push from sermon refs */}
      {verseRefs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">Sermon Verses</p>
          <div className="grid grid-cols-1 gap-1.5">
            {verseRefs.map((ref, i) => (
              <button
                key={i}
                onClick={() => pushVerse(ref)}
                disabled={pushing}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-medium ${
                  lastPushed === ref
                    ? 'bg-amber-400/30 border-amber-400/60 text-amber-100'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                  {ref}
                </div>
                {lastPushed === ref
                  ? <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  : <ChevronRight className="w-4 h-4 text-indigo-400" />
                }
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom verse input */}
      <div className="space-y-2">
        <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">Push a Custom Verse</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., John 3:16"
            value={customRef}
            onChange={e => setCustomRef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pushVerse(customRef)}
            className="bg-white/10 border-white/20 text-white placeholder:text-indigo-400 text-sm h-10"
          />
          <Button
            onClick={() => pushVerse(customRef)}
            disabled={!customRef.trim() || pushing}
            className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold h-10 px-4 flex-shrink-0"
          >
            {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-red-300 bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>}
    </div>
  );
}