import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, CheckCircle, Users, Trophy, Zap, Flame, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

const CHALLENGE_TYPES = [
  { value: 'reading', label: '📖 Reading', desc: 'Read X chapters together' },
  { value: 'memorization', label: '🧠 Memorize', desc: 'Memorize X verses' },
  { value: 'prayer', label: '🙏 Prayer', desc: 'Pray together X times' },
  { value: 'discussion', label: '💬 Discussion', desc: 'Post X discussion replies' },
  { value: 'devotional', label: '✨ Devotional', desc: 'Complete X devotionals' },
];

function ChallengeProgressBar({ current, goal, color = 'bg-indigo-500' }) {
  const pct = Math.min(100, Math.round((current / Math.max(1, goal)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{current} / {goal}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function GroupTeamChallenges({ groupId, group, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', challenge_type: 'reading', goal: 7, end_date: '' });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['group-challenges', groupId],
    queryFn: () => base44.entities.TeamChallenge.filter({ group_id: groupId }, '-created_date', 20).catch(() => []),
    enabled: !!groupId,
  });

  const { data: myContributions = [] } = useQuery({
    queryKey: ['challenge-contributions', groupId, user?.id],
    queryFn: () => base44.entities.GamificationEvent.filter({ user_id: user.id, group_id: groupId, event_type: 'challenge_contribution' }, '-created_date', 100).catch(() => []),
    enabled: !!user?.id,
  });

  const createChallenge = useMutation({
    mutationFn: () => base44.entities.TeamChallenge.create({
      group_id: groupId,
      group_name: group?.name,
      created_by: user.id,
      created_by_name: user.full_name,
      title: form.title.trim(),
      description: form.description.trim(),
      challenge_type: form.challenge_type,
      goal: parseInt(form.goal) || 7,
      current_progress: 0,
      participant_count: 0,
      participants: [],
      status: 'active',
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    }),
    onSuccess: () => {
      toast.success('Challenge created! 🎯');
      setShowCreate(false);
      setForm({ title: '', description: '', challenge_type: 'reading', goal: 7, end_date: '' });
      queryClient.invalidateQueries(['group-challenges', groupId]);
    },
  });

  const contribute = useMutation({
    mutationFn: async (challenge) => {
      const alreadyIn = challenge.participants?.includes(user.id);
      const newProgress = (challenge.current_progress || 0) + 1;
      const newParticipants = alreadyIn ? challenge.participants : [...(challenge.participants || []), user.id];

      await base44.entities.TeamChallenge.update(challenge.id, {
        current_progress: newProgress,
        participant_count: newParticipants.length,
        participants: newParticipants,
        status: newProgress >= challenge.goal ? 'completed' : 'active',
      });

      // Log contribution event
      await base44.entities.GamificationEvent.create({
        user_id: user.id,
        user_name: user.full_name,
        group_id: groupId,
        group_name: group?.name,
        event_type: 'challenge_contribution',
        subject: challenge.title,
        description: `Contributed to "${challenge.title}"`,
      }).catch(() => {});

      if (newProgress >= challenge.goal) {
        toast.success('🏆 Challenge completed! Amazing work, team!');
      } else {
        toast.success('+1 progress! Keep going! 💪');
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['group-challenges', groupId]),
  });

  const active = challenges.filter(c => c.status === 'active');
  const completed = challenges.filter(c => c.status === 'completed');

  const myContribMap = myContributions.reduce((acc, c) => {
    acc[c.subject] = (acc[c.subject] || 0) + 1;
    return acc;
  }, {});

  const TYPE_COLORS = {
    reading: 'bg-blue-500', memorization: 'bg-green-500',
    prayer: 'bg-teal-500', discussion: 'bg-indigo-500', devotional: 'bg-amber-500',
  };

  const ChallengeCard = ({ challenge }) => {
    const myCount = myContribMap[challenge.title] || 0;
    const isComplete = challenge.status === 'completed';
    const pct = Math.min(100, Math.round(((challenge.current_progress || 0) / (challenge.goal || 1)) * 100));

    return (
      <Card className={`border ${isComplete ? 'border-green-300 bg-green-50' : 'border-indigo-200'}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-semibold text-gray-900 text-sm">{challenge.title}</h4>
                {isComplete && <Badge className="bg-green-100 text-green-700 text-xs gap-1"><Trophy className="w-3 h-3" />Done!</Badge>}
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{challenge.challenge_type}</Badge>
              </div>
              {challenge.description && <p className="text-xs text-gray-500 leading-relaxed">{challenge.description}</p>}
            </div>
            {!isComplete && user && (
              <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs h-8 flex-shrink-0"
                onClick={() => contribute.mutate(challenge)}
                disabled={contribute.isPending}>
                {contribute.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                +1
              </Button>
            )}
          </div>

          <ChallengeProgressBar
            current={challenge.current_progress || 0}
            goal={challenge.goal || 1}
            color={TYPE_COLORS[challenge.challenge_type] || 'bg-indigo-500'}
          />

          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{challenge.participant_count || 0} participants</span>
            {myCount > 0 && <span className="flex items-center gap-1 text-indigo-600 font-medium"><CheckCircle className="w-3 h-3" />Your contribution: {myCount}</span>}
            {challenge.end_date && <span>Ends {format(new Date(challenge.end_date), 'MMM d')}</span>}
            {challenge.created_date && <span>Started {formatDistanceToNow(new Date(challenge.created_date), { addSuffix: true })}</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-gray-900">Team Challenges</h3>
          {active.length > 0 && <Badge className="bg-orange-100 text-orange-700 text-xs">{active.length} active</Badge>}
        </div>
        {(isAdmin || true) && (
          <Button size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-700" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create Challenge
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-semibold text-gray-900">New Team Challenge</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Challenge title *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.challenge_type}
                onChange={e => setForm(p => ({ ...p, challenge_type: e.target.value }))}>
                {CHALLENGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="flex gap-2 items-center">
                <label className="text-xs text-gray-600 whitespace-nowrap">Group Goal:</label>
                <input type="number" min="1" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} />
              </div>
              <input type="date" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="End date (optional)" value={form.end_date}
                onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              <textarea className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 col-span-2 min-h-[60px]"
                placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" className="gap-1 bg-orange-600 hover:bg-orange-700"
                onClick={() => createChallenge.mutate()}
                disabled={!form.title || createChallenge.isPending}>
                {createChallenge.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active challenges */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400 animate-pulse">Loading challenges...</div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />Active</p>
              <div className="space-y-3">{active.map(c => <ChallengeCard key={c.id} challenge={c} />)}</div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" />Completed</p>
              <div className="space-y-2">{completed.slice(0, 3).map(c => <ChallengeCard key={c.id} challenge={c} />)}</div>
            </div>
          )}
          {challenges.length === 0 && (
            <Card className="border-dashed border-gray-300">
              <CardContent className="py-12 text-center">
                <Target className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No challenges yet — create one to motivate your group!</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}