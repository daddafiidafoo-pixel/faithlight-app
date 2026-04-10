import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EventArchiveViewer({ eventId, isHost }) {
  const [participants, setParticipants] = useState([]);
  const [moderationLogs, setModerationLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArchive = async () => {
      try {
        const [participantData, moderationData] = await Promise.all([
          base44.entities.ParticipantLog.filter({ event_id: eventId }),
          base44.entities.ModerationLog.filter({ event_id: eventId })
        ]);

        setParticipants(participantData);
        setModerationLogs(moderationData);
      } catch (error) {
        console.error('Error loading archive:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArchive();
  }, [eventId]);

  if (loading) {
    return <div className="text-center py-8">Loading archive...</div>;
  }

  const roleColors = {
    host: 'bg-red-100 text-red-800',
    cohost: 'bg-purple-100 text-purple-800',
    speaker: 'bg-blue-100 text-blue-800',
    listener: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="participants" className="w-full">
        <TabsList>
          <TabsTrigger value="participants" className="gap-2">
            <Users className="w-4 h-4" />
            Participants ({participants.length})
          </TabsTrigger>
          {isHost && (
            <TabsTrigger value="moderation" className="gap-2">
              <Shield className="w-4 h-4" />
              Moderation ({moderationLogs.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="participants" className="space-y-3">
          {participants.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(p.joined_at).toLocaleTimeString()} - {p.left_at ? new Date(p.left_at).toLocaleTimeString() : 'still joined'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[p.role]}>
                      {p.role}
                    </Badge>
                    {p.duration_seconds && (
                      <span className="text-xs text-gray-600">
                        {Math.floor(p.duration_seconds / 60)}m
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {isHost && (
          <TabsContent value="moderation" className="space-y-3">
            {moderationLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No moderation actions recorded</p>
            ) : (
              moderationLogs.map(log => (
                <Card key={log.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-red-600">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          by {log.actor_user_id} {log.target_user_id && `→ ${log.target_user_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                      {log.metadata && (
                        <pre className="text-xs bg-gray-100 p-2 rounded max-w-xs overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}