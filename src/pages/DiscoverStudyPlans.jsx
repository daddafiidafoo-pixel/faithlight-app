import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Clock, PlayCircle, CheckCircle, ChevronRight, Loader2, Sparkles } from 'lucide-react';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function DiscoverStudyPlans() {
  const [plans, setPlans] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [fetchedPlans] = await Promise.all([
        base44.entities.StudyPlanCurated.list('-created_date', 50).then(r => r.filter(p => p.is_published !== false)).catch(() => []),
      ]);
      setPlans(fetchedPlans);

      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const progress = await base44.entities.UserStudyPlanProgress.filter({ user_id: u.id }, '-created_date', 50).catch(() => []);

        setUserProgress(progress);
      }
      setLoading(false);
    };
    init();
  }, []);

  const getProgressForPlan = (planId) => userProgress.find(p => p.plan_id === planId);

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return matchSearch && matchDiff;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">📚 Study Plans</h1>
            <p className="text-gray-500">Follow a structured plan to grow deeper in Scripture.</p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Link to={createPageUrl('MyStudyPlans')}>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" /> My Plans
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search plans…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan Cards */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No study plans found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(plan => {
              const progress = getProgressForPlan(plan.id);
              return (
                <Link key={plan.id} to={createPageUrl(`StudyPlanDetails?id=${plan.id}`)}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden h-full flex flex-col">
                    {plan.cover_image ? (
                      <img src={plan.cover_image} alt={plan.title} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white/70" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`text-xs ${DIFFICULTY_COLORS[plan.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                          {plan.difficulty}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {plan.duration_days} days
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{plan.title}</h3>
                      {plan.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{plan.description}</p>
                      )}
                      {plan.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {plan.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto">
                        {progress?.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" /> Completed
                          </span>
                        ) : progress?.status === 'active' ? (
                          <span className="flex items-center gap-1 text-sm text-indigo-600 font-medium">
                            <PlayCircle className="w-4 h-4" /> Continue Day {progress.current_day}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                            <ChevronRight className="w-4 h-4" /> Start Plan
                          </span>
                        )}
                      </div>
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