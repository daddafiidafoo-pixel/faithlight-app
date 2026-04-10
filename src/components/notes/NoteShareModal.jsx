import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Globe, Lock, Share2, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function NoteShareModal({ open, onClose, note, user, onShared }) {
  const [sharing, setSharing] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  const [postCreated, setPostCreated] = useState(false);

  const isPublic = note?.is_public;

  const handleTogglePublic = async () => {
    if (!note?.id) return;
    setSharing(true);
    try {
      const newPublic = !isPublic;
      await base44.entities.StudyNote.update(note.id, { is_public: newPublic });
      toast.success(newPublic ? 'Note is now public!' : 'Note is now private.');
      onShared?.({ ...note, is_public: newPublic });
    } catch (e) {
      toast.error('Failed: ' + e.message);
    } finally {
      setSharing(false);
    }
  };

  const handlePostToCommunity = async () => {
    if (!note || !user) return;
    setSharing(true);
    try {
      // First make public if not already
      if (!isPublic) {
        await base44.entities.StudyNote.update(note.id, { is_public: true });
      }

      // Create a community post linking to the note
      const body = [
        postMessage || `I wanted to share this study note with the community.`,
        '',
        note.passage_ref ? `📖 **${note.passage_ref}**` : '',
        '',
        `**${note.title}**`,
        note.content ? note.content.slice(0, 400) + (note.content.length > 400 ? '…' : '') : '',
        '',
        note.tags?.length ? `Tags: ${note.tags.map(t => `#${t}`).join(' ')}` : '',
      ].filter(Boolean).join('\n');

      await base44.entities.CommunityPost.create({
        user_id: user.id,
        user_name: user.full_name,
        title: `Study Note: ${note.title}`,
        body,
        category: 'Teaching',
        status: 'pending',
      });

      setPostCreated(true);
      toast.success('Posted to community for review!');
      onShared?.({ ...note, is_public: true });
    } catch (e) {
      toast.error('Failed to post: ' + e.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Note</p>
            <p className="font-semibold text-gray-900 text-sm">{note?.title}</p>
            {note?.passage_ref && <p className="text-xs text-indigo-600 mt-0.5">📖 {note.passage_ref}</p>}
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              {isPublic
                ? <Globe className="w-5 h-5 text-green-600" />
                : <Lock className="w-5 h-5 text-gray-400" />
              }
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isPublic ? 'Public Note' : 'Private Note'}
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic ? 'Visible on your public profile' : 'Only visible to you'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={isPublic ? 'outline' : 'default'}
              onClick={handleTogglePublic}
              disabled={sharing}
              className={isPublic ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublic ? 'Make Private' : 'Make Public'}
            </Button>
          </div>

          {/* Share to community post */}
          <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Post to Community Feed</p>
            <p className="text-xs text-gray-500">Share this note as a community post (will be reviewed before publishing).</p>
            <Textarea
              placeholder="Add a message to the community… (optional)"
              value={postMessage}
              onChange={e => setPostMessage(e.target.value)}
              className="text-sm min-h-[80px] bg-white resize-none"
            />
            {postCreated ? (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <Check className="w-4 h-4" /> Posted! Awaiting community review.
              </div>
            ) : (
              <Button
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handlePostToCommunity}
                disabled={sharing}
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Post to Community
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}