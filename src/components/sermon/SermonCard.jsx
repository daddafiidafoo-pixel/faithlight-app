import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SermonCollectionManager from './SermonCollectionManager';
import FollowButton from '../forum/FollowButton';
import { BookOpen, User, Clock, Star, Download, Eye, FolderPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SermonCard({ sermon, currentUser, onView }) {
  const [showRating, setShowRating] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [rating, setRating] = useState(0);
  const queryClient = useQueryClient();

  const ratingMutation = useMutation({
    mutationFn: async (ratingValue) => {
      if (!currentUser || !sermon?.id) {
        throw new Error('Missing user or sermon data');
      }

      // Check if already rated
      const existing = await base44.entities.SermonRating.filter({
        sermon_id: sermon.id,
        user_id: currentUser.id
      });

      if (existing.length > 0) {
        return await base44.entities.SermonRating.update(existing[0].id, {
          rating: ratingValue
        });
      }

      return await base44.entities.SermonRating.create({
        sermon_id: sermon.id,
        user_id: currentUser.id,
        user_name: currentUser.full_name || currentUser.email,
        rating: ratingValue
      });
    },
    onSuccess: async () => {
      // Update sermon average rating
      try {
        const allRatings = await base44.entities.SermonRating.filter({ sermon_id: sermon.id });
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        
        await base44.entities.SharedSermon.update(sermon.id, {
          average_rating: avg,
          ratings_count: allRatings.length
        });
      } catch (error) {
        console.error('Error updating sermon stats:', error);
      }

      queryClient.invalidateQueries(['community-sermons']);
      toast.success('Rating submitted!');
      setShowRating(false);
    },
    onError: (error) => {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating');
    }
  });

  const handleRating = (value) => {
    setRating(value);
    ratingMutation.mutate(value);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{sermon.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{sermon.summary || sermon.topic}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">
                {sermon.average_rating ? sermon.average_rating.toFixed(1) : 'New'}
              </span>
            </div>
            {sermon.rating_count > 0 && (
              <span className="text-xs text-gray-500">
                {sermon.rating_count} {sermon.rating_count === 1 ? 'rating' : 'ratings'}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span>{sermon.passage_references || 'Various passages'}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{sermon.author_name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{sermon.length_minutes} minutes</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-100 text-blue-800">{sermon.style}</Badge>
          <Badge className="bg-purple-100 text-purple-800">{sermon.audience}</Badge>
          {sermon.sermon_series && (
            <Badge className="bg-indigo-100 text-indigo-800">
              {sermon.sermon_series} {sermon.series_part && `#${sermon.series_part}`}
            </Badge>
          )}
          {sermon.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button onClick={() => onView(sermon)} className="flex-1 gap-2" size="sm">
              <Eye className="w-4 h-4" />
              View
            </Button>
            {currentUser && (
              <Button 
                onClick={() => setShowCollectionModal(true)} 
                variant="outline" 
                size="sm" 
                className="gap-2"
                title="Add to collection"
              >
                <FolderPlus className="w-4 h-4" />
              </Button>
            )}
          {!showRating ? (
            <Button onClick={() => setShowRating(true)} variant="outline" size="sm" className="gap-2">
              <Star className="w-4 h-4" />
              Rate
            </Button>
          ) : (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 cursor-pointer ${
                    rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                  }`}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>
          )}
          </div>
          {currentUser && sermon.sermon_series && (
            <FollowButton
              currentUser={currentUser}
              followingType="sermon_series"
              followingId={sermon.sermon_series}
              followingName={sermon.sermon_series}
              variant="outline"
              size="sm"
            />
          )}
        </div>
      </CardContent>

      {/* Collection Modal */}
      {showCollectionModal && currentUser && (
        <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to Collection</DialogTitle>
            </DialogHeader>
            <SermonCollectionManager 
              user={currentUser} 
              sermon={sermon}
              onClose={() => setShowCollectionModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}