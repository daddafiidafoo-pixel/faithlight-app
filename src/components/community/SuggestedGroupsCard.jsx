import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../../utils';

export default function SuggestedGroupsCard({ userId, userInterests = [] }) {
  const { data: suggestedGroups = [], isLoading } = useQuery({
    queryKey: ['suggested-groups', userId, userInterests],
    queryFn: async () => {
      if (!userId || userInterests.length === 0) return [];

      // Fetch groups that match user interests
      const allGroups = await base44.entities.Group.filter(
        { is_active: true },
        '-member_count',
        50
      );

      // Filter groups by matching user interests
      const matching = allGroups
        .filter(group => {
          // Check if group has interests that match user interests
          const hasMatchingInterest = userInterests.some(userInterest =>
            group.interests?.includes(userInterest)
          );
          return hasMatchingInterest;
        })
        .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
        .slice(0, 4);

      return matching;
    },
    enabled: !!userId && userInterests.length > 0,
  });

  const { data: myGroupIds = [] } = useQuery({
    queryKey: ['user-groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      const memberships = await base44.entities.GroupMember.filter(
        { user_id: userId },
        '-joined_date',
        100
      );
      return memberships.map(m => m.group_id);
    },
    enabled: !!userId,
  });

  // Filter out groups user is already a member of
  const filteredSuggestions = suggestedGroups.filter(
    group => !myGroupIds.includes(group.id)
  );

  if (isLoading || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-lg">Groups For You</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredSuggestions.map((group) => (
          <Link
            key={group.id}
            to={`${createPageUrl('GroupDetail')}?id=${group.id}`}
            className="block p-3 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{group.name}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {group.description}
                </p>
                {group.interests && group.interests.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {group.interests.slice(0, 2).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        <Link to={createPageUrl('DiscoverGroups')}>
          <Button
            variant="outline"
            className="w-full mt-4 gap-2"
            size="sm"
          >
            <span>Browse All Groups</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}