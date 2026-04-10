import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateStudyGroupModal({ open, onClose, user, onGroupCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    study_focus: '',
    group_goal: '',
    join_policy: 'open',
    meeting_frequency: 'weekly'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.group_name.trim() || !formData.study_focus.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const newGroup = await base44.entities.StudyGroup.create({
        ...formData,
        creator_user_id: user.id,
        creator_name: user.full_name,
        is_public: true,
        member_count: 1
      });

      // Add creator as member
      await base44.entities.GroupMember.create({
        group_id: newGroup.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'creator',
        member_progress_percentage: 0
      });

      toast.success('Study group created!');
      onGroupCreated?.(newGroup);
      onClose();
      setFormData({
        group_name: '',
        description: '',
        study_focus: '',
        group_goal: '',
        join_policy: 'open',
        meeting_frequency: 'weekly'
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>Start a virtual study group and invite others to learn together</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Group Name *</label>
            <Input
              placeholder="e.g., Gospel of John Study Circle"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">What will you study? *</label>
            <Input
              placeholder="e.g., Gospel of John, Parables, Christian Living"
              value={formData.study_focus}
              onChange={(e) => setFormData({ ...formData, study_focus: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <Textarea
              placeholder="Tell others about your group's focus and expectations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Group Goal (Optional)</label>
            <Input
              placeholder="e.g., Complete Gospel of John in 8 weeks"
              value={formData.group_goal}
              onChange={(e) => setFormData({ ...formData, group_goal: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Join Policy</label>
              <Select value={formData.join_policy} onValueChange={(v) => setFormData({ ...formData, join_policy: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open (Anyone can join)</SelectItem>
                  <SelectItem value="request">Request (Approval needed)</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Meeting Frequency</label>
              <Select value={formData.meeting_frequency} onValueChange={(v) => setFormData({ ...formData, meeting_frequency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}