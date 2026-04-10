import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VerseShareButton({ verse, user }) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share verses');
      return;
    }

    setSharing(true);
    try {
      await base44.entities.SharedVerse.create({
        user_id: user.id,
        user_name: user.full_name,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        reference: verse.reference,
        text: verse.text,
        translation: verse.translation || 'WEB',
        caption: caption.trim() || null,
        visibility
      });

      toast.success('Verse shared successfully!');
      setOpen(false);
      setCaption('');
    } catch (error) {
      toast.error('Failed to share verse');
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Verse</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-semibold text-indigo-600">{verse.reference}</p>
              <p className="text-sm mt-1">{verse.text}</p>
            </div>

            <Textarea
              placeholder="Add your reflection or comment (optional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />

            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="private">Private - Just for me</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleShare} disabled={sharing} className="w-full">
              {sharing ? 'Sharing...' : 'Share Verse'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}