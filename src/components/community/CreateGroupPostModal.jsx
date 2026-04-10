import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGroupPostModal({ open, onOpenChange, groupId, onPostCreated }) {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    if (open) getUser();
  }, [open]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsLoading(true);
    try {
      await base44.entities.GroupPost.create({
        group_id: groupId,
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        status: 'approved',
      });

      toast.success('Post created!');
      onPostCreated?.();
      onOpenChange(false);
      setTitle('');
      setContent('');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="h-24"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}