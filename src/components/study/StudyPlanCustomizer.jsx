import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyPlanCustomizer({ open, onOpenChange, plan, onSave }) {
  const [loading, setLoading] = useState(false);
  const [customData, setCustomData] = useState({
    title: plan?.title || '',
    description: plan?.description || '',
    goal: plan?.goal || '',
    topics: plan?.topics || '',
    focus_areas: plan?.focus_areas || '',
    duration_weeks: plan?.duration_weeks || 4,
  });

  const handleSave = async () => {
    if (!customData.title || !customData.goal) {
      toast.error('Title and goal are required');
      return;
    }

    setLoading(true);
    try {
      const updated = await base44.entities.StudyPlan.update(plan.id, {
        title: customData.title,
        description: customData.description,
        goal: customData.goal,
        topics: customData.topics,
        focus_areas: customData.focus_areas,
        duration_weeks: customData.duration_weeks,
      });

      toast.success('Study plan updated successfully');
      onSave?.(updated);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Study Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plan Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={customData.title}
                onChange={(e) => setCustomData({ ...customData, title: e.target.value })}
                placeholder="Study plan title"
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customData.description}
                onChange={(e) => setCustomData({ ...customData, description: e.target.value })}
                placeholder="Brief description of this study plan"
                className="h-20"
              />
            </CardContent>
          </Card>

          {/* Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Learning Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customData.goal}
                onChange={(e) => setCustomData({ ...customData, goal: e.target.value })}
                placeholder="What should students achieve?"
                className="h-20"
              />
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Topics/Books</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customData.topics}
                onChange={(e) => setCustomData({ ...customData, topics: e.target.value })}
                placeholder="Bible books or theological topics covered"
                className="h-16"
              />
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Focus Areas (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customData.focus_areas}
                onChange={(e) => setCustomData({ ...customData, focus_areas: e.target.value })}
                placeholder="Specific emphasis or focus areas"
                className="h-16"
              />
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={customData.duration_weeks}
                  onChange={(e) => setCustomData({ ...customData, duration_weeks: parseInt(e.target.value) })}
                  className="w-24"
                />
                <span className="text-sm text-gray-600">weeks</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}