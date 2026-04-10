import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Users, Copy, CheckCircle } from 'lucide-react';

export default function CallInterface({ 
  call, 
  callMode = 'audio', 
  participants = [], 
  isMe = false,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  isMicOn = true,
  isVideoOn = false,
  agoraChannelId
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyChannelId = () => {
    navigator.clipboard.writeText(agoraChannelId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const durationSeconds = call?.duration_seconds || 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      {/* Main Call Area */}
      <div className="w-full max-w-4xl space-y-6">
        {/* Video Grid (if video mode) */}
        {callMode === 'video' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Self Video */}
            <Card className="bg-black aspect-video flex items-center justify-center border border-gray-700">
              <div className="text-center text-white">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Your Video</p>
                <p className="text-xs text-gray-400 mt-1">(Agora video stream will appear here)</p>
              </div>
            </Card>

            {/* Remote Participants */}
            {participants.map(participant => (
              <Card
                key={participant.id}
                className="bg-black aspect-video flex items-center justify-center border border-gray-700 relative"
              >
                <div className="text-center text-white">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{participant.user_name}</p>
                  {participant.is_speaking && (
                    <p className="text-xs text-green-400 mt-1">🎙️ Speaking</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Audio Mode - Participant List */}
        {callMode === 'audio' && (
          <Card className="bg-gray-800 p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">In Call</h2>
            <div className="space-y-2 mb-6">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="text-white">
                    <p className="font-medium">{participant.user_name}</p>
                    {participant.is_speaking && (
                      <p className="text-xs text-green-400">🎙️ Speaking</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {participant.status === 'joined' ? '✓ Connected' : 'Connecting...'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Call Duration */}
        <div className="text-center">
          <p className="text-4xl font-bold text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-6 bg-gray-800/50 rounded-2xl p-6 backdrop-blur">
          {/* Mic Toggle */}
          <Button
            onClick={onToggleMic}
            className={`rounded-full w-16 h-16 ${
              isMicOn
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isMicOn ? 'Mute mic' : 'Unmute mic'}
          >
            {isMicOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </Button>

          {/* Video Toggle (if video mode) */}
          {callMode === 'video' && (
            <Button
              onClick={onToggleVideo}
              className={`rounded-full w-16 h-16 ${
                isVideoOn
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </Button>
          )}

          {/* End Call Button */}
          <Button
            onClick={onEndCall}
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Agora Channel Info */}
        {agoraChannelId && (
          <Card className="bg-gray-800 p-4 text-center">
            <p className="text-sm text-gray-400 mb-2">Agora Channel ID</p>
            <div className="flex items-center justify-center gap-2 bg-gray-900 rounded p-3">
              <code className="text-sm font-mono text-gray-300">{agoraChannelId}</code>
              <Button
                onClick={handleCopyChannelId}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Integration ready • Connect your Agora keys in Dashboard
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}