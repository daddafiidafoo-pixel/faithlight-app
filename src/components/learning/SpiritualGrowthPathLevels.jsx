import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Lock } from 'lucide-react';
import LevelDetailModal from './LevelDetailModal';
import MilestoneProgress from './MilestoneProgress';

export default function SpiritualGrowthPathLevels({ userId }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all spiritual growth levels
  const { data: allLevels = [] } = useQuery({
    queryKey: ['spiritualLevels'],
    queryFn: async () => {
      try {
        if (!base44?.entities?.SpiritualGrowthLevel) return [];
        const levels = await base44.entities.SpiritualGrowthLevel.list();
        return (levels || []).sort((a, b) => a.level_number - b.level_number);
      } catch (err) {
        console.warn('Failed to fetch spiritual levels:', err?.message);
        return [];
      }
    },
    retry: 0,
  });

  // Fetch user's spiritual progress
  const { data: userProgress } = useQuery({
    queryKey: ['userSpiritualProgress', userId],
    queryFn: async () => {
      if (!userId || !base44?.entities?.UserSpiritualProgress) return null;
      try {
        const progress = await base44.entities.UserSpiritualProgress.filter(
          { user_id: userId },
          '-created_date',
          1
        );
        return progress?.[0] || null;
      } catch (err) {
        console.warn('Failed to fetch user spiritual progress:', err?.message);
        return null;
      }
    },
    enabled: !!userId,
    retry: 0,
  });

  // Fetch milestone progress
  const { data: milestoneData } = useQuery({
    queryKey: ['milestoneProgress', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await base44.functions.invoke('checkMilestoneProgress', {});
        return response?.data || null;
      } catch (err) {
        console.warn('Failed to fetch milestone progress:', err?.message);
        return null;
      }
    },
    enabled: !!userId,
    retry: 0,
  });

  const currentLevel = userProgress?.current_level || 1;
  const completedLevels = userProgress?.completed_levels || [];
  const isLeaderEligible = userProgress?.leader_eligible && !userProgress?.leader_approved;
  const isLeaderApproved = userProgress?.leader_approved;

  const handleLevelClick = (level) => {
    setSelectedLevel(level);
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Spiritual Journey</h2>
          <p className="text-lg text-gray-600">
            {currentLevel === 1 && "Welcome to your faith journey. Let's start at the foundation."}
            {currentLevel === 2 && "You're growing strong! Continue deepening your faith."}
            {currentLevel === 3 && "Dive into theological depth and defend your faith."}
            {currentLevel === 4 && "You're ready to lead and mentor others."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allLevels.map((level) => {
            const isCompleted = completedLevels.includes(level.level_number);
            const isCurrentOrPast = level.level_number <= currentLevel;
            const isCurrent = level.level_number === currentLevel;
            const isLeadershipLevel = level.level_number === 4;
            const requiresApproval = isLeadershipLevel && isLeaderEligible;
            const isApproved = isLeadershipLevel && isLeaderApproved;

            return (
              <button
                key={level.id}
                onClick={() => handleLevelClick(level)}
                className="text-left transition-all"
              >
                <Card
                  className={`h-full transition-all ${
                    isCurrent
                      ? 'ring-2 ring-indigo-600 shadow-lg scale-105'
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : !isCurrentOrPast
                      ? 'opacity-60 grayscale'
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-5xl">{level.icon}</div>
                      {isCompleted && (
                        <Badge className="bg-green-600 text-white">✓ Completed</Badge>
                      )}
                      {requiresApproval && (
                        <Badge className="bg-yellow-600 text-white">🔒 Approval Pending</Badge>
                      )}
                      {isApproved && (
                        <Badge className="bg-indigo-600 text-white">✓ Approved</Badge>
                      )}
                      {!isCurrentOrPast && !requiresApproval && <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <CardTitle className="text-lg mt-3">{level.title}</CardTitle>
                    <p className="text-xs text-gray-600 mt-1">{level.subtitle}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Goal:</p>
                      <p className="text-sm text-gray-600">{level.goal}</p>
                    </div>

                    {isCurrent && milestoneData?.levelProgress?.[level.level_number] && (
                      <div className="mt-4">
                        <MilestoneProgress
                          level={level.level_number}
                          milestones={milestoneData.levelProgress[level.level_number].milestones}
                          language="en"
                        />
                      </div>
                    )}

                    <Button
                      className={`w-full gap-2 ${
                        isCurrent || isApproved
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : isCompleted || requiresApproval
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isCurrentOrPast && !requiresApproval}
                    >
                      {isCompleted && !isLeadershipLevel ? 'Review' : isCurrent || isApproved ? 'Continue' : requiresApproval ? 'Awaiting Approval' : 'Locked'} <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      {selectedLevel && (
        <LevelDetailModal
          level={selectedLevel}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          userProgress={userProgress}
        />
      )}
    </>
  );
}