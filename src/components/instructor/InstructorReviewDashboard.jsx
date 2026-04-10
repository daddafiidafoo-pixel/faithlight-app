import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InstructorReviewDashboard({ instructorId }) {
  const [respondingToId, setRespondingToId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['instructor-reviews', instructorId],
    queryFn: async () => {
      const allReviews = await base44.entities.CourseReview.filter({
        instructor_id: instructorId,
      }, '-created_date');
      return allReviews || [];
    },
    enabled: !!instructorId,
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['instructor-responses', instructorId],
    queryFn: async () => {
      const allResponses = await base44.entities.ReviewResponse.filter({
        instructor_id: instructorId,
      });
      return allResponses || [];
    },
    enabled: !!instructorId,
  });

  const respondMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ReviewResponse.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-responses', instructorId] });
      setRespondingToId(null);
      setResponseText('');
    },
  });

  const handleSubmitResponse = async (reviewId) => {
    const user = await base44.auth.me();
    if (!responseText.trim()) {
      alert('Please write a response');
      return;
    }

    respondMutation.mutate({
      review_id: reviewId,
      instructor_id: instructorId,
      instructor_name: user.full_name,
      response_text: responseText,
      is_helpful: true,
    });
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading reviews...</div>;
  }

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const respondedCount = reviews.filter(r =>
    responses.some(res => res.review_id === r.id)
  ).length;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Group by rating
  const lowRatings = reviews.filter(r => r.rating <= 2);
  const mediumRatings = reviews.filter(r => r.rating === 3);
  const highRatings = reviews.filter(r => r.rating >= 4);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-indigo-600">{avgRating || 'N/A'}</p>
              {avgRating && (
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">{reviews.length} total reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Responded</p>
            <p className="text-3xl font-bold text-green-600">{respondedCount}</p>
            <p className="text-xs text-gray-600 mt-1">
              {reviews.length > 0 ? Math.round((respondedCount / reviews.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">High Ratings (4-5★)</p>
            <p className="text-3xl font-bold text-green-600">{highRatings.length}</p>
            <p className="text-xs text-gray-600 mt-1">
              {reviews.length > 0 ? Math.round((highRatings.length / reviews.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Low Ratings (1-2★)</p>
            <p className="text-3xl font-bold text-red-600">{lowRatings.length}</p>
            <p className="text-xs text-gray-600 mt-1">
              {reviews.length > 0 ? Math.round((lowRatings.length / reviews.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Review Categories */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
          <TabsTrigger value="low">Needs Attention ({lowRatings.length})</TabsTrigger>
          <TabsTrigger value="high">Positive ({highRatings.length})</TabsTrigger>
        </TabsList>

        {/* All Reviews */}
        <TabsContent value="all" className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map(review => {
              const hasResponse = responses.some(r => r.review_id === review.id);
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  hasResponse={hasResponse}
                  isResponding={respondingToId === review.id}
                  responseText={responseText}
                  onToggleRespond={() => {
                    if (respondingToId === review.id) {
                      setRespondingToId(null);
                    } else {
                      setRespondingToId(review.id);
                      setResponseText('');
                    }
                  }}
                  onResponseChange={setResponseText}
                  onSubmitResponse={() => handleSubmitResponse(review.id)}
                  isSubmitting={respondMutation.isPending}
                />
              );
            })
          )}
        </TabsContent>

        {/* Low Ratings */}
        <TabsContent value="low" className="space-y-4">
          {lowRatings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Great work! No low ratings.</p>
              </CardContent>
            </Card>
          ) : (
            lowRatings.map(review => {
              const hasResponse = responses.some(r => r.review_id === review.id);
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  hasResponse={hasResponse}
                  isResponding={respondingToId === review.id}
                  responseText={responseText}
                  highlight={true}
                  onToggleRespond={() => {
                    if (respondingToId === review.id) {
                      setRespondingToId(null);
                    } else {
                      setRespondingToId(review.id);
                      setResponseText('');
                    }
                  }}
                  onResponseChange={setResponseText}
                  onSubmitResponse={() => handleSubmitResponse(review.id)}
                  isSubmitting={respondMutation.isPending}
                />
              );
            })
          )}
        </TabsContent>

        {/* High Ratings */}
        <TabsContent value="high" className="space-y-4">
          {highRatings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No positive ratings yet</p>
              </CardContent>
            </Card>
          ) : (
            highRatings.map(review => {
              const hasResponse = responses.some(r => r.review_id === review.id);
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  hasResponse={hasResponse}
                  isResponding={respondingToId === review.id}
                  responseText={responseText}
                  onToggleRespond={() => {
                    if (respondingToId === review.id) {
                      setRespondingToId(null);
                    } else {
                      setRespondingToId(review.id);
                      setResponseText('');
                    }
                  }}
                  onResponseChange={setResponseText}
                  onSubmitResponse={() => handleSubmitResponse(review.id)}
                  isSubmitting={respondMutation.isPending}
                />
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewCard({
  review,
  hasResponse,
  isResponding,
  responseText,
  highlight,
  onToggleRespond,
  onResponseChange,
  onSubmitResponse,
  isSubmitting,
}) {
  return (
    <Card className={highlight ? 'border-red-200 bg-red-50' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{review.user_name}</p>
              {hasResponse && (
                <Badge className="bg-green-100 text-green-800 text-xs">Responded</Badge>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {new Date(review.created_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        )}

        <p className="text-gray-700 mb-4">{review.comment}</p>

        <div className="border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            onClick={onToggleRespond}
            disabled={isSubmitting}
            className="gap-2 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {isResponding ? 'Cancel Response' : 'Respond to Review'}
          </Button>

          {isResponding && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <Textarea
                placeholder="Write your response to this review..."
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
                className="h-24"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={onToggleRespond}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSubmitResponse}
                  disabled={!responseText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Post Response'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}