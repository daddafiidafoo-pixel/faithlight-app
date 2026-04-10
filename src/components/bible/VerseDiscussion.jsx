import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { makeRefKey } from '../bibleVerseCache';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, X, ThumbsUp, User } from 'lucide-react';
import { toast } from 'sonner';

export default function VerseDiscussion({ user, book, chapter, verse, verseText, translation, onClose }) {
  const qc = useQueryClient();
  const refKey = makeRefKey(book, chapter, verse);
  const reference = `${book} ${chapter}:${verse}`;

  const [newInsight, setNewInsight] = useState('');
  const [aiReflection, setAiReflection] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // ── Fetch community insights for this verse ────────────────────────────────
  // Filter by ref_key only — single field, always safe.
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['verseInsights', refKey],
    queryFn: () => base44.entities.VerseCommentary.filter({ verse_ref: refKey }, '-created_date', 30),
    staleTime: 60_000,
  });

  // ── Post a new insight ─────────────────────────────────────────────────────
  const postMutation = useMutation({
    mutationFn: async (text) => {
      return base44.entities.VerseCommentary.create({
        verse_ref: refKey,
        reference,
        book,
        chapter,
        verse_number: verse,
        translation_id: translation,
        author_id: user?.id,
        author_name: user?.full_name || 'Anonymous',
        content: text,
        likes: 0,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verseInsights', refKey] });
      setNewInsight('');
      toast.success('Insight shared!');
    },
  });

  // ── Like an insight ────────────────────────────────────────────────────────
  const likeMutation = useMutation({
    mutationFn: async ({ id, likes }) => base44.entities.VerseCommentary.update(id, { likes: (likes || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verseInsights', refKey] }),
  });

  // ── AI reflection (lazy — only on button click) ────────────────────────────
  const loadAIReflection = async () => {
    if (aiReflection) return;
    setLoadingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Give a short devotional reflection (3-4 sentences) on this Bible verse:
"${verseText}" — ${reference}

Focus on practical Christian living. Be warm, personal, and encouraging.
Return JSON: { reflection: string, key_truth: string }`,
        response_json_schema: {
          type: 'object',
          properties: {
            reflection: { type: 'string' },
            key_truth: { type: 'string' },
          }
        }
      });
      setAiReflection(result);
    } catch {
      toast.error('Could not load AI reflection');
    }
    setLoadingAI(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-purple-700">Community Insights · {reference}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* AI Reflection */}
      {aiReflection ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-gray-700 space-y-1">
          <div className="flex items-center gap-1 text-indigo-600 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> AI Reflection
          </div>
          <p className="leading-relaxed">{aiReflection.reflection}</p>
          {aiReflection.key_truth && (
            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs mt-1">
              Key truth: {aiReflection.key_truth}
            </Badge>
          )}
        </div>
      ) : (
        <Button
          variant="outline" size="sm"
          className="h-7 gap-1 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          onClick={loadAIReflection}
          disabled={loadingAI}
        >
          {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Get AI Reflection
        </Button>
      )}

      {/* Community insights list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading insights…
        </div>
      ) : insights.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No insights yet. Be the first to share!</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {insights.map((ins) => (
            <div key={ins.id} className="bg-white border border-gray-100 rounded-lg p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">{ins.author_name}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{ins.content}</p>
                </div>
                <button
                  onClick={() => likeMutation.mutate({ id: ins.id, likes: ins.likes })}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-indigo-600 flex-shrink-0"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{ins.likes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post new insight */}
      {user ? (
        <div className="flex gap-2">
          <Textarea
            value={newInsight}
            onChange={e => setNewInsight(e.target.value)}
            placeholder="Share an insight or reflection…"
            className="text-xs min-h-[60px] resize-none flex-1"
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && newInsight.trim()) postMutation.mutate(newInsight.trim()); }}
          />
          <Button
            size="sm"
            className="self-end gap-1"
            disabled={!newInsight.trim() || postMutation.isPending}
            onClick={() => postMutation.mutate(newInsight.trim())}
          >
            {postMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">Sign in to share insights.</p>
      )}
    </div>
  );
}