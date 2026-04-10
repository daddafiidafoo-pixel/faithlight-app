import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, Send, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PullToRefresh from '@/components/PullToRefresh';

const CATEGORIES = ['health', 'family', 'faith', 'work', 'relationships', 'finances', 'gratitude', 'other'];

const CATEGORY_COLORS = {
  health: 'bg-red-100 text-red-700',
  family: 'bg-blue-100 text-blue-700',
  faith: 'bg-yellow-100 text-yellow-700',
  work: 'bg-purple-100 text-purple-700',
  relationships: 'bg-pink-100 text-pink-700',
  finances: 'bg-green-100 text-green-700',
  gratitude: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function PrayerWall() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [prayedSet, setPrayedSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fl_prayed_ids') || '[]')); }
    catch { return new Set(); }
  });
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'other', anonymous: false });

  useEffect(() => {
    fetchRequests();
    const unsub = base44.entities.PrayerCircleRequest.subscribe(() => fetchRequests());
    return unsub;
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await base44.entities.PrayerCircleRequest.list('-created_date', 40);
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePray = async (req) => {
    if (!isAuthenticated) return;
    if (prayedSet.has(req.id)) return; // already prayed
    const newSet = new Set(prayedSet);
    newSet.add(req.id);
    setPrayedSet(newSet);
    localStorage.setItem('fl_prayed_ids', JSON.stringify([...newSet]));
    // optimistic update
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, prayedCount: (r.prayedCount || 0) + 1 } : r));
    await base44.entities.PrayerCircleRequest.update(req.id, {
      prayedCount: (req.prayedCount || 0) + 1,
      prayedByEmails: [...(req.prayedByEmails || []), user.email],
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.PrayerCircleRequest.create({
        circleId: 'public_wall',
        authorEmail: user.email,
        authorName: form.anonymous ? 'Anonymous' : (user.full_name || user.email),
        requestText: form.body,
        prayedCount: 0,
        prayedByEmails: [],
        isAnswered: false,
      });
      setForm({ title: '', body: '', category: 'other', anonymous: false });
      setShowForm(false);
      fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-28">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🙏 Prayer Wall</h1>
            <p className="text-sm text-gray-500 mt-0.5">Lift each other up in prayer</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow hover:bg-violet-700 transition-colors"
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? 'Cancel' : 'Post Request'}
            </button>
          )}
        </div>

        {/* Post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-white border border-violet-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-3">Share Your Prayer Request</h2>
                <textarea
                  placeholder="What would you like the community to pray for?"
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none mb-3"
                />
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.anonymous}
                      onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
                      className="accent-violet-600"
                    />
                    Post anonymously
                  </label>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.body.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {submitting ? 'Posting...' : 'Post to Prayer Wall'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest notice */}
        {!isAuthenticated && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5 text-sm text-violet-700">
            Sign in to post your own prayer requests and show support.
          </div>
        )}

        {/* Prayer list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🙏</p>
            <p className="text-gray-500">No prayer requests yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req, i) => {
              const hasPrayed = prayedSet.has(req.id);
              const isExpanded = expandedId === req.id;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${req.isAnswered ? 'border-green-200' : 'border-gray-100'}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {req.authorName || 'Anonymous'}
                          </span>
                          {req.isAnswered && (
                            <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                              <Check size={10} /> Answered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {req.created_date ? formatDistanceToNow(new Date(req.created_date), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>

                    {/* Request text */}
                    <p className={`text-sm text-gray-700 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {req.requestText}
                    </p>
                    {req.requestText?.length > 160 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className="text-xs text-violet-600 mt-1 flex items-center gap-0.5 min-h-[44px] min-w-[44px] px-1"
                      >
                        {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Read more</>}
                      </button>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handlePray(req)}
                        disabled={hasPrayed || !isAuthenticated}
                        className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all min-h-[44px] ${
                          hasPrayed
                            ? 'bg-violet-100 text-violet-700 cursor-default'
                            : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600 active:scale-95'
                        }`}
                      >
                        <Heart size={14} className={hasPrayed ? 'fill-violet-600 text-violet-600' : ''} />
                        {hasPrayed ? 'Praying' : 'I\'m Praying'}
                        <span className="ml-0.5 text-xs opacity-70">· {req.prayedCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}