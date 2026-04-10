import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

// Mirror of the curated plans (just id, title, emoji, color, total_days)
const PLAN_META = {
  'overcoming-anxiety':  { title: 'Overcoming Anxiety', emoji: '🕊️', color: 'from-sky-500 to-cyan-500' },
  'gospel-of-john-21':   { title: 'Gospel of John', emoji: '✝️', color: 'from-indigo-500 to-purple-600' },
  'psalms-of-praise':    { title: 'Psalms of Praise', emoji: '🎵', color: 'from-amber-500 to-orange-500' },
  'sermon-on-the-mount': { title: 'Sermon on the Mount', emoji: '⛰️', color: 'from-green-500 to-teal-500' },
  'faith-heroes':        { title: 'Heroes of Faith', emoji: '🦁', color: 'from-rose-500 to-pink-600' },
  'prayer-school':       { title: 'Prayer School', emoji: '🙏', color: 'from-violet-500 to-purple-600' },
};

const TOTAL_DAYS = {
  'overcoming-anxiety': 7, 'gospel-of-john-21': 21, 'psalms-of-praise': 10,
  'sermon-on-the-mount': 14, 'faith-heroes': 12, 'prayer-school': 7,
};

export default function ReadingPlanProgressCard({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.entities.UserReadingProgress
      .filter({ user_id: user.id }, '-last_read_at', 3)
      .then(data => setPlans(data.filter(p => p.completed_days?.length > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading || plans.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <p className="text-sm font-extrabold text-gray-900">Reading Plans</p>
        </div>
        <Link to={createPageUrl('ReadingPlans')} className="text-xs text-indigo-600 font-bold flex items-center gap-0.5 hover:text-indigo-800">
          All Plans <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {plans.map(prog => {
          const meta = PLAN_META[prog.plan_id];
          if (!meta) return null;
          const total = TOTAL_DAYS[prog.plan_id] || 7;
          const done = prog.completed_days?.length || 0;
          const pct = Math.min(100, Math.round((done / total) * 100));
          const complete = pct === 100;

          return (
            <Link to={createPageUrl('ReadingPlans')} key={prog.id} className="block">
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{meta.title}</p>
                    <span className={`text-xs font-extrabold ml-2 flex-shrink-0 ${complete ? 'text-green-600' : 'text-indigo-600'}`}>
                      {complete ? <CheckCircle2 className="w-3.5 h-3.5 inline" /> : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {complete ? '🎉 Complete!' : `Day ${done + 1} of ${total}`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}