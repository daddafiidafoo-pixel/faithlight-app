import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Users, Zap, Clock, Loader2 } from 'lucide-react';

/**
 * Team challenge card with progress and team management
 */
export default function TeamChallengeCard({ challenge, userId }) {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');

  // Get active teams for this challenge
  const { data: teams = [] } = useQuery({
    queryKey: ['challenge-teams', challenge.id],
    queryFn: async () => {
      return await base44.entities.GroupGoal.filter(
        { team_challenge_id: challenge.id },
        'current_progress'
      );
    },
  });

  // Check if user is in a team
  const userTeam = teams.find(t => t.member_ids.includes(userId));

  const joinChallengeMutation = useMutation({
    mutationFn: async (action) => {
      const response = await base44.functions.invoke('joinTeamChallenge', {
        team_challenge_id: challenge.id,
        action,
        team_name: action === 'create_team' ? teamName : undefined,
      });
      return response.data;
    },
  });

  const daysRemaining = Math.ceil(
    (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const topTeams = [...teams].sort((a, b) => b.current_progress - a.current_progress).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              {challenge.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">{challenge.description}</p>
          </div>
          <Badge className="whitespace-nowrap">
            <Clock className="w-3 h-3 mr-1" />
            {daysRemaining}d left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Challenge Goal */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Goal</p>
          <p className="text-sm text-gray-900">
            Complete <strong>{challenge.target_value}</strong> {challenge.target_metric.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Reward: <Zap className="w-3 h-3 inline" /> {challenge.reward_points} points per member
          </p>
        </div>

        {/* Team Status */}
        {userTeam ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Your Team: {userTeam.team_name}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{userTeam.current_progress} / {challenge.target_value}</span>
                <span>{Math.round((userTeam.current_progress / challenge.target_value) * 100)}%</span>
              </div>
              <Progress value={(userTeam.current_progress / challenge.target_value) * 100} />
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600">
                {userTeam.member_ids.length} / {challenge.team_size_max} members
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {showTeamForm ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Team name..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    joinChallengeMutation.mutate('create_team');
                    setTeamName('');
                    setShowTeamForm(false);
                  }}
                  disabled={!teamName || joinChallengeMutation.isPending}
                >
                  {joinChallengeMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">Join a team to participate</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTeamForm(true)}
                  className="w-full"
                >
                  Create Team
                </Button>
              </>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {topTeams.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs font-semibold text-gray-600 mb-2">Top Teams</p>
            <div className="space-y-1">
              {topTeams.map((team, i) => (
                <div
                  key={team.id}
                  className={`flex items-center justify-between text-sm p-2 rounded ${
                    userTeam?.id === team.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600">#{i + 1}</span>
                    <span className="text-gray-900">{team.team_name}</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">
                    {team.current_progress}/{challenge.target_value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}