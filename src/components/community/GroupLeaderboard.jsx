import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, TrendingUp, MessageSquare } from 'lucide-react';

export default function GroupLeaderboard({ groupId, isDarkMode = false }) {
  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }, '-contribution_score'),
    enabled: !!groupId
  });

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  const getMedalColor = (rank) => {
    switch(rank) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return primaryColor;
    }
  };

  return (
    <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <CardTitle style={{ color: textColor }} className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: '#FFD700' }} />
          Group Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {members.length === 0 ? (
          <p style={{ color: borderColor }} className="text-sm text-center py-4">
            No members yet
          </p>
        ) : (
          members.slice(0, 10).map((member, idx) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: bgColor,
                borderColor,
                border: `1px solid ${borderColor}`
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <span
                  className="text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getMedalColor(idx), color: '#000000' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p style={{ color: textColor }} className="font-medium text-sm">
                    {member.user_name}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {member.posts_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {member.posts_count} posts
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" style={{ color: '#EF4444' }} />
                  <span style={{ color: primaryColor }} className="font-bold">
                    {member.contribution_score}
                  </span>
                </div>
                <p style={{ color: borderColor }} className="text-xs">
                  {(member.member_progress_percentage || 0).toFixed(0)}% progress
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}