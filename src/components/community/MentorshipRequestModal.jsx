import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const FOCUS_AREAS = [
  'Scripture Study', 'Preaching', 'Leadership', 'Spiritual Growth',
  'Discipleship', 'Prayer Life', 'Theological Knowledge', 'Ministry Skills'
];

export default function MentorshipRequestModal({ open, onOpenChange, mentor, isMentor, onSubmit }) {
  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(selectedFocusAreas, goals);
    } finally {
      setIsLoading(false);
      setSelectedFocusAreas([]);
      setGoals('');
    }
  };

  if (!mentor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isMentor ? 'Offer Mentorship' : 'Request Mentorship'} from {mentor.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Mentor's expertise:</p>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise_areas?.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Focus Areas (select at least one)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FOCUS_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedFocusAreas.includes(area)}
                    onCheckedChange={() => {
                      if (selectedFocusAreas.includes(area)) {
                        setSelectedFocusAreas(selectedFocusAreas.filter(a => a !== area));
                      } else {
                        setSelectedFocusAreas([...selectedFocusAreas, area]);
                      }
                    }}
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goals & Expectations
            </label>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder={isMentor ? 
                'What would you like to help this person achieve?' :
                'What are your goals for this mentorship?'
              }
              className="h-24"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedFocusAreas.length === 0 || !goals.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isMentor ? 'Send Offer' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}