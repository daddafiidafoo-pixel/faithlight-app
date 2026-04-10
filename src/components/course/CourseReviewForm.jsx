import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CourseReviewForm({ courseId, instructorId, userName, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    content_quality: 0,
    instructor_clarity: 0,
    pacing: 0,
    course_structure: 0,
  });
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (reviewData) => {
      return await base44.entities.CourseReview.create(reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-rating', courseId] });
      setRating(0);
      setTitle('');
      setComment('');
      setAspects({
        content_quality: 0,
        instructor_clarity: 0,
        pacing: 0,
        course_structure: 0,
      });
      onSuccess?.();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      alert('Please provide a rating and comment');
      return;
    }

    submitMutation.mutate({
      course_id: courseId,
      user_id: await base44.auth.me().then(u => u?.id),
      user_name: userName,
      instructor_id: instructorId,
      rating,
      title: title || `${rating}-Star Review`,
      comment,
      aspects: Object.values(aspects).some(v => v > 0) ? aspects : undefined,
      course_completed: true,
      is_verified_purchase: true,
    });
  };

  const aspectLabels = {
    content_quality: 'Content Quality',
    instructor_clarity: 'Instructor Clarity',
    pacing: 'Course Pacing',
    course_structure: 'Course Structure',
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg">Share Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoveredRating(num)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      num <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-semibold text-gray-700 pt-1">
                  {rating}/5 stars
                </span>
              )}
            </div>
          </div>

          {/* Aspect Ratings */}
          <div className="bg-white p-4 rounded-lg space-y-3">
            <p className="text-sm font-semibold text-gray-900 mb-3">Rate specific aspects (optional)</p>
            {Object.entries(aspectLabels).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-700">{label}</label>
                  <span className="text-xs text-gray-600">
                    {aspects[key] > 0 ? `${aspects[key]}/5` : 'Skip'}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAspects({ ...aspects, [key]: num })}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= aspects[key]
                            ? 'fill-indigo-500 text-indigo-500'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Review Title (optional)
            </label>
            <Input
              placeholder="Summarize your review in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review
            </label>
            <Textarea
              placeholder="What did you think about this course? What was most helpful? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-32"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!rating || !comment.trim() || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}