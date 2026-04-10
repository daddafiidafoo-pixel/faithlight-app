import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function AgoraRemoteUser({ user, videoTrack, audioTrack, role }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !videoTrack) return;

    const play = async () => {
      try {
        if (videoTrack.isPlaying) {
          videoTrack.stop();
        }
        videoTrack.play(containerRef.current);
      } catch (err) {
        console.error('Error playing remote video:', err);
      }
    };

    play();

    return () => {
      if (videoTrack && videoTrack.isPlaying) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden group"
    >
      {/* User info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-semibold">{user.user_name}</p>
            <p className="text-gray-300 text-xs">{role}</p>
          </div>
          <div className="flex gap-1">
            {audioTrack && (
              <div className="bg-black bg-opacity-50 rounded p-1">
                {audioTrack.muted ? (
                  <MicOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Mic className="w-4 h-4 text-green-400" />
                )}
              </div>
            )}
            {videoTrack && (
              <div className="bg-black bg-opacity-50 rounded p-1">
                {videoTrack.enabled ? (
                  <Video className="w-4 h-4 text-green-400" />
                ) : (
                  <VideoOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role badge */}
      {['host', 'cohost', 'speaker'].includes(role) && (
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
          {role.toUpperCase()}
        </div>
      )}
    </div>
  );
}