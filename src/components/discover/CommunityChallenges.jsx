import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, CheckCircle, Flame, BookOpen, Loader2, Sparkles, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { differenceInDays, format, isPast } from 'date-fns';
import { toast } from 'sonner';

const CHALLENGE_ICONS = {
  bible_reading: BookOpen,
  prayer: Flame,
  memorization: Target,
  study_plan: Trophy,
  forum_discussion: Users,
};

const CHALLENGE_COLORS = {
  bible_reading: 'from-blue-500 to-indigo-600',
  prayer: 'from-orange-400 to-red-500',
  memorization: 'from-purple-500 to-pink-500',
  study_plan: 'from-green-500 to-emerald-600',
  forum_discussion: 'from-amber-400 to-orange-500',
};

function ChallengeCard({ challenge, userId, userName }) {
  const [expanded, setExpanded] = useState(false);
  const [aiMatchup, setAiMatchup] = useState(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const queryClient = useQueryClient();

  const Icon = CHALLENGE_ICONS[challenge.challenge_type] || Trophy;
  const gradientColor = CHALLENGE_COLORS[challenge.challenge_type] || 'from-indigo-500 to-purple-600';
  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const progress = challenge.target_value > 0
    ? Math.min(Math.round((challenge.completed_count / challenge.participant_count || 0) * 100), 100)
    : 0;

  const { data: myEntry } = useQuery({
    queryKey: ['my-challenge', challenge.id, userId],
    queryFn: async () => {
      if (!userId) return null;
      const r = await base44.entities.CommunityChallengeMember.filter({ challenge_id: challenge.id, user_id: userId }, '-updated_date', 1);
      return r[0] || null;
    },
    enabled: !!userId,
    retry: false,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CommunityChallengeMember.create({
        challenge_id: challenge.id,
        user_id: userId,
        user_name: userName,
        joined_at: new Date().toISOString(),
        progress: 0,
        completed: false,
      });
      await base44.entities.CommunityChallenge.update(challenge.id, {
        participant_count: (challenge.participant_count || 0) + 1,
      });
    },
    onSuccess: () => {
      toast.success('You joined the challenge! 🎉');
      queryClient.invalidateQueries({ queryKey: ['my-challenge', challenge.id] });
      queryClient.invalidateQueries({ queryKey: ['community-challenges'] });
    },
  });

  const suggestMatchup = async () => {
    setLoadingMatchup(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `For the community Bible challenge "${challenge.title}" (${challenge.description}), suggest a fun and faith-building collaborative matchup idea between groups. Give a creative group name, a specific scripture focus, and a short motivational message. Keep it under 60 words total.`,
        response_json_schema: {
          type: 'object',
          properties: {
            group_name: { type: 'string' },
            scripture_focus: { type: 'string' },
            motivational_message: { type: 'string' },
          }
        }
      });
      setAiMatchup(result);
    } catch {
      setAiMatchup({ group_name: 'Faith Warriors', scripture_focus: challenge.target_book || 'Psalms', motivational_message: 'Together we grow stronger in the Word!' });
    }
    setLoadingMatchup(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header gradient strip */}
      <div className={`h-1.5 bg-gradient-to-r ${gradientColor}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradientColor} shadow-sm flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{challenge.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{challenge.description}</p>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-bold flex-shrink-0">
            +{challenge.reward_points || 100} pts
          </Badge>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {challenge.participant_count || 0} joined
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" /> {challenge.completed_count || 0} completed
          </span>
          <span className={`flex items-center gap-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : ''}`}>
            <Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
          </span>
        </div>

        {/* Progress bar (collective) */}
        {challenge.participant_count > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Community progress</span>
              <span>{challenge.completed_count || 0}/{challenge.participant_count || 0} finished</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${gradientColor} transition-all`}
                style={{ width: `${challenge.participant_count > 0 ? Math.round(((challenge.completed_count || 0) / challenge.participant_count) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {challenge.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {challenge.tags.slice(0, 3).map(t => (
              <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {userId ? (
            myEntry ? (
              <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 rounded-lg px-3 py-1.5 flex-1 justify-center">
                <CheckCircle className="w-3.5 h-3.5" /> Joined
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || daysLeft <= 0}
                className={`flex-1 bg-gradient-to-r ${gradientColor} text-white border-0 hover:opacity-90 text-xs gap-1`}
              >
                {joinMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3" />}
                Join Challenge
              </Button>
            )
          ) : null}
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded: AI Matchup */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={suggestMatchup}
              disabled={loadingMatchup}
              className="w-full flex items-center justify-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-semibold py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              {loadingMatchup ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI: Suggest Group Matchup
            </button>
            {aiMatchup && (
              <div className="mt-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-xs">
                <p className="font-bold text-purple-700">🏆 {aiMatchup.group_name}</p>
                <p className="text-gray-600 mt-1"><span className="font-semibold">Focus:</span> {aiMatchup.scripture_focus}</p>
                <p className="text-indigo-600 italic mt-1">"{aiMatchup.motivational_message}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunityChallenges({ user }) {
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['community-challenges'],
    queryFn: () => base44.entities.CommunityChallenge.filter({ is_active: true }, '-updated_date', 10),
    retry: false,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
    </div>
  );

  if (challenges.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">No active challenges yet. Check back soon!</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {challenges.map(c => (
        <ChallengeCard
          key={c.id}
          challenge={c}
          userId={user?.id}
          userName={user?.full_name}
        />
      ))}
    </div>
  );
}