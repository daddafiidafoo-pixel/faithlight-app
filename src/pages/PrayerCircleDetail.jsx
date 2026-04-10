import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Flag, Trash2, Users, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function PrayerCircleDetail() {
  const { circleId } = useParams();
  const [newRequest, setNewRequest] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Fetch circle
  const { data: circle, isLoading: circleLoading } = useQuery({
    queryKey: ['circle', circleId],
    queryFn: () => base44.entities.PrayerCircle.read(circleId),
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['circleMembers', circleId],
    queryFn: () =>
      base44.entities.CircleMember.filter({ circle_id: circleId }, '-joined_at'),
  });

  // Fetch prayer requests
  const { data: prayers = [] } = useQuery({
    queryKey: ['circlePrayers', circleId],
    queryFn: () =>
      base44.entities.CirclePrayerRequest.filter(
        { circle_id: circleId },
        '-created_date'
      ),
  });

  // Post prayer request
  const postMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('postPrayerRequest', {
        circle_id: circleId,
        text: newRequest,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circlePrayers', circleId] });
      setNewRequest('');
      toast.success('Prayer request posted!');
    },
    onError: (err) => toast.error(err.message),
  });

  // Leave circle
  const leaveMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('prayerCircleLeave', {
        circle_id: circleId,
      }),
    onSuccess: () => {
      window.location.href = '/prayer-circles';
    },
    onError: (err) => toast.error(err.message),
  });

  if (circleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600">Circle not found</p>
          <Link to="/prayer-circles">
            <Button className="mt-4">Back to Circles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.email === circle.created_by;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          to="/prayer-circles"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{circle.name}</h1>
            {circle.description && (
              <p className="text-gray-600 mt-2">{circle.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {circle.member_count} members
              </span>
              <span>{circle.post_count} prayers</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded">
                Admin
              </span>
            )}
            <Button
              onClick={() => leaveMutation.mutate()}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Post new prayer */}
        <Card className="p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Share a Prayer Request
          </label>
          <Textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Share what's on your heart..."
            rows={4}
            className="mb-4"
          />
          <Button
            onClick={() => postMutation.mutate()}
            disabled={!newRequest.trim() || postMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {postMutation.isPending ? 'Posting...' : 'Post Prayer'}
          </Button>
        </Card>

        {/* Prayer feed */}
        <div className="space-y-4">
          {prayers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">
                No prayers yet. Be the first to share!
              </p>
            </Card>
          ) : (
            prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                circle={circle}
                currentUser={currentUser}
                isAdmin={isAdmin}
                circleId={circleId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PrayerCard({ prayer, circle, currentUser, isAdmin, circleId }) {
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('reportCirclePost', {
        prayer_request_id: prayer.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circlePrayers', circleId] });
      toast.success('Post reported');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('deletePrayerRequest', {
        prayer_request_id: prayer.id,
        circle_id: circleId,
        is_admin: isAdmin,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circlePrayers', circleId] });
      queryClient.invalidateQueries({ queryKey: ['circle', circleId] });
      toast.success('Post deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  const canDelete =
    currentUser?.email === prayer.user_email || isAdmin;
  const alreadyReported = prayer.reported_by?.includes(currentUser?.email);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900">{prayer.user_name}</p>
          <p className="text-xs text-gray-500">
            {new Date(prayer.created_date).toLocaleDateString()}
          </p>
        </div>
        {prayer.is_reported && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            Reported
          </span>
        )}
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{prayer.text}</p>

      <div className="flex gap-2">
        {!alreadyReported && (
          <Button
            onClick={() => reportMutation.mutate()}
            disabled={reportMutation.isPending}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-red-600"
          >
            <Flag className="w-4 h-4" />
          </Button>
        )}
        {canDelete && (
          <Button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}