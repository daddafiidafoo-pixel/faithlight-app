import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function PrayerRequestsWidget({ userId }) {
  const { data: prayers = [] } = useQuery({
    queryKey: ['prayer-widget', userId],
    queryFn: async () => {
      if (!userId) return [];
      const memberships = await base44.entities.GroupMember.filter({ user_id: userId }, '-updated_date', 10).catch(() => []);
      if (!memberships.length) return [];
      const groupIds = memberships.map(m => m.group_id).slice(0, 5);
      const all = await Promise.all(
        groupIds.map(gid => base44.entities.PrayerRequest.filter({ group_id: gid }, '-updated_date', 3).catch(() => []))
      );
      return all.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
    },
    enabled: !!userId,
    retry: false,
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-blue-50/50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">🙏 Prayer Requests</h2>
          <Link to={createPageUrl('Groups')}><Button variant="ghost" size="sm" className="text-indigo-600 text-xs">View All →</Button></Link>
        </div>
        {prayers.length === 0 ? (
          <Card className="border-dashed border-2 border-blue-200 bg-white">
            <CardContent className="py-8 text-center text-gray-500">
              <p className="text-2xl mb-2">🙏</p>
              <p className="text-sm">No active prayer requests from your groups.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prayers.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
                <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{p.title}</p>
                {p.details && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.details}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{p.user_name || 'Anonymous'}</span>
                  <span className="text-xs text-blue-500">🙏 {p.prayer_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}