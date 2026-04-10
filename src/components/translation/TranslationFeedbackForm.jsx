import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Star, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function TranslationFeedbackForm({ 
  voiceRequestId,
  sourceText,
  translation,
  explanation,
  language,
  onSubmitted
}) {
  const [rating, setRating] = useState('3');
  const [isAccurate, setIsAccurate] = useState('partial');
  const [feedback, setFeedback] = useState('');
  const [issue, setIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ISSUES = {
    word_choice: 'Incorrect word or phrase choice',
    grammar: 'Grammar or sentence structure',
    meaning: 'Lost or changed meaning',
    tone: 'Wrong tone or formality',
    unclear: 'Translation unclear or confusing',
    other: 'Other issue',
  };

  const handleSubmit = async () => {
    if (!feedback.trim() || !issue) {
      toast.error('Please provide feedback and select an issue type');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const review = await base44.entities.TranslationReview.create({
        voice_request_id: voiceRequestId,
        reviewer_user_id: (await base44.auth.me()).id,
        reviewer_name: (await base44.auth.me()).full_name || 'Anonymous',
        rating: parseInt(rating),
        notes: feedback,
        status: isAccurate === 'accurate' ? 'APPROVED' : 'NEEDS_FIX',
        suggested_correction: isAccurate === 'inaccurate' ? feedback : null,
      });

      // Track the issue for analytics
      await trackTranslationIssue({
        voiceRequestId,
        issueType: issue,
        language,
        severity: rating,
        feedback,
      });

      toast.success('Thank you! Your feedback helps improve translations for everyone.');
      onSubmitted?.();
      
      // Reset form
      setFeedback('');
      setRating('3');
      setIsAccurate('partial');
      setIssue('');
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const trackTranslationIssue = async (data) => {
    try {
      // This can be extended to create a TranslationIssueLog entity for analytics
      console.log('Tracking translation issue:', data);
      // In future: base44.entities.TranslationIssueLog.create(data)
    } catch (error) {
      console.error('Failed to track issue:', error);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Report Translation Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original & Translation */}
        <div className="grid gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Original</label>
            <div className="p-2 bg-white rounded text-sm text-gray-700 border">{sourceText}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Translation</label>
            <div className="p-2 bg-white rounded text-sm text-gray-700 border">{translation}</div>
          </div>
        </div>

        {/* Accuracy Rating */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Is this translation accurate?</label>
          <div className="space-y-2">
            {[
              { value: 'accurate', label: '✓ Accurate - No changes needed' },
              { value: 'partial', label: '~ Partially accurate - Has some errors' },
              { value: 'inaccurate', label: '✗ Inaccurate - Needs significant changes' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded">
                <input
                  type="radio"
                  name="accuracy"
                  value={option.value}
                  checked={isAccurate === option.value}
                  onChange={(e) => setIsAccurate(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quality Rating */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Quality Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star.toString())}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= parseInt(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Type of Issue</label>
          <Select value={issue} onValueChange={setIssue}>
            <SelectTrigger>
              <SelectValue placeholder="Select issue type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ISSUES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feedback */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Your Feedback
          </label>
          <Textarea
            placeholder={isAccurate === 'inaccurate' ? 'Explain what should be corrected...' : 'Describe the issue...'}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="h-20"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific so our team can improve future translations.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !feedback.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}