import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Trash2, ExternalLink } from 'lucide-react';

export default function ListenLater() {
  const [savedEpisodes, setSavedEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    loadSavedEpisodes();
  }, []);

  const loadSavedEpisodes = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUser(currentUser);

      const saved = await base44.entities.SavedPodcastEpisode.filter({
        user_email: currentUser.email,
      }, '-saved_at', 50);
      setSavedEpisodes(saved || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from Listen Later?')) return;
    try {
      await base44.entities.SavedPodcastEpisode.delete(id);
      setSavedEpisodes(savedEpisodes.filter(ep => ep.id !== id));
    } catch (error) {
      console.error('Error deleting episode:', error);
      alert('Failed to delete episode');
    }
  };

  const handleUpdateProgress = async (episodeId, position) => {
    try {
      await base44.entities.SavedPodcastEpisode.update(episodeId, {
        current_position: position,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-gray-600">Please log in to view saved episodes</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12">Loading episodes...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">📚 Listen Later</h1>
        <p className="text-gray-600 mb-8">Your saved podcast episodes</p>

        {savedEpisodes.length > 0 ? (
          <div className="space-y-4">
            {savedEpisodes.map((episode) => (
              <Card
                key={episode.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  selectedEpisode?.id === episode.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedEpisode(episode)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{episode.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{episode.podcast_name}</p>
                    <p className="text-sm text-gray-700 mt-2">{episode.description}</p>

                    {episode.related_verses && episode.related_verses.length > 0 && (
                      <div className="mt-3">
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

                    {episode.current_position > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(episode.current_position / episode.duration_seconds) * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.floor(episode.current_position / 60)}:{String(episode.current_position % 60).padStart(2, '0')} / {Math.floor(episode.duration_seconds / 60)}:{String(episode.duration_seconds % 60).padStart(2, '0')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(episode.id);
                      }}
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No saved episodes yet. Add episodes from the Podcasts page!</p>
          </Card>
        )}
      </div>
    </div>
  );
}