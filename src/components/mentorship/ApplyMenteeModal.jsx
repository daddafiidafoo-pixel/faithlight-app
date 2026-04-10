import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'Bible Study', 'Prayer', 'Discipleship', 'Leadership', 
  'Marriage & Family', 'Youth Ministry', 'Evangelism',
  'Theology', 'Spiritual Formation', 'Worship'
];

export default function ApplyMenteeModal({ open, onOpenChange, user }) {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [interestAreas, setInterestAreas] = useState([]);
  const [spiritualGoals, setSpiritualGoals] = useState('');
  const [preferredGender, setPreferredGender] = useState('any');

  const toggleInterest = (area) => {
    setInterestAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.MenteeProfile.create({
        user_id: user.id,
        bio: bio.trim(),
        interest_areas: interestAreas,
        spiritual_goals: spiritualGoals.trim(),
        preferred_mentor_gender: preferredGender,
      });
    },
    onSuccess: () => {
      toast.success('Profile created! Browse mentors to request mentorship.');
      queryClient.invalidateQueries(['mentee-profile']);
      onOpenChange(false);
      setBio('');
      setInterestAreas([]);
      setSpiritualGoals('');
    },
    onError: () => {
      toast.error('Failed to create profile');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find a Mentor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Tell us about yourself</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your background and where you are in your faith journey..."
              className="h-24 mt-2"
            />
          </div>

          <div>
            <Label>What areas do you want to grow in? (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {INTEREST_OPTIONS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interestAreas.includes(area)}
                    onChange={() => toggleInterest(area)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>What are your spiritual growth goals?</Label>
            <Textarea
              value={spiritualGoals}
              onChange={(e) => setSpiritualGoals(e.target.value)}
              placeholder="Share your personal goals for spiritual growth..."
              className="h-24 mt-2"
            />
          </div>

          <div>
            <Label>Preferred Mentor Gender</Label>
            <Select value={preferredGender} onValueChange={setPreferredGender}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">No preference</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={!bio.trim() || interestAreas.length === 0 || !spiritualGoals.trim() || applyMutation.isPending}
              className="gap-2"
            >
              {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}