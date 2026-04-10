import React, { useState, useEffect } from 'react';
import { Download, Trash2, Play, Pause, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [audioRef] = useState(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('fl_audio_downloads') || '[]');
    setDownloads(saved);

    const updateTime = () => setCurrentTime(audioRef.current?.currentTime || 0);
    const updateDuration = () => setDuration(audioRef.current?.duration || 0);

    audioRef.current.addEventListener('timeupdate', updateTime);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);
    audioRef.current.addEventListener('ended', () => setPlaying(null));

    return () => {
      audioRef.current.removeEventListener('timeupdate', updateTime);
      audioRef.current.removeEventListener('loadedmetadata', updateDuration);
      audioRef.current.removeEventListener('ended', () => setPlaying(null));
    };
  }, [audioRef]);

  const playTrack = (download) => {
    if (playing?.id === download.id) {
      audioRef.current.pause();
      setPlaying(null);
    } else {
      audioRef.current.src = download.blobUrl;
      audioRef.current.play();
      setPlaying(download);
    }
  };

  const deleteTrack = (id) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('fl_audio_downloads', JSON.stringify(updated));
    if (playing?.id === id) {
      audioRef.current.pause();
      setPlaying(null);
    }
    toast('Download removed', { icon: '🗑️' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-8 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Download size={20} />
            </div>
            <h1 className="text-2xl font-bold">Downloaded Audio</h1>
          </div>
          <p className="text-blue-100 text-sm">Manage offline audio files</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        {downloads.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-12 text-center">
            <Download size={40} className="mx-auto text-indigo-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">No downloads yet</h2>
            <p className="text-gray-500 text-sm">Download audio tracks from the player to listen offline</p>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map((download) => (
              <div
                key={download.id}
                className={`bg-white rounded-2xl border border-gray-200 p-4 transition-all ${
                  playing?.id === download.id ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Play button */}
                  <button
                    onClick={() => playTrack(download)}
                    className="flex-shrink-0 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                    aria-label={playing?.id === download.id ? 'Pause' : 'Play'}
                  >
                    {playing?.id === download.id ? (
                      <Pause size={18} fill="white" />
                    ) : (
                      <Play size={18} fill="white" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{download.title}</h3>
                    {download.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{download.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Downloaded {formatDate(download.downloadedAt)}
                    </p>

                    {/* Progress bar */}
                    {playing?.id === download.id && (
                      <div className="mt-2">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{
                              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTrack(download.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Delete download"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Storage info */}
        {downloads.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Volume2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">📱 Offline Listening</p>
                <p>Downloaded files are stored locally and can be played without internet connection.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}