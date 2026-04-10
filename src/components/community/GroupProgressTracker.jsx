import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Users } from 'lucide-react';

export default function GroupProgressTracker({ groupId, isDarkMode = false }) {
  const { data: group } = useQuery({
    queryKey: ['study-group', groupId],
    queryFn: () => base44.entities.StudyGroup.filter({ id: groupId }).then(groups => groups[0]),
    enabled: !!groupId
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['group-goals', groupId],
    queryFn: () => base44.entities.GroupGoal.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }),
    enabled: !!groupId
  });

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  const avgProgress = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + (m.member_progress_percentage || 0), 0) / members.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
        <CardHeader>
          <CardTitle style={{ color: textColor }} className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Group Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p style={{ color: textColor }} className="font-medium">
                Overall Completion
              </p>
              <Badge style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}>
                {group?.group_progress_percentage || 0}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{ 
                  width: `${group?.group_progress_percentage || 0}%`,
                  backgroundColor: primaryColor 
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
              <Users className="w-5 h-5 mb-2" style={{ color: primaryColor }} />
              <p style={{ color: borderColor }} className="text-xs mb-1">Members</p>
              <p style={{ color: textColor }} className="font-bold text-lg">{members.length}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
              <CheckCircle2 className="w-5 h-5 mb-2" style={{ color: '#22C55E' }} />
              <p style={{ color: borderColor }} className="text-xs mb-1">Avg Progress</p>
              <p style={{ color: textColor }} className="font-bold text-lg">{avgProgress}%</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
              <Target className="w-5 h-5 mb-2" style={{ color: primaryColor }} />
              <p style={{ color: borderColor }} className="text-xs mb-1">Goals</p>
              <p style={{ color: textColor }} className="font-bold text-lg">{goals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Goals */}
      {goals.length > 0 && (
        <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
          <CardHeader>
            <CardTitle style={{ color: textColor }} className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Group Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: textColor }} className="font-medium text-sm">
                    {goal.goal_title}
                  </p>
                  <Badge variant="outline">{goal.status}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                      backgroundColor: primaryColor
                    }}
                  />
                </div>
                <p style={{ color: borderColor }} className="text-xs mt-1">
                  {goal.current_value} / {goal.target_value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}