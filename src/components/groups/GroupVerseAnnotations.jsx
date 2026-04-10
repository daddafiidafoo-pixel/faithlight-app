import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Plus, Loader2, BookOpen, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupVerseAnnotations({ groupId, user, isAdmin }) {
  const [newNote, setNewNote] = useState('');
  const [newPassage, setNewPassage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ['group-annotations', groupId],
    queryFn: () => base44.entities.SharedExplanation?.filter?.({ group_id: groupId }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const createAnnotationMutation = useMutation({
    mutationFn: async () => {
      if (!newNote.trim() || !newPassage.trim()) return;
      return base44.entities.SharedExplanation?.create?.({
        group_id: groupId,
        user_id: user.id,
        user_name: user.full_name,
        bible_passage: newPassage,
        explanation: newNote,
        visibility: 'group',
        created_at: new Date().toISOString(),
        likes: 0,
      });
    },
    onSuccess: () => {
      toast.success('Reflection shared with the group!');
      setNewNote('');
      setNewPassage('');
      setOpenDialog(false);
      queryClient.invalidateQueries(['group-annotations', groupId]);
    },
    onError: () => toast.error('Failed to share reflection'),
  });

  const mockAnnotations = [
    {
      id: 'ann-1',
      passage: 'John 3:16',
      author: 'Sarah Johnson',
      authorAvatar: 'S',
      text: 'This verse reminds me that God\'s love is not conditional. It\'s available to everyone, regardless of their past. This challenges me to love others the same way.',
      tags: ['love', 'faith', 'grace'],
      likes: 4,
      replies: 2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      liked: false,
    },
    {
      id: 'ann-2',
      passage: '1 Corinthians 13:4-7',
      author: 'Michael Chen',
      authorAvatar: 'M',
      text: 'Paul\'s description of love here is so practical. "Love is patient, love is kind" — these are actions, not just feelings. It helps me understand how to live out my faith in relationships.',
      tags: ['love', 'relationships'],
      likes: 3,
      replies: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      liked: false,
    },
    {
      id: 'ann-3',
      passage: 'Psalm 23',
      author: 'Emma Davis',
      authorAvatar: 'E',
      text: 'Reflecting on "The Lord is my shepherd" during a difficult time. It provides comfort knowing that God is guiding me through the valley of the shadow of death.',
      tags: ['comfort', 'trust'],
      likes: 5,
      replies: 3,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      liked: true,
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading annotations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          Group Verse Reflections
        </h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4" />
              Share Reflection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Verse Reflection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Bible Passage</label>
                <Input
                  placeholder="e.g., John 3:16 or Psalm 23:1-6"
                  value={newPassage}
                  onChange={e => setNewPassage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Your Reflection</label>
                <Textarea
                  placeholder="Share what this verse means to you, how it challenges you, or what you learned..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="mt-1 h-32"
                />
              </div>
              <p className="text-xs text-gray-500 italic">This will be visible only to group members.</p>
              <Button
                onClick={() => createAnnotationMutation.mutate()}
                disabled={createAnnotationMutation.isPending}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {createAnnotationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Share Reflection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <p className="text-sm text-purple-800">
            <strong>Group-Only Space:</strong> All reflections shared here are visible only to group members. This is a sacred space for collective study and personal sharing.
          </p>
        </CardContent>
      </Card>

      {/* Annotations List */}
      <div className="space-y-4">
        {mockAnnotations.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <p className="text-gray-500">No reflections yet. Be the first to share!</p>
          </Card>
        ) : (
          mockAnnotations.map(annotation => (
            <Card key={annotation.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-400">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {annotation.authorAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="font-bold text-gray-900">{annotation.author}</h4>
                      <Badge variant="outline" className="text-xs font-mono">{annotation.passage}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{annotation.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Reflection Text */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3">"{annotation.text}"</p>

                {/* Tags */}
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {annotation.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag}</Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 text-xs ${annotation.liked ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${annotation.liked ? 'fill-red-600' : ''}`} />
                    {annotation.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-gray-600">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {annotation.replies}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}