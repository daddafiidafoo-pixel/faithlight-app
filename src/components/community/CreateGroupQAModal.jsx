import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const TAGS = ['theology', 'prayer', 'scripture', 'worship', 'bible-study', 'devotional'];

export default function CreateGroupQAModal({ open, onOpenChange, groupId, onQuestionCreated }) {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
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
      await base44.entities.GroupQA.create({
        group_id: groupId,
        question_author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        status: 'open',
      });

      toast.success('Question posted!');
      onQuestionCreated?.();
      onOpenChange(false);
      setTitle('');
      setContent('');
      setSelectedTags([]);
    } catch (error) {
      toast.error('Failed to post question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to ask?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide more context and details..."
              className="h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-gray-500 text-xs">(select up to 3)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else if (selectedTags.length < 3) {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
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
              Ask
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}