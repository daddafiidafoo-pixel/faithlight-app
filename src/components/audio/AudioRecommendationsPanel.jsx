import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Plus, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const REASON_LABELS = {
  listening_history: 'Based on your listening history',
  study_plan_alignment: 'Aligns with your study plan',
  interest_match: 'Matches your interests',
  progression_level: 'Matches your learning level',
  similar_content: 'Similar to content you enjoy',
};

export default function AudioRecommendationsPanel({ userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({}); // { recIndex: 'like'|'dislike' }

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('getAudioRecommendations', {});
      setRecommendations(response.data?.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = (book, chapter) => {
    toast.success(`Added ${book} ${chapter} to playlist`);
  };

  const handlePlayAudio = (book, chapter) => {
    toast.info(`Playing ${book} ${chapter}`);
  };

  const handleFeedback = async (idx, rec, type) => {
    setFeedback(prev => ({ ...prev, [idx]: type }));
    try {
      await base44.entities.AudioRecommendation.create({
        user_id: userId,
        book: rec.book,
        chapter: rec.chapter,
        reason: rec.reason,
        confidence_score: rec.confidence,
        user_feedback: type,
        feedback_at: new Date().toISOString(),
      });
      toast.success(type === 'like' ? 'Great! We\'ll recommend more like this.' : 'Got it — we\'ll adjust your recommendations.');
    } catch (e) {
      // feedback is non-critical, silently ignore
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            onClick={fetchRecommendations}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommended for You</CardTitle>
        <Button
          onClick={fetchRecommendations}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {rec.book} {rec.chapter}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {REASON_LABELS[rec.reason] || rec.reason}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-gray-500">Match</div>
                      <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {rec.confidence}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    onClick={() => handlePlayAudio(rec.book, rec.chapter)}
                    size="sm"
                    className="gap-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Play className="w-3 h-3" />
                    Play
                  </Button>
                  <Button
                    onClick={() => handleAddToPlaylist(rec.book, rec.chapter)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Playlist
                  </Button>
                  <button
                    onClick={() => handleFeedback(idx, rec, 'like')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${feedback[idx] === 'like' ? 'bg-green-100 border-green-400 text-green-700' : 'border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600'}`}
                    title="Like this recommendation"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(idx, rec, 'dislike')}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${feedback[idx] === 'dislike' ? 'bg-red-100 border-red-400 text-red-700' : 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-600'}`}
                    title="Not for me"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Start listening to get personalized recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}