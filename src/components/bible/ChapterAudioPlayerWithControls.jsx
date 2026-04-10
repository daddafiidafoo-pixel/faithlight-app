import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export default function ChapterAudioPlayerWithControls({ 
  book, 
  chapter, 
  audioUrl, 
  isDarkMode = false,
  onClose 
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load audio when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      setLoaded(true);
    }
  }, [audioUrl]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        toast.error('Failed to play audio');
        setPlaying(false);
      });
      setPlaying(true);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
    }
  };

  const handleSeek = (e) => {
    if (!duration || !audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const downloadForOffline = async () => {
    if (!audioUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const downloads = JSON.parse(localStorage.getItem('fl_audio_downloads') || '[]');
      
      const downloadId = Date.now().toString();
      downloads.push({
        id: downloadId,
        title: `${book} ${chapter}`,
        type: 'chapter',
        src: audioUrl,
        blobUrl: URL.createObjectURL(blob),
        downloadedAt: new Date().toISOString(),
        duration: duration,
        book,
        chapter,
      });
      
      localStorage.setItem('fl_audio_downloads', JSON.stringify(downloads));
      toast.success(`✅ ${book} ${chapter} downloaded for offline listening`);
    } catch (err) {
      toast.error('Failed to download audio');
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold" style={{ color: textColor }}>🎧 Listen to {book} {chapter}</h4>
        <button 
          onClick={onClose}
          className="p-1 hover:opacity-70 transition-opacity"
          title="Close player"
        >
          <X size={16} style={{ color: textColor }} />
        </button>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={() => setLoaded(true)}
      />

      {/* Progress bar */}
      <div 
        className="h-1 bg-gray-200 rounded-full mb-3 cursor-pointer"
        style={{ backgroundColor: isDarkMode ? '#2A2F2C' : '#E6E6E6' }}
        onClick={handleSeek}
      >
        <div 
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs mb-3" style={{ color: textColor, opacity: 0.7 }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls row 1: Playback */}
      <div className="flex items-center gap-2 mb-3">
        {/* Rewind 15s */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleSkipBack}
          disabled={!loaded}
          className="h-9 w-9 p-0"
          title="Rewind 15 seconds"
        >
          <SkipBack size={16} />
        </Button>

        {/* Play/Pause */}
        <Button
          size="sm"
          onClick={togglePlay}
          disabled={!loaded}
          className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {!loaded ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Loading...
            </>
          ) : playing ? (
            <>
              <Pause size={16} /> Pause
            </>
          ) : (
            <>
              <Play size={16} /> Play
            </>
          )}
        </Button>

        {/* Skip forward 15s */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleSkipForward}
          disabled={!loaded}
          className="h-9 w-9 p-0"
          title="Skip forward 15 seconds"
        >
          <SkipForward size={16} />
        </Button>
      </div>

      {/* Controls row 2: Speed & Download */}
      <div className="flex items-center gap-2">
        {/* Speed selector */}
        <select
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          disabled={!loaded}
          className="text-xs px-2 py-1.5 rounded border flex-1"
          style={{ 
            backgroundColor: isDarkMode ? '#2A2F2C' : '#F5F5F5',
            borderColor: borderColor,
            color: textColor
          }}
          title="Playback speed"
        >
          {SPEED_OPTIONS.map(s => (
            <option key={s} value={s}>{s}× Speed</option>
          ))}
        </select>

        {/* Download for offline */}
        <Button
          size="sm"
          variant="outline"
          onClick={downloadForOffline}
          disabled={!loaded || downloading}
          className="h-9 px-2 gap-1"
          title="Download for offline listening"
        >
          {downloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span className="hidden sm:inline text-xs">Offline</span>
        </Button>
      </div>

      <p className="text-xs mt-2" style={{ color: textColor, opacity: 0.6 }}>
        Controls: Play/Pause • Rewind/Skip ±15s • Adjust speed • Download for offline
      </p>
    </div>
  );
}