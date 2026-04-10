import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, Video, Clock, Users, Trash2, PhoneOff } from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { toast } from 'sonner';
import CallHistoryCard from '@/components/CallHistoryCard';

export default function CallHistory() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, audio, video

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    getUser();
  }, []);

  // Fetch all calls involving the user
  const { data: calls = [], isLoading, refetch } = useQuery({
    queryKey: ['call-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get all calls where user is creator or a participant
      const allCalls = await base44.entities.Call.filter(
        { status: 'ended' },
        '-ended_at',
        100
      );

      const result = [];
      for (const call of allCalls) {
        if (call.created_by === user.id) {
          result.push(call);
        } else {
          // Check if user is a participant
          const participants = await base44.entities.CallParticipant.filter(
            { call_id: call.id },
            '',
            100
          );
          if (participants.some(p => p.user_id === user.id)) {
            result.push(call);
          }
        }
      }
      return result;
    },
    enabled: !!user?.id
  });

  // Delete call mutation
  const deleteCallMutation = useMutation({
    mutationFn: async (callId) => {
      await base44.entities.Call.update(callId, {
        is_archived: true
      });
    },
    onSuccess: () => {
      refetch();
      toast.success('Call removed from history');
    },
    onError: () => {
      toast.error('Failed to remove call');
    }
  });

  // Filter and search calls
  const filteredCalls = calls.filter(call => {
    const matchesMode = filterMode === 'all' || call.mode === filterMode;
    const matchesSearch = 
      call.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.conversation_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  const missedCalls = filteredCalls.filter(c => c.status === 'missed');
  const completedCalls = filteredCalls.filter(c => c.status !== 'missed');

  const getTotalDuration = (callsList) => {
    return callsList.reduce((acc, call) => acc + (call.duration_seconds || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
          </div>
          <p className="text-gray-600">View and manage your call history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCalls.length}</p>
                </div>
                <Phone className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(getTotalDuration(completedCalls) / 60)}m
                  </p>
                </div>
                <Clock className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missed Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{missedCalls.length}</p>
                </div>
                <PhoneOff className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterMode} onValueChange={setFilterMode} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="video" className="gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
        </Card>

        {/* Call History Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Calls ({completedCalls.length})</TabsTrigger>
            <TabsTrigger value="missed">Missed ({missedCalls.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">Loading call history...</p>
                </CardContent>
              </Card>
            ) : completedCalls.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No calls yet</p>
                </CardContent>
              </Card>
            ) : (
              completedCalls.map(call => (
                <CallHistoryCard
                  key={call.id}
                  call={call}
                  currentUser={user}
                  onDelete={() => deleteCallMutation.mutate(call.id)}
                  isDeleting={deleteCallMutation.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="missed" className="space-y-4">
            {missedCalls.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PhoneOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No missed calls</p>
                </CardContent>
              </Card>
            ) : (
              missedCalls.map(call => (
                <CallHistoryCard
                  key={call.id}
                  call={call}
                  currentUser={user}
                  onDelete={() => deleteCallMutation.mutate(call.id)}
                  isDeleting={deleteCallMutation.isPending}
                  isMissed={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}