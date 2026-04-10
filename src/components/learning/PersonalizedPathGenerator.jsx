import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'apologetics', 'theology', 'church history', 'bible study', 'leadership',
  'discipleship', 'prayer', 'faith', 'grace', 'salvation', 'christian living',
  'gospel', 'missions', 'pastoral care', 'worship', 'holy spirit'
];

export default function PersonalizedPathGenerator({ user, isDarkMode }) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [pathName, setPathName] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  const generatePathMutation = useMutation({
    mutationFn: async () => {
      if (!pathName.trim() || selectedInterests.length === 0) {
        throw new Error('Please enter a path name and select interests');
      }

      setLoading(true);

      try {
        // Generate path using AI
        const prompt = `Create a personalized learning path for someone interested in: ${selectedInterests.join(', ')}.

Generate a structured sequence of 4-6 biblical/theological topics or courses that would help them learn progressively about these interests. For each item, provide:
1. Topic/Course name
2. Type (course/lesson/playlist)
3. Estimated duration in hours
4. Brief description

Format as JSON array with objects containing: title, type, estimated_duration_hours, description`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    type: { type: 'string' },
                    estimated_duration_hours: { type: 'number' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        // Create learning path session
        const totalHours = aiResponse.items?.reduce((sum, item) => sum + (item.estimated_duration_hours || 0), 0) || 0;

        const pathData = {
          user_id: user.id,
          path_name: pathName,
          path_type: 'course_sequence',
          primary_interests: selectedInterests,
          items: (aiResponse.items || []).map((item, idx) => ({
            id: `${pathName}_${idx}_${Date.now()}`,
            type: item.type,
            entity_id: '',
            title: item.title,
            sequence_order: idx + 1,
            estimated_duration_hours: item.estimated_duration_hours || 2,
            is_completed: false,
            progress_percent: 0,
            ai_summary: item.description,
            key_takeaways: []
          })),
          total_estimated_hours: totalHours,
          total_completed_hours: 0,
          overall_progress_percent: 0,
          current_step_index: 0,
          status: 'active',
          ai_generated: true,
          started_date: new Date().toISOString(),
          path_summary: `Learning path covering ${selectedInterests.join(', ')}`
        };

        const newPath = await base44.entities.UserLearningPathSession.create(pathData);
        
        queryClient.invalidateQueries({ queryKey: ['userLearningPaths', user?.id] });
        toast.success('Learning path created!');
        
        setShowDialog(false);
        setPathName('');
        setSelectedInterests([]);

        return newPath;
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate learning path');
    }
  });

  const handleToggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="w-full gap-2"
        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
      >
        <Sparkles className="w-4 h-4" />
        Create Personalized Path
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: cardColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: textColor }}>
              Create Your Learning Path
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Path Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textColor }}>
                Path Name *
              </label>
              <Input
                placeholder="e.g., Apologetics Fundamentals"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor
                }}
              />
            </div>

            {/* Select Interests */}
            <div className="space-y-3">
              <label className="text-sm font-semibold" style={{ color: textColor }}>
                What interests you? (select at least 1) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    className="p-3 rounded-lg border-2 transition-all text-sm text-left"
                    style={{
                      backgroundColor: selectedInterests.includes(interest) ? primaryColor : bgColor,
                      borderColor: selectedInterests.includes(interest) ? primaryColor : borderColor,
                      color: selectedInterests.includes(interest) ? '#FFFFFF' : textColor
                    }}
                  >
                    {selectedInterests.includes(interest) ? '✓ ' : ''}{interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Interests Summary */}
            {selectedInterests.length > 0 && (
              <div style={{ backgroundColor: bgColor, padding: '12px', borderRadius: '8px' }}>
                <p className="text-xs" style={{ color: mutedColor }}>
                  Selected: {selectedInterests.join(', ')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor }}>
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={loading}
                style={{ borderColor, color: textColor }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => generatePathMutation.mutate()}
                disabled={loading || !pathName.trim() || selectedInterests.length === 0}
                className="flex-1 gap-2"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Path
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}