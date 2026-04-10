import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, Zap, Lock, CheckCircle, Loader2, Sparkles } from 'lucide-react';

/**
 * Quest line viewer showing progression and unlocks
 */
export default function QuestLineViewer({ questLineId, userId }) {
  const queryClient = useQueryClient();

  // Get quest line
  const { data: questLine } = useQuery({
    queryKey: ['quest-line', questLineId],
    queryFn: async () => {
      const lines = await base44.entities.QuestLine.filter({ id: questLineId });
      return lines[0];
    },
  });

  // Get user quest progress
  const { data: userQuest } = useQuery({
    queryKey: ['user-quest', userId, questLineId],
    queryFn: async () => {
      const quests = await base44.entities.UserQuest.filter(
        { user_id: userId, quest_line_id: questLineId }
      );
      return quests[0];
    },
  });

  const startQuestMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('startQuestLine', {
        quest_line_id: questLineId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-quest'] });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId) => {
      const response = await base44.functions.invoke('completeQuestTask', {
        user_quest_id: userQuest.id,
        quest_id: questId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-quest'] });
    },
  });

  if (!questLine) return null;

  const progress = userQuest
    ? Math.round((userQuest.quests_completed.length / questLine.total_quests) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-purple-600" />
              {questLine.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">{questLine.description}</p>
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            {questLine.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Start Button */}
        {!userQuest && (
          <Button
            onClick={() => startQuestMutation.mutate()}
            disabled={startQuestMutation.isPending}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {startQuestMutation.isPending ? 'Starting...' : 'Start Quest Line'}
          </Button>
        )}

        {userQuest && (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Progress</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-gray-600">
                {userQuest.quests_completed.length} / {questLine.total_quests} quests complete
              </p>
            </div>

            {/* Quest Sequence */}
            <div className="space-y-2 pt-2 border-t">
              {questLine.quest_sequence.map((quest, i) => {
                const isCompleted = userQuest.quests_completed.includes(quest.quest_id);
                const isCurrent = !isCompleted && i + 1 === userQuest.current_quest_position;
                const isLocked = i + 1 > userQuest.current_quest_position;

                return (
                  <div
                    key={quest.quest_id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-300 border-2'
                        : isLocked
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        ) : isCurrent ? (
                          <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {quest.position}
                          </span>
                        ) : (
                          <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {quest.position}
                          </span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{quest.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{quest.description}</p>
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <Button
                        size="sm"
                        onClick={() => completeQuestMutation.mutate(quest.quest_id)}
                        disabled={completeQuestMutation.isPending}
                        className="w-full gap-1 mt-2"
                      >
                        {completeQuestMutation.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            Complete Quest
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rewards */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
              <p className="font-semibold text-purple-900 mb-1">Rewards</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>
                  <Zap className="w-3 h-3 inline mr-1" />
                  {questLine.reward_points_total} total points
                </li>
                {userQuest.is_completed && questLine.final_badge_id && (
                  <li className="text-green-700 font-semibold">
                    ✓ Final badge unlocked!
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}