import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { submitTranslationReview } from '@/functions/voiceTranslationEngine';

export default function TranslationReviewPanel({ voiceRequestId, user }) {
  const [rating, setRating] = useState('5');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('APPROVED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: translation } = useQuery({
    queryKey: ['translation-detail', voiceRequestId],
    queryFn: () => base44.entities.VoiceRequest.filter({ id: voiceRequestId }),
    enabled: !!voiceRequestId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['translation-reviews', voiceRequestId],
    queryFn: () => base44.entities.TranslationReview.filter({ voice_request_id: voiceRequestId }),
    enabled: !!voiceRequestId,
  });

  const handleSubmitReview = async () => {
    if (!notes.trim()) {
      toast.error('Please add review notes');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitTranslationReview(
        voiceRequestId,
        user.id,
        user.full_name,
        parseInt(rating),
        notes,
        status
      );

      setNotes('');
      setRating('5');
      setStatus('APPROVED');
      queryClient.invalidateQueries(['translation-reviews']);
      toast.success('Review submitted');
    } catch (error) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!translation || translation.length === 0) return null;

  const trans = translation[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Translation Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Original</h4>
            <p className="p-3 bg-gray-50 rounded text-sm">{trans.source_text}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Translation</h4>
            <p className="p-3 bg-blue-50 rounded text-sm">{trans.result_translation}</p>
          </div>
          {trans.result_explanation && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Explanation</h4>
              <p className="p-3 bg-amber-50 rounded text-sm">{trans.result_explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submit Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Quality Rating</label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="NEEDS_FIX">Needs Fix</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Notes</label>
            <Textarea
              placeholder="Add your review notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-sm">{review.reviewer_name}</div>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.notes}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {review.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}