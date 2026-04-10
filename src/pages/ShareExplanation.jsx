import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, AlertCircle } from 'lucide-react';

export default function ShareExplanation() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('shareId') || window.location.pathname.split('/').pop();

  const [thread, setThread] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareId) { setNotFound(true); setLoading(false); return; }
    (async () => {
      try {
        const threads = await base44.entities.AIExplanationThread.filter(
          { share_id: shareId, is_shared: true }, null, 1
        ).catch(() => []);
        if (!threads.length) { setNotFound(true); setLoading(false); return; }
        const t = threads[0];
        const n = await base44.entities.AIExplanationVerseNote.filter(
          { thread_id: t.id }, 'verse_key', 300
        ).catch(() => []);
        setThread(t);
        setNotes(n || []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [shareId]);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  if (notFound || !thread) return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Not available</h2>
      <p className="text-sm text-gray-500">This explanation is not shared or no longer exists.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Bible Explanation (Shared)</span>
          </div>
          <CardTitle>{thread.reference}</CardTitle>
          <CardDescription>AI-generated explanation — read only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {thread.passage_text && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap italic">{thread.passage_text}</p>
            </div>
          )}
          {thread.summary && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{thread.summary}</p>
            </div>
          )}
          {thread.context && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Context</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{thread.context}</p>
            </div>
          )}
          {thread.themes?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {thread.themes.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
            </div>
          )}
          {thread.application?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Application</p>
              <ul className="text-sm text-gray-700 list-disc ml-4 space-y-1">
                {thread.application.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-400">This is AI-generated commentary based only on the displayed passage text.</p>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verse-by-verse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.map(n => (
              <div key={n.id} className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-indigo-700 mb-1">{n.verse_key}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.breakdown}</p>
                {Array.isArray(n.qa) && n.qa.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up Q&A</p>
                    {n.qa.slice(0, 3).map((x, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-semibold text-gray-800">Q: {x.q}</p>
                        <p className="text-gray-700 whitespace-pre-wrap">A: {x.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}