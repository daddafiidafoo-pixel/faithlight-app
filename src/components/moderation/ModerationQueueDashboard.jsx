import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Clock, Flag, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ModerationQueueDashboard({ userId }) {
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState(null);

  // Fetch flagged content
  const { data: flaggedContent = [], isLoading: flaggedLoading } = useQuery({
    queryKey: ['flaggedContent'],
    queryFn: async () => {
      try {
        const flagged = await base44.asServiceRole.entities.FlaggedContent.filter(
          { status: 'pending_review' },
          '-created_date',
          20
        );
        return flagged || [];
      } catch (err) {
        console.warn('Failed to fetch flagged content:', err);
        return [];
      }
    },
    retry: 0,
  });

  // Fetch moderation actions
  const { data: moderationActions = [] } = useQuery({
    queryKey: ['moderationActions'],
    queryFn: async () => {
      try {
        const actions = await base44.asServiceRole.entities.ModerationAction.filter(
          { status: 'under_review' },
          '-created_date',
          30
        );
        return actions || [];
      } catch (err) {
        console.warn('Failed to fetch moderation actions:', err);
        return [];
      }
    },
    retry: 0,
  });

  // Fetch user safety profiles for review
  const { data: usersUnderReview = [] } = useQuery({
    queryKey: ['usersUnderReview'],
    queryFn: async () => {
      try {
        const users = await base44.asServiceRole.entities.UserSafetyProfile.filter(
          { is_flagged_for_review: true },
          '-trust_score',
          10
        );
        return users || [];
      } catch (err) {
        console.warn('Failed to fetch users under review:', err);
        return [];
      }
    },
    retry: 0,
  });

  // Approve content
  const approveMutation = useMutation({
    mutationFn: async (flaggedId) => {
      return base44.asServiceRole.entities.FlaggedContent.update(flaggedId, {
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
    },
  });

  // Remove content
  const removeMutation = useMutation({
    mutationFn: async (flaggedId) => {
      return base44.asServiceRole.entities.FlaggedContent.update(flaggedId, {
        status: 'removed',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
    },
  });

  // Dismiss flag
  const dismissMutation = useMutation({
    mutationFn: async (flaggedId) => {
      return base44.asServiceRole.entities.FlaggedContent.update(flaggedId, {
        status: 'dismissed',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
    },
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hate_speech':
      case 'harassment':
        return '⚠️';
      case 'misinformation':
        return '🚫';
      case 'doctrinal_concern':
        return '📖';
      case 'cultural_insensitivity':
        return '🌍';
      case 'spam':
        return '📧';
      default:
        return '🚩';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">{flaggedContent.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Actions Under Review</p>
            <p className="text-3xl font-bold text-red-600">{moderationActions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Users Flagged</p>
            <p className="text-3xl font-bold text-yellow-600">{usersUnderReview.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flagged-content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flagged-content">🚩 Flagged Content ({flaggedContent.length})</TabsTrigger>
          <TabsTrigger value="user-safety">👤 User Safety ({usersUnderReview.length})</TabsTrigger>
          <TabsTrigger value="moderation-log">📋 Recent Actions</TabsTrigger>
        </TabsList>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged-content" className="space-y-4">
          {flaggedLoading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : flaggedContent.length === 0 ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">All Caught Up!</p>
                <p className="text-sm text-green-700">No pending content review.</p>
              </CardContent>
            </Card>
          ) : (
            flaggedContent.map((item) => (
              <Card key={item.id} className={`border-2 ${getSeverityColor(item.priority)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(item.ai_categories?.[0])}</span>
                        <Badge className={getSeverityColor(item.priority)}>
                          {item.priority.toUpperCase()}
                        </Badge>
                        {item.flagging_method === 'ai_filter' && (
                          <Badge variant="outline">AI Flagged</Badge>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        {item.content_type} by {item.author_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{item.content_preview}</p>
                    </div>
                    {item.ai_confidence && (
                      <p className="text-xs text-gray-600">
                        Confidence: {(item.ai_confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ai_categories?.map((cat, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cat.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(item.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => removeMutation.mutate(item.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissMutation.mutate(item.id)}
                      disabled={dismissMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* User Safety Tab */}
        <TabsContent value="user-safety" className="space-y-4">
          {usersUnderReview.length === 0 ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">No Flagged Users</p>
              </CardContent>
            </Card>
          ) : (
            usersUnderReview.map((profile) => (
              <Card key={profile.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">User ID: {profile.user_id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Violations: {profile.total_violations} | Warnings: {profile.total_warnings}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">Trust Score</p>
                      <p className={`text-2xl font-bold ${profile.trust_score > 70 ? 'text-green-600' : profile.trust_score > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {profile.trust_score}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.active_ban_until && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-sm text-red-700 font-semibold">🔒 Banned Until</p>
                      <p className="text-sm text-red-600">{new Date(profile.active_ban_until).toLocaleDateString()}</p>
                    </div>
                  )}
                  {profile.active_mute_until && (
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-semibold">🔇 Muted Until</p>
                      <p className="text-sm text-yellow-600">{new Date(profile.active_mute_until).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recent Violations:</p>
                    {profile.violation_history?.slice(0, 3).map((v, idx) => (
                      <p key={idx} className="text-xs text-gray-600">
                        • {v.category} ({new Date(v.date).toLocaleDateString()})
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Moderation Log Tab */}
        <TabsContent value="moderation-log" className="space-y-4">
          {moderationActions.length === 0 ? (
            <p className="text-center text-gray-600">No recent moderation actions.</p>
          ) : (
            moderationActions.slice(0, 10).map((action) => (
              <Card key={action.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{action.user_name}</p>
                      <p className="text-sm text-gray-600">{action.violation_category}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Action: <Badge className="ml-1">{action.action_taken}</Badge>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(action.created_date).toLocaleDateString()}
                      </p>
                      <Badge className="mt-1" variant={action.is_repeat_violation ? 'destructive' : 'outline'}>
                        {action.is_repeat_violation ? '⚠️ Repeat' : 'First'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}