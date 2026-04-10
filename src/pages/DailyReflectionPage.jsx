import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getHighlights } from '@/lib/highlights';
import DailyReflectionPanel from '@/components/ai/DailyReflectionPanel';
import { Sparkles, BookOpen, Heart, ChevronLeft, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function DailyReflectionPage() {
  const [user, setUser] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        const [entries, h] = await Promise.all([
          base44.entities.PrivatePrayerJournal.filter({ userEmail: u.email }, '-created_date', 20),
          Promise.resolve(getHighlights(u.email)),
        ]);
        setJournalEntries(entries || []);
        setHighlights(h || []);
        setLoading(false);
      })
      .catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const activeCount = journalEntries.filter(e => !e.isAnswered).length;
  const answeredCount = journalEntries.filter(e => e.isAnswered).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 px-4 pt-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link to="/PrayerJournalPage" className="min-h-[44px] flex items-center gap-2 px-4 py-3 rounded-lg text-violet-300 text-sm mb-5 hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Back to Journal
          </Link>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Daily Reflection</h1>
              <p className="text-violet-200 text-sm">AI-powered spiritual insights from your journey</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-violet-300 text-xs mt-4">
            <Calendar size={13} />
            <span>{today}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: <Heart className="w-4 h-4" />, value: activeCount, label: 'Active Prayers', color: 'bg-rose-500/30' },
              { icon: <BookOpen className="w-4 h-4" />, value: highlights.length, label: 'Highlights', color: 'bg-amber-500/30' },
              { icon: <Sparkles className="w-4 h-4" />, value: answeredCount, label: 'Answered', color: 'bg-green-500/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-3 py-2.5 text-center`}>
                <div className="flex justify-center text-white mb-1">{s.icon}</div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-violet-200 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 space-y-5">
        {/* AI Reflection Panel */}
        <DailyReflectionPanel
          journalEntries={journalEntries}
          highlights={highlights}
          onGenerate={setReflection}
        />

        {/* Recent Prayers */}
        {journalEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <p className="text-sm font-bold text-gray-900">Recent Prayers ({journalEntries.length})</p>
            </div>
            <div className="divide-y divide-gray-50">
              {journalEntries.slice(0, 5).map(e => (
                <div key={e.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.isAnswered ? 'bg-green-400' : 'bg-violet-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{e.content?.substring(0, 80)}</p>
                  </div>
                  {e.isAnswered && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Answered</span>
                  )}
                </div>
              ))}
              {journalEntries.length > 5 && (
                <div className="px-4 py-2.5 text-center">
                  <Link to="/PrayerJournalPage" className="text-xs text-violet-500 hover:text-violet-700 font-semibold">
                    View all {journalEntries.length} entries →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Highlighted Verses */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-bold text-gray-900">Saved Highlights ({highlights.length})</p>
            </div>
            <div className="divide-y divide-gray-50">
              {highlights.slice(0, 5).map(h => (
                <div key={h.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 bg-${h.color || 'yellow'}-300`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 mb-0.5">{h.verseReference}</p>
                    <p className="text-sm text-gray-700 italic line-clamp-2">"{h.textSnippet}"</p>
                  </div>
                </div>
              ))}
              {highlights.length > 5 && (
                <div className="px-4 py-2.5 text-center">
                  <Link to="/MyHighlights" className="text-xs text-amber-600 hover:text-amber-700 font-semibold">
                    View all {highlights.length} highlights →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty call to action */}
        {journalEntries.length === 0 && highlights.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <Sparkles className="w-12 h-12 text-violet-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Start your spiritual journal</p>
            <p className="text-sm text-gray-400 mb-4">Add prayer entries and highlight Bible verses to receive personalized AI reflections on your growth journey.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/PrayerJournalPage" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                Start Journaling →
              </Link>
              <Link to="/BibleReaderPage" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Read & Highlight
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}