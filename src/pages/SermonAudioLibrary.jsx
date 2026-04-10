import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SermonAudioPlayer from '@/components/audio/SermonAudioPlayer';

export default function SermonAudioLibrary() {
  const [user, setUser] = useState(null);
  const [selectedSermon, setSelectedSermon] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.me().then(u => setUser(u)).catch(() => {});
      }
    });
  }, []);

  const { data: sermons = [] } = useQuery({
    queryKey: ['sermonAudios'],
    queryFn: () => base44.entities.SermonAudio.list('-created_date', 50)
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['sermonProgress', user?.email],
    queryFn: () => user ? base44.entities.SermonAudioProgress.filter(
      { userId: user.email },
      '-lastPlayedAt'
    ) : [],
    enabled: !!user
  });

  // Get user's in-progress or recently played sermons
  const inProgress = sermons.filter(s => 
    progress.some(p => p.sermonAudioId === s.id && !p.isCompleted)
  );

  const completed = sermons.filter(s =>
    progress.some(p => p.sermonAudioId === s.id && p.isCompleted)
  );

  const unwatched = sermons.filter(s =>
    !progress.some(p => p.sermonAudioId === s.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Music className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Sermon Audio Library</h1>
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Continue Listening</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map(sermon => (
                <SermonCard
                  key={sermon.id}
                  sermon={sermon}
                  onPlay={() => setSelectedSermon(sermon)}
                  user={user}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Sermons */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">All Sermons</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map(sermon => (
              <SermonCard
                key={sermon.id}
                sermon={sermon}
                onPlay={() => setSelectedSermon(sermon)}
                user={user}
              />
            ))}
          </div>
        </div>

        {/* Player */}
        {selectedSermon && (
          <SermonAudioPlayer
            sermon={selectedSermon}
            user={user}
            onClose={() => setSelectedSermon(null)}
          />
        )}
      </div>
    </div>
  );
}

function SermonCard({ sermon, onPlay, user }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {sermon.thumbnailUrl && (
        <img
          src={sermon.thumbnailUrl}
          alt={sermon.title}
          className="w-full h-32 object-cover bg-slate-200"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{sermon.title}</h3>
        {sermon.speaker && (
          <p className="text-sm text-slate-600 mb-2">{sermon.speaker}</p>
        )}
        <p className="text-xs text-slate-500 mb-4">
          {new Date(sermon.date).toLocaleDateString()}
        </p>
        <Button
          onClick={onPlay}
          className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Play className="w-4 h-4" /> Play
        </Button>
      </div>
    </div>
  );
}