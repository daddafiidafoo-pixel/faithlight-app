import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Bookmark, Volume2, Clock } from 'lucide-react';

const SAMPLE_PODCASTS = [
  {
    id: 1,
    name: 'The Bible Project',
    description: 'Exploring the Bible\'s grand narrative',
    episodes: [
      {
        id: 'ep1',
        title: 'The Gospel of Mark',
        description: 'Understanding Mark\'s account of Jesus',
        url: 'https://example.com/episode1.mp3',
        duration_seconds: 1800,
        related_verses: ['Mark 1:1', 'Mark 1:14-15'],
        published_date: '2024-03-10T00:00:00Z',
      },
      {
        id: 'ep2',
        title: 'Proverbs: Wisdom for Life',
        description: 'Ancient wisdom applied today',
        url: 'https://example.com/episode2.mp3',
        duration_seconds: 2400,
        related_verses: ['Proverbs 1:1', 'Proverbs 1:7'],
        published_date: '2024-03-03T00:00:00Z',
      },
    ],
  },
  {
    id: 2,
    name: 'Bible.com Podcast',
    description: 'Daily Scripture and reflection',
    episodes: [
      {
        id: 'ep3',
        title: 'Grace Unlimited',
        description: 'Understanding God\'s grace',
        url: 'https://example.com/episode3.mp3',
        duration_seconds: 1200,
        related_verses: ['Ephesians 2:8-9', 'Romans 3:24'],
        published_date: '2024-03-12T00:00:00Z',
      },
    ],
  },
];

export default function ChristianPodcasts() {
  const [selectedPodcast, setSelectedPodcast] = useState(SAMPLE_PODCASTS[0]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [savedEpisodes, setSavedEpisodes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);

      if (currentUser) {
        const saved = await base44.entities.SavedPodcastEpisode.filter({
          user_email: currentUser.email,
        });
        setSavedEpisodes(saved?.map(e => e.episode_url) || []);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  const handleSaveEpisode = async (episode) => {
    if (!isLoggedIn) {
      alert('Please log in to save episodes');
      return;
    }

    if (savedEpisodes.includes(episode.url)) {
      setSavedEpisodes(savedEpisodes.filter(url => url !== episode.url));
    } else {
      try {
        await base44.entities.SavedPodcastEpisode.create({
          user_email: user.email,
          title: episode.title,
          podcast_name: selectedPodcast.name,
          episode_url: episode.url,
          description: episode.description,
          related_verses: episode.related_verses,
          duration_seconds: episode.duration_seconds,
          published_date: episode.published_date,
          saved_at: new Date().toISOString(),
        });
        setSavedEpisodes([...savedEpisodes, episode.url]);
      } catch (error) {
        console.error('Error saving episode:', error);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🎙️ Christian Podcasts</h1>
        <p className="text-gray-600 mb-8">Listen to teachings from major Christian ministries</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Podcast List */}
          <div>
            <h2 className="font-semibold mb-4">Podcasts</h2>
            <div className="space-y-2">
              {SAMPLE_PODCASTS.map((podcast) => (
                <Card
                  key={podcast.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedPodcast?.id === podcast.id
                      ? 'bg-purple-100 border-purple-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPodcast(podcast)}
                >
                  <p className="font-medium text-sm">{podcast.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{podcast.episodes.length} episodes</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Episodes */}
          <div className="lg:col-span-3">
            <h2 className="font-semibold mb-4">Episodes from {selectedPodcast.name}</h2>
            <p className="text-gray-600 text-sm mb-6">{selectedPodcast.description}</p>

            <div className="space-y-4">
              {selectedPodcast.episodes.map((episode) => (
                <Card
                  key={episode.id}
                  className={`p-4 cursor-pointer border-2 transition-all ${
                    selectedEpisode?.id === episode.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedEpisode(episode)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{episode.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{episode.description}</p>

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(episode.duration_seconds)}
                        </span>
                        <span>{new Date(episode.published_date).toLocaleDateString()}</span>
                      </div>

                      {episode.related_verses && episode.related_verses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Related Verses:</p>
                          <div className="flex flex-wrap gap-1">
                            {episode.related_verses.map((verse) => (
                              <span key={verse} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {verse}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-2 ml-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(!isPlaying);
                          setSelectedEpisode(episode);
                        }}
                        size="icon"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isPlaying && selectedEpisode?.id === episode.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEpisode(episode);
                        }}
                        variant={savedEpisodes.includes(episode.url) ? 'default' : 'outline'}
                        size="icon"
                      >
                        <Bookmark className={`w-4 h-4 ${savedEpisodes.includes(episode.url) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        {selectedEpisode && (
          <Card className="fixed bottom-0 left-0 right-0 p-4 rounded-none border-t border-gray-200 bg-white shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{selectedEpisode.title}</p>
                  <p className="text-xs text-gray-500">{selectedPodcast.name}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${selectedEpisode.duration_seconds ? (currentTime / selectedEpisode.duration_seconds) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}