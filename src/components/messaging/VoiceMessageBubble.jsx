import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Flag, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { toast } from 'sonner';

export default function VoiceMessageBubble({
  message,
  isOwn,
  onReport,
  onBlock,
}) {
  const { lang } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const audioRef = useRef(null);

  if (!message.audio_url) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-xs flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {lang === 'om' ? 'Ergaa sagalee hin jiru' : 'Voice message unavailable'}
        </div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = message.audio_url;
    a.download = `voice_${Date.now()}`;
    a.click();
    toast.success(lang === 'om' ? 'Gad facaasifamee' : 'Downloaded');
  };

  const handleReport = () => {
    onReport?.(message.id);
    setShowMenu(false);
    toast.success(lang === 'om' ? 'Raasifamee' : 'Reported');
  };

  const handleBlock = () => {
    onBlock?.(message.created_by);
    setShowMenu(false);
    toast.success(lang === 'om' ? 'Cufa jira' : 'User blocked');
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 gap-2`}>
      <audio
        ref={audioRef}
        src={message.audio_url}
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className={`rounded-lg p-4 max-w-xs ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={isOwn ? 'ghost' : 'outline'}
            onClick={handlePlayToggle}
            className={isOwn ? 'text-white hover:bg-blue-700' : ''}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <div className="flex flex-col">
            <span className="text-xs font-semibold">
              {lang === 'om' ? 'Sagalee' : 'Voice'}
            </span>
            <span className="text-xs">
              {message.audio_duration_sec
                ? formatDuration(message.audio_duration_sec)
                : '--'}
            </span>
          </div>
        </div>

        {/* Moderation menu */}
        {!isOwn && (
          <div className="mt-2 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋯
            </Button>

            {showMenu && (
              <div className="absolute bg-white border border-gray-200 rounded shadow-lg mt-2 py-1 z-10">
                <button
                  onClick={handleDownload}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  {lang === 'om' ? 'Gad Facaasu' : 'Download'}
                </button>
                <button
                  onClick={handleReport}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  <Flag className="w-4 h-4 inline mr-2" />
                  {lang === 'om' ? 'Raasii' : 'Report'}
                </button>
                <button
                  onClick={handleBlock}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  {lang === 'om' ? 'Cufi' : 'Block'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}