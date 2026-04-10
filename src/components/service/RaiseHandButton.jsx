import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Hand, CheckCircle } from 'lucide-react';

export default function RaiseHandButton({ roomId, userId, userRole }) {
  const [hasRequest, setHasRequest] = useState(null);
  const [requestType, setRequestType] = useState('question');
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  // Check if user has active request (prevent duplicates)
  useEffect(() => {
    const checkRequest = async () => {
      try {
        const reqs = await base44.entities.ServiceSpeakerRequest.filter(
          { room_id: roomId, user_id: userId },
          '-requested_at',
          1
        );
        // Show if has pending, approved, or speaking
        const activeReq = reqs.find((r) =>
          ['pending', 'approved', 'speaking'].includes(r.status)
        );
        setHasRequest(activeReq || null);
      } catch (e) {
        console.error('Failed to check request:', e);
      }
    };

    if (userId) checkRequest();
  }, [roomId, userId]);

  // Subscribe to status updates
  useEffect(() => {
    if (!hasRequest) return;

    const unsubscribe = base44.entities.ServiceSpeakerRequest.subscribe((event) => {
      if (event.data.room_id === roomId && event.id === hasRequest.id) {
        setHasRequest(event.data);
        if (event.data.status === 'denied') {
          setTimeout(() => setHasRequest(null), 5000);
        }
      }
    });
    return unsubscribe;
  }, [roomId, hasRequest]);

  const handleRaiseHand = async () => {
    try {
      setLoading(true);
      await base44.entities.ServiceSpeakerRequest.create({
        room_id: roomId,
        user_id: userId,
        user_name: (await base44.auth.me()).full_name,
        request_type: requestType,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      setHasRequest({ id: 'temp' });
    } catch (e) {
      console.error('Failed to raise hand:', e);
      alert('Failed to raise hand');
    } finally {
      setLoading(false);
    }
  };

  // Hide if user is already speaker/host or if chat is locked
  if (userRole !== 'audience') {
    return null;
  }

  if (hasRequest?.status === 'denied') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-red-900">✗ Request denied</p>
            <p className="text-xs text-red-700">{hasRequest.notes || 'Try again later'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasRequest?.status === 'approved') {
    const isVideo = hasRequest.approved_with_video;
    return (
      <Card className={`border-2 ${isVideo ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">{isVideo ? '🎥' : '🎙️'}</p>
            <p className={`text-sm font-semibold ${isVideo ? 'text-green-900' : 'text-blue-900'}`}>
              {isVideo ? 'You\'re on stage!' : 'You can speak now'}
            </p>
            <p className={`text-xs ${isVideo ? 'text-green-700' : 'text-blue-700'}`}>
              {isVideo ? 'Get ready for video!' : 'Click "Start Speaking" when ready'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasRequest?.status === 'pending') {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">⏳ Waiting…</p>
              <p className="text-xs text-orange-700">Host is reviewing your request</p>
            </div>
            <Badge className="bg-orange-600 animate-pulse">Pending</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasRequest?.status === 'speaking') {
    return (
      <Card className="bg-green-50 border-green-300 border-2">
        <CardContent className="pt-6">
          <div className="text-center space-y-2 animate-pulse">
            <p className="text-lg">🎤</p>
            <p className="text-sm font-semibold text-green-900">You're speaking!</p>
            <p className="text-xs text-green-700">Everyone can hear you</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Hand className="w-4 h-4" />
          Raise Hand
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>What do you want to share?</AlertDialogTitle>
        <div className="space-y-3">
          {[
            { value: 'question', label: '❓ Question', desc: 'Ask the speaker' },
            { value: 'testimony', label: '✝️ Testimony', desc: 'Share your story' },
            { value: 'prayer', label: '🙏 Prayer Request', desc: 'Prayer concern' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                requestType === option.value
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={requestType === option.value}
                onChange={(e) => setRequestType(e.target.value)}
              />
              <div>
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRaiseHand}
            disabled={loading}
            className="bg-indigo-600"
          >
            {loading ? 'Sending...' : 'Raise Hand'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}