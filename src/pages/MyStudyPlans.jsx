import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PlayCircle, CheckCircle, PauseCircle, Loader2, Plus } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Active', icon: PlayCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
};

export default function MyStudyPlans() {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setLoading(false); return; }
      setUser(u);
      const progress = await base44.entities.UserStudyPlanProgress.filter({ user_id: u.id }, '-last_opened_at', 50).catch(() => []);
      setPlans(progress);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Sign in to see your study plans.</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Study Plans</h1>
            <p className="text-gray-500">Your active and completed plans.</p>
          </div>
          <Link to={createPageUrl('DiscoverStudyPlans')}>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Discover Plans</Button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No plans yet</h3>
            <p className="text-gray-400 text-sm mb-5">Start a study plan to track your progress.</p>
            <Link to={createPageUrl('DiscoverStudyPlans')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Browse Plans</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(p => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.active;
              const StatusIcon = cfg.icon;
              return (
                <Link key={p.id} to={createPageUrl(`StudyPlanDetails?id=${p.plan_id}`)}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{p.plan_title || 'Study Plan'}</h3>
                        <Badge className={`text-xs ${cfg.bg} ${cfg.color} border-0`}>{cfg.label}</Badge>
                      </div>
                      {p.status !== 'completed' && (
                        <p className="text-sm text-gray-500 mb-2">Day {p.current_day}</p>
                      )}
                      <Progress
                        value={p.status === 'completed' ? 100 : ((p.completed_days?.length || 0) / Math.max(p.current_day, 1)) * 100}
                        className="h-1.5"
                      />
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {p.completed_days?.length || 0} days done
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}