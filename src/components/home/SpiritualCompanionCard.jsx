import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Heart, Flame, Star, RefreshCw, ChevronRight } from 'lucide-react';

const SUGGESTION_ICONS = {
  reading: BookOpen,
  devotional: Star,
  prayer: Heart,
  challenge: Flame,
};

const SUGGESTION_COLORS = {
  reading: { bg: 'from-indigo-600 to-purple-700', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  devotional: { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  prayer: { bg: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-400' },
  challenge: { bg: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
};

const CACHE_KEY = 'faithlight_spiritual_insight';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export default function SpiritualCompanionCard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsight = async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }

    try {
      const res = await base44.functions.invoke('generateSpiritualInsights');
      if (res?.data?.success) {
        const payload = { insight: res.data.insight, stats: res.data.stats };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: payload }));
        setData(payload);
      }
    } catch (err) {
      console.debug('[SpiritualCompanionCard] Failed to load insight:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchInsight();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsight(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gray-100" />
          <div>
            <div className="h-3 w-32 bg-gray-100 rounded mb-1.5" />
            <div className="h-2.5 w-20 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded mb-2" />
        <div className="h-3 w-3/4 bg-gray-100 rounded mb-4" />
        <div className="h-10 w-full bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!data?.insight) return null;

  const { insight, stats } = data;
  const type = insight.suggestion_type || 'reading';
  const colors = SUGGESTION_COLORS[type] || SUGGESTION_COLORS.reading;
  const Icon = SUGGESTION_ICONS[type] || BookOpen;
  const ctaPage = insight.cta_page || 'BibleReader';

  return (
    <div className="mb-6">
      {/* Stats row */}
      {stats && (
        <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { label: 'Highlights', value: stats.total_highlights, emoji: '✨' },
            { label: 'Sessions', value: stats.total_reading_sessions, emoji: '📖' },
            { label: 'Study Plans', value: stats.active_plans, emoji: '🗺️' },
            { label: 'Prayers', value: stats.prayer_entries, emoji: '🙏' },
          ].map(s => (
            <div key={s.label} className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 px-3 py-2 text-center shadow-sm min-w-[72px]">
              <p className="text-base">{s.emoji}</p>
              <p className="text-sm font-bold text-gray-800">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main card */}
      <div className={`rounded-3xl bg-gradient-to-br ${colors.bg} p-5 shadow-lg text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Your Faith Journey</p>
              <p className="text-sm font-bold text-white">{insight.theme}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Refresh suggestion"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Insight message */}
        <p className="text-sm text-white/90 leading-relaxed mb-4 relative">
          {insight.insight_message}
        </p>

        {/* Suggestion box */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-4 relative">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wide mb-0.5">
                Suggested {type === 'challenge' ? 'Challenge' : type === 'reading' ? 'Reading' : type === 'prayer' ? 'Prayer' : 'Devotional'}
              </p>
              <p className="text-sm font-bold text-white">{insight.suggestion_title}</p>
              {insight.passage && (
                <p className="text-xs text-white/70 mt-0.5">📖 {insight.passage}</p>
              )}
              <p className="text-xs text-white/80 mt-1 leading-relaxed">{insight.suggestion_description}</p>
            </div>
          </div>
        </div>

        {/* CTA button */}
        <Link
          to={createPageUrl(ctaPage)}
          className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm py-3 rounded-2xl transition-all active:scale-95 relative"
        >
          {insight.cta_label || 'Start Reading'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-400 text-center mt-2 px-2">
        AI suggestions support your Bible study and may not represent every Christian tradition.
      </p>
    </div>
  );
}