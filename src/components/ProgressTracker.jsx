import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Target, Flame } from "lucide-react";

export default function ProgressTracker({ stats }) {
  const { completedLessons = 0, totalLessons = 0, averageScore = 0, streak = 0 } = stats;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lessons Completed</span>
            <span className="font-semibold">{completedLessons} / {totalLessons}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <div className="text-xs text-gray-600">Lessons</div>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
            <div className="text-xs text-gray-600">Avg Score</div>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}