import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function StudyPlanCard({ plan, isEnrolled, onEnroll }) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.UserStudyPlanEnrollment.create({
        user_email: user.email,
        study_plan_id: plan.id,
        plan_title: plan.title,
        plan_topic: plan.topic,
        enrolled_date: new Date().toISOString()
      });
      onEnroll();
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-start gap-4 mb-4">
        <BookOpen className="w-10 h-10 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900">{plan.title}</h3>
          <p className="text-sm text-slate-500 capitalize">{plan.topic}</p>
        </div>
      </div>

      <p className="text-slate-700 text-sm mb-4 line-clamp-2">{plan.description}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-600">{plan.duration_days} days</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {plan.daily_readings?.length || 0} readings
        </span>
      </div>

      <Button
        onClick={handleEnroll}
        disabled={enrolling || isEnrolled}
        className="w-full"
        variant={isEnrolled ? 'outline' : 'default'}
      >
        {isEnrolled ? 'Enrolled' : enrolling ? 'Enrolling...' : 'Enroll Now'}
      </Button>
    </Card>
  );
}