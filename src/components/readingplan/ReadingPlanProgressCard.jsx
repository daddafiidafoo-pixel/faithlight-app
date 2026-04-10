import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, Check } from 'lucide-react';

export default function ReadingPlanProgressCard({ plan, progress, onContinue, onViewDetails }) {
  const totalDays = plan.dayCount || 90;
  const completedDays = progress?.completedDaysCount || 0;
  const progressPercent = (completedDays / totalDays) * 100;
  const currentDay = progress?.currentDay || 1;

  return (
    <Card className="p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description || 'Bible reading plan'}</p>
        </div>
        <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0" />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs text-gray-600">{completedDays}/{totalDays} days</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            Day {currentDay} of {totalDays}
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            {completedDays} completed
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onViewDetails(plan.id)}
          className="flex-1"
        >
          View Plan
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => onContinue(plan.id)}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}