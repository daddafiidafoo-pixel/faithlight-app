import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'bible-study', 'prayer', 'theology', 'worship', 'youth',
  'women', 'men', 'marriage', 'parenting', 'discipleship', 'missions'
];

export default function EditGroupModal({ open, onOpenChange, group, onGroupUpdated }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [privacy, setPrivacy] = useState(group?.privacy || 'invite_only');
  const [interests, setInterests] = useState(group?.interests || []);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Group.update(group.id, {
        name: name.trim(),
        description: description.trim(),
        privacy,
        interests,
      });
    },
    onSuccess: () => {
      toast.success('Group updated!');
      onGroupUpdated?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update group');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite_only">Invite Only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests <span className="text-gray-500 text-xs">(up to 3)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    if (interests.includes(interest)) {
                      setInterests(interests.filter(i => i !== interest));
                    } else if (interests.length < 3) {
                      setInterests([...interests, interest]);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    interests.includes(interest)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}