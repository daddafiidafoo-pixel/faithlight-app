import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Video, Clock, Trash2, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CallHistoryCard({ call, currentUser, onDelete, isDeleting, isMissed }) {
  const [participants, setParticipants] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch call participants
        const parts = await base44.entities.CallParticipant.filter(
          { call_id: call.id },
          '',
          100
        );
        setParticipants(parts);

        // Fetch conversation details if exists
        if (call.conversation_id) {
          const conv = await base44.entities.Conversation.filter(
            { id: call.conversation_id },
            '',
            1
          );
          if (conv.length > 0) {
            setConversation(conv[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching call details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [call.id]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getOtherParticipantName = () => {
    if (call.type === 'direct' && participants.length > 0) {
      const other = participants.find(p => p.user_id !== currentUser?.id);
      return other?.user_name || call.created_by_name;
    }
    return call.created_by_name;
  };

  return (
    <Card className={isMissed ? 'border-red-200 bg-red-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Call Icon and Details */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-3 rounded-lg flex-shrink-0 ${
              isMissed 
                ? 'bg-red-100' 
                : call.mode === 'video' 
                  ? 'bg-indigo-100' 
                  : 'bg-blue-100'
            }`}>
              {isMissed ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : call.mode === 'video' ? (
                <Video className="w-6 h-6 text-indigo-600" />
              ) : (
                <Phone className="w-6 h-6 text-blue-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name and Type */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {getOtherParticipantName()}
                </h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize whitespace-nowrap">
                  {call.type}
                </span>
                {isMissed && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded whitespace-nowrap">
                    Missed
                  </span>
                )}
              </div>

              {/* Conversation Title (if group) */}
              {call.type === 'group' && conversation && (
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {conversation.title}
                </p>
              )}

              {/* Timestamp and Duration */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  {format(new Date(call.ended_at), 'MMM d, yyyy h:mm a')}
                </span>
                {!isMissed && call.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(call.duration_seconds)}
                  </span>
                )}
              </div>

              {/* Participants Count */}
              {call.type === 'group' && participants.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{participants.length} participants</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {call.conversation_id && !isMissed && (
              <Button
                onClick={() => {
                  window.location.href = `/DirectMessages?conversationId=${call.conversation_id}`;
                }}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call Again</span>
              </Button>
            )}
            <Button
              onClick={onDelete}
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}