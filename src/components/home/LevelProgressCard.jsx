import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Lock } from 'lucide-react';

const NEXT_STEPS = {
  1: {
    en: 'Complete the remaining prayer reflections',
    om: 'Yaadannoo kadhannaa hafe xumuri'
  },
  2: {
    en: 'Join a community discussion',
    om: 'Marii garee keessatti hirmaadhu'
  },
  3: {
    en: 'Join a moderated study group',
    om: 'Garee barnoota mirkanaa\'e keessatti seeni'
  },
  leaderEligible: {
    en: 'Request leadership approval',
    om: 'Mirkaneessa geggeessummaa gaafadhu'
  }
};

const LEVEL_STATUS = {
  1: {
    en: 'You\'re on Level 1 (New Believer)',
    om: 'Ati Sadarkaa 1 (Amantii Haaraa) irra jirta'
  },
  2: {
    en: 'You\'re on Level 2 (Growing Strong)',
    om: 'Ati Sadarkaa 2 (Jabaadhu) irra jirta'
  },
  3: {
    en: 'You\'re on Level 3 (Deep Study)',
    om: 'Ati Sadarkaa 3 (Barnoota Cimaa) irra jirta'
  },
  4: {
    en: 'You\'re on Level 4 (Leadership Training)',
    om: 'Ati Sadarkaa 4 (Leenjii Geggeessummaa) irra jirta'
  }
};

export default function LevelProgressCard({ currentLevel, isLeaderEligible, isLeaderApproved, language = 'en' }) {
  const statusText = LEVEL_STATUS[currentLevel]?.[language] || LEVEL_STATUS[1][language];
  
  let statusIcon = <Circle className="w-5 h-5 text-yellow-500" />;
  let nextStepText = '';
  
  if (isLeaderApproved) {
    statusIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
  } else if (isLeaderEligible) {
    statusIcon = <Circle className="w-5 h-5 text-amber-500" />;
    nextStepText = NEXT_STEPS.leaderEligible[language];
  } else if (currentLevel <= 3) {
    statusIcon = <Circle className="w-5 h-5 text-yellow-500" />;
    nextStepText = NEXT_STEPS[currentLevel]?.[language] || '';
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start gap-3">
          {statusIcon}
          <div>
            <h3 className="font-semibold text-gray-900">{statusText}</h3>
            {nextStepText && (
              <p className="text-sm text-gray-700 mt-2">
                {language === 'om' 
                  ? `Kan itti aanu: ${nextStepText}`
                  : `Next: ${nextStepText}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}