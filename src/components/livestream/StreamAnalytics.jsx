import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, TrendingUp, Clock, Video } from 'lucide-react';

export default function StreamAnalytics({ streams }) {
  const totalViews = streams.reduce((sum, s) => sum + (s.total_views || 0), 0);
  const totalPeakViewers = streams.reduce((sum, s) => sum + (s.peak_viewers || 0), 0);
  const avgViewers = streams.length > 0 ? Math.round(totalPeakViewers / streams.length) : 0;
  const endedStreams = streams.filter(s => s.status === 'ended');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Streams</p>
                <p className="text-3xl font-bold">{streams.length}</p>
              </div>
              <Video className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Peak Viewers</p>
                <p className="text-3xl font-bold">{avgViewers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold">{endedStreams.length}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {streams
              .filter(s => s.total_views > 0)
              .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
              .slice(0, 5)
              .map(stream => (
                <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{stream.title}</p>
                    <p className="text-sm text-gray-600">
                      Peak: {stream.peak_viewers || 0} viewers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{stream.total_views}</p>
                    <p className="text-xs text-gray-600">views</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}