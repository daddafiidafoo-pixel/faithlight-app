import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Bookmark, BookmarkCheck, Trash2, MessageCircle, PlusCircle } from 'lucide-react';
import ExplanationThreadView from '../components/ai/ExplanationThreadView';
import { toast } from 'sonner';

export default function MyAIExplanations() {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setLoading(false); return; }
      setUser(u);
      const all = await base44.entities.AIExplanationThread.filter(
        { user_id: u.id }, '-created_date', 100
      ).catch(() => []);
      setThreads(all);
      setLoading(false);
    };
    init();
  }, []);

  const handleDelete = async (threadId) => {
    await base44.entities.AIExplanationThread.delete(threadId);
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (selected?.id === threadId) setSelected(null);
    toast.success('Deleted.');
  };

  const handleSavedChange = (threadId, saved) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, saved } : t));
    setSelected(prev => prev?.id === threadId ? { ...prev, saved } : prev);
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Sign in to see your saved AI explanations.</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  const savedThreads = threads.filter(t => t.saved);
  const allThreads = threads;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" /> My AI Explanations
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Your saved and recent Bible study threads.</p>
          </div>
          <Link to={createPageUrl('BibleExplain')}>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="w-4 h-4" /> New Explanation
            </Button>
          </Link>
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No explanations yet</h3>
            <p className="text-gray-400 text-sm mb-5">Start an AI explanation of any passage to begin.</p>
            <Link to={createPageUrl('BibleExplain')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Explain a Passage</Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Thread list */}
            <div className="w-72 flex-shrink-0 space-y-2">
              {allThreads.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`bg-white rounded-xl border p-3 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all ${selected?.id === t.id ? 'border-indigo-400 shadow-sm' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{t.reference}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(t.created_date)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {t.saved && <BookmarkCheck className="w-3.5 h-3.5 text-indigo-500" />}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Thread view */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {selected ? (
                <ExplanationThreadView
                  thread={selected}
                  onSavedChange={(saved) => handleSavedChange(selected.id, saved)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                  <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Select a thread to continue the conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}