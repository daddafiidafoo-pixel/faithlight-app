import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function CourseEnrollmentStats({ enrollment }) {
  if (!enrollment) return null;

  const stats = [
    {
      label: 'Total Enrolled',
      value: enrollment.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: enrollment.completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'In Progress',
      value: enrollment.in_progress,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Average Progress',
      value: `${enrollment.avg_progress}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`border-0 ${stat.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}