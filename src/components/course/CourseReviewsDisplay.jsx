import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CourseReviewsDisplay({ courseId }) {
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const allReviews = await base44.entities.CourseReview.filter(
        { course_id: courseId, status: 'approved' },
        '-created_date'
      );
      return allReviews || [];
    },
    enabled: !!courseId,
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['review-responses'],
    queryFn: async () => {
      const allResponses = await base44.entities.ReviewResponse.list();
      return allResponses || [];
    },
  });

  if (isLoading) {
    return <div className="text-gray-600">Loading reviews...</div>;
  }

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Filter and sort
  let filteredReviews = reviews;
  if (filterRating !== 'all') {
    filteredReviews = reviews.filter(r => r.rating === parseInt(filterRating));
  }

  if (sortBy === 'highest') {
    filteredReviews = [...filteredReviews].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'lowest') {
    filteredReviews = [...filteredReviews].sort((a, b) => a.rating - b.rating);
  } else if (sortBy === 'helpful') {
    filteredReviews = [...filteredReviews].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
  }

  return (
    <div className="space-y-8">
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-indigo-600">{avgRating}</p>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars];
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-12">{stars} ★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Filter by Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {reviews.length === 0 ? 'No reviews yet. Be the first to review!' : 'No reviews match your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => {
            const response = responses.find(r => r.review_id === review.id);
            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{review.user_name}</p>
                        {review.is_verified_purchase && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
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

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}

                  {/* Review Comment */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                  {/* Aspect Ratings */}
                  {review.aspects && Object.keys(review.aspects).some(k => review.aspects[k] > 0) && (
                    <div className="bg-gray-50 p-3 rounded mb-4 text-sm space-y-1">
                      {Object.entries(review.aspects).map(([key, value]) => {
                        if (value === 0) return null;
                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-700">{label}:</span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < value ? 'fill-indigo-500 text-indigo-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-2 pb-4 border-b border-gray-200 mb-4">
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful_count || 0})
                    </button>
                  </div>

                  {/* Instructor Response */}
                  {response && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mt-4">
                      <p className="font-semibold text-gray-900 mb-2 text-sm">
                        Instructor Response
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {response.response_text}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(response.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}