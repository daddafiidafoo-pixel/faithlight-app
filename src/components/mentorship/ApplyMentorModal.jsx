import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EXPERTISE_OPTIONS = [
  'Bible Study', 'Prayer', 'Discipleship', 'Leadership', 
  'Marriage & Family', 'Youth Ministry', 'Evangelism',
  'Theology', 'Spiritual Formation', 'Worship'
];

export default function ApplyMentorModal({ open, onOpenChange, user }) {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [maxMentees, setMaxMentees] = useState('3');
  const [frequency, setFrequency] = useState('biweekly');

  const toggleExpertise = (area) => {
    setExpertiseAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MentorProfile.create({
        user_id: user.id,
        bio: bio.trim(),
        expertise_areas: expertiseAreas,
        years_of_experience: parseInt(yearsOfExperience),
        max_mentees: parseInt(maxMentees),
        preferred_meeting_frequency: frequency,
        status: 'approved', // Auto-approve for now
      });
    },
    onSuccess: () => {
      toast.success('Mentor application submitted!');
      queryClient.invalidateQueries(['mentor-profile']);
      queryClient.invalidateQueries(['mentors']);
      onOpenChange(false);
      setBio('');
      setExpertiseAreas([]);
      setYearsOfExperience('');
    },
    onError: () => {
      toast.error('Failed to submit application');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Become a Mentor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Tell us about yourself</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your background, ministry experience, and why you want to mentor..."
              className="h-32 mt-2"
            />
          </div>

          <div>
            <Label>Areas of Expertise (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EXPERTISE_OPTIONS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expertiseAreas.includes(area)}
                    onChange={() => toggleExpertise(area)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Years of Experience in Ministry/Leadership</Label>
            <Input
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              placeholder="e.g., 5"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Maximum Number of Mentees</Label>
              <Select value={maxMentees} onValueChange={setMaxMentees}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mentee</SelectItem>
                  <SelectItem value="2">2 mentees</SelectItem>
                  <SelectItem value="3">3 mentees</SelectItem>
                  <SelectItem value="4">4 mentees</SelectItem>
                  <SelectItem value="5">5 mentees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Meeting Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={!bio.trim() || expertiseAreas.length === 0 || !yearsOfExperience || applyMutation.isPending}
              className="gap-2"
            >
              {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}