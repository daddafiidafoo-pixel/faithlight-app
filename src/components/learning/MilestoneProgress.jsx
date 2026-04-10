import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';

const MILESTONE_LABELS = {
  L1_COURSE_7DAY_BEGINNER_COMPLETE: 'Complete 7-Day Beginner Course',
  L1_READ_JOHN_PROGRESS_70: 'Reach 70% in John Reading Plan',
  L1_PRAYER_REFLECTIONS_5: 'Complete 5 Prayer Reflections',
  L2_COURSE_SPIRITUAL_GROWTH_COMPLETE: 'Complete Spiritual Growth Course',
  L2_DEVOTIONAL_STREAK_14: 'Maintain 14-Day Devotion Streak',
  L2_COMMUNITY_PARTICIPATION_3: 'Participate in 3 Community Discussions',
  L2_BIBLE_STUDY_METHOD_COMPLETE: 'Learn SOAP Bible Study Method',
  L3_COURSE_DOCTRINE_FOUNDATIONS_COMPLETE: 'Complete Doctrine Foundations Course',
  L3_QUIZ_PASS_3: 'Pass 3 Theology Quizzes',
  L3_JOIN_STUDY_GROUP_1: 'Join a Moderated Study Group',
  L3_HEBREWS_OR_ACTS_PROGRESS_50: 'Complete 50% of Hebrews or Acts Study'
};

const MILESTONE_LABELS_OM = {
  L1_COURSE_7DAY_BEGINNER_COMPLETE: 'Barnoota Guyyaa 7 Xumuri',
  L1_READ_JOHN_PROGRESS_70: 'Yohaannis 70% ga\'i',
  L1_PRAYER_REFLECTIONS_5: 'Yaadannoo Kadhannaa 5 Xumuri',
  L2_COURSE_SPIRITUAL_GROWTH_COMPLETE: 'Barnoota Jabaadhu Xumuri',
  L2_DEVOTIONAL_STREAK_14: 'Itti Fufiinsa Guyyaa 14 Eegadhu',
  L2_COMMUNITY_PARTICIPATION_3: 'Garee Keessatti Hirmaannoo 3 Gadi Fudhadi',
  L2_BIBLE_STUDY_METHOD_COMPLETE: 'Mala SOAP Bari',
  L3_COURSE_DOCTRINE_FOUNDATIONS_COMPLETE: 'Barnoota Jecha Itti Gahu Xumuri',
  L3_QUIZ_PASS_3: 'Gaaffii Jecha 3 Guutuu',
  L3_JOIN_STUDY_GROUP_1: 'Garee Barnoota Mirkanaa\'e Keessatti Seeni',
  L3_HEBREWS_OR_ACTS_PROGRESS_50: 'Barnoota Ivreewwaa ykn Yeroo 50% Xumuri'
};

export default function MilestoneProgress({ level, milestones, language = 'en' }) {
  const labels = language === 'om' ? MILESTONE_LABELS_OM : MILESTONE_LABELS;
  
  if (!milestones || milestones.length === 0) return null;

  const completed = milestones.filter(m => m.completed).length;
  const total = milestones.length;
  const percentage = (completed / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {language === 'om' ? 'Tarkaanfiiwwan Sadarkaa' : `Level ${level} Milestones`}
        </h3>
        <span className="text-xs text-gray-600">
          {completed}/{total}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.key}
            className="flex items-start gap-2 text-sm p-2 rounded bg-gray-50"
          >
            {milestone.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <span className={milestone.completed ? 'text-gray-600 line-through' : 'text-gray-700'}>
              {labels[milestone.key] || milestone.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}