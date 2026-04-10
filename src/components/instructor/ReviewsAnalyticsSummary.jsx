import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReviewsAnalyticsSummary({ reviews }) {
  if (!reviews || reviews.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center py-8">
            No reviews yet. Reviews will appear as students complete your course.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { distribution, avg_rating } = reviews;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5" />
            Rating Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-indigo-600">{avg_rating}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avg_rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{reviews.total} total reviews</p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars];
              const percent = reviews.total > 0 ? (count / reviews.total) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stars >= 4
                          ? 'bg-green-500'
                          : stars === 3
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {avg_rating >= 4.5 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="font-semibold text-green-900 text-sm">Excellent Feedback</p>
              <p className="text-xs text-green-700 mt-1">
                Your course has an excellent rating. Keep up the great work!
              </p>
            </div>
          )}

          {avg_rating < 3.5 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-semibold text-red-900 text-sm">Review Attention Needed</p>
              <p className="text-xs text-red-700 mt-1">
                Consider reviewing student feedback to identify areas for improvement.
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="font-semibold text-gray-900 text-sm">
              {distribution[5] + distribution[4]} Positive Ratings
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {Math.round(((distribution[5] + distribution[4]) / reviews.total) * 100)}% of students
              gave 4-5 stars
            </p>
          </div>

          {distribution[1] + distribution[2] > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="font-semibold text-orange-900 text-sm">
                {distribution[1] + distribution[2]} Low Ratings
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Review feedback from 1-2 star ratings for improvement opportunities
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}