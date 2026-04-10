import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  'general', 'bible-study', 'prayer', 'theology', 'worship',
  'youth', 'women', 'men', 'marriage', 'parenting', 'discipleship', 'missions'
];

export default function CreateGroupForumTopicModal({ groupId, user, onClose, onTopicCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const createMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ForumTopic.create({
        title,
        content,
        category,
        group_id: groupId,
        author_id: user.id,
        author_name: user.full_name,
        status: 'active',
      });
    },
    onSuccess: () => {
      onTopicCreated();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Topic Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your topic in detail..."
              className="mt-2 h-32"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Topic
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}