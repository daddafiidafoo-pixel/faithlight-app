import React from 'react';
import { X, Play, Trash2, ListMusic, GripVertical } from 'lucide-react';
import { useAudioPlayerStore } from './useAudioPlayerStore';

export default function AudioPlaylistPanel() {
  const {
    playlist, playlistIndex, togglePlaylist, removeFromPlaylist,
    clearPlaylist, playFromPlaylist, bookId, chapter,
  } = useAudioPlayerStore();

  return (
    <div
      className="fixed bottom-28 left-0 right-0 z-39 bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl max-h-64 overflow-y-auto"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ListMusic size={16} className="text-purple-600" />
          <span className="font-bold text-sm text-slate-800">Queue</span>
          {playlist.length > 0 && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              {playlist.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {playlist.length > 0 && (
            <button
              onClick={clearPlaylist}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
            >
              Clear all
            </button>
          )}
          <button onClick={togglePlaylist} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {playlist.length === 0 && (
        <div className="text-center py-8">
          <ListMusic size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">Queue is empty</p>
          <p className="text-xs text-slate-300 mt-1">Tap "Add to Queue" on any chapter</p>
        </div>
      )}

      {/* Playlist items */}
      <div className="divide-y divide-slate-50">
        {playlist.map((item, idx) => {
          const isActive = idx === playlistIndex ||
            (playlistIndex === -1 && item.bookId === bookId && item.chapter === chapter);
          return (
            <div
              key={`${item.bookId}-${item.chapter}-${idx}`}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive ? 'bg-purple-50' : 'hover:bg-slate-50'
              }`}
            >
              <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
              <button
                onClick={() => playFromPlaylist(idx)}
                className="flex-1 text-left min-w-0"
              >
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-purple-700' : 'text-slate-800'}`}>
                  {item.bookName} {item.chapter}
                </p>
                <p className="text-xs text-slate-400">Chapter {item.chapter} of {item.totalChapters}</p>
              </button>
              {isActive && (
                <div className="flex gap-0.5 items-end h-4 flex-shrink-0">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-1 bg-purple-500 rounded-full animate-pulse"
                      style={{ height: `${[8, 14, 10][i - 1]}px`, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => removeFromPlaylist(idx)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}