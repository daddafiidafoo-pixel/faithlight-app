import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Mic, Clock } from 'lucide-react';

export default function QAQueuePanel({ roomId, isHost, participants, room, onApprove }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const reqs = await base44.entities.ServiceSpeakerRequest.filter(
          { room_id: roomId },
          'requested_at',
          50
        );
        // Show pending, approved, and speaking (hide denied/done)
        setRequests(reqs.filter((r) => ['pending', 'approved', 'speaking'].includes(r.status)));
      } catch (e) {
        console.error('Failed to load requests:', e);
      }
    };
    loadRequests();
  }, [roomId]);

  useEffect(() => {
    const unsubscribe = base44.entities.ServiceSpeakerRequest.subscribe((event) => {
      if (event.data.room_id === roomId) {
        if (event.type === 'create') {
          if (['pending', 'approved', 'speaking'].includes(event.data.status)) {
            setRequests((prev) => [event.data, ...prev]);
          }
        }
        if (event.type === 'update') {
          if (['pending', 'approved', 'speaking'].includes(event.data.status)) {
            setRequests((prev) =>
              prev.some((r) => r.id === event.id)
                ? prev.map((r) => (r.id === event.id ? event.data : r))
                : [event.data, ...prev]
            );
          } else {
            setRequests((prev) => prev.filter((r) => r.id !== event.id));
          }
        }
      }
    });
    return unsubscribe;
  }, [roomId]);

  const handleApprove = async (reqId, userId) => {
    try {
      setLoading(true);
      // Update request
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
      });

      // Promote user to speaker (audio-only)
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          role: 'speaker',
          is_muted: false,
        });
      }

      onApprove?.();
    } catch (e) {
      console.error('Failed to approve:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSpeaking = async (reqId) => {
    try {
      setLoading(true);
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'speaking',
        started_speaking_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to start speaking:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async (reqId, userId) => {
    try {
      setLoading(true);
      // Mark request as done
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'done',
        completed_at: new Date().toISOString(),
      });

      // Demote user back to audience
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          role: 'audience',
          is_muted: true,
          is_on_stage: false,
        });
      }
    } catch (e) {
      console.error('Failed to mark done:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (reqId) => {
    try {
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'denied',
      });
    } catch (e) {
      console.error('Failed to deny:', e);
    }
  };

  const handleApproveAudio = async (reqId, userId) => {
    try {
      setLoading(true);
      // Update request - audio only
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_with_video: false,
      });

      // Promote user to speaker (audio-only)
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          role: 'speaker',
          is_muted: false,
          is_on_stage: false,
        });
      }
    } catch (e) {
      console.error('Failed to approve audio:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVideo = async (reqId, userId, room) => {
    const onStageCount = participants.filter((p) => p.is_on_stage && !p.left_at).length;

    if (onStageCount >= (room?.video_limit || 6)) {
      // Fallback to audio-only
      alert('Stage is full. Approving audio-only.');
      await handleApproveAudio(reqId, userId);
      return;
    }

    try {
      setLoading(true);
      // Update request - with video
      await base44.entities.ServiceSpeakerRequest.update(reqId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_with_video: true,
      });

      // Promote user to speaker + stage
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          role: 'speaker',
          is_muted: false,
          is_on_stage: true,
        });
      }
    } catch (e) {
      console.error('Failed to approve with video:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBringToStage = async (reqId, userId, room) => {
    const onStageCount = participants.filter((p) => p.is_on_stage && !p.left_at).length;
    if (onStageCount >= (room?.video_limit || 6)) {
      alert('Stage is full. Remove someone first.');
      return;
    }

    try {
      setLoading(true);
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          is_on_stage: true,
        });
      }
    } catch (e) {
      console.error('Failed to bring to stage:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromStage = async (userId) => {
    try {
      const parts = await base44.entities.ServiceRoomParticipant.filter(
        { room_id: roomId, user_id: userId },
        '-created_date',
        1
      );
      if (parts.length > 0) {
        await base44.entities.ServiceRoomParticipant.update(parts[0].id, {
          is_on_stage: false,
        });
      }
    } catch (e) {
      console.error('Failed to remove from stage:', e);
    }
  };

  if (!isHost) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Q&A Queue</h3>
            <Badge variant="outline">{requests.length}</Badge>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No active requests</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {requests.map((req) => {
                const isOnStage = participants.find(
                  (p) => p.user_id === req.user_id && p.is_on_stage
                );

                return (
                  <div
                    key={req.id}
                    className={`p-3 rounded-lg border ${
                      req.status === 'speaking'
                        ? 'bg-green-50 border-green-300'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {req.user_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {req.request_type === 'question' && '❓ Question'}
                          {req.request_type === 'testimony' && '✝️ Testimony'}
                          {req.request_type === 'prayer' && '🙏 Prayer'}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${
                          req.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : req.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {req.status === 'pending' && 'Pending'}
                        {req.status === 'approved' && 'Approved'}
                        {req.status === 'speaking' && '🎙️ Speaking'}
                      </Badge>
                    </div>

                    {/* Pending */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 gap-1"
                            >
                              🎙️ Audio
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Approve {req.user_name} (Audio Only)?</AlertDialogTitle>
                            <AlertDialogDescription>
                              They'll be unmuted and can speak. No video.
                            </AlertDialogDescription>
                            <div className="flex gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleApproveAudio(req.id, req.user_id)}
                                className="bg-blue-600"
                              >
                                Approve Audio
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>

                        {(() => {
                          const onStageCount = participants.filter(
                            (p) => p.is_on_stage && !p.left_at
                          ).length;
                          const videoLimit = room?.video_limit || 6;
                          return onStageCount < videoLimit ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 gap-1"
                                >
                                  🎥 Video
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>
                                  Approve {req.user_name} + Video?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  They'll be unmuted and brought on stage.
                                </AlertDialogDescription>
                                <div className="flex gap-3">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproveVideo(req.id, req.user_id, room)}
                                    className="bg-green-600"
                                  >
                                    Approve + Video
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 opacity-50 cursor-not-allowed"
                              disabled
                            >
                              🎥 Full
                            </Button>
                          );
                        })()}

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleDeny(req.id)}
                          disabled={loading}
                        >
                          <XCircle className="w-3 h-3" />
                          Deny
                        </Button>
                      </div>
                    )}

                    {/* Approved */}
                    {req.status === 'approved' && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() => handleStartSpeaking(req.id)}
                          disabled={loading}
                        >
                          <Mic className="w-3 h-3" />
                          Start Speaking
                        </Button>
                        {!isOnStage && !req.approved_with_video && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() =>
                              handleBringToStage(req.id, req.user_id, room)
                            }
                          >
                            🎥 Stage
                          </Button>
                        )}
                        {isOnStage && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleRemoveFromStage(req.user_id)}
                          >
                            🚫 Remove
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Speaking */}
                    {req.status === 'speaking' && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs bg-red-600 hover:bg-red-700 gap-1"
                          onClick={() => handleDone(req.id, req.user_id)}
                          disabled={loading}
                        >
                          ✓ Done
                        </Button>
                        {!isOnStage && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() =>
                              handleBringToStage(req.id, req.user_id, room)
                            }
                          >
                            🎥 Stage
                          </Button>
                        )}
                        {isOnStage && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleRemoveFromStage(req.user_id)}
                          >
                            🚫 Remove
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}